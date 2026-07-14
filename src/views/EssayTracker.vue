<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useEssayStore, type Essay } from "../stores/essayStore";
import { useCollegeStore } from "../stores/collegeStore";
import { getUserKey } from "../stores/userKey";
import { showToast } from "../composables/useToast";

const router = useRouter();
const essayStore = useEssayStore();
const collegeStore = useCollegeStore();

const selectedCollegeId = ref<string | null>(null);
const showCommonApp = ref(false);
const showEditor = ref(false);
const editingId = ref<string | null>(null);
const essayContent = ref("");
const showConfetti = ref(false);
const collegeSearch = ref("");
let confettiTimer: number | null = null;
const tempTarget = ref<number | null>(null);

const essayTargets = ref<Record<string, number>>({});

const commonAppPrompts = [
    "Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it.",
    "The lessons we take from obstacles we encounter can be fundamental to later success. Recount a time when you faced a challenge, setback, or failure.",
    "Reflect on a time when you questioned or challenged a belief or idea. What prompted your thinking? What was the outcome?",
    "Reflect on something that someone has done for you that has made you happy or thankful in a surprising way.",
    "Discuss an accomplishment, event, or realization that sparked a period of personal growth and a new understanding of yourself or others.",
    "Describe a topic, idea, or concept you find so engaging that it makes you lose all track of time.",
    "Share an essay on any topic of your choice.",
];

(function loadTargets() {
    const saved = localStorage.getItem(getUserKey("essay-targets"));
    if (saved) essayTargets.value = JSON.parse(saved);
})();

function saveTargets() {
    localStorage.setItem(
        getUserKey("essay-targets"),
        JSON.stringify(essayTargets.value),
    );
}

const form = ref({
    title: "",
    prompt: "",
    targetWordCount: 650,
    status: "Not Started" as Essay["status"],
});

const selectedCollege = computed(() =>
    collegeStore.colleges.find((c) => c.id === selectedCollegeId.value),
);
const collegeEssays = computed(() =>
    selectedCollegeId.value
        ? essayStore.essays.filter(
              (e) => e.collegeId === selectedCollegeId.value,
          )
        : [],
);
const commonAppEssays = computed(() =>
    essayStore.essays.filter((e) => e.collegeId === "common-app"),
);
const commonAppStats = computed(() => ({
    total: commonAppEssays.value.length,
    done: commonAppEssays.value.filter((e) => e.status === "Done").length,
    drafting: commonAppEssays.value.filter((e) => e.status === "Drafting")
        .length,
}));

const scholarshipOtherEssays = computed(() =>
    essayStore.essays.filter((e) => e.collegeId === "scholarship-other"),
);
const scholarshipOtherStats = computed(() => {
    const essays = scholarshipOtherEssays.value;
    return {
        total: essays.length,
        done: essays.filter((e) => e.status === "Done").length,
        drafting: essays.filter((e) => e.status === "Drafting").length,
    };
});

const filteredColleges = computed(() => {
    if (!collegeSearch.value.trim()) return collegeStore.colleges;
    const q = collegeSearch.value.toLowerCase();
    return collegeStore.colleges.filter((c) =>
        c.name.toLowerCase().includes(q),
    );
});

function isPromptAdded(promptIndex: number): boolean {
    return essayStore.essays.some(
        (e) =>
            e.collegeId === "common-app" &&
            e.prompt === commonAppPrompts[promptIndex],
    );
}
function getPromptEssay(promptIndex: number): Essay | undefined {
    return essayStore.essays.find(
        (e) =>
            e.collegeId === "common-app" &&
            e.prompt === commonAppPrompts[promptIndex],
    );
}
function togglePrompt(promptIndex: number) {
    const existing = getPromptEssay(promptIndex);
    if (existing) {
        essayStore.deleteEssay(existing.id);
    } else {
        essayStore.addEssay({
            id: crypto.randomUUID(),
            title: `Common App Prompt #${promptIndex + 1}`,
            collegeId: "common-app",
            collegeName: "Common App",
            prompt: commonAppPrompts[promptIndex],
            targetWordCount: 650,
            currentWordCount: 0,
            status: "Not Started",
            content: "",
        });
    }
}

const currentWordCount = computed(() => {
    const t = essayContent.value.trim();
    return t ? t.split(/\s+/).length : 0;
});

