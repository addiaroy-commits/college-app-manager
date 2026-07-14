<script setup lang="ts">
import { ref, computed } from "vue";
import {
    useScholarshipStore,
    type Scholarship,
    type ScholarshipStatus,
    type ScholarshipType,
    type ChecklistStatus,
    type ChecklistItem,
    type ScholarshipDocLink,
    type ScholarshipEssayLink,
} from "../stores/scholarshipStore";
import { useDocumentStore } from "../stores/documentStore";
import { useEssayStore } from "../stores/essayStore";
import {
    calculateMatchScore,
    getMatchBadges,
    getScamWarnings,
} from "../services/scholarshipMatcher";
import { showToast } from "../composables/useToast";
import { getUserKey } from "../stores/userKey";

const store = useScholarshipStore();
const docStore = useDocumentStore();
const essayStore = useEssayStore();

// Seed sample data on first load
store.seedScholarships();

// ── Filters ──
const searchQuery = ref("");
const viewMode = ref<"yours" | "all">("yours");
const filterStatus = ref<ScholarshipStatus | "All">("All");
const filterType = ref<ScholarshipType | "All">("All");
const filterMatch = ref<"All" | "Strong" | "Possible" | "Low">("All");
const filterEffort = ref<"All" | "Low" | "Medium" | "High">("All");
const filterDeadline = ref<"All" | "ThisWeek" | "ThisMonth" | "Later">("All");
const sortBy = ref<"deadline" | "amount" | "match" | "effort" | "priority">(
    "deadline",
);
const removedFromYours = ref<Set<string>>(new Set());

// Load removed set from localStorage
(function () {
    try {
        const saved = localStorage.getItem(getUserKey("removed-scholarships"));
        if (saved) removedFromYours.value = new Set(JSON.parse(saved));
    } catch {}
})();

function saveRemovedFromYours() {
    localStorage.setItem(
        getUserKey("removed-scholarships"),
        JSON.stringify([...removedFromYours.value]),
    );
}

function isCustomizedSample(s: Scholarship): boolean {
    if (!s.isSample) return false;
    return (
        s.status !== "Not Started" ||
        s.docLinks.length > 0 ||
        s.essayLinks.length > 0 ||
        s.notes.trim().length > 0 ||
        s.checklist.some(
            (c) => c.status !== "Needed" && c.status !== "Not Needed",
        )
    );
}

function isYourScholarship(s: Scholarship): boolean {
    if (!s.isSample) return true;
    return isCustomizedSample(s) && !removedFromYours.value.has(s.id);
}

function removeFromYours(id: string) {
    const next = new Set(removedFromYours.value);
    next.add(id);
    removedFromYours.value = next;
    saveRemovedFromYours();
}

const statusOptions: ScholarshipStatus[] = [
    "Not Started",
    "Researching",
    "Drafting",
    "Submitted",
    "Finalist",
    "Won",
    "Rejected",
];
const typeOptions: ScholarshipType[] = [
    "Merit",
    "Need-Based",
    "Major-Specific",
    "Identity-Based",
    "Local",
    "School-Specific",
    "Essay Contest",
    "Athletic",
    "Arts",
    "STEM",
    "Community Service",
    "Other",
];

// ── Detail / Form ──
const showDetail = ref(false);
const showForm = ref(false);
const editingId = ref<string | null>(null);
const selectedScholarship = ref<Scholarship | null>(null);
const activeDetailTab = ref<
    "overview" | "materials" | "docs" | "essays" | "ai"
>("overview");
const showConfetti = ref(false);
let confettiTimer: number | null = null;

// ── AI Panel ──
const aiQuestion = ref("");
const aiAnswer = ref("");
const aiLoading = ref(false);
const aiHistory = ref<{ q: string; a: string }[]>([]);

// ── Form Data ──
const form = ref({
    name: "",
    provider: "",
    awardAmount: 0,
    deadline: "",
    status: "Not Started" as ScholarshipStatus,
    type: "Merit" as ScholarshipType,
    renewable: false,
    minGpa: 0,
    satActRequired: "",
    citizenshipRequired: "",
    gradeLevel: "",
    majorEligibility: "",
    schoolEligibility: "",
    applicationLink: "",
    notes: "",
    checklist: [] as ChecklistItem[],
    docLinks: [] as ScholarshipDocLink[],
    essayLinks: [] as ScholarshipEssayLink[],
    tags: "",
    effortLevel: "Medium" as "Low" | "Medium" | "High",
    isScam: false,
});

// ── Computed: Filtered & Sorted ──
const filteredScholarships = computed(() => {
    let list = [...store.scholarships];

    // View mode filter
    if (viewMode.value === "yours") {
        list = list.filter((s) => isYourScholarship(s));
    }

    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.provider.toLowerCase().includes(q) ||
                s.notes.toLowerCase().includes(q) ||
                s.tags.some((t) => t.toLowerCase().includes(q)),
        );
    }

    if (filterStatus.value !== "All")
        list = list.filter((s) => s.status === filterStatus.value);
    if (filterType.value !== "All")
        list = list.filter((s) => s.type === filterType.value);
    if (filterEffort.value !== "All")
        list = list.filter((s) => s.effortLevel === filterEffort.value);

    if (filterMatch.value !== "All") {
        list = list.filter((s) => {
            const score = calculateMatchScore(s);
            if (filterMatch.value === "Strong") return score >= 70;
            if (filterMatch.value === "Possible")
                return score >= 40 && score < 70;
            return score < 40;
        });
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (filterDeadline.value === "ThisWeek") {
        const week = new Date(now);
        week.setDate(week.getDate() + 7);
        list = list.filter(
            (s) =>
                s.deadline &&
                new Date(s.deadline + "T00:00:00") <= week &&
                new Date(s.deadline + "T00:00:00") >= now,
        );
    } else if (filterDeadline.value === "ThisMonth") {
        const month = new Date(now);
        month.setDate(month.getDate() + 30);
        list = list.filter(
            (s) =>
                s.deadline &&
                new Date(s.deadline + "T00:00:00") <= month &&
                new Date(s.deadline + "T00:00:00") >= now,
        );
    } else if (filterDeadline.value === "Later") {
        const month = new Date(now);
        month.setDate(month.getDate() + 30);
        list = list.filter(
            (s) => !s.deadline || new Date(s.deadline + "T00:00:00") > month,
        );
    }

    // Sort: user-created always first, then by selected sort
    list.sort((a, b) => {
        // User-created (non-sample) always first
        if (!a.isSample && b.isSample) return -1;
        if (a.isSample && !b.isSample) return 1;

        switch (sortBy.value) {
            case "deadline": {
                if (!a.deadline && !b.deadline) return 0;
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return (
                    new Date(a.deadline).getTime() -
                    new Date(b.deadline).getTime()
                );
            }
            case "amount":
                return b.awardAmount - a.awardAmount;
            case "match":
                return calculateMatchScore(b) - calculateMatchScore(a);
            case "effort": {
                const o = { Low: 1, Medium: 2, High: 3 };
                return (o[a.effortLevel] || 2) - (o[b.effortLevel] || 2);
            }
            case "priority": {
                const aScore = calculateMatchScore(a);
                const bScore = calculateMatchScore(b);
                if (aScore !== bScore) return bScore - aScore;
                if (!a.deadline && !b.deadline) return 0;
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return (
                    new Date(a.deadline).getTime() -
                    new Date(b.deadline).getTime()
                );
            }
            default:
                return 0;
        }
    });

    return list;
});

