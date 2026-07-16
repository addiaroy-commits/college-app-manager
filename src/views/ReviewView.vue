<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
import { useCollegeStore } from "../stores/collegeStore";
import { useEssayStore } from "../stores/essayStore";
import { useDocumentStore } from "../stores/documentStore";
import { useCostStore } from "../stores/costStore";
import { useApplicationStore } from "../stores/applicationStore";
import { usePreferenceStore } from "../stores/preferenceStore";
import { useDeadlineTimeline } from "../composables/useDeadlineTimeline";

const router = useRouter();
const user = useUserStore();
const colleges = useCollegeStore();
const essays = useEssayStore();
const documents = useDocumentStore();
const costs = useCostStore();
const applications = useApplicationStore();
const preferences = usePreferenceStore();
applications.ensureApplications(colleges.colleges);
const { events: timelineEvents } = useDeadlineTimeline();

const submitted = computed(() => applications.applications.filter((item) => ["Submitted", "Accepted", "Waitlisted", "Deferred", "Rejected"].includes(item.status)).length);
const completedEssays = computed(() => essays.essays.filter((essay) => essay.status === "Done").length);
const openTasks = computed(() => applications.tasks.filter((task) => task.status !== "Done"));
const averageCompletion = computed(() => {
    if (!applications.applications.length) return 0;
    const total = applications.applications.reduce((sum, application) => {
        const active = application.checklist.filter((item) => item.status !== "Not Needed");
        const done = active.filter((item) => item.status === "Done").length;
        return sum + (active.length ? done / active.length : 0);
    }, 0);
    return Math.round((total / applications.applications.length) * 100);
});

const applicationRows = computed(() => colleges.colleges.map((college) => {
    const application = applications.applications.find((item) => item.collegeId === college.id);
    const active = application?.checklist.filter((item) => item.status !== "Not Needed") || [];
    const done = active.filter((item) => item.status === "Done").length;
    return { college, status: application?.status || "Not Started", completion: active.length ? Math.round((done / active.length) * 100) : 0, done, total: active.length };
}).sort((a, b) => new Date(a.college.deadline || "2999-12-31").getTime() - new Date(b.college.deadline || "2999-12-31").getTime()));

const upcoming = computed(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    return timelineEvents.value
        .filter((event) => new Date(`${event.date}T00:00:00`) >= today)
        .map((event) => ({ id: event.id, title: event.title, date: event.date, type: event.kind.replace("-", " ") }))
        .slice(0, 8);
});

const costSummary = computed(() => {
    if (!costs.costs.length) return null;
    return {
        averageNet: Math.round(costs.costs.reduce((sum, item) => sum + item.netCost, 0) / costs.costs.length),
        lowest: [...costs.costs].sort((a,b) => a.netCost - b.netCost)[0],
    };
});