watch(
    () => form.value.status,
    (newStatus) => {
        if (newStatus === "Done") {
            showConfetti.value = true;
            if (confettiTimer) clearTimeout(confettiTimer);
            confettiTimer = setTimeout(() => {
                showConfetti.value = false;
            }, 3000);
        }
    },
);
watch(essayContent, () => {
    if (editingId.value) {
        const essay = essayStore.essays.find((e) => e.id === editingId.value);
        if (essay) {
            essay.currentWordCount = currentWordCount.value;
            essay.content = essayContent.value;
            essayStore.updateEssay(editingId.value, essay);
        }
    }
});

const showScholarshipOther = ref(false);
const isScholarshipEssay = ref(false);
const scholarshipOtherForm = ref({
    title: "",
    prompt: "",
    targetWordCount: 650,
    status: "Not Started" as Essay["status"],
    essayType: "scholarship" as string,
    customName: "",
});
const scholarshipOtherTypes = [
    { value: "scholarship", label: "🎓 Scholarship Essay" },
    { value: "other", label: "📝 Other (custom)" },
];

function openAddScholarshipOther() {
    editingId.value = null;
    isScholarshipEssay.value = true;
    essayContent.value = "";
    scholarshipOtherForm.value = {
        title: "",
        prompt: "",
        targetWordCount: 650,
        status: "Not Started",
        essayType: "scholarship",
        customName: "",
    };
    showEditor.value = true;
}
function saveScholarshipOtherEssay() {
    if (!form.value.title.trim()) return;
    const eType = scholarshipOtherForm.value.essayType;
    const displayType =
        eType === "other" && scholarshipOtherForm.value.customName.trim()
            ? scholarshipOtherForm.value.customName.trim()
            : eType;
    if (editingId.value) {
        essayStore.updateEssay(editingId.value, {
            id: editingId.value,
            title: form.value.title.trim(),
            collegeId: "scholarship-other",
            collegeName: "Scholarship / Other",
            prompt: form.value.prompt.trim(),
            targetWordCount: form.value.targetWordCount,
            currentWordCount: currentWordCount.value,
            status: form.value.status,
            content: essayContent.value,
            essayType: displayType as any,
        });
    } else {
        essayStore.addEssay({
            id: crypto.randomUUID(),
            title: form.value.title.trim(),
            collegeId: "scholarship-other",
            collegeName: "Scholarship / Other",
            prompt: form.value.prompt.trim(),
            targetWordCount: form.value.targetWordCount,
            currentWordCount: 0,
            status: "Not Started",
            content: "",
            essayType: displayType as any,
        });
    }
    showEditor.value = false;
    editingId.value = null;
    isScholarshipEssay.value = false;
}

function openCollege(id: string) {
    isScholarshipEssay.value = false;
    selectedCollegeId.value = id;
    tempTarget.value = hasTarget(id) ? getTarget(id) : null;
}
function getEssayStats(collegeId: string) {
    const essays = essayStore.essays.filter((e) => e.collegeId === collegeId);
    return {
        total: essays.length,
        done: essays.filter((e) => e.status === "Done").length,
    };
}
function setTarget(collegeId: string, val: number | null) {
    if (!val || val <= 0) {
        delete essayTargets.value[collegeId];
    } else {
        essayTargets.value[collegeId] = val;
    }
    saveTargets();
}
function hasTarget(collegeId: string) {
    return (
        essayTargets.value[collegeId] !== undefined &&
        essayTargets.value[collegeId] > 0
    );
}
function getTarget(collegeId: string) {
    return essayTargets.value[collegeId] ?? 0;
}
function openAddEssay() {
    editingId.value = null;
    essayContent.value = "";
    form.value = {
        title: "",
        prompt: "",
        targetWordCount: 650,
        status: "Not Started",
    };
    showEditor.value = true;
}
function saveEssay() {
    if (!form.value.title.trim()) return;
    essayStore.addEssay({
        id: crypto.randomUUID(),
        title: form.value.title.trim(),
        collegeId: selectedCollegeId.value!,
        collegeName: selectedCollege.value?.name ?? "",
        prompt: form.value.prompt.trim(),
        targetWordCount: form.value.targetWordCount,
        currentWordCount: 0,
        status: "Not Started",
        content: "",
    });
    showEditor.value = false;
    editingId.value = null;
}
function removeEssay(id: string) {
    const essay = essayStore.essays.find((e) => e.id === id);
    if (!essay) return;
    const snapshot = { ...essay };
    essayStore.deleteEssay(id);
    showToast(`"${snapshot.title}" deleted`, () => {
        essayStore.addEssay(snapshot);
        showToast(`"${snapshot.title}" restored`);
    });
}
function statusColor(s: string) {
    if (s === "Done") return "status-done";
    if (s === "Drafting") return "status-drafting";
    return "status-not-started";
}
</script>