// ── Dashboard Stats ──
const dashboardStats = computed(() => {
    const all = store.scholarships;
    const total = all.length;
    const totalPossible = all.reduce((s, x) => s + x.awardAmount, 0);
    const applied = all.filter(
        (s) =>
            s.status === "Submitted" ||
            s.status === "Finalist" ||
            s.status === "Won" ||
            s.status === "Rejected",
    );
    const won = all.filter((s) => s.status === "Won");
    const pending = all.filter(
        (s) => s.status === "Submitted" || s.status === "Finalist",
    );
    const upcoming = all.filter((s) => {
        if (!s.deadline) return false;
        const d = daysUntil(s.deadline);
        return d >= 0 && d <= 30;
    });
    const highMatch = all.filter((s) => calculateMatchScore(s) >= 70);
    const missing = all.filter((s) => {
        return s.checklist.some(
            (c) => c.status === "Needed" || c.status === "In Progress",
        );
    });

    return {
        total,
        totalPossible,
        appliedAmount: applied.reduce((s, x) => s + x.awardAmount, 0),
        wonAmount: won.reduce((s, x) => s + x.awardAmount, 0),
        pendingAmount: pending.reduce((s, x) => s + x.awardAmount, 0),
        upcoming: upcoming.length,
        highPriority: highMatch.length,
        missing: missing.length,
    };
});

// ── Helpers ──
function daysUntil(dateStr: string): number {
    if (!dateStr) return Infinity;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return (
        (new Date(dateStr + "T00:00:00").getTime() - now.getTime()) / 86400000
    );
}

