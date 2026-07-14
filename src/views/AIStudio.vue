<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApplicationStore } from "../stores/applicationStore";
import { useCollegeStore } from "../stores/collegeStore";
import { useEssayStore, type Essay } from "../stores/essayStore";
import {
    buildApplicationAdvice,
    buildEssayCoach,
    buildReuseMatches,
} from "../services/applicationIntelligence";

type StudioTab = "reuse" | "coach" | "advisor";

const route = useRoute();
const router = useRouter();
const essayStore = useEssayStore();
const collegeStore = useCollegeStore();
const applicationStore = useApplicationStore();
applicationStore.ensureApplications(collegeStore.colleges);

const requestedTab = String(route.query.tab || "reuse");
const activeTab = ref<StudioTab>(["reuse", "coach", "advisor"].includes(requestedTab) ? requestedTab as StudioTab : "reuse");
const requestedEssay = String(route.query.essay || "");
const firstTarget = essayStore.essays.find((essay) => essay.status !== "Done") || essayStore.essays[0];
const firstCoach = essayStore.essays.find((essay) => essay.content && !essay.content.startsWith("FILE:")) || essayStore.essays[0];
const selectedTargetId = ref(essayStore.essays.some((essay) => essay.id === requestedEssay) ? requestedEssay : firstTarget?.id || "");
const selectedCoachId = ref(essayStore.essays.some((essay) => essay.id === requestedEssay) ? requestedEssay : firstCoach?.id || "");

const targetEssay = computed(() => essayStore.essays.find((essay) => essay.id === selectedTargetId.value));
const coachEssay = computed(() => essayStore.essays.find((essay) => essay.id === selectedCoachId.value));
const reuseMatches = computed(() => targetEssay.value ? buildReuseMatches(targetEssay.value, essayStore.essays) : []);
const coachReport = computed(() => coachEssay.value ? buildEssayCoach(coachEssay.value) : null);
const advisorReport = computed(() => buildApplicationAdvice(
    collegeStore.colleges,
    applicationStore.applications,
    essayStore.essays,
    applicationStore.tasks,
    applicationStore.recommendations,
));

watch(() => route.query, (query) => {
    const tab = String(query.tab || "");
    if (["reuse", "coach", "advisor"].includes(tab)) activeTab.value = tab as StudioTab;
    const essayId = String(query.essay || "");
    if (essayStore.essays.some((essay) => essay.id === essayId)) {
        selectedTargetId.value = essayId;
        selectedCoachId.value = essayId;
    }
});

function setTab(tab: StudioTab) {
    activeTab.value = tab;
    const essay = tab === "coach" ? selectedCoachId.value : tab === "reuse" ? selectedTargetId.value : undefined;
    void router.replace({ path: "/ai-studio", query: { tab, ...(essay ? { essay } : {}) } });
}

function openEssay(essay: Essay) {
    const path = essay.collegeId === "common-app"
        ? `/essays/college/common-app/essay/${essay.id}`
        : `/essays/college/${essay.collegeId}/essay/${essay.id}`;
    void router.push(path);
}

function essayLabel(essay: Essay) {
    return `${essay.collegeName || "General"} - ${essay.title}`;
}

function deadlineLabel(days: number | null) {
    if (days === null) return "No deadline";
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return "Due today";
    return `${days}d left`;
}
</script>