<template>
    <div>
        <div v-if="showConfetti" class="confetti-container">
            <div
                v-for="i in 50"
                :key="i"
                class="confetti-piece"
                :style="{
                    left: Math.random() * 100 + '%',
                    animationDelay: Math.random() * 2 + 's',
                    backgroundColor: [
                        '#ff6b6b',
                        '#ffd93d',
                        '#6bcb77',
                        '#4d96ff',
                        '#ff922b',
                        '#cc5de8',
                    ][i % 6],
                }"
            ></div>
        </div>

        <div class="page-header">
            <h2>✍️ Essay Tracker</h2>
            <button class="studio-link" @click="router.push('/ai-studio')">Open AI Studio</button>
        </div>
        <p class="welcome">
            Manage college essays, Common App prompts, and scholarship & award
            essays.
        </p>

        <input
            v-model="collegeSearch"
            type="text"
            placeholder="🔍 Search colleges..."
            class="essay-search"
        />

        <!-- Common App Card -->
        <div class="common-app-card" @click="showCommonApp = true">
            <div class="common-app-header">
                <span class="common-app-icon">🎓</span>
                <div>
                    <div class="common-app-name">Common App Essays</div>
                    <div class="common-app-sub">7 prompts available</div>
                </div>
            </div>
            <div class="common-app-stats">
                <template v-if="commonAppStats.total > 0"
                    >📝 {{ commonAppStats.total }} selected ·
                    {{ commonAppStats.done }} done ·
                    {{ commonAppStats.drafting }} drafting</template
                >
                <span v-else class="no-essays"
                    >Click to choose your prompts</span
                >
            </div>
            <div v-if="commonAppStats.total > 0" class="ca-progress">
                <div class="mini-bar">
                    <div
                        class="mini-fill"
                        :style="{
                            width: (commonAppStats.total / 7) * 100 + '%',
                            background: '#7c3aed',
                        }"
                    ></div>
                </div>
                <span class="mini-label">{{ commonAppStats.total }}/7</span>
            </div>
        </div>

        <!-- Scholarship / Awards / Other Essays Card -->
        <div
            class="common-app-card"
            style="border-color: #10b981"
            @click="showScholarshipOther = true"
        >
            <div class="common-app-header">
                <span class="common-app-icon">📝</span>
                <div>
                    <div class="common-app-name">
                        Scholarship, Awards & Other Essays
                    </div>
                    <div class="common-app-sub">
                        Scholarship · Award · Competition · Fellowship ·
                        Personal
                    </div>
                </div>
            </div>
            <div class="common-app-stats">
                <template v-if="scholarshipOtherStats.total > 0">
                    📝 {{ scholarshipOtherStats.total }} essays ·
                    {{ scholarshipOtherStats.done }} done ·
                    {{ scholarshipOtherStats.drafting }} drafting
                </template>
                <span v-else class="no-essays"
                    >Click to add scholarship or personal essays</span
                >
            </div>
            <div v-if="scholarshipOtherStats.total > 0" class="ca-progress">
                <div class="mini-bar">
                    <div
                        class="mini-fill"
                        :style="{
                            width:
                                Math.min(
                                    (scholarshipOtherStats.done /
                                        Math.max(
                                            scholarshipOtherStats.total,
                                            1,
                                        )) *
                                        100,
                                    100,
                                ) + '%',
                            background: '#10b981',
                        }"
                    ></div>
                </div>
                <span class="mini-label"
                    >{{ scholarshipOtherStats.done }}/{{
                        scholarshipOtherStats.total
                    }}
                    done</span
                >
            </div>
        </div>

        <p v-if="filteredColleges.length === 0" class="empty-text">
            {{
                collegeSearch
                    ? "No colleges match your search."
                    : "Add colleges from the 🏫 College List page!"
            }}
        </p>

        <!-- College Cards -->
        <div v-else class="college-grid">
            <div
                v-for="college in filteredColleges"
                :key="college.id"
                class="college-card"
                @click="openCollege(college.id)"
            >
                <div class="card-top">
                    <span class="card-name">{{ college.name }}</span
                    ><span
                        class="category-badge"
                        :class="college.category.toLowerCase()"
                        >{{ college.category }}</span
                    >
                </div>
                <div class="card-essays">
                    <template v-if="getEssayStats(college.id).total > 0"
                        >📝 {{ getEssayStats(college.id).total }} essays ·
                        {{ getEssayStats(college.id).done }} done</template
                    ><span v-else class="no-essays">No essays yet</span>
                </div>
                <div v-if="hasTarget(college.id)" class="card-progress">
                    <div class="mini-bar">
                        <div
                            class="mini-fill"
                            :style="{
                                width:
                                    Math.min(
                                        (getEssayStats(college.id).total /
                                            Math.max(
                                                getTarget(college.id),
                                                1,
                                            )) *
                                            100,
                                        100,
                                    ) + '%',
                                background:
                                    getEssayStats(college.id).total >=
                                    getTarget(college.id)
                                        ? '#059669'
                                        : '#1e1b4b',
                            }"
                        ></div>
                    </div>
                    <span class="mini-label"
                        >{{ getEssayStats(college.id).total }}/{{
                            getTarget(college.id)
                        }}</span
                    >
                </div>
            </div>
        </div>

        <!-- Common App Popup -->
        <div
            v-if="showCommonApp"
            class="modal-overlay"
            @click="showCommonApp = false"
        >
            <div class="modal ca-modal" @click.stop>
                <div class="modal-header ca-header">
                    <h3>🎓 Common App Essay Prompts</h3>
                    <button class="btn-close" @click="showCommonApp = false">
                        ✕
                    </button>
                </div>
                <div class="ca-subheader">
                    Choose the prompts you want to work on. Click again to
                    remove.
                </div>
                <div class="modal-body">
                    <div
                        v-for="(prompt, idx) in commonAppPrompts"
                        :key="idx"
                        class="ca-row"
                    >
                        <div class="ca-num">#{{ idx + 1 }}</div>
                        <div class="ca-prompt-text">{{ prompt }}</div>
                        <div class="ca-actions">
                            <span
                                v-if="getPromptEssay(idx)"
                                class="status-badge"
                                :class="
                                    statusColor(getPromptEssay(idx)!.status)
                                "
                                >{{ getPromptEssay(idx)!.status }}</span
                            >
                            <button
                                v-if="getPromptEssay(idx)"
                                class="mini-view-btn"
                                @click="
                                    router.push(
                                        '/essays/college/common-app/essay/' +
                                            getPromptEssay(idx)!.id,
                                    );
                                    showCommonApp = false;
                                "
                            >
                                View →
                            </button>
                            <button
                                class="ca-toggle"
                                @click="togglePrompt(idx)"
                            >
                                {{
                                    isPromptAdded(idx) ? "✕ Remove" : "+ Select"
                                }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- College Detail Modal -->
        <div
            v-if="selectedCollege"
            class="modal-overlay"
            @click="selectedCollegeId = null"
        >
            <div class="modal" @click.stop>
                <div class="modal-header">
                    <h3>📝 {{ selectedCollege.name }}</h3>
                    <button class="btn-close" @click="selectedCollegeId = null">
                        ✕
                    </button>
                </div>
                <div class="target-section">
                    <div
                        v-if="!hasTarget(selectedCollegeId!)"
                        class="target-prompt"
                    >
                        <span
                            >🎯 How many essays for
                            {{ selectedCollege.name }}?</span
                        >
                        <div class="target-input-row">
                            <input
                                v-model.number="tempTarget"
                                type="number"
                                min="1"
                                placeholder="e.g. 3"
                                class="target-input"
                            /><button
                                class="btn-save"
                                @click="
                                    setTarget(selectedCollegeId!, tempTarget);
                                    tempTarget = null;
                                "
                            >
                                Set
                            </button>
                        </div>
                    </div>
                    <div v-else class="progress-banner">
                        <div class="progress-row">
                            <span class="progress-label"
                                >{{ collegeEssays.length }}/{{
                                    getTarget(selectedCollegeId!)
                                }}
                                essays ·
                                {{ getEssayStats(selectedCollegeId!).done }}
                                done</span
                            ><button
                                class="edit-target-btn"
                                @click="
                                    tempTarget = getTarget(selectedCollegeId!);
                                    delete essayTargets[selectedCollegeId!];
                                    saveTargets();
                                "
                            >
                                Edit
                            </button>
                        </div>
                        <div class="progress-bar">
                            <div
                                class="progress-fill"
                                :style="{
                                    width:
                                        Math.min(
                                            (collegeEssays.length /
                                                Math.max(
                                                    getTarget(
                                                        selectedCollegeId!,
                                                    ),
                                                    1,
                                                )) *
                                                100,
                                            100,
                                        ) + '%',
                                    background:
                                        collegeEssays.length >=
                                        getTarget(selectedCollegeId!)
                                            ? '#059669'
                                            : '#1e1b4b',
                                }"
                            ></div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button
                        class="view-full-btn"
                        @click="
                            router.push('/essays/college/' + selectedCollegeId)
                        "
                    >
                        📖 View Full</button
                    ><button class="btn-add" @click="openAddEssay">
                        + Add Essay
                    </button>
                </div>
                <div class="modal-body">
                    <p v-if="collegeEssays.length === 0" class="empty-text">
                        No essays yet.
                    </p>
                    <div
                        v-for="essay in collegeEssays"
                        :key="essay.id"
                        class="essay-row"
                    >
                        <div class="essay-info">
                            <div class="essay-title">{{ essay.title }}</div>
                            <div class="essay-meta">
                                {{ essay.currentWordCount }} /
                                {{ essay.targetWordCount }} words<span
                                    v-if="essay.prompt"
                                >
                                    · 💬 {{ essay.prompt.slice(0, 35)
                                    }}{{
                                        essay.prompt.length > 35 ? "..." : ""
                                    }}</span
                                ><span
                                    v-if="essay.content?.startsWith('FILE:')"
                                    class="attached-badge"
                                    >📎 Attached</span
                                >
                            </div>
                        </div>
                        <span
                            class="status-badge"
                            :class="statusColor(essay.status)"
                            >{{ essay.status }}</span
                        >
                        <button
                            class="mini-view-btn"
                            @click="
                                router.push(
                                    '/essays/college/' +
                                        selectedCollegeId +
                                        '/essay/' +
                                        essay.id,
                                )
                            "
                        >
                            View →
                        </button>
                        <button
                            class="mini-del-btn"
                            @click.stop="removeEssay(essay.id)"
                            title="Delete"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div
            v-if="showEditor"
            class="modal-overlay editor-z"
            @click="showEditor = false"
        >
            <div class="modal editor-modal" @click.stop>
                <div class="modal-header">
                    <h3>
                        {{
                            editingId &&
                            essayStore.essays.find((e) => e.id === editingId)
                                ?.collegeId === "scholarship-other"
                                ? "Edit Scholarship Essay"
                                : selectedCollegeId
                                  ? "New Essay for " +
                                    (selectedCollege?.name || "")
                                  : "New Scholarship Essay"
                        }}
                    </h3>
                    <button class="btn-close" @click="showEditor = false">
                        ✕
                    </button>
                </div>
                <div class="modal-body">
                    <div
                        v-if="
                            isScholarshipEssay ||
                            (editingId &&
                                essayStore.essays.find(
                                    (e) => e.id === editingId,
                                )?.collegeId === 'scholarship-other')
                        "
                        class="field"
                    >
                        <label>Essay Type</label>
                        <select v-model="scholarshipOtherForm.essayType">
                            <option
                                v-for="t in scholarshipOtherTypes"
                                :key="t.value"
                                :value="t.value"
                            >
                                {{ t.label }}
                            </option>
                        </select>
                        <input
                            v-if="scholarshipOtherForm.essayType === 'other'"
                            v-model="scholarshipOtherForm.customName"
                            type="text"
                            placeholder="e.g. Award, Competition, Fellowship..."
                            style="margin-top: 6px"
                        />
                    </div>
                    <div class="field">
                        <label>Essay Title *</label
                        ><input
                            v-model="form.title"
                            type="text"
                            placeholder="e.g. Personal Statement"
                        />
                    </div>
                    <div class="field">
                        <label>Prompt (optional)</label
                        ><textarea
                            v-model="form.prompt"
                            rows="2"
                            placeholder="What is the essay question?"
                        ></textarea>
                    </div>
                    <div class="field">
                        <label>Target Word Count</label
                        ><input
                            v-model.number="form.targetWordCount"
                            type="number"
                            min="0"
                        />
                    </div>
                </div>
                <div class="modal-footer">
                    <button
                        class="btn-save"
                        @click="
                            isScholarshipEssay ||
                            (editingId &&
                                essayStore.essays.find(
                                    (e) => e.id === editingId,
                                )?.collegeId === 'scholarship-other')
                                ? saveScholarshipOtherEssay()
                                : saveEssay()
                        "
                    >
                        Add Essay</button
                    ><button class="btn-cancel" @click="showEditor = false">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
        <!-- Scholarship / Other Essays Popup -->
        <div
            v-if="showScholarshipOther"
            class="modal-overlay"
            @click="showScholarshipOther = false"
        >
            <div class="modal ca-modal" @click.stop>
                <div class="modal-header ca-header">
                    <h3>📝 Scholarship, Awards & Other Essays</h3>
                    <button
                        class="btn-close"
                        @click="showScholarshipOther = false"
                    >
                        ✕
                    </button>
                </div>
                <div class="ca-subheader">
                    Essays not tied to a specific college. Use for scholarships,
                    awards, competitions, fellowships, and personal essays.
                </div>
                <div class="modal-body">
                    <!-- Scholarship Essays -->
                    <h4
                        style="
                            margin: 0 0 8px;
                            font-size: 14px;
                            color: var(--text-primary);
                        "
                    >
                        🎓 Scholarship Essays
                    </h4>
                    <p
                        v-if="
                            scholarshipOtherEssays.filter(
                                (e) =>
                                    !e.essayType ||
                                    e.essayType === 'scholarship',
                            ).length === 0
                        "
                        class="empty-text"
                    >
                        No scholarship essays yet.
                    </p>
                    <div
                        v-for="essay in scholarshipOtherEssays.filter(
                            (e) =>
                                !e.essayType || e.essayType === 'scholarship',
                        )"
                        :key="essay.id"
                        class="essay-row"
                    >
                        <div class="essay-info">
                            <div class="essay-title">{{ essay.title }}</div>
                            <div class="essay-meta">
                                📝 {{ essay.currentWordCount }} /
                                {{ essay.targetWordCount }} words<span
                                    v-if="essay.prompt"
                                >
                                    · 💬 {{ essay.prompt.slice(0, 35)
                                    }}{{
                                        essay.prompt.length > 35 ? "..." : ""
                                    }}</span
                                >
                            </div>
                        </div>
                        <span
                            class="status-badge"
                            :class="statusColor(essay.status)"
                            >{{ essay.status }}</span
                        >
                        <button
                            class="mini-view-btn"
                            @click="
                                router.push(
                                    '/essays/college/scholarship-other/essay/' +
                                        essay.id,
                                );
                                showScholarshipOther = false;
                            "
                        >
                            View →
                        </button>
                        <button
                            class="mini-del-btn"
                            @click.stop="removeEssay(essay.id)"
                            title="Delete"
                        >
                            🗑️
                        </button>
                    </div>

                    <!-- Other Essays -->
                    <h4
                        style="
                            margin: 16px 0 8px;
                            font-size: 14px;
                            color: var(--text-primary);
                        "
                    >
                        📝 Other Essays
                    </h4>
                    <p
                        v-if="
                            scholarshipOtherEssays.filter(
                                (e) =>
                                    e.essayType &&
                                    e.essayType !== 'scholarship',
                            ).length === 0
                        "
                        class="empty-text"
                    >
                        No other essays yet.
                    </p>
                    <div
                        v-for="essay in scholarshipOtherEssays.filter(
                            (e) => e.essayType && e.essayType !== 'scholarship',
                        )"
                        :key="essay.id"
                        class="essay-row"
                    >
                        <div class="essay-info">
                            <div class="essay-title">
                                {{ essay.title }}
                                <span class="so-type-badge so-other">{{
                                    essay.essayType
                                }}</span>
                            </div>
                            <div class="essay-meta">
                                📝 {{ essay.currentWordCount }} /
                                {{ essay.targetWordCount }} words<span
                                    v-if="essay.prompt"
                                >
                                    · 💬 {{ essay.prompt.slice(0, 35)
                                    }}{{
                                        essay.prompt.length > 35 ? "..." : ""
                                    }}</span
                                >
                            </div>
                        </div>
                        <span
                            class="status-badge"
                            :class="statusColor(essay.status)"
                            >{{ essay.status }}</span
                        >
                        <button
                            class="mini-view-btn"
                            @click="
                                router.push(
                                    '/essays/college/scholarship-other/essay/' +
                                        essay.id,
                                );
                                showScholarshipOther = false;
                            "
                        >
                            View →
                        </button>
                        <button
                            class="mini-del-btn"
                            @click.stop="removeEssay(essay.id)"
                            title="Delete"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
                <div
                    class="modal-footer"
                    style="
                        padding: 14px 24px;
                        border-top: 1px solid var(--border-color);
                    "
                >
                    <button class="btn-add" @click="openAddScholarshipOther">
                        + Add Essay
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
}
.page-header h2 {
    margin-bottom: 0;
    font-size: 24px;
}
.studio-link {
    padding: 9px 12px;
    border: 1px solid var(--primary);
    border-radius: 6px;
    background: var(--primary);
    color: var(--primary-contrast);
    font-size: 11px;
    font-weight: 800;
    cursor: pointer;
}
.welcome {
    color: var(--text-secondary);
    margin-bottom: 16px;
}
.essay-search {
    width: 100%;
    padding: 10px 16px;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    font-size: 14px;
    margin-bottom: 16px;
    background: var(--bg-input);
    color: var(--text-primary);
    font-family: inherit;
    box-sizing: border-box;
}
.essay-search:focus {
    outline: none;
    border-color: #1e1b4b;
    box-shadow: 0 0 0 2px rgba(30, 27, 75, 0.15);
}
.common-app-card {
    background: linear-gradient(
        135deg,
        var(--bg-card),
        rgba(124, 58, 237, 0.06)
    );
    border: 1px solid #c4b5fd;
    border-radius: 12px;
    padding: 18px 20px;
    cursor: pointer;
    margin-bottom: 20px;
    transition: all 0.15s;
}
.common-app-card:hover {
    box-shadow: var(--shadow);
    border-color: #7c3aed;
}
.common-app-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
}
.common-app-icon {
    font-size: 32px;
}
.common-app-name {
    font-weight: 700;
    font-size: 16px;
    color: var(--text-primary);
}
.common-app-sub {
    font-size: 12px;
    color: var(--text-secondary);
}
.common-app-stats {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 8px;
}
.ca-progress {
    display: flex;
    align-items: center;
    gap: 10px;
}
.ca-modal {
    max-width: 640px;
}
.ca-header {
    background: linear-gradient(135deg, #ede9fe, #ddd6fe);
}
.ca-subheader {
    font-size: 13px;
    color: var(--text-secondary);
    padding: 10px 24px;
    border-bottom: 1px solid var(--border-color);
}
.ca-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-color);
}
.ca-row:last-child {
    border-bottom: none;
}
.ca-num {
    font-weight: 800;
    font-size: 18px;
    color: #7c3aed;
    min-width: 28px;
    text-align: center;
}
.ca-prompt-text {
    flex: 1;
    font-size: 13px;
    color: var(--text-primary);
    line-height: 1.4;
}
.ca-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
}
.ca-toggle {
    padding: 5px 14px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    background: var(--bg-card);
    color: var(--text-primary);
    transition: all 0.15s;
}
.ca-toggle:hover {
    border-color: #7c3aed;
    color: #7c3aed;
}
.college-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
}
.college-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 14px 16px;
    cursor: pointer;
    transition: all 0.15s;
}
.college-card:hover {
    box-shadow: var(--shadow);
    border-color: #1e1b4b;
}
.card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}
.card-name {
    font-weight: 600;
    font-size: 15px;
    color: var(--text-primary);
}
.card-essays {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 4px;
}
.no-essays {
    color: var(--text-secondary);
    font-size: 12px;
    font-style: italic;
}
.category-badge {
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}
.category-badge.reach {
    background: #fee2e2;
    color: #dc2626;
}
.category-badge.target {
    background: #fef3c7;
    color: #d97706;
}
.category-badge.safety {
    background: #d1fae5;
    color: #059669;
}
.card-progress {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 6px;
}
.mini-bar {
    flex: 1;
    height: 6px;
    background: var(--border-light);
    border-radius: 3px;
    overflow: hidden;
}
.mini-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s;
}
.mini-label {
    font-size: 11px;
    color: var(--text-secondary);
    white-space: nowrap;
}
.target-section {
    padding: 0 24px 14px;
}
.target-prompt {
    display: flex;
    align-items: center;
    gap: 10px;
}
.target-input-row {
    display: flex;
    gap: 8px;
    align-items: center;
}
.target-input {
    width: 80px;
    padding: 6px 10px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 14px;
    text-align: center;
}
.progress-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}
.progress-label {
    font-size: 13px;
    color: var(--text-primary);
    font-weight: 600;
}
.edit-target-btn {
    background: none;
    border: none;
    color: #7c3aed;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
}
.edit-target-btn:hover {
    text-decoration: underline;
}
.progress-bar {
    height: 8px;
    background: var(--border-light);
    border-radius: 4px;
    overflow: hidden;
}
.progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;
}
.modal-actions {
    display: flex;
    gap: 8px;
    padding: 0 24px 8px;
}
.view-full-btn {
    background: none;
    border: 1px solid var(--border-color);
    color: var(--primary, #5b21b6);
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
}
.view-full-btn:hover {
    background: var(--border-light);
}
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 32px;
}
.modal {
    background: var(--bg-card);
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.editor-modal {
    max-width: 580px;
}
.modal-overlay.editor-z {
    z-index: 10000;
}
.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border-color);
}
.modal-header h3 {
    margin: 0;
    font-size: 17px;
    color: var(--text-primary);
}
.btn-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 4px 8px;
    border-radius: 6px;
}
.btn-close:hover {
    background: var(--border-light);
}
.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 18px 24px;
}
.modal-footer {
    display: flex;
    gap: 8px;
    padding: 14px 24px;
    border-top: 1px solid var(--border-color);
}
.essay-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--border-color);
}
.essay-row:last-child {
    border-bottom: none;
}
.essay-info {
    flex: 1;
}
.essay-title {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary);
}
.essay-meta {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 2px;
}
.attached-badge {
    background: #ede9fe;
    color: #7c3aed;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 11px;
    margin-left: 6px;
}
.mini-view-btn {
    background: none;
    border: 1px solid var(--border-color);
    color: var(--primary, #5b21b6);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
}
.mini-view-btn:hover {
    background: var(--border-light);
}
.mini-del-btn {
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
}
.mini-del-btn:hover {
    background: #fee2e2;
}
.status-badge {
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    color: #fff;
}
.status-not-started {
    background: #9ca3af;
}
.status-drafting {
    background: #3b82f6;
}
.status-done {
    background: #10b981;
}
.field {
    margin-bottom: 12px;
}
.field label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 4px;
}
.field input,
.field select,
.field textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    background: var(--bg-input);
    color: var(--text-primary);
    box-sizing: border-box;
}
.field input:focus,
.field select:focus,
.field textarea:focus {
    outline: none;
    border-color: #1e1b4b;
    box-shadow: 0 0 0 2px rgba(30, 27, 75, 0.15);
}
.btn-add {
    background: #1e1b4b;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}
.btn-save {
    background: #059669;
    color: #fff;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}
.btn-cancel {
    background: var(--border-light);
    color: var(--text-primary);
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
}
.empty-text {
    color: var(--text-secondary);
    text-align: center;
    padding: 40px 0;
}
.confetti-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 99999;
    overflow: hidden;
}
.confetti-piece {
    position: absolute;
    top: -10px;
    width: 10px;
    height: 10px;
    animation: confetti-fall 3s ease-in forwards;
}
@keyframes confetti-fall {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
    }
}
.so-type-badge {
    font-size: 10px;
    padding: 1px 8px;
    border-radius: 10px;
    font-weight: 600;
    margin-left: 6px;
    vertical-align: middle;
    display: inline-block;
}
.so-scholarship {
    background: #ede9fe;
    color: #7c3aed;
}
.so-award {
    background: #fef3c7;
    color: #d97706;
}
.so-competition {
    background: #dbeafe;
    color: #2563eb;
}
.so-fellowship {
    background: #d1fae5;
    color: #059669;
}
.so-other {
    background: #f3f4f6;
    color: #6b7280;
}
</style>