function deadlineLabel(s: Scholarship): string {
    const d = daysUntil(s.deadline);
    if (d === Infinity) return "No deadline";
    if (d < 0) return "Past due";
    if (d === 0) return "Due today!";
    if (d <= 7) return `Due in ${Math.ceil(d)}d`;
    if (d <= 30) return `Due in ${Math.ceil(d)}d`;
    const dt = new Date(s.deadline + "T00:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function deadlineUrgency(s: Scholarship): string {
    const d = daysUntil(s.deadline);
    if (d === Infinity) return "gray";
    if (d < 0) return "gray";
    if (d <= 7) return "red";
    if (d <= 30) return "yellow";
    return "green";
}

function statusColor(s: ScholarshipStatus): string {
    const map: Record<ScholarshipStatus, string> = {
        "Not Started": "#9ca3af",
        Researching: "#60a5fa",
        Drafting: "#f59e0b",
        Submitted: "#3b82f6",
        Finalist: "#8b5cf6",
        Won: "#10b981",
        Rejected: "#ef4444",
    };
    return map[s] || "#9ca3af";
}

function fmtCurrency(n: number): string {
    if (n >= 1000) return "$" + (n / 1000).toFixed(0) + "k";
    return "$" + n;
}

function checklistProgress(s: Scholarship): number {
    const needed = s.checklist.filter((c) => c.status !== "Not Needed");
    if (needed.length === 0) return 100;
    const done = needed.filter((c) => c.status === "Done").length;
    return Math.round((done / needed.length) * 100);
}

function checklistDone(s: Scholarship): number {
    return s.checklist.filter((c) => c.status === "Done").length;
}
function checklistTotal(s: Scholarship): number {
    return s.checklist.filter((c) => c.status !== "Not Needed").length;
}

// ── Open Detail ──
function openDetail(s: Scholarship) {
    selectedScholarship.value = s;
    activeDetailTab.value = "overview";
    showDetail.value = true;
    aiAnswer.value = "";
    aiHistory.value = [];
}

// ── Open Form ──
function openAddForm() {
    editingId.value = null;
    form.value = {
        name: "",
        provider: "",
        awardAmount: 0,
        deadline: "",
        status: "Not Started",
        type: "Merit",
        renewable: false,
        minGpa: 0,
        satActRequired: "",
        citizenshipRequired: "",
        gradeLevel: "",
        majorEligibility: "",
        schoolEligibility: "",
        applicationLink: "",
        notes: "",
        checklist: store.getChecklistDefaults(),
        docLinks: [],
        essayLinks: [],
        tags: "",
        effortLevel: "Medium",
        isScam: false,
    };
    showForm.value = true;
}

function openEditForm(s: Scholarship) {
    editingId.value = s.id;
    form.value = {
        name: s.name,
        provider: s.provider,
        awardAmount: s.awardAmount,
        deadline: s.deadline,
        status: s.status,
        type: s.type,
        renewable: s.renewable,
        minGpa: s.minGpa,
        satActRequired: s.satActRequired,
        citizenshipRequired: s.citizenshipRequired,
        gradeLevel: s.gradeLevel,
        majorEligibility: s.majorEligibility,
        schoolEligibility: s.schoolEligibility,
        applicationLink: s.applicationLink,
        notes: s.notes,
        checklist: s.checklist.map((c) => ({ ...c })),
        docLinks: [...s.docLinks],
        essayLinks: [...s.essayLinks],
        tags: s.tags.join(", "),
        effortLevel: s.effortLevel,
        isScam: s.isScam,
    };
    showForm.value = true;
}

// ── Save ──
function saveScholarship() {
    if (!form.value.name.trim()) {
        alert("Scholarship name is required.");
        return;
    }
    const data: Scholarship = {
        id: editingId.value || crypto.randomUUID(),
        name: form.value.name.trim(),
        provider: form.value.provider.trim(),
        awardAmount: form.value.awardAmount,
        deadline: form.value.deadline,
        status: form.value.status,
        type: form.value.type,
        renewable: form.value.renewable,
        minGpa: form.value.minGpa,
        satActRequired: form.value.satActRequired.trim(),
        citizenshipRequired: form.value.citizenshipRequired.trim(),
        gradeLevel: form.value.gradeLevel.trim(),
        majorEligibility: form.value.majorEligibility.trim(),
        schoolEligibility: form.value.schoolEligibility.trim(),
        applicationLink: form.value.applicationLink.trim(),
        notes: form.value.notes.trim(),
        checklist: form.value.checklist,
        docLinks: form.value.docLinks,
        essayLinks: form.value.essayLinks,
        tags: form.value.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        effortLevel: form.value.effortLevel,
        isScam: form.value.isScam,
        isSample: false,
        createdAt: editingId.value
            ? store.scholarships.find((s) => s.id === editingId.value)
                  ?.createdAt || new Date().toISOString()
            : new Date().toISOString(),
    };

    if (editingId.value) {
        store.updateScholarship(editingId.value, data);
    } else {
        store.scholarships.unshift(data);
        store.save();
    }
    showForm.value = false;
    editingId.value = null;
}

function deleteScholarship(id: string) {
    const s = store.scholarships.find((x) => x.id === id);
    if (!s) return;
    const snapshot = JSON.parse(JSON.stringify(s));
    store.deleteScholarship(id);
    showDetail.value = false;
    showToast(`"${snapshot.name}" deleted`, () => {
        store.addScholarship(snapshot);
        showToast(`"${snapshot.name}" restored`);
    });
}

// ── Quick Actions ──
function markSubmitted(s: Scholarship) {
    const updated = { ...s, status: "Submitted" as ScholarshipStatus };
    store.updateScholarship(s.id, updated);
    if (selectedScholarship.value?.id === s.id)
        selectedScholarship.value = updated;
}

function markWon(s: Scholarship) {
    if (s.status === "Won") return; // already won, no double-count
    const updated = { ...s, status: "Won" as ScholarshipStatus };
    store.updateScholarship(s.id, updated);
    if (selectedScholarship.value?.id === s.id)
        selectedScholarship.value = updated;
    // trigger confetti
    showConfetti.value = true;
    if (confettiTimer) clearTimeout(confettiTimer);
    confettiTimer = window.setTimeout(() => {
        showConfetti.value = false;
    }, 3000);
}

function markRejected(s: Scholarship) {
    const updated = { ...s, status: "Rejected" as ScholarshipStatus };
    store.updateScholarship(s.id, updated);
    if (selectedScholarship.value?.id === s.id)
        selectedScholarship.value = updated;
}

// ── Checklist ──
function toggleChecklistItem(s: Scholarship, itemId: string) {
    const updated = { ...s };
    const item = updated.checklist.find((c) => c.id === itemId);
    if (!item) return;
    const sequence: ChecklistStatus[] = [
        "Not Needed",
        "Needed",
        "In Progress",
        "Done",
    ];
    const idx = sequence.indexOf(item.status);
    item.status = sequence[(idx + 1) % sequence.length];
    store.updateScholarship(s.id, updated);
    if (selectedScholarship.value?.id === s.id)
        selectedScholarship.value = updated;
}

function addCustomChecklistItem(s: Scholarship, label: string) {
    if (!label.trim()) return;
    const updated = { ...s };
    updated.checklist = [
        ...updated.checklist,
        {
            id: crypto.randomUUID(),
            label: label.trim(),
            status: "Needed",
            isCustom: true,
        },
    ];
    store.updateScholarship(s.id, updated);
    if (selectedScholarship.value?.id === s.id)
        selectedScholarship.value = updated;
}

// ── Document Linking ──
function linkDocument(s: Scholarship) {
    openDocPicker(s);
}

function unlinkDocument(s: Scholarship, linkId: string) {
    const updated = { ...s };
    updated.docLinks = updated.docLinks.filter((d) => d.id !== linkId);
    store.updateScholarship(s.id, updated);
    if (selectedScholarship.value?.id === s.id)
        selectedScholarship.value = updated;
}

// ── Essay Linking ──
function linkEssay(s: Scholarship) {
    openEssayPicker(s);
}

function unlinkEssay(s: Scholarship, linkId: string) {
    const updated = { ...s };
    updated.essayLinks = updated.essayLinks.filter((e) => e.id !== linkId);
    store.updateScholarship(s.id, updated);
    if (selectedScholarship.value?.id === s.id)
        selectedScholarship.value = updated;
}

// ── AI Assistant (Mock) ──
const customChecklistLabel = ref("");
const showEssayPicker = ref(false);
const essayPickerSearch = ref("");
const pickingForScholarship = ref<Scholarship | null>(null);
const showDocPicker = ref(false);
const docPickerSearch = ref("");
const pickingDocForScholarship = ref<Scholarship | null>(null);
const selectedDocIds = ref<Set<string>>(new Set());

const availableDocs = computed(() => {
    let list = [...docStore.documents];
    if (docPickerSearch.value.trim()) {
        const q = docPickerSearch.value.toLowerCase();
        list = list.filter(
            (d) =>
                d.fileName.toLowerCase().includes(q) ||
                d.type.toLowerCase().includes(q),
        );
    }
    return list;
});

function openDocPicker(s: Scholarship) {
    pickingDocForScholarship.value = s;
    docPickerSearch.value = "";
    selectedDocIds.value = new Set();
    showDocPicker.value = true;
}

function toggleDocSelection(docId: string) {
    const next = new Set(selectedDocIds.value);
    if (next.has(docId)) {
        next.delete(docId);
    } else {
        next.add(docId);
    }
    selectedDocIds.value = next;
}

function linkSelectedDocuments() {
    const s = pickingDocForScholarship.value;
    if (!s || selectedDocIds.value.size === 0) return;
    const updated = { ...s };
    const docs = docStore.documents.filter((d) =>
        selectedDocIds.value.has(d.id),
    );
    let added = 0;
    docs.forEach((doc) => {
        if (updated.docLinks.some((d) => d.documentId === doc.id)) return;
        updated.docLinks = [
            ...updated.docLinks,
            {
                id: crypto.randomUUID(),
                documentId: doc.id,
                fileName: doc.fileName,
                type: doc.type,
            },
        ];
        added++;
    });
    store.updateScholarship(s.id, updated);
    if (selectedScholarship.value?.id === s.id)
        selectedScholarship.value = updated;
    showDocPicker.value = false;
    pickingDocForScholarship.value = null;
}

const availableEssays = computed(() => {
    let list = [
        ...essayStore.essays.filter(
            (e) =>
                e.collegeId === "scholarship-other" &&
                (!e.essayType || e.essayType === "scholarship"),
        ),
    ];
    if (essayPickerSearch.value.trim()) {
        const q = essayPickerSearch.value.toLowerCase();
        list = list.filter(
            (e) =>
                e.title.toLowerCase().includes(q) ||
                e.collegeName.toLowerCase().includes(q),
        );
    }
    return list;
});

function openEssayPicker(s: Scholarship) {
    pickingForScholarship.value = s;
    essayPickerSearch.value = "";
    showEssayPicker.value = true;
}

function pickEssay(essay: { id: string; title: string }) {
    const s = pickingForScholarship.value;
    if (!s) return;
    const updated = { ...s };
    if (updated.essayLinks.some((e) => e.essayId === essay.id)) return;
    updated.essayLinks = [
        ...updated.essayLinks,
        { id: crypto.randomUUID(), essayId: essay.id, essayTitle: essay.title },
    ];
    store.updateScholarship(s.id, updated);
    if (selectedScholarship.value?.id === s.id)
        selectedScholarship.value = updated;
    showEssayPicker.value = false;
    pickingForScholarship.value = null;
}

function askAI(question: string) {
    if (!question.trim()) return;
    aiLoading.value = true;
    aiAnswer.value = "";

    const s = selectedScholarship.value;
    if (!s) {
        aiAnswer.value = "Please select a scholarship first.";
        aiLoading.value = false;
        return;
    }

    setTimeout(() => {
        const q = question.toLowerCase();
        if (q.includes("explain") || q.includes("simple")) {
            aiAnswer.value = `${s.name} is a scholarship offered by ${s.provider || "an organization"}. It awards up to ${fmtCurrency(s.awardAmount)} and requires ${checklistTotal(s)} materials. Deadline: ${s.deadline || "not specified"}.`;
        } else if (q.includes("qualify")) {
            const score = calculateMatchScore(s);
            aiAnswer.value = `Match Score: ${score}/100. ${score >= 70 ? "You're a strong match!" : score >= 40 ? "You're a possible match — review the requirements." : "This may be a stretch, but check the eligibility details."}`;
        } else if (q.includes("first") || q.includes("work on")) {
            const needed = s.checklist.filter(
                (c) => c.status === "Needed" || c.status === "In Progress",
            );
            aiAnswer.value =
                needed.length > 0
                    ? `Start with: ${needed.map((c) => c.label).join(", ")}. These are the materials you still need.`
                    : "All required materials are done! Focus on polishing your application.";
        } else if (q.includes("outline")) {
            aiAnswer.value = `Scholarship Essay Outline for ${s.name}:\n1. Introduction: Hook + why this scholarship matters\n2. Your story: Connect your experiences to the scholarship values\n3. Achievements: Highlight relevant accomplishments\n4. Goals: How this scholarship helps your future\n5. Conclusion: Thank you + call to action`;
        } else if (q.includes("reuse")) {
            aiAnswer.value =
                "Check your Essay Tracker for existing essays you can adapt. Look for essays with similar prompts or themes about leadership, service, or personal growth.";
        } else if (q.includes("missing")) {
            const missing = s.checklist.filter(
                (c) => c.status !== "Not Needed" && c.status !== "Done",
            );
            aiAnswer.value =
                missing.length > 0
                    ? `Still missing or in progress: ${missing.map((c) => c.label + " (" + c.status + ")").join(", ")}.`
                    : "All materials are complete!";
        } else if (q.includes("rank")) {
            aiAnswer.value =
                "Based on match score and award amount, here are your top scholarships:\n• Highest match + highest award first\n• Low effort / high reward prioritized\nCheck the 'Best Match' sort to see your ranking.";
        } else {
            aiAnswer.value =
                "I can help with: explaining scholarships, checking eligibility, identifying missing materials, generating essay outlines, and suggesting which essays to reuse. Try one of those!";
        }
        aiHistory.value.unshift({ q: question, a: aiAnswer.value });
        aiLoading.value = false;
    }, 600);
}

const aiPrompts = [
    {
        label: "🧠 Explain simply",
        query: "explain this scholarship in simple terms",
    },
    { label: "✅ Do I qualify?", query: "do I qualify for this" },
    { label: "📋 What first?", query: "what should I work on first" },
    { label: "✍️ Essay outline", query: "generate an essay outline" },
    { label: "♻️ Reuse essay", query: "reuse one of my existing essays" },
    { label: "⚠️ Missing items", query: "find missing requirements" },
    {
        label: "📊 Rank them",
        query: "rank my scholarships by best return on effort",
    },
];

// ── Scam Badge Helper ──
function scamWarningsText(s: Scholarship): string[] {
    return getScamWarnings(s);
}

function goToEssays() {
    location.href = "/essays";
}
</script>

<template>
    <div class="scholarships-page">
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
        <h2>🎓 Scholarships</h2>
        <p class="welcome">
            Find, organize, and complete scholarship applications. Every dollar
            counts!
        </p>

        <!-- ── Dashboard Cards ── -->
        <div class="dash-grid">
            <div class="dash-card">
                <div class="dash-num">{{ dashboardStats.total }}</div>
                <div class="dash-label">Total Scholarships</div>
            </div>
            <div class="dash-card">
                <div class="dash-num">
                    {{ fmtCurrency(dashboardStats.totalPossible) }}
                </div>
                <div class="dash-label">Possible Awards</div>
            </div>
            <div class="dash-card">
                <div class="dash-num green">
                    {{ fmtCurrency(dashboardStats.wonAmount) }}
                </div>
                <div class="dash-label">Amount Won</div>
            </div>
            <div class="dash-card">
                <div class="dash-num blue">
                    {{ fmtCurrency(dashboardStats.appliedAmount) }}
                </div>
                <div class="dash-label">Applied For</div>
            </div>
            <div class="dash-card">
                <div class="dash-num yellow">
                    {{ fmtCurrency(dashboardStats.pendingAmount) }}
                </div>
                <div class="dash-label">Pending</div>
            </div>
            <div class="dash-card">
                <div class="dash-num red">{{ dashboardStats.upcoming }}</div>
                <div class="dash-label">Due Within 30 Days</div>
            </div>
            <div class="dash-card">
                <div class="dash-num purple">
                    {{ dashboardStats.highPriority }}
                </div>
                <div class="dash-label">Strong Matches</div>
            </div>
            <div class="dash-card">
                <div class="dash-num orange">{{ dashboardStats.missing }}</div>
                <div class="dash-label">Missing Materials</div>
            </div>
        </div>

        <!-- ── Toolbar ── -->
        <div class="toolbar">
            <input
                v-model="searchQuery"
                type="text"
                placeholder="🔍 Search scholarships..."
                class="search-bar"
            />
            <div class="toolbar-row">
                <select v-model="filterStatus" class="filter-select">
                    <option value="All">All Statuses</option>
                    <option v-for="s in statusOptions" :key="s" :value="s">
                        {{ s }}
                    </option>
                </select>
                <select v-model="filterType" class="filter-select">
                    <option value="All">All Types</option>
                    <option v-for="t in typeOptions" :key="t" :value="t">
                        {{ t }}
                    </option>
                </select>
                <select v-model="filterMatch" class="filter-select">
                    <option value="All">All Matches</option>
                    <option value="Strong">Strong Match</option>
                    <option value="Possible">Possible Match</option>
                    <option value="Low">Low Match</option>
                </select>
                <select v-model="filterEffort" class="filter-select">
                    <option value="All">All Effort</option>
                    <option value="Low">Low Effort</option>
                    <option value="Medium">Medium Effort</option>
                    <option value="High">High Effort</option>
                </select>
                <select v-model="filterDeadline" class="filter-select">
                    <option value="All">All Deadlines</option>
                    <option value="ThisWeek">This Week</option>
                    <option value="ThisMonth">This Month</option>
                    <option value="Later">Later / None</option>
                </select>
                <select v-model="sortBy" class="filter-select">
                    <option value="deadline">Deadline Soonest</option>
                    <option value="amount">Highest Award</option>
                    <option value="match">Best Match</option>
                    <option value="effort">Least Effort</option>
                    <option value="priority">Highest Priority</option>
                </select>
            </div>
        </div>

        <div class="view-tabs">
            <button
                class="view-tab"
                :class="{ active: viewMode === 'yours' }"
                @click="viewMode = 'yours'"
            >
                ⭐ Your Scholarships
            </button>
            <button
                class="view-tab"
                :class="{ active: viewMode === 'all' }"
                @click="viewMode = 'all'"
            >
                🔍 All Scholarships
            </button>
        </div>

        <button class="btn-add" @click="openAddForm">+ Add Scholarship</button>

        <!-- ── Scholarship List ── -->
        <p v-if="filteredScholarships.length === 0" class="empty-text">
            {{
                viewMode === "yours"
                    ? "No scholarships here yet. Add one above, or customize a sample scholarship to make it yours!"
                    : "No scholarships match your filters. Try adjusting or add a new one!"
            }}
        </p>

        <div v-else class="scholarship-grid">
            <div
                v-for="s in filteredScholarships"
                :key="s.id"
                class="scholarship-card"
                @click="openDetail(s)"
            >
                <div class="card-top">
                    <span class="card-name">{{ s.name }}</span>
                    <span v-if="s.isScam" class="scam-badge"
                        >⚠️ Scam Check</span
                    >
                    <span v-if="!s.isSample" class="added-by-you-badge"
                        >Added by You</span
                    >
                    <span
                        v-else-if="isCustomizedSample(s)"
                        class="customized-badge"
                        >Customized Sample</span
                    >
                    <span v-else class="sample-badge">Sample</span>
                </div>
                <div class="card-provider">
                    {{ s.provider || "No provider listed" }}
                </div>
                <div class="card-meta">
                    <span class="card-amount">{{
                        fmtCurrency(s.awardAmount)
                    }}</span>
                    <span
                        class="card-deadline"
                        :class="'urgency-' + deadlineUrgency(s)"
                        >{{ deadlineLabel(s) }}</span
                    >
                    <span
                        class="card-status"
                        :style="{ background: statusColor(s.status) }"
                        >{{ s.status }}</span
                    >
                </div>
                <div class="card-badges">
                    <span
                        v-for="badge in getMatchBadges(s)"
                        :key="badge"
                        class="badge"
                        :class="
                            'badge-' +
                            badge
                                .toLowerCase()
                                .replace(/\s+/g, '-')
                                .replace(/\//g, '-')
                        "
                        >{{ badge }}</span
                    >
                </div>
                <div class="card-progress">
                    <div class="mini-bar">
                        <div
                            class="mini-fill"
                            :style="{ width: checklistProgress(s) + '%' }"
                        ></div>
                    </div>
                    <span class="mini-label"
                        >{{ checklistDone(s) }}/{{
                            checklistTotal(s)
                        }}
                        materials</span
                    >
                </div>
                <div
                    v-if="
                        s.isSample &&
                        isCustomizedSample(s) &&
                        !removedFromYours.has(s.id)
                    "
                    class="remove-from-yours"
                    @click.stop="removeFromYours(s.id)"
                >
                    ✕ Remove from Your Scholarships
                </div>
            </div>
        </div>

        <!-- ── Detail Modal ── -->
        <div
            v-if="showDetail && selectedScholarship"
            class="modal-overlay"
            @click="showDetail = false"
        >
            <div class="modal detail-modal" @click.stop>
                <div class="modal-header">
                    <h3>{{ selectedScholarship.name }}</h3>
                    <button class="btn-close" @click="showDetail = false">
                        ✕
                    </button>
                </div>

                <!-- Detail Tabs -->
                <div class="detail-tabs">
                    <button
                        :class="{ active: activeDetailTab === 'overview' }"
                        @click="activeDetailTab = 'overview'"
                    >
                        📋 Overview
                    </button>
                    <button
                        :class="{ active: activeDetailTab === 'materials' }"
                        @click="activeDetailTab = 'materials'"
                    >
                        ✅ Materials
                    </button>
                    <button
                        :class="{ active: activeDetailTab === 'docs' }"
                        @click="activeDetailTab = 'docs'"
                    >
                        📁 Docs
                    </button>
                    <button
                        :class="{ active: activeDetailTab === 'essays' }"
                        @click="activeDetailTab = 'essays'"
                    >
                        ✍️ Essays
                    </button>
                    <button
                        :class="{ active: activeDetailTab === 'ai' }"
                        @click="activeDetailTab = 'ai'"
                    >
                        🤖 AI Help
                    </button>
                </div>

                <div class="modal-body">
                    <!-- OVERVIEW -->
                    <div v-if="activeDetailTab === 'overview'">
                        <div class="detail-section">
                            <div class="detail-row">
                                <span class="detail-label">Provider</span
                                ><span>{{
                                    selectedScholarship.provider || "—"
                                }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Award</span
                                ><span class="detail-amount">{{
                                    fmtCurrency(selectedScholarship.awardAmount)
                                }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Deadline</span
                                ><span
                                    :class="
                                        'urgency-' +
                                        deadlineUrgency(selectedScholarship)
                                    "
                                    >{{
                                        selectedScholarship.deadline ||
                                        "No deadline"
                                    }}
                                    ({{
                                        deadlineLabel(selectedScholarship)
                                    }})</span
                                >
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Status</span
                                ><span
                                    class="status-pill"
                                    :style="{
                                        background: statusColor(
                                            selectedScholarship.status,
                                        ),
                                    }"
                                    >{{ selectedScholarship.status }}</span
                                >
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Type</span
                                ><span>{{ selectedScholarship.type }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Effort</span
                                ><span>{{
                                    selectedScholarship.effortLevel
                                }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Renewable</span
                                ><span>{{
                                    selectedScholarship.renewable ? "Yes" : "No"
                                }}</span>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Eligibility</h4>
                            <div class="detail-row">
                                <span class="detail-label">Min GPA</span
                                ><span>{{
                                    selectedScholarship.minGpa || "None"
                                }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">SAT/ACT</span
                                ><span>{{
                                    selectedScholarship.satActRequired || "—"
                                }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Citizenship</span
                                ><span>{{
                                    selectedScholarship.citizenshipRequired ||
                                    "—"
                                }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Grade Level</span
                                ><span>{{
                                    selectedScholarship.gradeLevel || "—"
                                }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Major</span
                                ><span>{{
                                    selectedScholarship.majorEligibility || "—"
                                }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">School</span
                                ><span>{{
                                    selectedScholarship.schoolEligibility || "—"
                                }}</span>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>
                                Match Score:
                                {{
                                    calculateMatchScore(selectedScholarship)
                                }}/100
                            </h4>
                            <div class="badge-row">
                                <span
                                    v-for="badge in getMatchBadges(
                                        selectedScholarship,
                                    )"
                                    :key="badge"
                                    class="badge"
                                    :class="
                                        'badge-' +
                                        badge
                                            .toLowerCase()
                                            .replace(/\s+/g, '-')
                                            .replace(/\//g, '-')
                                    "
                                    >{{ badge }}</span
                                >
                            </div>
                            <div
                                v-if="
                                    scamWarningsText(selectedScholarship).length
                                "
                                class="scam-warnings"
                            >
                                <p
                                    v-for="(w, i) in scamWarningsText(
                                        selectedScholarship,
                                    )"
                                    :key="i"
                                    class="warning-text"
                                >
                                    ⚠️ {{ w }}
                                </p>
                            </div>
                        </div>

                        <div
                            v-if="selectedScholarship.notes"
                            class="detail-section"
                        >
                            <h4>Notes</h4>
                            <p class="notes-text">
                                {{ selectedScholarship.notes }}
                            </p>
                        </div>

                        <div class="detail-section">
                            <h4>Materials Progress</h4>
                            <div class="progress-bar lg">
                                <div
                                    class="progress-fill"
                                    :style="{
                                        width:
                                            checklistProgress(
                                                selectedScholarship,
                                            ) + '%',
                                    }"
                                ></div>
                            </div>
                            <span class="progress-text"
                                >{{ checklistDone(selectedScholarship) }}/{{
                                    checklistTotal(selectedScholarship)
                                }}
                                done</span
                            >
                        </div>

                        <div
                            v-if="selectedScholarship.applicationLink"
                            class="detail-section"
                        >
                            <a
                                :href="selectedScholarship.applicationLink"
                                target="_blank"
                                class="app-link"
                                >🔗 Open Application →</a
                            >
                        </div>

                        <div class="detail-actions">
                            <button
                                class="btn-mark submitted"
                                @click="markSubmitted(selectedScholarship!)"
                            >
                                📤 Mark Submitted
                            </button>
                            <button
                                class="btn-mark won"
                                @click="markWon(selectedScholarship!)"
                            >
                                🏆 I Won This!
                            </button>
                            <button
                                class="btn-mark rejected"
                                @click="markRejected(selectedScholarship!)"
                            >
                                ❌ Rejected
                            </button>
                        </div>
                    </div>

                    <!-- MATERIALS -->
                    <div v-if="activeDetailTab === 'materials'">
                        <div class="checklist-grid">
                            <div
                                v-for="item in selectedScholarship.checklist"
                                :key="item.id"
                                class="checklist-row"
                                @click="
                                    toggleChecklistItem(
                                        selectedScholarship!,
                                        item.id,
                                    )
                                "
                            >
                                <span
                                    class="check-status"
                                    :class="
                                        'chk-' +
                                        item.status
                                            .toLowerCase()
                                            .replace(/\s+/g, '-')
                                    "
                                    >{{
                                        item.status === "Not Needed"
                                            ? "⬜"
                                            : item.status === "Needed"
                                              ? "⬜"
                                              : item.status === "In Progress"
                                                ? "🔄"
                                                : "✅"
                                    }}</span
                                >
                                <span class="check-label">{{
                                    item.label
                                }}</span>
                                <span
                                    class="check-badge"
                                    :class="
                                        'chk-' +
                                        item.status
                                            .toLowerCase()
                                            .replace(/\s+/g, '-')
                                    "
                                    >{{ item.status }}</span
                                >
                            </div>
                        </div>
                        <div class="add-custom-row">
                            <input
                                v-model="customChecklistLabel"
                                type="text"
                                placeholder="Add custom item..."
                                class="custom-input"
                                @keyup.enter="
                                    addCustomChecklistItem(
                                        selectedScholarship,
                                        customChecklistLabel,
                                    );
                                    customChecklistLabel = '';
                                "
                            />
                            <button
                                class="btn-small"
                                @click="
                                    addCustomChecklistItem(
                                        selectedScholarship,
                                        customChecklistLabel,
                                    );
                                    customChecklistLabel = '';
                                "
                            >
                                + Add
                            </button>
                        </div>
                    </div>

                    <!-- DOCS -->
                    <div v-if="activeDetailTab === 'docs'">
                        <p
                            v-if="selectedScholarship.docLinks.length === 0"
                            class="empty-text"
                        >
                            No documents linked yet.
                        </p>
                        <div v-else class="link-list">
                            <div
                                v-for="link in selectedScholarship.docLinks"
                                :key="link.id"
                                class="link-row"
                            >
                                <span>📄 {{ link.fileName }}</span>
                                <span class="link-type">{{ link.type }}</span>
                                <button
                                    class="mini-del"
                                    @click="
                                        unlinkDocument(
                                            selectedScholarship!,
                                            link.id,
                                        )
                                    "
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <button
                            class="btn-link"
                            @click="linkDocument(selectedScholarship)"
                        >
                            + Link Document from Vault
                        </button>
                    </div>

                    <!-- ESSAYS -->
                    <div v-if="activeDetailTab === 'essays'">
                        <p
                            v-if="selectedScholarship.essayLinks.length === 0"
                            class="empty-text"
                        >
                            No essays linked yet.
                        </p>
                        <div v-else class="link-list">
                            <div
                                v-for="link in selectedScholarship.essayLinks"
                                :key="link.id"
                                class="link-row"
                            >
                                <span>✍️ {{ link.essayTitle }}</span>
                                <button
                                    class="mini-del"
                                    @click="
                                        unlinkEssay(
                                            selectedScholarship!,
                                            link.id,
                                        )
                                    "
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <button
                            class="btn-link"
                            @click="linkEssay(selectedScholarship)"
                        >
                            + Link Essay from Tracker
                        </button>
                    </div>

                    <!-- AI -->
                    <div v-if="activeDetailTab === 'ai'">
                        <div class="ai-prompts">
                            <button
                                v-for="p in aiPrompts"
                                :key="p.query"
                                class="ai-prompt-btn"
                                @click="askAI(p.query)"
                            >
                                {{ p.label }}
                            </button>
                        </div>
                        <div class="ai-input-row">
                            <input
                                v-model="aiQuestion"
                                type="text"
                                placeholder="Ask about this scholarship..."
                                class="ai-input"
                                @keyup.enter="
                                    askAI(aiQuestion);
                                    aiQuestion = '';
                                "
                            />
                            <button
                                class="btn-ai"
                                @click="
                                    askAI(aiQuestion);
                                    aiQuestion = '';
                                "
                                :disabled="aiLoading"
                            >
                                Ask
                            </button>
                        </div>
                        <div v-if="aiLoading" class="ai-loading">
                            Thinking...
                        </div>
                        <div v-if="aiAnswer" class="ai-answer">
                            {{ aiAnswer }}
                        </div>
                        <div v-if="aiHistory.length" class="ai-history">
                            <h4>History</h4>
                            <div
                                v-for="(h, i) in aiHistory.slice(0, 3)"
                                :key="i"
                                class="ai-history-item"
                            >
                                <p class="ai-h-q">Q: {{ h.q }}</p>
                                <p class="ai-h-a">{{ h.a.slice(0, 150) }}...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button
                        class="btn-edit"
                        @click="
                            showDetail = false;
                            openEditForm(selectedScholarship);
                        "
                    >
                        ✏️ Edit
                    </button>
                    <button
                        class="btn-del"
                        @click="deleteScholarship(selectedScholarship.id)"
                    >
                        🗑️ Delete
                    </button>
                </div>
            </div>
        </div>

        <!-- ── Add/Edit Form Modal ── -->
        <div
            v-if="showForm"
            class="modal-overlay z-form"
            @click="showForm = false"
        >
            <div class="modal form-modal" @click.stop>
                <div class="modal-header">
                    <h3>{{ editingId ? "Edit" : "Add" }} Scholarship</h3>
                    <button class="btn-close" @click="showForm = false">
                        ✕
                    </button>
                </div>
                <div class="modal-body">
                    <div class="field">
                        <label>Name *</label
                        ><input
                            v-model="form.name"
                            type="text"
                            placeholder="Scholarship name..."
                        />
                    </div>
                    <div class="form-grid">
                        <div class="field">
                            <label>Provider</label
                            ><input v-model="form.provider" type="text" />
                        </div>
                        <div class="field">
                            <label>Award Amount</label
                            ><input
                                v-model.number="form.awardAmount"
                                type="number"
                                min="0"
                            />
                        </div>
                        <div class="field">
                            <label>Deadline</label
                            ><input v-model="form.deadline" type="date" />
                        </div>
                        <div class="field">
                            <label>Status</label
                            ><select v-model="form.status">
                                <option
                                    v-for="s in statusOptions"
                                    :key="s"
                                    :value="s"
                                >
                                    {{ s }}
                                </option>
                            </select>
                        </div>
                        <div class="field">
                            <label>Type</label
                            ><select v-model="form.type">
                                <option
                                    v-for="t in typeOptions"
                                    :key="t"
                                    :value="t"
                                >
                                    {{ t }}
                                </option>
                            </select>
                        </div>
                        <div class="field">
                            <label>Effort Level</label
                            ><select v-model="form.effortLevel">
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div class="field">
                            <label>Min GPA</label
                            ><input
                                v-model.number="form.minGpa"
                                type="number"
                                min="0"
                                step="0.1"
                            />
                        </div>
                        <div class="field">
                            <label>SAT/ACT</label
                            ><input v-model="form.satActRequired" type="text" />
                        </div>
                        <div class="field">
                            <label>Citizenship</label
                            ><input
                                v-model="form.citizenshipRequired"
                                type="text"
                            />
                        </div>
                        <div class="field">
                            <label>Grade Level</label
                            ><input v-model="form.gradeLevel" type="text" />
                        </div>
                        <div class="field">
                            <label>Major Eligibility</label
                            ><input
                                v-model="form.majorEligibility"
                                type="text"
                            />
                        </div>
                        <div class="field">
                            <label>School Eligibility</label
                            ><input
                                v-model="form.schoolEligibility"
                                type="text"
                            />
                        </div>
                        <div class="field">
                            <label>App Link</label
                            ><input
                                v-model="form.applicationLink"
                                type="text"
                            />
                        </div>
                        <div class="field">
                            <label>Tags (comma-separated)</label
                            ><input v-model="form.tags" type="text" />
                        </div>
                        <div class="field check">
                            <label
                                ><input
                                    v-model="form.renewable"
                                    type="checkbox"
                                />
                                Renewable</label
                            >
                        </div>
                        <div class="field check">
                            <label
                                ><input v-model="form.isScam" type="checkbox" />
                                Flag as Potential Scam</label
                            >
                        </div>
                    </div>
                    <div class="field full">
                        <label>Notes</label
                        ><textarea v-model="form.notes" rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-save" @click="saveScholarship">
                        {{ editingId ? "Update" : "Save" }}
                    </button>
                    <button class="btn-cancel" @click="showForm = false">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
        <!-- Essay Picker Modal -->
        <div
            v-if="showEssayPicker"
            class="modal-overlay z-picker"
            @click="showEssayPicker = false"
        >
            <div class="modal detail-modal" @click.stop>
                <div class="modal-header">
                    <h3>📝 Link an Essay</h3>
                    <button class="btn-close" @click="showEssayPicker = false">
                        ✕
                    </button>
                </div>
                <div class="modal-body">
                    <input
                        v-model="essayPickerSearch"
                        type="text"
                        placeholder="🔍 Search essays..."
                        class="search-bar"
                        style="margin-bottom: 12px"
                    />
                    <p v-if="availableEssays.length === 0" class="empty-text">
                        No essays found. Create one in the Essay Tracker first!
                    </p>
                    <div v-else class="essay-picker-list">
                        <div
                            v-for="e in availableEssays"
                            :key="e.id"
                            class="essay-picker-row"
                            @click="pickEssay(e)"
                        >
                            <div>
                                <div class="ep-title">{{ e.title }}</div>
                                <div class="ep-meta">
                                    {{ e.collegeName }} · {{ e.status }} ·
                                    {{ e.currentWordCount }}/{{
                                        e.targetWordCount
                                    }}
                                    words
                                </div>
                            </div>
                            <button class="btn-small">Select</button>
                        </div>
                    </div>
                </div>
                <div
                    class="modal-footer"
                    style="
                        border-top: 1px solid var(--border-color);
                        padding: 14px 24px;
                    "
                >
                    <button
                        class="btn-link"
                        @click="
                            showEssayPicker = false;
                            goToEssays();
                        "
                    >
                        + Create New Essay in Tracker
                    </button>
                </div>
            </div>
        </div>

        <!-- Document Picker Modal -->
        <div
            v-if="showDocPicker"
            class="modal-overlay z-picker"
            @click="showDocPicker = false"
        >
            <div class="modal detail-modal" @click.stop>
                <div class="modal-header">
                    <h3>📁 Link Documents from Vault</h3>
                    <button class="btn-close" @click="showDocPicker = false">
                        ✕
                    </button>
                </div>
                <div class="modal-body">
                    <input
                        v-model="docPickerSearch"
                        type="text"
                        placeholder="🔍 Search documents..."
                        class="search-bar"
                        style="margin-bottom: 12px"
                    />
                    <p v-if="availableDocs.length === 0" class="empty-text">
                        No documents in the vault yet. Upload one first!
                    </p>
                    <div v-else class="essay-picker-list">
                        <div
                            v-for="doc in availableDocs"
                            :key="doc.id"
                            class="essay-picker-row"
                            @click="toggleDocSelection(doc.id)"
                        >
                            <div
                                style="
                                    display: flex;
                                    align-items: center;
                                    gap: 10px;
                                "
                            >
                                <span style="font-size: 18px">{{
                                    selectedDocIds.has(doc.id) ? "☑️" : "⬜"
                                }}</span>
                                <div>
                                    <div class="ep-title">
                                        📄 {{ doc.fileName }}
                                    </div>
                                    <div class="ep-meta">
                                        {{ doc.type }} ·
                                        {{
                                            doc.dateAdded
                                                ? doc.dateAdded.slice(0, 10)
                                                : ""
                                        }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="modal-footer"
                    style="
                        border-top: 1px solid var(--border-color);
                        padding: 14px 24px;
                    "
                >
                    <button class="btn-cancel" @click="showDocPicker = false">
                        Cancel
                    </button>
                    <button
                        class="btn-save"
                        @click="linkSelectedDocuments()"
                        :disabled="selectedDocIds.size === 0"
                    >
                        Link Selected Documents ({{ selectedDocIds.size }})
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.scholarships-page {
    max-width: 1100px;
}
.welcome {
    color: var(--text-secondary);
    margin-bottom: 20px;
}

/* Dashboard */
.dash-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
    margin-bottom: 24px;
}
.dash-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 14px;
    text-align: center;
}
.dash-num {
    font-size: 24px;
    font-weight: 800;
    color: var(--text-primary);
}
.dash-num.green {
    color: #10b981;
}
.dash-num.blue {
    color: #3b82f6;
}
.dash-num.yellow {
    color: #f59e0b;
}
.dash-num.red {
    color: #ef4444;
}
.dash-num.purple {
    color: #8b5cf6;
}
.dash-num.orange {
    color: #f97316;
}
.dash-label {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
}

/* Toolbar */
.toolbar {
    margin-bottom: 16px;
}
.search-bar {
    width: 100%;
    padding: 10px 16px;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    font-size: 14px;
    margin-bottom: 8px;
    background: var(--bg-input);
    color: var(--text-primary);
    font-family: inherit;
    box-sizing: border-box;
}
.toolbar-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
.filter-select {
    padding: 6px 10px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 12px;
    background: var(--bg-input);
    color: var(--text-primary);
    font-family: inherit;
}

.btn-add {
    background: var(--primary, #5b21b6);
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 16px;
}

/* Grid */
.scholarship-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
}
.scholarship-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 14px 16px;
    cursor: pointer;
    transition: all 0.15s;
}
.scholarship-card:hover {
    box-shadow: var(--shadow);
    border-color: var(--primary, #5b21b6);
}
.card-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    flex-wrap: wrap;
}
.card-name {
    font-weight: 700;
    font-size: 15px;
    color: var(--text-primary);
}
.scam-badge {
    font-size: 10px;
    background: #fef2f2;
    color: #dc2626;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
}
.sample-badge {
    font-size: 10px;
    background: #fef3c7;
    color: #92400e;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
}
.card-provider {
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 6px;
}
.card-meta {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 6px;
    flex-wrap: wrap;
}
.card-amount {
    font-weight: 700;
    font-size: 16px;
    color: var(--primary, #5b21b6);
}
.card-deadline {
    font-size: 12px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
}
.urgency-red {
    background: #fee2e2;
    color: #dc2626;
}
.urgency-yellow {
    background: #fef3c7;
    color: #92400e;
}
.urgency-green {
    background: #d1fae5;
    color: #059669;
}
.urgency-gray {
    background: var(--border-light);
    color: var(--text-secondary);
}
.card-status {
    font-size: 11px;
    color: #fff;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;
}

/* Badges */
.card-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 8px;
}
.badge {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 10px;
}
.badge-strong-match {
    background: #d1fae5;
    color: #059669;
}
.badge-possible-match {
    background: #dbeafe;
    color: #2563eb;
}
.badge-low-match {
    background: #f3f4f6;
    color: #6b7280;
}
.badge-deadline-soon {
    background: #fee2e2;
    color: #dc2626;
}
.badge-worth-applying {
    background: #fef3c7;
    color: #92400e;
}
.badge-low-effort-high-reward {
    background: #ede9fe;
    color: #7c3aed;
}
.badge-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 8px 0;
}

/* Progress */
.card-progress {
    display: flex;
    align-items: center;
    gap: 8px;
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
    background: var(--primary, #5b21b6);
    border-radius: 3px;
    transition: width 0.3s;
}
.mini-label {
    font-size: 11px;
    color: var(--text-secondary);
    white-space: nowrap;
}
.progress-bar.lg {
    height: 10px;
    background: var(--border-light);
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 4px;
}
.progress-fill {
    height: 100%;
    background: var(--primary, #5b21b6);
    border-radius: 5px;
    transition: width 0.3s;
}
.progress-text {
    font-size: 12px;
    color: var(--text-secondary);
}

/* Detail Modal */
.detail-tabs {
    display: flex;
    gap: 2px;
    padding: 0 24px;
    border-bottom: 1px solid var(--border-color);
}
.detail-tabs button {
    background: none;
    border: none;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    cursor: pointer;
    border-bottom: 2px solid transparent;
}
.detail-tabs button.active {
    color: var(--primary, #5b21b6);
    border-bottom-color: var(--primary, #5b21b6);
}
.detail-section {
    margin-bottom: 16px;
}
.detail-section h4 {
    font-size: 14px;
    color: var(--text-primary);
    margin: 0 0 8px;
}
.detail-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 13px;
}
.detail-label {
    color: var(--text-secondary);
    font-weight: 600;
}
.detail-amount {
    font-weight: 700;
    color: var(--primary, #5b21b6);
}
.status-pill {
    color: #fff;
    padding: 2px 10px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
}
.app-link {
    color: var(--primary, #5b21b6);
    font-weight: 600;
    text-decoration: underline;
}
.notes-text {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
}
.scam-warnings {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 10px 14px;
    margin-top: 8px;
}
.warning-text {
    color: #dc2626;
    font-size: 12px;
    margin: 4px 0;
}

.detail-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 16px;
}
.btn-mark {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    color: #fff;
}
.btn-mark.submitted {
    background: #3b82f6;
}
.btn-mark.won {
    background: #10b981;
}
.btn-mark.rejected {
    background: #ef4444;
}

/* Checklist */
.checklist-grid {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.checklist-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s;
}
.checklist-row:hover {
    background: var(--border-light);
}
.check-status {
    font-size: 16px;
}
.check-label {
    flex: 1;
    font-size: 13px;
    color: var(--text-primary);
}
.check-badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;
}
.chk-not-needed {
    background: var(--border-light);
    color: #6b7280;
}
.chk-needed {
    background: #fee2e2;
    color: #dc2626;
}
.chk-in-progress {
    background: #dbeafe;
    color: #2563eb;
}
.chk-done {
    background: #d1fae5;
    color: #059669;
}
.add-custom-row {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}
.custom-input {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
    background: var(--bg-input);
    color: var(--text-primary);
}
.btn-small {
    background: var(--primary, #5b21b6);
    color: #fff;
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
}

/* Docs / Essays */
.link-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
}
.link-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: var(--border-light);
    border-radius: 6px;
    font-size: 13px;
}
.link-type {
    font-size: 11px;
    color: var(--text-secondary);
}
.btn-link {
    background: none;
    border: 2px dashed var(--border-color);
    color: var(--primary, #5b21b6);
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
    width: 100%;
    font-weight: 600;
}
.btn-link:hover {
    border-color: var(--primary, #5b21b6);
}

/* AI */
.ai-prompts {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
}
.ai-prompt-btn {
    background: var(--border-light);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
}
.ai-prompt-btn:hover {
    background: var(--primary, #5b21b6);
    color: #fff;
    border-color: var(--primary, #5b21b6);
}
.ai-input-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
}
.ai-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 13px;
    font-family: inherit;
    background: var(--bg-input);
    color: var(--text-primary);
}
.btn-ai {
    background: var(--primary, #5b21b6);
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
}
.btn-ai:disabled {
    opacity: 0.5;
}
.ai-loading {
    font-size: 13px;
    color: var(--text-secondary);
    padding: 10px 0;
}
.ai-answer {
    background: var(--border-light);
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-primary);
    white-space: pre-wrap;
    margin-bottom: 12px;
}
.ai-history {
    margin-top: 16px;
}
.ai-history h4 {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0 0 8px;
}
.ai-history-item {
    background: var(--border-light);
    border-radius: 6px;
    padding: 8px 12px;
    margin-bottom: 6px;
}
.ai-h-q {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 2px;
}
.ai-h-a {
    font-size: 12px;
    color: var(--text-secondary);
    margin: 0;
}

/* Form */
.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
.field {
    margin-bottom: 10px;
}
.field.full {
    grid-column: span 2;
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
    border-color: var(--primary, #5b21b6);
    box-shadow: 0 0 0 2px rgba(91, 33, 182, 0.15);
}
.field.check label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
}
.field.check input {
    width: auto;
}

/* Modal */
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
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.detail-modal {
    max-width: 620px;
}
.form-modal {
    max-width: 580px;
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
.btn-edit {
    background: var(--primary, #5b21b6);
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
}
.btn-del {
    background: #dc2626;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
}

.empty-text {
    color: var(--text-secondary);
    text-align: center;
    padding: 30px 0;
}
.mini-del {
    background: none;
    border: none;
    font-size: 14px;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 2px 4px;
}
.mini-del:hover {
    background: #fee2e2;
    border-radius: 4px;
    color: #dc2626;
}

/* Essay Picker */
.essay-picker-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 400px;
    overflow-y: auto;
}
.essay-picker-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
}
.essay-picker-row:hover {
    border-color: var(--primary, #5b21b6);
    background: rgba(91, 33, 182, 0.04);
}
.ep-title {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary);
}
.ep-meta {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 2px;
}
.modal-overlay.z-form {
    z-index: 10000;
}
.modal-overlay.z-picker {
    z-index: 10001;
}
.view-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
    background: var(--border-light);
    padding: 4px;
    border-radius: 10px;
}
.view-tab {
    padding: 8px 16px;
    border: none;
    background: transparent;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.15s;
}
.view-tab:hover {
    color: var(--text-primary);
}
.view-tab.active {
    background: var(--bg-card);
    color: var(--primary, #5b21b6);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.added-by-you-badge {
    font-size: 10px;
    background: #ede9fe;
    color: #7c3aed;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
}
.customized-badge {
    font-size: 10px;
    background: #fef3c7;
    color: #b45309;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
}
.remove-from-yours {
    font-size: 11px;
    color: #dc2626;
    margin-top: 8px;
    padding: 6px 0 0;
    border-top: 1px solid var(--border-color);
    cursor: pointer;
    font-weight: 600;
}
.remove-from-yours:hover {
    text-decoration: underline;
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
</style>