<template>
    <div class="studio-page">
        <header class="studio-header">
            <div>
                <span class="eyebrow">Private application intelligence</span>
                <h2>AI Studio</h2>
                <p>Reuse thoughtfully, strengthen each draft, and focus your application plan.</p>
            </div>
            <div class="privacy-chip"><span></span>Runs on this device</div>
        </header>

        <nav class="studio-tabs" aria-label="AI Studio tools">
            <button :class="{ active: activeTab === 'reuse' }" @click="setTab('reuse')">
                <strong>Essay Reuse Mapper</strong><span>Find adaptable material</span>
            </button>
            <button :class="{ active: activeTab === 'coach' }" @click="setTab('coach')">
                <strong>Essay Coach</strong><span>Get revision guidance</span>
            </button>
            <button :class="{ active: activeTab === 'advisor' }" @click="setTab('advisor')">
                <strong>Application Advisor</strong><span>Prioritize the whole plan</span>
            </button>
        </nav>
        <p class="method-note">Scores measure draft signals and tracked completion only. They do not predict admission decisions.</p>

        <section v-if="activeTab === 'reuse'" class="tool-panel">
            <div class="tool-heading">
                <div><h3>Essay Reuse Mapper</h3><p>Choose a target prompt to find existing stories and ideas worth adapting.</p></div>
                <label class="essay-select"><span>Target essay</span><select v-model="selectedTargetId"><option v-for="essay in essayStore.essays" :key="essay.id" :value="essay.id">{{ essayLabel(essay) }}</option></select></label>
            </div>

            <div v-if="essayStore.essays.length < 2" class="empty-state">
                <strong>Add at least two essays to compare prompts.</strong>
                <p>The mapper needs one target and one existing draft with at least a few sentences.</p>
                <button class="primary-button" @click="router.push('/essays')">Open Essay Tracker</button>
            </div>
            <template v-else-if="targetEssay">
                <div class="target-strip">
                    <div><span>Target prompt</span><strong>{{ targetEssay.prompt || targetEssay.title }}</strong></div>
                    <button class="secondary-button" @click="openEssay(targetEssay)">Open target draft</button>
                </div>
                <div v-if="reuseMatches.length" class="match-list">
                    <article v-for="match in reuseMatches" :key="match.source.id" class="match-row">
                        <div class="match-score" :class="{ strong: match.score >= 55 }"><strong>{{ match.score }}</strong><span>match</span></div>
                        <div class="match-content">
                            <div class="match-title"><div><span>{{ match.source.collegeName || 'General' }}</span><h4>{{ match.source.title }}</h4></div><button class="text-button" @click="openEssay(match.source)">Open source</button></div>
                            <p class="match-reason">{{ match.reason }}</p>
                            <div v-if="match.sharedThemes.length" class="tag-row"><span v-for="theme in match.sharedThemes" :key="theme">{{ theme }}</span></div>
                            <div class="match-guidance">
                                <div><strong>Adaptation plan</strong><ol><li v-for="step in match.adaptationSteps" :key="step">{{ step }}</li></ol></div>
                                <div v-if="match.cautions.length"><strong>Watch for</strong><ul><li v-for="caution in match.cautions" :key="caution">{{ caution }}</li></ul></div>
                            </div>
                        </div>
                    </article>
                </div>
                <div v-else class="empty-state"><strong>No reusable text drafts yet.</strong><p>Attached files are private and cannot be analyzed until their text is pasted into Write mode.</p></div>
            </template>
        </section>

        <section v-else-if="activeTab === 'coach'" class="tool-panel">
            <div class="tool-heading">
                <div><h3>AI Essay Coach</h3><p>Get a focused revision plan without replacing the student's voice.</p></div>
                <label class="essay-select"><span>Essay to coach</span><select v-model="selectedCoachId"><option v-for="essay in essayStore.essays" :key="essay.id" :value="essay.id">{{ essayLabel(essay) }}</option></select></label>
            </div>
            <div v-if="!coachEssay" class="empty-state"><strong>Add an essay to begin coaching.</strong><button class="primary-button" @click="router.push('/essays')">Create an essay</button></div>
            <template v-else-if="coachReport">
                <div class="coach-overview">
                    <div class="score-block"><strong>{{ coachReport.score }}</strong><span>draft score</span></div>
                    <div><h4>{{ coachEssay.title }}</h4><p>{{ coachReport.summary }}</p><div class="tag-row"><span v-for="theme in coachReport.themes" :key="theme">{{ theme }}</span></div></div>
                    <button class="primary-button" @click="openEssay(coachEssay)">Revise draft</button>
                </div>
                <div v-if="coachReport.categories.length" class="coach-grid">
                    <div class="category-list">
                        <h4>Draft dimensions</h4>
                        <div v-for="category in coachReport.categories" :key="category.id" class="category-row">
                            <div><strong>{{ category.label }}</strong><span>{{ category.note }}</span></div>
                            <div class="category-score"><span>{{ category.score }}</span><div><i :style="{ width: category.score + '%' }"></i></div></div>
                        </div>
                    </div>
                    <div class="coach-column">
                        <div class="guidance-section"><h4>Revision plan</h4><article v-for="action in coachReport.actions" :key="action.id" class="action-row"><span :class="action.priority.toLowerCase()">{{ action.priority }}</span><div><strong>{{ action.title }}</strong><p>{{ action.detail }}</p></div></article></div>
                        <div v-if="coachReport.strengths.length" class="guidance-section"><h4>What is working</h4><ul class="clean-list"><li v-for="strength in coachReport.strengths" :key="strength">{{ strength }}</li></ul></div>
                        <div v-if="coachReport.repeatedWords.length" class="guidance-section"><h4>Repeated language</h4><div class="tag-row"><span v-for="word in coachReport.repeatedWords" :key="word.word">{{ word.word }} x{{ word.count }}</span></div></div>
                    </div>
                </div>
            </template>
        </section>

        <section v-else class="tool-panel">
            <div class="tool-heading"><div><h3>AI Application Advisor</h3><p>A portfolio-level check of readiness, deadlines, essays, recommendations, and list balance.</p></div><button class="secondary-button" @click="router.push('/applications')">Open Command Center</button></div>
            <div class="advisor-overview">
                <div class="score-block"><strong>{{ advisorReport.score }}</strong><span>plan health</span></div>
                <p>{{ advisorReport.summary }}</p>
            </div>
            <div v-if="advisorReport.categories.length" class="health-grid">
                <div v-for="category in advisorReport.categories" :key="category.id" class="health-item"><div><span>{{ category.label }}</span><strong>{{ category.score }}%</strong></div><div class="health-track"><i :style="{ width: category.score + '%' }"></i></div><p>{{ category.note }}</p></div>
            </div>
            <div class="advisor-grid">
                <div class="priority-section">
                    <div class="section-heading"><h4>Priority actions</h4><span>{{ advisorReport.actions.length }} recommended</span></div>
                    <div v-if="advisorReport.actions.length" class="priority-list"><button v-for="action in advisorReport.actions" :key="action.id" class="priority-row" @click="router.push(action.route)"><span :class="action.priority.toLowerCase()">{{ action.priority }}</span><div><strong>{{ action.title }}</strong><p>{{ action.detail }}</p></div><b>›</b></button></div>
                    <div v-else class="quiet-state">No urgent gaps found. Keep records updated as deadlines approach.</div>
                </div>
                <aside class="strategy-section"><h4>Portfolio strategy</h4><ul class="clean-list"><li v-for="note in advisorReport.strategyNotes" :key="note">{{ note }}</li></ul></aside>
            </div>
            <div v-if="advisorReport.readiness.length" class="readiness-section">
                <div class="section-heading"><h4>College readiness</h4><span>Sorted by deadline and risk</span></div>
                <div class="readiness-table">
                    <div v-for="item in advisorReport.readiness" :key="item.college.id" class="readiness-row">
                        <div><strong>{{ item.college.name }}</strong><span>{{ item.college.category }} · {{ deadlineLabel(item.daysRemaining) }}</span></div>
                        <div class="mini-progress"><i :style="{ width: item.score + '%' }"></i></div>
                        <strong>{{ item.score }}%</strong>
                        <span class="risk-pill" :class="item.risk.toLowerCase().replaceAll(' ', '-')">{{ item.risk }}</span>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.studio-page { max-width: 1180px; margin: 0 auto; }