function formatDate(value: string) {
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function printPage() {
    window.print();
}
</script>

<template>
    <div class="review-page">
        <header class="review-header">
            <div><span class="review-label">Read-only progress review</span><h2>{{ user.username }}'s Application Overview</h2><p>Prepared {{ new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) }}</p></div>
            <div class="review-actions"><button @click="printPage">Print</button><button class="primary" @click="router.push('/settings')">Exit review</button></div>
        </header>

        <div v-if="preferences.preferences.reviewMessage" class="student-note"><strong>Student note</strong><p>{{ preferences.preferences.reviewMessage }}</p></div>

        <section class="metric-grid">
            <div><strong>{{ colleges.colleges.length }}</strong><span>Colleges tracked</span></div>
            <div><strong>{{ submitted }}</strong><span>Applications submitted</span></div>
            <div><strong>{{ completedEssays }}/{{ essays.essays.length }}</strong><span>Essays complete</span></div>
            <div><strong>{{ averageCompletion }}%</strong><span>Checklist progress</span></div>
        </section>

        <section class="review-section">
            <div class="section-heading"><h3>Application Progress</h3><span>{{ openTasks.length }} open tasks</span></div>
            <div v-if="applicationRows.length" class="application-list">
                <div v-for="row in applicationRows" :key="row.college.id" class="application-row">
                    <div class="college-copy"><strong>{{ row.college.name }}</strong><span>{{ row.college.category }} · {{ row.college.applicationType || 'Regular' }} · {{ row.college.deadline ? formatDate(row.college.deadline) : 'No deadline' }}</span></div>
                    <span class="status-badge">{{ row.status }}</span>
                    <div class="progress-copy"><span>{{ row.done }}/{{ row.total }}</span><div><i :style="{ width: row.completion + '%' }"></i></div></div>
                </div>
            </div>
            <p v-else class="empty">No colleges have been added yet.</p>
        </section>

        <div class="review-columns">
            <section class="review-section">
                <div class="section-heading"><h3>Upcoming</h3><span>Next 8 dates</span></div>
                <div v-if="upcoming.length" class="upcoming-list"><div v-for="item in upcoming" :key="item.id"><span><strong>{{ item.title }}</strong><small>{{ item.type }}</small></span><time>{{ formatDate(item.date) }}</time></div></div>
                <p v-else class="empty">No upcoming deadlines.</p>
            </section>
            <section class="review-section">
                <div class="section-heading"><h3>Supporting Materials</h3><span>Private contents hidden</span></div>
                <dl class="support-list"><div><dt>Documents organized</dt><dd>{{ documents.documents.length }}</dd></div><div><dt>Recommendation letters</dt><dd>{{ applications.recommendations.filter(item => item.status === 'Submitted').length }}/{{ applications.recommendations.length }}</dd></div><div><dt>Open high-priority tasks</dt><dd>{{ openTasks.filter(task => task.priority === 'High').length }}</dd></div><div><dt>Essays drafting</dt><dd>{{ essays.essays.filter(essay => essay.status === 'Drafting').length }}</dd></div></dl>
            </section>
        </div>

        <section v-if="preferences.preferences.reviewShowFinancials && costSummary" class="review-section financial-section">
            <div class="section-heading"><h3>Financial Snapshot</h3><span>Estimates only</span></div>
            <div class="financial-row"><div><strong>${{ costSummary.averageNet.toLocaleString() }}</strong><span>Average estimated net cost</span></div><div><strong>{{ costSummary.lowest.collegeName }}</strong><span>Lowest estimate · ${{ costSummary.lowest.netCost.toLocaleString() }}</span></div></div>
        </section>

        <footer class="privacy-note">This view intentionally hides essay text, document contents, portal links, usernames, and private notes.</footer>
    </div>
</template>

<style scoped>
.review-page { max-width: 1100px; margin: 0 auto; }
.review-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; padding-bottom: 22px; border-bottom: 2px solid var(--text-primary); }
.review-label { display: block; margin-bottom: 7px; color: var(--primary); font-size: 10px; font-weight: 800; text-transform: uppercase; }
.review-header h2 { margin: 0 0 4px; }
.review-header p { font-size: 12px; }
.review-actions { display: flex; gap: 8px; }
.review-actions button { padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-card); color: var(--text-primary); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.review-actions .primary { border-color: var(--primary); background: var(--primary); color: white; }
.student-note { margin: 18px 0; padding: 14px 16px; border-left: 3px solid var(--primary); background: var(--card-accent); }
.student-note strong { font-size: 11px; text-transform: uppercase; }
.student-note p { margin-top: 5px; color: var(--text-primary); font-size: 13px; line-height: 1.5; white-space: pre-wrap; }
.metric-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; margin: 22px 0; border: 1px solid var(--border-color); background: var(--border-color); }
.metric-grid > div { padding: 18px; background: var(--bg-card); }
.metric-grid strong { display: block; font-size: 25px; }
.metric-grid span { color: var(--text-secondary); font-size: 11px; }
.review-section { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color); }
.section-heading { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 12px; }
.section-heading h3 { font-size: 15px; }
.section-heading span { color: var(--text-secondary); font-size: 10px; }
.application-list { border: 1px solid var(--border-color); border-radius: 7px; overflow: hidden; }
.application-row { display: grid; grid-template-columns: minmax(220px,1fr) 130px 150px; align-items: center; gap: 18px; padding: 13px 15px; border-bottom: 1px solid var(--border-light); }
.application-row:last-child { border-bottom: 0; }
.college-copy { display: flex; min-width: 0; flex-direction: column; gap: 3px; }
.college-copy strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
.college-copy span { color: var(--text-secondary); font-size: 10px; }
.status-badge { color: var(--text-secondary); font-size: 11px; }
.progress-copy { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 10px; }
.progress-copy div { flex: 1; height: 6px; overflow: hidden; border-radius: 3px; background: var(--border-color); }
.progress-copy i { display: block; height: 100%; background: var(--primary); }
.review-columns { display: grid; grid-template-columns: 1.15fr .85fr; gap: 28px; }
.upcoming-list > div { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border-light); }
.upcoming-list span { display: flex; flex-direction: column; gap: 2px; }
.upcoming-list strong { font-size: 12px; }
.upcoming-list small, .upcoming-list time { color: var(--text-secondary); font-size: 10px; }
.support-list > div { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-light); }
.support-list dt { color: var(--text-secondary); font-size: 11px; }
.support-list dd { font-size: 12px; font-weight: 800; }
.financial-row { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; }
.financial-row > div { padding: 14px; border: 1px solid var(--border-color); border-radius: 7px; }
.financial-row strong, .financial-row span { display: block; }
.financial-row strong { font-size: 16px; }
.financial-row span { margin-top: 3px; color: var(--text-secondary); font-size: 10px; }
.privacy-note { margin: 28px 0 8px; color: var(--text-secondary); font-size: 10px; text-align: center; }
.empty { padding: 20px; color: var(--text-secondary); font-size: 12px; text-align: center; }
@media (max-width: 760px) {
    .review-header { flex-direction: column; }
    .review-actions { width: 100%; }
    .review-actions button { flex: 1; }
    .metric-grid { grid-template-columns: repeat(2,1fr); }
    .review-columns { grid-template-columns: 1fr; gap: 0; }
    .application-row { grid-template-columns: 1fr auto; gap: 8px; }
    .progress-copy { grid-column: 1 / -1; }
    .financial-row { grid-template-columns: 1fr; }
}
@media print {
    .review-actions { display: none; }
    .review-page { max-width: none; color: #111; }
    .metric-grid > div, .application-list, .financial-row > div { break-inside: avoid; }
}
</style>
