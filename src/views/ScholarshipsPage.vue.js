import { ref, computed } from "vue";
import { useScholarshipStore, } from "../stores/scholarshipStore";
import { useDocumentStore } from "../stores/documentStore";
import { useEssayStore } from "../stores/essayStore";
import { calculateMatchScore, getMatchBadges, getScamWarnings, } from "../services/scholarshipMatcher";
const store = useScholarshipStore();
const docStore = useDocumentStore();
const essayStore = useEssayStore();
// Seed sample data on first load
store.seedScholarships();
// ── Filters ──
const searchQuery = ref("");
const viewMode = ref("yours");
const filterStatus = ref("All");
const filterType = ref("All");
const filterMatch = ref("All");
const filterEffort = ref("All");
const filterDeadline = ref("All");
const sortBy = ref("deadline");
const removedFromYours = ref(new Set());
// Load removed set from localStorage
(function () {
    try {
        const saved = localStorage.getItem("applywise-removed-scholarships");
        if (saved)
            removedFromYours.value = new Set(JSON.parse(saved));
    }
    catch { }
})();
function saveRemovedFromYours() {
    localStorage.setItem("applywise-removed-scholarships", JSON.stringify([...removedFromYours.value]));
}
function isCustomizedSample(s) {
    if (!s.isSample)
        return false;
    return (s.status !== "Not Started" ||
        s.docLinks.length > 0 ||
        s.essayLinks.length > 0 ||
        s.notes.trim().length > 0 ||
        s.checklist.some((c) => c.status !== "Needed" && c.status !== "Not Needed"));
}
function isYourScholarship(s) {
    if (!s.isSample)
        return true;
    return isCustomizedSample(s) && !removedFromYours.value.has(s.id);
}
function removeFromYours(id) {
    const next = new Set(removedFromYours.value);
    next.add(id);
    removedFromYours.value = next;
    saveRemovedFromYours();
}
const statusOptions = [
    "Not Started",
    "Researching",
    "Drafting",
    "Submitted",
    "Finalist",
    "Won",
    "Rejected",
];
const typeOptions = [
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
const editingId = ref(null);
const selectedScholarship = ref(null);
const activeDetailTab = ref("overview");
const showConfetti = ref(false);
let confettiTimer = null;
// ── AI Panel ──
const aiQuestion = ref("");
const aiAnswer = ref("");
const aiLoading = ref(false);
const aiHistory = ref([]);
// ── Form Data ──
const form = ref({
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
    checklist: [],
    docLinks: [],
    essayLinks: [],
    tags: "",
    effortLevel: "Medium",
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
        list = list.filter((s) => s.name.toLowerCase().includes(q) ||
            s.provider.toLowerCase().includes(q) ||
            s.notes.toLowerCase().includes(q) ||
            s.tags.some((t) => t.toLowerCase().includes(q)));
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
            if (filterMatch.value === "Strong")
                return score >= 70;
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
        list = list.filter((s) => s.deadline &&
            new Date(s.deadline + "T00:00:00") <= week &&
            new Date(s.deadline + "T00:00:00") >= now);
    }
    else if (filterDeadline.value === "ThisMonth") {
        const month = new Date(now);
        month.setDate(month.getDate() + 30);
        list = list.filter((s) => s.deadline &&
            new Date(s.deadline + "T00:00:00") <= month &&
            new Date(s.deadline + "T00:00:00") >= now);
    }
    else if (filterDeadline.value === "Later") {
        const month = new Date(now);
        month.setDate(month.getDate() + 30);
        list = list.filter((s) => !s.deadline || new Date(s.deadline + "T00:00:00") > month);
    }
    // Sort: user-created always first, then by selected sort
    list.sort((a, b) => {
        // User-created (non-sample) always first
        if (!a.isSample && b.isSample)
            return -1;
        if (a.isSample && !b.isSample)
            return 1;
        switch (sortBy.value) {
            case "deadline": {
                if (!a.deadline && !b.deadline)
                    return 0;
                if (!a.deadline)
                    return 1;
                if (!b.deadline)
                    return -1;
                return (new Date(a.deadline).getTime() -
                    new Date(b.deadline).getTime());
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
                if (aScore !== bScore)
                    return bScore - aScore;
                if (!a.deadline && !b.deadline)
                    return 0;
                if (!a.deadline)
                    return 1;
                if (!b.deadline)
                    return -1;
                return (new Date(a.deadline).getTime() -
                    new Date(b.deadline).getTime());
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
    const applied = all.filter((s) => s.status === "Submitted" ||
        s.status === "Finalist" ||
        s.status === "Won" ||
        s.status === "Rejected");
    const won = all.filter((s) => s.status === "Won");
    const pending = all.filter((s) => s.status === "Submitted" || s.status === "Finalist");
    const upcoming = all.filter((s) => {
        if (!s.deadline)
            return false;
        const d = daysUntil(s.deadline);
        return d >= 0 && d <= 30;
    });
    const highMatch = all.filter((s) => calculateMatchScore(s) >= 70);
    const missing = all.filter((s) => {
        return s.checklist.some((c) => c.status === "Needed" || c.status === "In Progress");
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
function daysUntil(dateStr) {
    if (!dateStr)
        return Infinity;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return ((new Date(dateStr + "T00:00:00").getTime() - now.getTime()) / 86400000);
}
function deadlineLabel(s) {
    const d = daysUntil(s.deadline);
    if (d === Infinity)
        return "No deadline";
    if (d < 0)
        return "Past due";
    if (d === 0)
        return "Due today!";
    if (d <= 7)
        return `Due in ${Math.ceil(d)}d`;
    if (d <= 30)
        return `Due in ${Math.ceil(d)}d`;
    const dt = new Date(s.deadline + "T00:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function deadlineUrgency(s) {
    const d = daysUntil(s.deadline);
    if (d === Infinity)
        return "gray";
    if (d < 0)
        return "gray";
    if (d <= 7)
        return "red";
    if (d <= 30)
        return "yellow";
    return "green";
}
function statusColor(s) {
    const map = {
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
function fmtCurrency(n) {
    if (n >= 1000)
        return "$" + (n / 1000).toFixed(0) + "k";
    return "$" + n;
}
function checklistProgress(s) {
    const needed = s.checklist.filter((c) => c.status !== "Not Needed");
    if (needed.length === 0)
        return 100;
    const done = needed.filter((c) => c.status === "Done").length;
    return Math.round((done / needed.length) * 100);
}
function checklistDone(s) {
    return s.checklist.filter((c) => c.status === "Done").length;
}
function checklistTotal(s) {
    return s.checklist.filter((c) => c.status !== "Not Needed").length;
}
// ── Open Detail ──
function openDetail(s) {
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
function openEditForm(s) {
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
    const data = {
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
    }
    else {
        store.scholarships.unshift(data);
        store.save();
    }
    showForm.value = false;
    editingId.value = null;
}
function deleteScholarship(id) {
    if (confirm("Delete this scholarship?")) {
        store.deleteScholarship(id);
        showDetail.value = false;
    }
}
// ── Quick Actions ──
function markSubmitted(s) {
    const updated = { ...s, status: "Submitted" };
    store.updateScholarship(s.id, updated);
    if (selectedScholarship.value?.id === s.id)
        selectedScholarship.value = updated;
}
function markWon(s) {
    if (s.status === "Won")
        return; // already won, no double-count
    const updated = { ...s, status: "Won" };
    store.updateScholarship(s.id, updated);
    if (selectedScholarship.value?.id === s.id)
        selectedScholarship.value = updated;
    // trigger confetti
    showConfetti.value = true;
    if (confettiTimer)
        clearTimeout(confettiTimer);
    confettiTimer = window.setTimeout(() => {
        showConfetti.value = false;
    }, 3000);
}
function markRejected(s) {
    const updated = { ...s, status: "Rejected" };
    store.updateScholarship(s.id, updated);
    if (selectedScholarship.value?.id === s.id)
        selectedScholarship.value = updated;
}
// ── Checklist ──
function toggleChecklistItem(s, itemId) {
    const updated = { ...s };
    const item = updated.checklist.find((c) => c.id === itemId);
    if (!item)
        return;
    const sequence = [
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
function addCustomChecklistItem(s, label) {
    if (!label.trim())
        return;
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
function linkDocument(s) {
    openDocPicker(s);
}
function unlinkDocument(s, linkId) {
    const updated = { ...s };
    updated.docLinks = updated.docLinks.filter((d) => d.id !== linkId);
    store.updateScholarship(s.id, updated);
    if (selectedScholarship.value?.id === s.id)
        selectedScholarship.value = updated;
}
// ── Essay Linking ──
function linkEssay(s) {
    openEssayPicker(s);
}
function unlinkEssay(s, linkId) {
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
const pickingForScholarship = ref(null);
const showDocPicker = ref(false);
const docPickerSearch = ref("");
const pickingDocForScholarship = ref(null);
const selectedDocIds = ref(new Set());
const availableDocs = computed(() => {
    let list = [...docStore.documents];
    if (docPickerSearch.value.trim()) {
        const q = docPickerSearch.value.toLowerCase();
        list = list.filter((d) => d.fileName.toLowerCase().includes(q) ||
            d.type.toLowerCase().includes(q));
    }
    return list;
});
function openDocPicker(s) {
    pickingDocForScholarship.value = s;
    docPickerSearch.value = "";
    selectedDocIds.value = new Set();
    showDocPicker.value = true;
}
function toggleDocSelection(docId) {
    const next = new Set(selectedDocIds.value);
    if (next.has(docId)) {
        next.delete(docId);
    }
    else {
        next.add(docId);
    }
    selectedDocIds.value = next;
}
function linkSelectedDocuments() {
    const s = pickingDocForScholarship.value;
    if (!s || selectedDocIds.value.size === 0)
        return;
    const updated = { ...s };
    const docs = docStore.documents.filter((d) => selectedDocIds.value.has(d.id));
    let added = 0;
    docs.forEach((doc) => {
        if (updated.docLinks.some((d) => d.documentId === doc.id))
            return;
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
        ...essayStore.essays.filter((e) => e.collegeId === "scholarship-other" &&
            (!e.essayType || e.essayType === "scholarship")),
    ];
    if (essayPickerSearch.value.trim()) {
        const q = essayPickerSearch.value.toLowerCase();
        list = list.filter((e) => e.title.toLowerCase().includes(q) ||
            e.collegeName.toLowerCase().includes(q));
    }
    return list;
});
function openEssayPicker(s) {
    pickingForScholarship.value = s;
    essayPickerSearch.value = "";
    showEssayPicker.value = true;
}
function pickEssay(essay) {
    const s = pickingForScholarship.value;
    if (!s)
        return;
    const updated = { ...s };
    if (updated.essayLinks.some((e) => e.essayId === essay.id))
        return;
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
function askAI(question) {
    if (!question.trim())
        return;
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
        }
        else if (q.includes("qualify")) {
            const score = calculateMatchScore(s);
            aiAnswer.value = `Match Score: ${score}/100. ${score >= 70 ? "You're a strong match!" : score >= 40 ? "You're a possible match — review the requirements." : "This may be a stretch, but check the eligibility details."}`;
        }
        else if (q.includes("first") || q.includes("work on")) {
            const needed = s.checklist.filter((c) => c.status === "Needed" || c.status === "In Progress");
            aiAnswer.value =
                needed.length > 0
                    ? `Start with: ${needed.map((c) => c.label).join(", ")}. These are the materials you still need.`
                    : "All required materials are done! Focus on polishing your application.";
        }
        else if (q.includes("outline")) {
            aiAnswer.value = `Scholarship Essay Outline for ${s.name}:\n1. Introduction: Hook + why this scholarship matters\n2. Your story: Connect your experiences to the scholarship values\n3. Achievements: Highlight relevant accomplishments\n4. Goals: How this scholarship helps your future\n5. Conclusion: Thank you + call to action`;
        }
        else if (q.includes("reuse")) {
            aiAnswer.value =
                "Check your Essay Tracker for existing essays you can adapt. Look for essays with similar prompts or themes about leadership, service, or personal growth.";
        }
        else if (q.includes("missing")) {
            const missing = s.checklist.filter((c) => c.status !== "Not Needed" && c.status !== "Done");
            aiAnswer.value =
                missing.length > 0
                    ? `Still missing or in progress: ${missing.map((c) => c.label + " (" + c.status + ")").join(", ")}.`
                    : "All materials are complete!";
        }
        else if (q.includes("rank")) {
            aiAnswer.value =
                "Based on match score and award amount, here are your top scholarships:\n• Highest match + highest award first\n• Low effort / high reward prioritized\nCheck the 'Best Match' sort to see your ranking.";
        }
        else {
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
function scamWarningsText(s) {
    return getScamWarnings(s);
}
function goToEssays() {
    location.href = "/essays";
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['dash-num']} */ ;
/** @type {__VLS_StyleScopedClasses['dash-num']} */ ;
/** @type {__VLS_StyleScopedClasses['dash-num']} */ ;
/** @type {__VLS_StyleScopedClasses['dash-num']} */ ;
/** @type {__VLS_StyleScopedClasses['dash-num']} */ ;
/** @type {__VLS_StyleScopedClasses['dash-num']} */ ;
/** @type {__VLS_StyleScopedClasses['scholarship-card']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['checklist-row']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-link']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-prompt-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-ai']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-history']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['check']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-del']} */ ;
/** @type {__VLS_StyleScopedClasses['essay-picker-row']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['view-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['view-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['remove-from-yours']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "scholarships-page" },
});
/** @type {__VLS_StyleScopedClasses['scholarships-page']} */ ;
if (__VLS_ctx.showConfetti) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "confetti-container" },
    });
    /** @type {__VLS_StyleScopedClasses['confetti-container']} */ ;
    for (const [i] of __VLS_vFor((50))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (i),
            ...{ class: "confetti-piece" },
            ...{ style: ({
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
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['confetti-piece']} */ ;
        // @ts-ignore
        [showConfetti,];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "welcome" },
});
/** @type {__VLS_StyleScopedClasses['welcome']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-grid" },
});
/** @type {__VLS_StyleScopedClasses['dash-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-card" },
});
/** @type {__VLS_StyleScopedClasses['dash-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-num" },
});
/** @type {__VLS_StyleScopedClasses['dash-num']} */ ;
(__VLS_ctx.dashboardStats.total);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-label" },
});
/** @type {__VLS_StyleScopedClasses['dash-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-card" },
});
/** @type {__VLS_StyleScopedClasses['dash-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-num" },
});
/** @type {__VLS_StyleScopedClasses['dash-num']} */ ;
(__VLS_ctx.fmtCurrency(__VLS_ctx.dashboardStats.totalPossible));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-label" },
});
/** @type {__VLS_StyleScopedClasses['dash-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-card" },
});
/** @type {__VLS_StyleScopedClasses['dash-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-num green" },
});
/** @type {__VLS_StyleScopedClasses['dash-num']} */ ;
/** @type {__VLS_StyleScopedClasses['green']} */ ;
(__VLS_ctx.fmtCurrency(__VLS_ctx.dashboardStats.wonAmount));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-label" },
});
/** @type {__VLS_StyleScopedClasses['dash-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-card" },
});
/** @type {__VLS_StyleScopedClasses['dash-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-num blue" },
});
/** @type {__VLS_StyleScopedClasses['dash-num']} */ ;
/** @type {__VLS_StyleScopedClasses['blue']} */ ;
(__VLS_ctx.fmtCurrency(__VLS_ctx.dashboardStats.appliedAmount));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-label" },
});
/** @type {__VLS_StyleScopedClasses['dash-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-card" },
});
/** @type {__VLS_StyleScopedClasses['dash-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-num yellow" },
});
/** @type {__VLS_StyleScopedClasses['dash-num']} */ ;
/** @type {__VLS_StyleScopedClasses['yellow']} */ ;
(__VLS_ctx.fmtCurrency(__VLS_ctx.dashboardStats.pendingAmount));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-label" },
});
/** @type {__VLS_StyleScopedClasses['dash-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-card" },
});
/** @type {__VLS_StyleScopedClasses['dash-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-num red" },
});
/** @type {__VLS_StyleScopedClasses['dash-num']} */ ;
/** @type {__VLS_StyleScopedClasses['red']} */ ;
(__VLS_ctx.dashboardStats.upcoming);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-label" },
});
/** @type {__VLS_StyleScopedClasses['dash-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-card" },
});
/** @type {__VLS_StyleScopedClasses['dash-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-num purple" },
});
/** @type {__VLS_StyleScopedClasses['dash-num']} */ ;
/** @type {__VLS_StyleScopedClasses['purple']} */ ;
(__VLS_ctx.dashboardStats.highPriority);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-label" },
});
/** @type {__VLS_StyleScopedClasses['dash-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-card" },
});
/** @type {__VLS_StyleScopedClasses['dash-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-num orange" },
});
/** @type {__VLS_StyleScopedClasses['dash-num']} */ ;
/** @type {__VLS_StyleScopedClasses['orange']} */ ;
(__VLS_ctx.dashboardStats.missing);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-label" },
});
/** @type {__VLS_StyleScopedClasses['dash-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "toolbar" },
});
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    value: (__VLS_ctx.searchQuery),
    type: "text",
    placeholder: "🔍 Search scholarships...",
    ...{ class: "search-bar" },
});
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "toolbar-row" },
});
/** @type {__VLS_StyleScopedClasses['toolbar-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    value: (__VLS_ctx.filterStatus),
    ...{ class: "filter-select" },
});
/** @type {__VLS_StyleScopedClasses['filter-select']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "All",
});
for (const [s] of __VLS_vFor((__VLS_ctx.statusOptions))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (s),
        value: (s),
    });
    (s);
    // @ts-ignore
    [dashboardStats, dashboardStats, dashboardStats, dashboardStats, dashboardStats, dashboardStats, dashboardStats, dashboardStats, fmtCurrency, fmtCurrency, fmtCurrency, fmtCurrency, searchQuery, filterStatus, statusOptions,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    value: (__VLS_ctx.filterType),
    ...{ class: "filter-select" },
});
/** @type {__VLS_StyleScopedClasses['filter-select']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "All",
});
for (const [t] of __VLS_vFor((__VLS_ctx.typeOptions))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (t),
        value: (t),
    });
    (t);
    // @ts-ignore
    [filterType, typeOptions,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    value: (__VLS_ctx.filterMatch),
    ...{ class: "filter-select" },
});
/** @type {__VLS_StyleScopedClasses['filter-select']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "All",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "Strong",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "Possible",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "Low",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    value: (__VLS_ctx.filterEffort),
    ...{ class: "filter-select" },
});
/** @type {__VLS_StyleScopedClasses['filter-select']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "All",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "Low",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "Medium",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "High",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    value: (__VLS_ctx.filterDeadline),
    ...{ class: "filter-select" },
});
/** @type {__VLS_StyleScopedClasses['filter-select']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "All",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "ThisWeek",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "ThisMonth",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "Later",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    value: (__VLS_ctx.sortBy),
    ...{ class: "filter-select" },
});
/** @type {__VLS_StyleScopedClasses['filter-select']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "deadline",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "amount",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "match",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "effort",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "priority",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "view-tabs" },
});
/** @type {__VLS_StyleScopedClasses['view-tabs']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return __VLS_ctx.viewMode = 'yours';
            // @ts-ignore
            [filterMatch, filterEffort, filterDeadline, sortBy, viewMode,];
        } },
    ...{ class: "view-tab" },
    ...{ class: ({ active: __VLS_ctx.viewMode === 'yours' }) },
});
/** @type {__VLS_StyleScopedClasses['view-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return __VLS_ctx.viewMode = 'all';
            // @ts-ignore
            [viewMode, viewMode,];
        } },
    ...{ class: "view-tab" },
    ...{ class: ({ active: __VLS_ctx.viewMode === 'all' }) },
});
/** @type {__VLS_StyleScopedClasses['view-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.openAddForm) },
    ...{ class: "btn-add" },
});
/** @type {__VLS_StyleScopedClasses['btn-add']} */ ;
if (__VLS_ctx.filteredScholarships.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "empty-text" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
    (__VLS_ctx.viewMode === "yours"
        ? "No scholarships here yet. Add one above, or customize a sample scholarship to make it yours!"
        : "No scholarships match your filters. Try adjusting or add a new one!");
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "scholarship-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['scholarship-grid']} */ ;
    for (const [s] of __VLS_vFor((__VLS_ctx.filteredScholarships))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.filteredScholarships.length === 0))
                        throw 0;
                    return __VLS_ctx.openDetail(s);
                    // @ts-ignore
                    [viewMode, viewMode, openAddForm, filteredScholarships, filteredScholarships, openDetail,];
                } },
            key: (s.id),
            ...{ class: "scholarship-card" },
        });
        /** @type {__VLS_StyleScopedClasses['scholarship-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-top" },
        });
        /** @type {__VLS_StyleScopedClasses['card-top']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "card-name" },
        });
        /** @type {__VLS_StyleScopedClasses['card-name']} */ ;
        (s.name);
        if (s.isScam) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "scam-badge" },
            });
            /** @type {__VLS_StyleScopedClasses['scam-badge']} */ ;
        }
        if (!s.isSample) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "added-by-you-badge" },
            });
            /** @type {__VLS_StyleScopedClasses['added-by-you-badge']} */ ;
        }
        else if (__VLS_ctx.isCustomizedSample(s)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "customized-badge" },
            });
            /** @type {__VLS_StyleScopedClasses['customized-badge']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "sample-badge" },
            });
            /** @type {__VLS_StyleScopedClasses['sample-badge']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-provider" },
        });
        /** @type {__VLS_StyleScopedClasses['card-provider']} */ ;
        (s.provider || "No provider listed");
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['card-meta']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "card-amount" },
        });
        /** @type {__VLS_StyleScopedClasses['card-amount']} */ ;
        (__VLS_ctx.fmtCurrency(s.awardAmount));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "card-deadline" },
            ...{ class: ('urgency-' + __VLS_ctx.deadlineUrgency(s)) },
        });
        /** @type {__VLS_StyleScopedClasses['card-deadline']} */ ;
        (__VLS_ctx.deadlineLabel(s));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "card-status" },
            ...{ style: ({ background: __VLS_ctx.statusColor(s.status) }) },
        });
        /** @type {__VLS_StyleScopedClasses['card-status']} */ ;
        (s.status);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-badges" },
        });
        /** @type {__VLS_StyleScopedClasses['card-badges']} */ ;
        for (const [badge] of __VLS_vFor((__VLS_ctx.getMatchBadges(s)))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                key: (badge),
                ...{ class: "badge" },
                ...{ class: ('badge-' +
                        badge
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/\//g, '-')) },
            });
            /** @type {__VLS_StyleScopedClasses['badge']} */ ;
            (badge);
            // @ts-ignore
            [fmtCurrency, isCustomizedSample, deadlineUrgency, deadlineLabel, statusColor, getMatchBadges,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-progress" },
        });
        /** @type {__VLS_StyleScopedClasses['card-progress']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mini-bar" },
        });
        /** @type {__VLS_StyleScopedClasses['mini-bar']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mini-fill" },
            ...{ style: ({ width: __VLS_ctx.checklistProgress(s) + '%' }) },
        });
        /** @type {__VLS_StyleScopedClasses['mini-fill']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "mini-label" },
        });
        /** @type {__VLS_StyleScopedClasses['mini-label']} */ ;
        (__VLS_ctx.checklistDone(s));
        (__VLS_ctx.checklistTotal(s));
        if (s.isSample &&
            __VLS_ctx.isCustomizedSample(s) &&
            !__VLS_ctx.removedFromYours.has(s.id)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.filteredScholarships.length === 0))
                            throw 0;
                        if (!(s.isSample &&
                            __VLS_ctx.isCustomizedSample(s) &&
                            !__VLS_ctx.removedFromYours.has(s.id)))
                            throw 0;
                        return __VLS_ctx.removeFromYours(s.id);
                        // @ts-ignore
                        [isCustomizedSample, checklistProgress, checklistDone, checklistTotal, removedFromYours, removeFromYours,];
                    } },
                ...{ class: "remove-from-yours" },
            });
            /** @type {__VLS_StyleScopedClasses['remove-from-yours']} */ ;
        }
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                    throw 0;
                return __VLS_ctx.showDetail = false;
                // @ts-ignore
                [showDetail, showDetail, selectedScholarship,];
            } },
        ...{ class: "modal-overlay" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal detail-modal" },
    });
    /** @type {__VLS_StyleScopedClasses['modal']} */ ;
    /** @type {__VLS_StyleScopedClasses['detail-modal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-header" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (__VLS_ctx.selectedScholarship.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                    throw 0;
                return __VLS_ctx.showDetail = false;
                // @ts-ignore
                [showDetail, selectedScholarship,];
            } },
        ...{ class: "btn-close" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-tabs" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-tabs']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                    throw 0;
                return __VLS_ctx.activeDetailTab = 'overview';
                // @ts-ignore
                [activeDetailTab,];
            } },
        ...{ class: ({ active: __VLS_ctx.activeDetailTab === 'overview' }) },
    });
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                    throw 0;
                return __VLS_ctx.activeDetailTab = 'materials';
                // @ts-ignore
                [activeDetailTab, activeDetailTab,];
            } },
        ...{ class: ({ active: __VLS_ctx.activeDetailTab === 'materials' }) },
    });
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                    throw 0;
                return __VLS_ctx.activeDetailTab = 'docs';
                // @ts-ignore
                [activeDetailTab, activeDetailTab,];
            } },
        ...{ class: ({ active: __VLS_ctx.activeDetailTab === 'docs' }) },
    });
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                    throw 0;
                return __VLS_ctx.activeDetailTab = 'essays';
                // @ts-ignore
                [activeDetailTab, activeDetailTab,];
            } },
        ...{ class: ({ active: __VLS_ctx.activeDetailTab === 'essays' }) },
    });
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                    throw 0;
                return __VLS_ctx.activeDetailTab = 'ai';
                // @ts-ignore
                [activeDetailTab, activeDetailTab,];
            } },
        ...{ class: ({ active: __VLS_ctx.activeDetailTab === 'ai' }) },
    });
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-body" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
    if (__VLS_ctx.activeDetailTab === 'overview') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-section" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.selectedScholarship.provider || "—");
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-amount" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-amount']} */ ;
        (__VLS_ctx.fmtCurrency(__VLS_ctx.selectedScholarship.awardAmount));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: ('urgency-' +
                    __VLS_ctx.deadlineUrgency(__VLS_ctx.selectedScholarship)) },
        });
        (__VLS_ctx.selectedScholarship.deadline ||
            "No deadline");
        (__VLS_ctx.deadlineLabel(__VLS_ctx.selectedScholarship));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-pill" },
            ...{ style: ({
                    background: __VLS_ctx.statusColor(__VLS_ctx.selectedScholarship.status),
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['status-pill']} */ ;
        (__VLS_ctx.selectedScholarship.status);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.selectedScholarship.type);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.selectedScholarship.effortLevel);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.selectedScholarship.renewable ? "Yes" : "No");
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-section" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.selectedScholarship.minGpa || "None");
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.selectedScholarship.satActRequired || "—");
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.selectedScholarship.citizenshipRequired ||
            "—");
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.selectedScholarship.gradeLevel || "—");
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.selectedScholarship.majorEligibility || "—");
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.selectedScholarship.schoolEligibility || "—");
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-section" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
        (__VLS_ctx.calculateMatchScore(__VLS_ctx.selectedScholarship));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "badge-row" },
        });
        /** @type {__VLS_StyleScopedClasses['badge-row']} */ ;
        for (const [badge] of __VLS_vFor((__VLS_ctx.getMatchBadges(__VLS_ctx.selectedScholarship)))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                key: (badge),
                ...{ class: "badge" },
                ...{ class: ('badge-' +
                        badge
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/\//g, '-')) },
            });
            /** @type {__VLS_StyleScopedClasses['badge']} */ ;
            (badge);
            // @ts-ignore
            [fmtCurrency, deadlineUrgency, deadlineLabel, statusColor, getMatchBadges, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, activeDetailTab, activeDetailTab, calculateMatchScore,];
        }
        if (__VLS_ctx.scamWarningsText(__VLS_ctx.selectedScholarship).length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "scam-warnings" },
            });
            /** @type {__VLS_StyleScopedClasses['scam-warnings']} */ ;
            for (const [w, i] of __VLS_vFor((__VLS_ctx.scamWarningsText(__VLS_ctx.selectedScholarship)))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    key: (i),
                    ...{ class: "warning-text" },
                });
                /** @type {__VLS_StyleScopedClasses['warning-text']} */ ;
                (w);
                // @ts-ignore
                [selectedScholarship, selectedScholarship, scamWarningsText, scamWarningsText,];
            }
        }
        if (__VLS_ctx.selectedScholarship.notes) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "detail-section" },
            });
            /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "notes-text" },
            });
            /** @type {__VLS_StyleScopedClasses['notes-text']} */ ;
            (__VLS_ctx.selectedScholarship.notes);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-section" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "progress-bar lg" },
        });
        /** @type {__VLS_StyleScopedClasses['progress-bar']} */ ;
        /** @type {__VLS_StyleScopedClasses['lg']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "progress-fill" },
            ...{ style: ({
                    width: __VLS_ctx.checklistProgress(__VLS_ctx.selectedScholarship) + '%',
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['progress-fill']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "progress-text" },
        });
        /** @type {__VLS_StyleScopedClasses['progress-text']} */ ;
        (__VLS_ctx.checklistDone(__VLS_ctx.selectedScholarship));
        (__VLS_ctx.checklistTotal(__VLS_ctx.selectedScholarship));
        if (__VLS_ctx.selectedScholarship.applicationLink) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "detail-section" },
            });
            /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: (__VLS_ctx.selectedScholarship.applicationLink),
                target: "_blank",
                ...{ class: "app-link" },
            });
            /** @type {__VLS_StyleScopedClasses['app-link']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-actions" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-actions']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                        throw 0;
                    if (!(__VLS_ctx.activeDetailTab === 'overview'))
                        throw 0;
                    return __VLS_ctx.markSubmitted(__VLS_ctx.selectedScholarship);
                    // @ts-ignore
                    [checklistProgress, checklistDone, checklistTotal, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, selectedScholarship, markSubmitted,];
                } },
            ...{ class: "btn-mark submitted" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-mark']} */ ;
        /** @type {__VLS_StyleScopedClasses['submitted']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                        throw 0;
                    if (!(__VLS_ctx.activeDetailTab === 'overview'))
                        throw 0;
                    return __VLS_ctx.markWon(__VLS_ctx.selectedScholarship);
                    // @ts-ignore
                    [selectedScholarship, markWon,];
                } },
            ...{ class: "btn-mark won" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-mark']} */ ;
        /** @type {__VLS_StyleScopedClasses['won']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                        throw 0;
                    if (!(__VLS_ctx.activeDetailTab === 'overview'))
                        throw 0;
                    return __VLS_ctx.markRejected(__VLS_ctx.selectedScholarship);
                    // @ts-ignore
                    [selectedScholarship, markRejected,];
                } },
            ...{ class: "btn-mark rejected" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-mark']} */ ;
        /** @type {__VLS_StyleScopedClasses['rejected']} */ ;
    }
    if (__VLS_ctx.activeDetailTab === 'materials') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "checklist-grid" },
        });
        /** @type {__VLS_StyleScopedClasses['checklist-grid']} */ ;
        for (const [item] of __VLS_vFor((__VLS_ctx.selectedScholarship.checklist))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                            throw 0;
                        if (!(__VLS_ctx.activeDetailTab === 'materials'))
                            throw 0;
                        return;
                        __VLS_ctx.toggleChecklistItem(__VLS_ctx.selectedScholarship, item.id);
                        // @ts-ignore
                        [selectedScholarship, selectedScholarship, activeDetailTab, toggleChecklistItem,];
                    } },
                key: (item.id),
                ...{ class: "checklist-row" },
            });
            /** @type {__VLS_StyleScopedClasses['checklist-row']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "check-status" },
                ...{ class: ('chk-' +
                        item.status
                            .toLowerCase()
                            .replace(/\s+/g, '-')) },
            });
            /** @type {__VLS_StyleScopedClasses['check-status']} */ ;
            (item.status === "Not Needed"
                ? "⬜"
                : item.status === "Needed"
                    ? "⬜"
                    : item.status === "In Progress"
                        ? "🔄"
                        : "✅");
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "check-label" },
            });
            /** @type {__VLS_StyleScopedClasses['check-label']} */ ;
            (item.label);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "check-badge" },
                ...{ class: ('chk-' +
                        item.status
                            .toLowerCase()
                            .replace(/\s+/g, '-')) },
            });
            /** @type {__VLS_StyleScopedClasses['check-badge']} */ ;
            (item.status);
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "add-custom-row" },
        });
        /** @type {__VLS_StyleScopedClasses['add-custom-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            ...{ onKeyup: (...[$event]) => {
                    if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                        throw 0;
                    if (!(__VLS_ctx.activeDetailTab === 'materials'))
                        throw 0;
                    __VLS_ctx.addCustomChecklistItem(__VLS_ctx.selectedScholarship, __VLS_ctx.customChecklistLabel);
                    __VLS_ctx.customChecklistLabel = '';
                    ;
                    // @ts-ignore
                    [selectedScholarship, addCustomChecklistItem, customChecklistLabel, customChecklistLabel,];
                } },
            value: (__VLS_ctx.customChecklistLabel),
            type: "text",
            placeholder: "Add custom item...",
            ...{ class: "custom-input" },
        });
        /** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                        throw 0;
                    if (!(__VLS_ctx.activeDetailTab === 'materials'))
                        throw 0;
                    __VLS_ctx.addCustomChecklistItem(__VLS_ctx.selectedScholarship, __VLS_ctx.customChecklistLabel);
                    __VLS_ctx.customChecklistLabel = '';
                    ;
                    // @ts-ignore
                    [selectedScholarship, addCustomChecklistItem, customChecklistLabel, customChecklistLabel, customChecklistLabel,];
                } },
            ...{ class: "btn-small" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-small']} */ ;
    }
    if (__VLS_ctx.activeDetailTab === 'docs') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        if (__VLS_ctx.selectedScholarship.docLinks.length === 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "empty-text" },
            });
            /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "link-list" },
            });
            /** @type {__VLS_StyleScopedClasses['link-list']} */ ;
            for (const [link] of __VLS_vFor((__VLS_ctx.selectedScholarship.docLinks))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (link.id),
                    ...{ class: "link-row" },
                });
                /** @type {__VLS_StyleScopedClasses['link-row']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (link.fileName);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "link-type" },
                });
                /** @type {__VLS_StyleScopedClasses['link-type']} */ ;
                (link.type);
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                                throw 0;
                            if (!(__VLS_ctx.activeDetailTab === 'docs'))
                                throw 0;
                            if (!!(__VLS_ctx.selectedScholarship.docLinks.length === 0))
                                throw 0;
                            return;
                            __VLS_ctx.unlinkDocument(__VLS_ctx.selectedScholarship, link.id);
                            // @ts-ignore
                            [selectedScholarship, selectedScholarship, selectedScholarship, activeDetailTab, unlinkDocument,];
                        } },
                    ...{ class: "mini-del" },
                });
                /** @type {__VLS_StyleScopedClasses['mini-del']} */ ;
                // @ts-ignore
                [];
            }
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                        throw 0;
                    if (!(__VLS_ctx.activeDetailTab === 'docs'))
                        throw 0;
                    return __VLS_ctx.linkDocument(__VLS_ctx.selectedScholarship);
                    // @ts-ignore
                    [selectedScholarship, linkDocument,];
                } },
            ...{ class: "btn-link" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-link']} */ ;
    }
    if (__VLS_ctx.activeDetailTab === 'essays') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        if (__VLS_ctx.selectedScholarship.essayLinks.length === 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "empty-text" },
            });
            /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "link-list" },
            });
            /** @type {__VLS_StyleScopedClasses['link-list']} */ ;
            for (const [link] of __VLS_vFor((__VLS_ctx.selectedScholarship.essayLinks))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (link.id),
                    ...{ class: "link-row" },
                });
                /** @type {__VLS_StyleScopedClasses['link-row']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (link.essayTitle);
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                                throw 0;
                            if (!(__VLS_ctx.activeDetailTab === 'essays'))
                                throw 0;
                            if (!!(__VLS_ctx.selectedScholarship.essayLinks.length === 0))
                                throw 0;
                            return;
                            __VLS_ctx.unlinkEssay(__VLS_ctx.selectedScholarship, link.id);
                            // @ts-ignore
                            [selectedScholarship, selectedScholarship, selectedScholarship, activeDetailTab, unlinkEssay,];
                        } },
                    ...{ class: "mini-del" },
                });
                /** @type {__VLS_StyleScopedClasses['mini-del']} */ ;
                // @ts-ignore
                [];
            }
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                        throw 0;
                    if (!(__VLS_ctx.activeDetailTab === 'essays'))
                        throw 0;
                    return __VLS_ctx.linkEssay(__VLS_ctx.selectedScholarship);
                    // @ts-ignore
                    [selectedScholarship, linkEssay,];
                } },
            ...{ class: "btn-link" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-link']} */ ;
    }
    if (__VLS_ctx.activeDetailTab === 'ai') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-prompts" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-prompts']} */ ;
        for (const [p] of __VLS_vFor((__VLS_ctx.aiPrompts))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                            throw 0;
                        if (!(__VLS_ctx.activeDetailTab === 'ai'))
                            throw 0;
                        return __VLS_ctx.askAI(p.query);
                        // @ts-ignore
                        [activeDetailTab, aiPrompts, askAI,];
                    } },
                key: (p.query),
                ...{ class: "ai-prompt-btn" },
            });
            /** @type {__VLS_StyleScopedClasses['ai-prompt-btn']} */ ;
            (p.label);
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-input-row" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-input-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            ...{ onKeyup: (...[$event]) => {
                    if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                        throw 0;
                    if (!(__VLS_ctx.activeDetailTab === 'ai'))
                        throw 0;
                    __VLS_ctx.askAI(__VLS_ctx.aiQuestion);
                    __VLS_ctx.aiQuestion = '';
                    ;
                    // @ts-ignore
                    [askAI, aiQuestion, aiQuestion,];
                } },
            value: (__VLS_ctx.aiQuestion),
            type: "text",
            placeholder: "Ask about this scholarship...",
            ...{ class: "ai-input" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-input']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                        throw 0;
                    if (!(__VLS_ctx.activeDetailTab === 'ai'))
                        throw 0;
                    __VLS_ctx.askAI(__VLS_ctx.aiQuestion);
                    __VLS_ctx.aiQuestion = '';
                    ;
                    // @ts-ignore
                    [askAI, aiQuestion, aiQuestion, aiQuestion,];
                } },
            ...{ class: "btn-ai" },
            disabled: (__VLS_ctx.aiLoading),
        });
        /** @type {__VLS_StyleScopedClasses['btn-ai']} */ ;
        if (__VLS_ctx.aiLoading) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ai-loading" },
            });
            /** @type {__VLS_StyleScopedClasses['ai-loading']} */ ;
        }
        if (__VLS_ctx.aiAnswer) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ai-answer" },
            });
            /** @type {__VLS_StyleScopedClasses['ai-answer']} */ ;
            (__VLS_ctx.aiAnswer);
        }
        if (__VLS_ctx.aiHistory.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ai-history" },
            });
            /** @type {__VLS_StyleScopedClasses['ai-history']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
            for (const [h, i] of __VLS_vFor((__VLS_ctx.aiHistory.slice(0, 3)))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (i),
                    ...{ class: "ai-history-item" },
                });
                /** @type {__VLS_StyleScopedClasses['ai-history-item']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "ai-h-q" },
                });
                /** @type {__VLS_StyleScopedClasses['ai-h-q']} */ ;
                (h.q);
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "ai-h-a" },
                });
                /** @type {__VLS_StyleScopedClasses['ai-h-a']} */ ;
                (h.a.slice(0, 150));
                // @ts-ignore
                [aiLoading, aiLoading, aiAnswer, aiAnswer, aiHistory, aiHistory,];
            }
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                    throw 0;
                __VLS_ctx.showDetail = false;
                __VLS_ctx.openEditForm(__VLS_ctx.selectedScholarship);
                ;
                // @ts-ignore
                [showDetail, selectedScholarship, openEditForm,];
            } },
        ...{ class: "btn-edit" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-edit']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showDetail && __VLS_ctx.selectedScholarship))
                    throw 0;
                return __VLS_ctx.deleteScholarship(__VLS_ctx.selectedScholarship.id);
                // @ts-ignore
                [selectedScholarship, deleteScholarship,];
            } },
        ...{ class: "btn-del" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-del']} */ ;
}
if (__VLS_ctx.showForm) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showForm))
                    throw 0;
                return __VLS_ctx.showForm = false;
                // @ts-ignore
                [showForm, showForm,];
            } },
        ...{ class: "modal-overlay z-form" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-form']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal form-modal" },
    });
    /** @type {__VLS_StyleScopedClasses['modal']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-modal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-header" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (__VLS_ctx.editingId ? "Edit" : "Add");
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showForm))
                    throw 0;
                return __VLS_ctx.showForm = false;
                // @ts-ignore
                [showForm, editingId,];
            } },
        ...{ class: "btn-close" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-body" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.form.name),
        type: "text",
        placeholder: "Scholarship name...",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.form.provider),
        type: "text",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "0",
    });
    (__VLS_ctx.form.awardAmount);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "date",
    });
    (__VLS_ctx.form.deadline);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.form.status),
    });
    for (const [s] of __VLS_vFor((__VLS_ctx.statusOptions))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (s),
            value: (s),
        });
        (s);
        // @ts-ignore
        [statusOptions, form, form, form, form, form,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.form.type),
    });
    for (const [t] of __VLS_vFor((__VLS_ctx.typeOptions))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (t),
            value: (t),
        });
        (t);
        // @ts-ignore
        [typeOptions, form,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.form.effortLevel),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "Low",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "Medium",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "High",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "0",
        step: "0.1",
    });
    (__VLS_ctx.form.minGpa);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.form.satActRequired),
        type: "text",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.form.citizenshipRequired),
        type: "text",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.form.gradeLevel),
        type: "text",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.form.majorEligibility),
        type: "text",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.form.schoolEligibility),
        type: "text",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.form.applicationLink),
        type: "text",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.form.tags),
        type: "text",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field check" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    /** @type {__VLS_StyleScopedClasses['check']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "checkbox",
    });
    (__VLS_ctx.form.renewable);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field check" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    /** @type {__VLS_StyleScopedClasses['check']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "checkbox",
    });
    (__VLS_ctx.form.isScam);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field full" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    /** @type {__VLS_StyleScopedClasses['full']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.form.notes),
        rows: "3",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.saveScholarship) },
        ...{ class: "btn-save" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
    (__VLS_ctx.editingId ? "Update" : "Save");
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showForm))
                    throw 0;
                return __VLS_ctx.showForm = false;
                // @ts-ignore
                [showForm, editingId, form, form, form, form, form, form, form, form, form, form, form, form, saveScholarship,];
            } },
        ...{ class: "btn-cancel" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-cancel']} */ ;
}
if (__VLS_ctx.showEssayPicker) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showEssayPicker))
                    throw 0;
                return __VLS_ctx.showEssayPicker = false;
                // @ts-ignore
                [showEssayPicker, showEssayPicker,];
            } },
        ...{ class: "modal-overlay z-picker" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-picker']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal detail-modal" },
    });
    /** @type {__VLS_StyleScopedClasses['modal']} */ ;
    /** @type {__VLS_StyleScopedClasses['detail-modal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-header" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showEssayPicker))
                    throw 0;
                return __VLS_ctx.showEssayPicker = false;
                // @ts-ignore
                [showEssayPicker,];
            } },
        ...{ class: "btn-close" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-body" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.essayPickerSearch),
        type: "text",
        placeholder: "🔍 Search essays...",
        ...{ class: "search-bar" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
    if (__VLS_ctx.availableEssays.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "empty-text" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "essay-picker-list" },
        });
        /** @type {__VLS_StyleScopedClasses['essay-picker-list']} */ ;
        for (const [e] of __VLS_vFor((__VLS_ctx.availableEssays))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.showEssayPicker))
                            throw 0;
                        if (!!(__VLS_ctx.availableEssays.length === 0))
                            throw 0;
                        return __VLS_ctx.pickEssay(e);
                        // @ts-ignore
                        [essayPickerSearch, availableEssays, availableEssays, pickEssay,];
                    } },
                key: (e.id),
                ...{ class: "essay-picker-row" },
            });
            /** @type {__VLS_StyleScopedClasses['essay-picker-row']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ep-title" },
            });
            /** @type {__VLS_StyleScopedClasses['ep-title']} */ ;
            (e.title);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ep-meta" },
            });
            /** @type {__VLS_StyleScopedClasses['ep-meta']} */ ;
            (e.collegeName);
            (e.status);
            (e.currentWordCount);
            (e.targetWordCount);
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ class: "btn-small" },
            });
            /** @type {__VLS_StyleScopedClasses['btn-small']} */ ;
            // @ts-ignore
            [];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-footer" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showEssayPicker))
                    throw 0;
                __VLS_ctx.showEssayPicker = false;
                __VLS_ctx.goToEssays();
                ;
                // @ts-ignore
                [showEssayPicker, goToEssays,];
            } },
        ...{ class: "btn-link" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-link']} */ ;
}
if (__VLS_ctx.showDocPicker) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showDocPicker))
                    throw 0;
                return __VLS_ctx.showDocPicker = false;
                // @ts-ignore
                [showDocPicker, showDocPicker,];
            } },
        ...{ class: "modal-overlay z-picker" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-picker']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal detail-modal" },
    });
    /** @type {__VLS_StyleScopedClasses['modal']} */ ;
    /** @type {__VLS_StyleScopedClasses['detail-modal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-header" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showDocPicker))
                    throw 0;
                return __VLS_ctx.showDocPicker = false;
                // @ts-ignore
                [showDocPicker,];
            } },
        ...{ class: "btn-close" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-body" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.docPickerSearch),
        type: "text",
        placeholder: "🔍 Search documents...",
        ...{ class: "search-bar" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
    if (__VLS_ctx.availableDocs.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "empty-text" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "essay-picker-list" },
        });
        /** @type {__VLS_StyleScopedClasses['essay-picker-list']} */ ;
        for (const [doc] of __VLS_vFor((__VLS_ctx.availableDocs))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.showDocPicker))
                            throw 0;
                        if (!!(__VLS_ctx.availableDocs.length === 0))
                            throw 0;
                        return __VLS_ctx.toggleDocSelection(doc.id);
                        // @ts-ignore
                        [docPickerSearch, availableDocs, availableDocs, toggleDocSelection,];
                    } },
                key: (doc.id),
                ...{ class: "essay-picker-row" },
            });
            /** @type {__VLS_StyleScopedClasses['essay-picker-row']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ style: {} },
            });
            (__VLS_ctx.selectedDocIds.has(doc.id) ? "☑️" : "⬜");
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ep-title" },
            });
            /** @type {__VLS_StyleScopedClasses['ep-title']} */ ;
            (doc.fileName);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ep-meta" },
            });
            /** @type {__VLS_StyleScopedClasses['ep-meta']} */ ;
            (doc.type);
            (doc.dateAdded
                ? doc.dateAdded.slice(0, 10)
                : "");
            // @ts-ignore
            [selectedDocIds,];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-footer" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showDocPicker))
                    throw 0;
                return __VLS_ctx.showDocPicker = false;
                // @ts-ignore
                [showDocPicker,];
            } },
        ...{ class: "btn-cancel" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-cancel']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showDocPicker))
                    throw 0;
                return __VLS_ctx.linkSelectedDocuments();
                // @ts-ignore
                [linkSelectedDocuments,];
            } },
        ...{ class: "btn-save" },
        disabled: (__VLS_ctx.selectedDocIds.size === 0),
    });
    /** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
    (__VLS_ctx.selectedDocIds.size);
}
// @ts-ignore
[selectedDocIds, selectedDocIds,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