.studio-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 22px; }
.eyebrow { display: block; margin-bottom: 5px; color: var(--primary); font-size: 10px; font-weight: 800; text-transform: uppercase; }
.studio-header p, .tool-heading p { font-size: 13px; }
.privacy-chip { display: flex; align-items: center; gap: 7px; padding: 7px 10px; border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-secondary); font-size: 11px; white-space: nowrap; }
.privacy-chip span { width: 7px; height: 7px; border-radius: 50%; background: #10b981; }
.studio-tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-bottom: 1px solid var(--border-color); }
.studio-tabs button { display: flex; flex-direction: column; align-items: flex-start; gap: 3px; padding: 14px 16px; border: 0; border-bottom: 3px solid transparent; background: transparent; color: var(--text-secondary); cursor: pointer; text-align: left; }
.studio-tabs button strong { color: var(--text-primary); font-size: 13px; }
.studio-tabs button span { font-size: 10px; }
.studio-tabs button.active { border-bottom-color: var(--primary); background: var(--interactive-soft); }
.studio-tabs button.active strong { color: var(--primary); }
.method-note { margin-top: 9px; color: var(--text-secondary); font-size: 9px; text-align: right; }
.tool-panel { padding: 24px 0; }
.tool-heading { display: flex; justify-content: space-between; align-items: flex-end; gap: 22px; margin-bottom: 20px; }
.tool-heading h3 { margin-bottom: 4px; font-size: 18px; }
.essay-select { display: flex; min-width: min(390px, 45vw); flex-direction: column; gap: 5px; color: var(--text-secondary); font-size: 10px; font-weight: 700; }
.essay-select select { width: 100%; padding: 9px 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-input); color: var(--text-primary); }
.primary-button, .secondary-button, .text-button { padding: 9px 12px; border-radius: 6px; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
.primary-button { border: 1px solid var(--primary); background: var(--primary); color: var(--primary-contrast); }
.secondary-button { border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); }
.text-button { border: 0; background: transparent; color: var(--primary); }
.empty-state { padding: 38px 20px; border: 1px dashed var(--border-color); border-radius: 8px; text-align: center; }
.empty-state p { margin: 6px auto 15px; font-size: 12px; }
.target-strip { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 12px; padding: 13px 15px; border-left: 3px solid var(--primary); background: var(--interactive-soft); }
.target-strip div { display: flex; min-width: 0; flex-direction: column; gap: 3px; }
.target-strip span, .match-title span { color: var(--text-secondary); font-size: 9px; font-weight: 800; text-transform: uppercase; }
.target-strip strong { font-size: 12px; }
.match-list { border-top: 1px solid var(--border-color); }
.match-row { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 18px; padding: 21px 0; border-bottom: 1px solid var(--border-color); }
.match-score { width: 58px; height: 58px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid var(--border-color); border-radius: 7px; background: var(--bg-card); color: var(--text-secondary); }
.match-score.strong { border-color: var(--interactive-border); background: var(--interactive-soft); color: var(--primary); }
.match-score strong { font-size: 20px; line-height: 1; }
.match-score span { margin-top: 3px; font-size: 8px; font-weight: 800; text-transform: uppercase; }
.match-title { display: flex; justify-content: space-between; gap: 15px; }
.match-title h4 { margin-top: 2px; font-size: 14px; }
.match-reason { margin: 8px 0; font-size: 12px; }
.tag-row { display: flex; flex-wrap: wrap; gap: 5px; }
.tag-row span { padding: 4px 7px; border: 1px solid var(--interactive-border); border-radius: 4px; background: var(--interactive-soft); color: var(--primary); font-size: 9px; font-weight: 700; }
.match-guidance { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; margin-top: 13px; }
.match-guidance strong { font-size: 10px; text-transform: uppercase; }
.match-guidance ol, .match-guidance ul { margin: 7px 0 0 18px; color: var(--text-secondary); font-size: 11px; line-height: 1.55; }
.coach-overview, .advisor-overview { display: grid; grid-template-columns: 86px minmax(0, 1fr) auto; align-items: center; gap: 20px; padding: 18px 0; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); }
.advisor-overview { grid-template-columns: 86px minmax(0, 1fr); }
.score-block { width: 78px; height: 72px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 7px; background: var(--primary); color: var(--primary-contrast); box-shadow: var(--interactive-shadow); }
.score-block strong { font-size: 28px; line-height: 1; }
.score-block span { margin-top: 5px; font-size: 8px; font-weight: 800; text-transform: uppercase; }
.coach-overview h4 { margin-bottom: 4px; }
.coach-overview p, .advisor-overview p { margin-bottom: 8px; font-size: 12px; }
.coach-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(300px, .9fr); gap: 28px; padding-top: 22px; }
.category-list h4, .guidance-section h4, .section-heading h4, .strategy-section h4 { margin-bottom: 12px; font-size: 13px; }
.category-row { display: grid; grid-template-columns: minmax(0, 1fr) 150px; align-items: center; gap: 18px; padding: 12px 0; border-bottom: 1px solid var(--border-light); }
.category-row > div:first-child { display: flex; flex-direction: column; gap: 3px; }
.category-row strong { font-size: 11px; }
.category-row span { color: var(--text-secondary); font-size: 9px; }
.category-score { display: grid; grid-template-columns: 28px 1fr; align-items: center; gap: 7px; }
.category-score > span { color: var(--text-primary); font-size: 10px; font-weight: 800; }
.category-score div, .health-track, .mini-progress { height: 6px; overflow: hidden; border-radius: 3px; background: var(--border-color); }
.category-score i, .health-track i, .mini-progress i { display: block; height: 100%; background: var(--primary); }
.coach-column { display: flex; flex-direction: column; gap: 22px; }
.action-row { display: grid; grid-template-columns: 48px minmax(0, 1fr); gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border-light); }
.action-row > span, .priority-row > span { align-self: start; padding: 3px 5px; border-radius: 3px; font-size: 8px; font-weight: 800; text-align: center; text-transform: uppercase; }
.action-row > span.high, .priority-row > span.high { background: #fee2e2; color: #b91c1c; }
.action-row > span.medium, .priority-row > span.plan { background: #fef3c7; color: #92400e; }
.action-row > span.polish { background: var(--interactive-soft); color: var(--primary); }
.action-row strong { font-size: 11px; }
.action-row p { margin-top: 3px; font-size: 10px; line-height: 1.45; }
.clean-list { margin-left: 18px; color: var(--text-secondary); font-size: 11px; line-height: 1.55; }
.health-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1px; margin: 22px 0; background: var(--border-color); border: 1px solid var(--border-color); }
.health-item { padding: 13px; background: var(--bg-card); }
.health-item > div:first-child { display: flex; justify-content: space-between; gap: 8px; font-size: 10px; }
.health-item p { margin-top: 7px; font-size: 9px; line-height: 1.4; }
.health-track { margin-top: 8px; }
.advisor-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(260px, .5fr); gap: 28px; }
.section-heading { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.section-heading span { color: var(--text-secondary); font-size: 9px; }
.priority-list { border-top: 1px solid var(--border-color); }
.priority-row { width: 100%; display: grid; grid-template-columns: 48px minmax(0, 1fr) 12px; align-items: start; gap: 11px; padding: 12px 5px; border: 0; border-bottom: 1px solid var(--border-color); background: transparent; color: var(--text-primary); cursor: pointer; text-align: left; }
.priority-row:hover { background: var(--interactive-soft); }
.priority-row > span.urgent { background: #dc2626; color: white; }
.priority-row strong { font-size: 11px; }
.priority-row p { margin-top: 3px; font-size: 9px; line-height: 1.4; }
.strategy-section { padding-left: 20px; border-left: 1px solid var(--border-color); }
.quiet-state { padding: 18px; background: var(--interactive-soft); color: var(--text-secondary); font-size: 11px; }
.readiness-section { margin-top: 28px; }
.readiness-table { border-top: 1px solid var(--border-color); }
.readiness-row { display: grid; grid-template-columns: minmax(180px, 1fr) minmax(100px, 180px) 42px 100px; align-items: center; gap: 15px; padding: 11px 4px; border-bottom: 1px solid var(--border-color); }
.readiness-row > div:first-child { display: flex; flex-direction: column; gap: 2px; }
.readiness-row > div:first-child strong { font-size: 11px; }
.readiness-row > div:first-child span { color: var(--text-secondary); font-size: 9px; }
.readiness-row > strong { font-size: 10px; }
.risk-pill { padding: 4px 6px; border-radius: 4px; font-size: 8px; font-weight: 800; text-align: center; }
.risk-pill.on-track { background: #d1fae5; color: #047857; }
.risk-pill.needs-attention { background: #fef3c7; color: #92400e; }
.risk-pill.at-risk { background: #fee2e2; color: #b91c1c; }

@media (max-width: 760px) {
    .studio-header, .tool-heading { align-items: stretch; flex-direction: column; }
    .privacy-chip { align-self: flex-start; }
    .studio-tabs { display: flex; max-width: 100%; overflow-x: auto; }
    .studio-tabs button { min-width: 185px; }
    .essay-select { min-width: 0; width: 100%; }
    .target-strip { align-items: stretch; flex-direction: column; }
    .match-row { grid-template-columns: 48px minmax(0, 1fr); gap: 12px; }
    .match-score { width: 46px; height: 48px; }
    .match-score strong { font-size: 17px; }
    .match-guidance, .coach-grid, .advisor-grid { grid-template-columns: 1fr; }
    .coach-overview { grid-template-columns: 72px minmax(0, 1fr); }
    .coach-overview > button { grid-column: 1 / -1; }
    .score-block { width: 68px; height: 66px; }
    .category-row { grid-template-columns: 1fr; gap: 7px; }
    .category-score { grid-template-columns: 28px 1fr; }
    .health-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .strategy-section { padding: 20px 0 0; border-top: 1px solid var(--border-color); border-left: 0; }
    .readiness-row { grid-template-columns: minmax(0, 1fr) 45px 88px; }
    .readiness-row .mini-progress { grid-column: 1 / -1; grid-row: 2; }
}
</style>
