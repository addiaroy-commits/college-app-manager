import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useEssayStore } from "../stores/essayStore";
import { useCollegeStore } from "../stores/collegeStore";
import { getUserKey } from "../stores/userKey";
const router = useRouter();
const essayStore = useEssayStore();
const collegeStore = useCollegeStore();
const selectedCollegeId = ref(null);
const showCommonApp = ref(false);
const showEditor = ref(false);
const editingId = ref(null);
const essayContent = ref("");
const showConfetti = ref(false);
const collegeSearch = ref("");
let confettiTimer = null;
const tempTarget = ref(null);
const essayTargets = ref({});
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
    if (saved)
        essayTargets.value = JSON.parse(saved);
})();
function saveTargets() {
    localStorage.setItem(getUserKey("essay-targets"), JSON.stringify(essayTargets.value));
}
const form = ref({
    title: "",
    prompt: "",
    targetWordCount: 650,
    status: "Not Started",
});
const selectedCollege = computed(() => collegeStore.colleges.find((c) => c.id === selectedCollegeId.value));
const collegeEssays = computed(() => selectedCollegeId.value
    ? essayStore.essays.filter((e) => e.collegeId === selectedCollegeId.value)
    : []);
const commonAppEssays = computed(() => essayStore.essays.filter((e) => e.collegeId === "common-app"));
const commonAppStats = computed(() => ({
    total: commonAppEssays.value.length,
    done: commonAppEssays.value.filter((e) => e.status === "Done").length,
    drafting: commonAppEssays.value.filter((e) => e.status === "Drafting")
        .length,
}));
const scholarshipOtherEssays = computed(() => essayStore.essays.filter((e) => e.collegeId === "scholarship-other"));
const scholarshipOtherStats = computed(() => {
    const essays = scholarshipOtherEssays.value;
    return {
        total: essays.length,
        done: essays.filter((e) => e.status === "Done").length,
        drafting: essays.filter((e) => e.status === "Drafting").length,
    };
});
const filteredColleges = computed(() => {
    if (!collegeSearch.value.trim())
        return collegeStore.colleges;
    const q = collegeSearch.value.toLowerCase();
    return collegeStore.colleges.filter((c) => c.name.toLowerCase().includes(q));
});
function isPromptAdded(promptIndex) {
    return essayStore.essays.some((e) => e.collegeId === "common-app" &&
        e.prompt === commonAppPrompts[promptIndex]);
}
function getPromptEssay(promptIndex) {
    return essayStore.essays.find((e) => e.collegeId === "common-app" &&
        e.prompt === commonAppPrompts[promptIndex]);
}
function togglePrompt(promptIndex) {
    const existing = getPromptEssay(promptIndex);
    if (existing) {
        essayStore.deleteEssay(existing.id);
    }
    else {
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
watch(() => form.value.status, (newStatus) => {
    if (newStatus === "Done") {
        showConfetti.value = true;
        if (confettiTimer)
            clearTimeout(confettiTimer);
        confettiTimer = setTimeout(() => {
            showConfetti.value = false;
        }, 3000);
    }
});
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
    status: "Not Started",
    essayType: "scholarship",
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
    if (!form.value.title.trim())
        return;
    const eType = scholarshipOtherForm.value.essayType;
    const displayType = eType === "other" && scholarshipOtherForm.value.customName.trim()
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
            essayType: displayType,
        });
    }
    else {
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
            essayType: displayType,
        });
    }
    showEditor.value = false;
    editingId.value = null;
    isScholarshipEssay.value = false;
}
function openCollege(id) {
    isScholarshipEssay.value = false;
    selectedCollegeId.value = id;
    tempTarget.value = hasTarget(id) ? getTarget(id) : null;
}
function getEssayStats(collegeId) {
    const essays = essayStore.essays.filter((e) => e.collegeId === collegeId);
    return {
        total: essays.length,
        done: essays.filter((e) => e.status === "Done").length,
    };
}
function setTarget(collegeId, val) {
    if (!val || val <= 0) {
        delete essayTargets.value[collegeId];
    }
    else {
        essayTargets.value[collegeId] = val;
    }
    saveTargets();
}
function hasTarget(collegeId) {
    return (essayTargets.value[collegeId] !== undefined &&
        essayTargets.value[collegeId] > 0);
}
function getTarget(collegeId) {
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
    if (!form.value.title.trim())
        return;
    essayStore.addEssay({
        id: crypto.randomUUID(),
        title: form.value.title.trim(),
        collegeId: selectedCollegeId.value,
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
function removeEssay(id) {
    if (confirm("Delete this essay?"))
        essayStore.deleteEssay(id);
}
function statusColor(s) {
    if (s === "Done")
        return "status-done";
    if (s === "Drafting")
        return "status-drafting";
    return "status-not-started";
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['essay-search']} */ ;
/** @type {__VLS_StyleScopedClasses['common-app-card']} */ ;
/** @type {__VLS_StyleScopedClasses['ca-row']} */ ;
/** @type {__VLS_StyleScopedClasses['ca-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['college-card']} */ ;
/** @type {__VLS_StyleScopedClasses['category-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['category-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['category-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-target-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['view-full-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['essay-row']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-view-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-del-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "welcome" },
});
/** @type {__VLS_StyleScopedClasses['welcome']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    value: (__VLS_ctx.collegeSearch),
    type: "text",
    placeholder: "🔍 Search colleges...",
    ...{ class: "essay-search" },
});
/** @type {__VLS_StyleScopedClasses['essay-search']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            return __VLS_ctx.showCommonApp = true;
            // @ts-ignore
            [collegeSearch, showCommonApp,];
        } },
    ...{ class: "common-app-card" },
});
/** @type {__VLS_StyleScopedClasses['common-app-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "common-app-header" },
});
/** @type {__VLS_StyleScopedClasses['common-app-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "common-app-icon" },
});
/** @type {__VLS_StyleScopedClasses['common-app-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "common-app-name" },
});
/** @type {__VLS_StyleScopedClasses['common-app-name']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "common-app-sub" },
});
/** @type {__VLS_StyleScopedClasses['common-app-sub']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "common-app-stats" },
});
/** @type {__VLS_StyleScopedClasses['common-app-stats']} */ ;
if (__VLS_ctx.commonAppStats.total > 0) {
    (__VLS_ctx.commonAppStats.total);
    (__VLS_ctx.commonAppStats.done);
    (__VLS_ctx.commonAppStats.drafting);
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "no-essays" },
    });
    /** @type {__VLS_StyleScopedClasses['no-essays']} */ ;
}
if (__VLS_ctx.commonAppStats.total > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ca-progress" },
    });
    /** @type {__VLS_StyleScopedClasses['ca-progress']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mini-bar" },
    });
    /** @type {__VLS_StyleScopedClasses['mini-bar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mini-fill" },
        ...{ style: ({
                width: (__VLS_ctx.commonAppStats.total / 7) * 100 + '%',
                background: '#7c3aed',
            }) },
    });
    /** @type {__VLS_StyleScopedClasses['mini-fill']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "mini-label" },
    });
    /** @type {__VLS_StyleScopedClasses['mini-label']} */ ;
    (__VLS_ctx.commonAppStats.total);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            return __VLS_ctx.showScholarshipOther = true;
            // @ts-ignore
            [commonAppStats, commonAppStats, commonAppStats, commonAppStats, commonAppStats, commonAppStats, commonAppStats, showScholarshipOther,];
        } },
    ...{ class: "common-app-card" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['common-app-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "common-app-header" },
});
/** @type {__VLS_StyleScopedClasses['common-app-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "common-app-icon" },
});
/** @type {__VLS_StyleScopedClasses['common-app-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "common-app-name" },
});
/** @type {__VLS_StyleScopedClasses['common-app-name']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "common-app-sub" },
});
/** @type {__VLS_StyleScopedClasses['common-app-sub']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "common-app-stats" },
});
/** @type {__VLS_StyleScopedClasses['common-app-stats']} */ ;
if (__VLS_ctx.scholarshipOtherStats.total > 0) {
    (__VLS_ctx.scholarshipOtherStats.total);
    (__VLS_ctx.scholarshipOtherStats.done);
    (__VLS_ctx.scholarshipOtherStats.drafting);
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "no-essays" },
    });
    /** @type {__VLS_StyleScopedClasses['no-essays']} */ ;
}
if (__VLS_ctx.scholarshipOtherStats.total > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ca-progress" },
    });
    /** @type {__VLS_StyleScopedClasses['ca-progress']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mini-bar" },
    });
    /** @type {__VLS_StyleScopedClasses['mini-bar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mini-fill" },
        ...{ style: ({
                width: Math.min((__VLS_ctx.scholarshipOtherStats.done /
                    Math.max(__VLS_ctx.scholarshipOtherStats.total, 1)) *
                    100, 100) + '%',
                background: '#10b981',
            }) },
    });
    /** @type {__VLS_StyleScopedClasses['mini-fill']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "mini-label" },
    });
    /** @type {__VLS_StyleScopedClasses['mini-label']} */ ;
    (__VLS_ctx.scholarshipOtherStats.done);
    (__VLS_ctx.scholarshipOtherStats.total);
}
if (__VLS_ctx.filteredColleges.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "empty-text" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
    (__VLS_ctx.collegeSearch
        ? "No colleges match your search."
        : "Add colleges from the 🏫 College List page!");
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "college-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['college-grid']} */ ;
    for (const [college] of __VLS_vFor((__VLS_ctx.filteredColleges))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.filteredColleges.length === 0))
                        throw 0;
                    return __VLS_ctx.openCollege(college.id);
                    // @ts-ignore
                    [collegeSearch, scholarshipOtherStats, scholarshipOtherStats, scholarshipOtherStats, scholarshipOtherStats, scholarshipOtherStats, scholarshipOtherStats, scholarshipOtherStats, scholarshipOtherStats, scholarshipOtherStats, filteredColleges, filteredColleges, openCollege,];
                } },
            key: (college.id),
            ...{ class: "college-card" },
        });
        /** @type {__VLS_StyleScopedClasses['college-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-top" },
        });
        /** @type {__VLS_StyleScopedClasses['card-top']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "card-name" },
        });
        /** @type {__VLS_StyleScopedClasses['card-name']} */ ;
        (college.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "category-badge" },
            ...{ class: (college.category.toLowerCase()) },
        });
        /** @type {__VLS_StyleScopedClasses['category-badge']} */ ;
        (college.category);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-essays" },
        });
        /** @type {__VLS_StyleScopedClasses['card-essays']} */ ;
        if (__VLS_ctx.getEssayStats(college.id).total > 0) {
            (__VLS_ctx.getEssayStats(college.id).total);
            (__VLS_ctx.getEssayStats(college.id).done);
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "no-essays" },
            });
            /** @type {__VLS_StyleScopedClasses['no-essays']} */ ;
        }
        if (__VLS_ctx.hasTarget(college.id)) {
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
                ...{ style: ({
                        width: Math.min((__VLS_ctx.getEssayStats(college.id).total /
                            Math.max(__VLS_ctx.getTarget(college.id), 1)) *
                            100, 100) + '%',
                        background: __VLS_ctx.getEssayStats(college.id).total >=
                            __VLS_ctx.getTarget(college.id)
                            ? '#059669'
                            : '#1e1b4b',
                    }) },
            });
            /** @type {__VLS_StyleScopedClasses['mini-fill']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "mini-label" },
            });
            /** @type {__VLS_StyleScopedClasses['mini-label']} */ ;
            (__VLS_ctx.getEssayStats(college.id).total);
            (__VLS_ctx.getTarget(college.id));
        }
        // @ts-ignore
        [getEssayStats, getEssayStats, getEssayStats, getEssayStats, getEssayStats, getEssayStats, hasTarget, getTarget, getTarget, getTarget,];
    }
}
if (__VLS_ctx.showCommonApp) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showCommonApp))
                    throw 0;
                return __VLS_ctx.showCommonApp = false;
                // @ts-ignore
                [showCommonApp, showCommonApp,];
            } },
        ...{ class: "modal-overlay" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal ca-modal" },
    });
    /** @type {__VLS_StyleScopedClasses['modal']} */ ;
    /** @type {__VLS_StyleScopedClasses['ca-modal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-header ca-header" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['ca-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showCommonApp))
                    throw 0;
                return __VLS_ctx.showCommonApp = false;
                // @ts-ignore
                [showCommonApp,];
            } },
        ...{ class: "btn-close" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ca-subheader" },
    });
    /** @type {__VLS_StyleScopedClasses['ca-subheader']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-body" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
    for (const [prompt, idx] of __VLS_vFor((__VLS_ctx.commonAppPrompts))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (idx),
            ...{ class: "ca-row" },
        });
        /** @type {__VLS_StyleScopedClasses['ca-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ca-num" },
        });
        /** @type {__VLS_StyleScopedClasses['ca-num']} */ ;
        (idx + 1);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ca-prompt-text" },
        });
        /** @type {__VLS_StyleScopedClasses['ca-prompt-text']} */ ;
        (prompt);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ca-actions" },
        });
        /** @type {__VLS_StyleScopedClasses['ca-actions']} */ ;
        if (__VLS_ctx.getPromptEssay(idx)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "status-badge" },
                ...{ class: (__VLS_ctx.statusColor(__VLS_ctx.getPromptEssay(idx).status)) },
            });
            /** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
            (__VLS_ctx.getPromptEssay(idx).status);
        }
        if (__VLS_ctx.getPromptEssay(idx)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.showCommonApp))
                            throw 0;
                        if (!(__VLS_ctx.getPromptEssay(idx)))
                            throw 0;
                        __VLS_ctx.router.push('/essays/college/common-app/essay/' +
                            __VLS_ctx.getPromptEssay(idx).id);
                        __VLS_ctx.showCommonApp = false;
                        ;
                        // @ts-ignore
                        [showCommonApp, commonAppPrompts, getPromptEssay, getPromptEssay, getPromptEssay, getPromptEssay, getPromptEssay, statusColor, router,];
                    } },
                ...{ class: "mini-view-btn" },
            });
            /** @type {__VLS_StyleScopedClasses['mini-view-btn']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showCommonApp))
                        throw 0;
                    return __VLS_ctx.togglePrompt(idx);
                    // @ts-ignore
                    [togglePrompt,];
                } },
            ...{ class: "ca-toggle" },
        });
        /** @type {__VLS_StyleScopedClasses['ca-toggle']} */ ;
        (__VLS_ctx.isPromptAdded(idx) ? "✕ Remove" : "+ Select");
        // @ts-ignore
        [isPromptAdded,];
    }
}
if (__VLS_ctx.selectedCollege) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.selectedCollege))
                    throw 0;
                return __VLS_ctx.selectedCollegeId = null;
                // @ts-ignore
                [selectedCollege, selectedCollegeId,];
            } },
        ...{ class: "modal-overlay" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal" },
    });
    /** @type {__VLS_StyleScopedClasses['modal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-header" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (__VLS_ctx.selectedCollege.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.selectedCollege))
                    throw 0;
                return __VLS_ctx.selectedCollegeId = null;
                // @ts-ignore
                [selectedCollege, selectedCollegeId,];
            } },
        ...{ class: "btn-close" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "target-section" },
    });
    /** @type {__VLS_StyleScopedClasses['target-section']} */ ;
    if (!__VLS_ctx.hasTarget(__VLS_ctx.selectedCollegeId)) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "target-prompt" },
        });
        /** @type {__VLS_StyleScopedClasses['target-prompt']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.selectedCollege.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "target-input-row" },
        });
        /** @type {__VLS_StyleScopedClasses['target-input-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            type: "number",
            min: "1",
            placeholder: "e.g. 3",
            ...{ class: "target-input" },
        });
        (__VLS_ctx.tempTarget);
        /** @type {__VLS_StyleScopedClasses['target-input']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.selectedCollege))
                        throw 0;
                    if (!(!__VLS_ctx.hasTarget(__VLS_ctx.selectedCollegeId)))
                        throw 0;
                    __VLS_ctx.setTarget(__VLS_ctx.selectedCollegeId, __VLS_ctx.tempTarget);
                    __VLS_ctx.tempTarget = null;
                    ;
                    // @ts-ignore
                    [hasTarget, selectedCollege, selectedCollegeId, selectedCollegeId, tempTarget, tempTarget, tempTarget, setTarget,];
                } },
            ...{ class: "btn-save" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "progress-banner" },
        });
        /** @type {__VLS_StyleScopedClasses['progress-banner']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "progress-row" },
        });
        /** @type {__VLS_StyleScopedClasses['progress-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "progress-label" },
        });
        /** @type {__VLS_StyleScopedClasses['progress-label']} */ ;
        (__VLS_ctx.collegeEssays.length);
        (__VLS_ctx.getTarget(__VLS_ctx.selectedCollegeId));
        (__VLS_ctx.getEssayStats(__VLS_ctx.selectedCollegeId).done);
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.selectedCollege))
                        throw 0;
                    if (!!(!__VLS_ctx.hasTarget(__VLS_ctx.selectedCollegeId)))
                        throw 0;
                    __VLS_ctx.tempTarget = __VLS_ctx.getTarget(__VLS_ctx.selectedCollegeId);
                    delete __VLS_ctx.essayTargets[__VLS_ctx.selectedCollegeId];
                    __VLS_ctx.saveTargets();
                    ;
                    // @ts-ignore
                    [getEssayStats, getTarget, getTarget, selectedCollegeId, selectedCollegeId, selectedCollegeId, selectedCollegeId, tempTarget, collegeEssays, essayTargets, saveTargets,];
                } },
            ...{ class: "edit-target-btn" },
        });
        /** @type {__VLS_StyleScopedClasses['edit-target-btn']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "progress-bar" },
        });
        /** @type {__VLS_StyleScopedClasses['progress-bar']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "progress-fill" },
            ...{ style: ({
                    width: Math.min((__VLS_ctx.collegeEssays.length /
                        Math.max(__VLS_ctx.getTarget(__VLS_ctx.selectedCollegeId), 1)) *
                        100, 100) + '%',
                    background: __VLS_ctx.collegeEssays.length >=
                        __VLS_ctx.getTarget(__VLS_ctx.selectedCollegeId)
                        ? '#059669'
                        : '#1e1b4b',
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['progress-fill']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.selectedCollege))
                    throw 0;
                return;
                __VLS_ctx.router.push('/essays/college/' + __VLS_ctx.selectedCollegeId);
                // @ts-ignore
                [getTarget, getTarget, router, selectedCollegeId, selectedCollegeId, selectedCollegeId, collegeEssays, collegeEssays,];
            } },
        ...{ class: "view-full-btn" },
    });
    /** @type {__VLS_StyleScopedClasses['view-full-btn']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.openAddEssay) },
        ...{ class: "btn-add" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-add']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-body" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
    if (__VLS_ctx.collegeEssays.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "empty-text" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
    }
    for (const [essay] of __VLS_vFor((__VLS_ctx.collegeEssays))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (essay.id),
            ...{ class: "essay-row" },
        });
        /** @type {__VLS_StyleScopedClasses['essay-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "essay-info" },
        });
        /** @type {__VLS_StyleScopedClasses['essay-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "essay-title" },
        });
        /** @type {__VLS_StyleScopedClasses['essay-title']} */ ;
        (essay.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "essay-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['essay-meta']} */ ;
        (essay.currentWordCount);
        (essay.targetWordCount);
        if (essay.prompt) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (essay.prompt.slice(0, 35));
            (essay.prompt.length > 35 ? "..." : "");
        }
        if (essay.content?.startsWith('FILE:')) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "attached-badge" },
            });
            /** @type {__VLS_StyleScopedClasses['attached-badge']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-badge" },
            ...{ class: (__VLS_ctx.statusColor(essay.status)) },
        });
        /** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
        (essay.status);
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.selectedCollege))
                        throw 0;
                    return;
                    __VLS_ctx.router.push('/essays/college/' +
                        __VLS_ctx.selectedCollegeId +
                        '/essay/' +
                        essay.id);
                    // @ts-ignore
                    [statusColor, router, selectedCollegeId, collegeEssays, collegeEssays, openAddEssay,];
                } },
            ...{ class: "mini-view-btn" },
        });
        /** @type {__VLS_StyleScopedClasses['mini-view-btn']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.selectedCollege))
                        throw 0;
                    return __VLS_ctx.removeEssay(essay.id);
                    // @ts-ignore
                    [removeEssay,];
                } },
            ...{ class: "mini-del-btn" },
            title: "Delete",
        });
        /** @type {__VLS_StyleScopedClasses['mini-del-btn']} */ ;
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.showEditor) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showEditor))
                    throw 0;
                return __VLS_ctx.showEditor = false;
                // @ts-ignore
                [showEditor, showEditor,];
            } },
        ...{ class: "modal-overlay editor-z" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
    /** @type {__VLS_StyleScopedClasses['editor-z']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal editor-modal" },
    });
    /** @type {__VLS_StyleScopedClasses['modal']} */ ;
    /** @type {__VLS_StyleScopedClasses['editor-modal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-header" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (__VLS_ctx.editingId &&
        __VLS_ctx.essayStore.essays.find((e) => e.id === __VLS_ctx.editingId)
            ?.collegeId === "scholarship-other"
        ? "Edit Scholarship Essay"
        : __VLS_ctx.selectedCollegeId
            ? "New Essay for " +
                (__VLS_ctx.selectedCollege?.name || "")
            : "New Scholarship Essay");
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showEditor))
                    throw 0;
                return __VLS_ctx.showEditor = false;
                // @ts-ignore
                [selectedCollege, selectedCollegeId, showEditor, editingId, editingId, essayStore,];
            } },
        ...{ class: "btn-close" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-body" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
    if (__VLS_ctx.isScholarshipEssay ||
        (__VLS_ctx.editingId &&
            __VLS_ctx.essayStore.essays.find((e) => e.id === __VLS_ctx.editingId)?.collegeId === 'scholarship-other')) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "field" },
        });
        /** @type {__VLS_StyleScopedClasses['field']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
            value: (__VLS_ctx.scholarshipOtherForm.essayType),
        });
        for (const [t] of __VLS_vFor((__VLS_ctx.scholarshipOtherTypes))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                key: (t.value),
                value: (t.value),
            });
            (t.label);
            // @ts-ignore
            [editingId, editingId, essayStore, isScholarshipEssay, scholarshipOtherForm, scholarshipOtherTypes,];
        }
        if (__VLS_ctx.scholarshipOtherForm.essayType === 'other') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                value: (__VLS_ctx.scholarshipOtherForm.customName),
                type: "text",
                placeholder: "e.g. Award, Competition, Fellowship...",
                ...{ style: {} },
            });
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.form.title),
        type: "text",
        placeholder: "e.g. Personal Statement",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.form.prompt),
        rows: "2",
        placeholder: "What is the essay question?",
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
    (__VLS_ctx.form.targetWordCount);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showEditor))
                    throw 0;
                return;
                __VLS_ctx.isScholarshipEssay ||
                    (__VLS_ctx.editingId &&
                        __VLS_ctx.essayStore.essays.find((e) => e.id === __VLS_ctx.editingId)?.collegeId === 'scholarship-other')
                    ? __VLS_ctx.saveScholarshipOtherEssay()
                    : __VLS_ctx.saveEssay();
                // @ts-ignore
                [editingId, editingId, essayStore, isScholarshipEssay, scholarshipOtherForm, scholarshipOtherForm, form, form, form, saveScholarshipOtherEssay, saveEssay,];
            } },
        ...{ class: "btn-save" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showEditor))
                    throw 0;
                return __VLS_ctx.showEditor = false;
                // @ts-ignore
                [showEditor,];
            } },
        ...{ class: "btn-cancel" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-cancel']} */ ;
}
if (__VLS_ctx.showScholarshipOther) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showScholarshipOther))
                    throw 0;
                return __VLS_ctx.showScholarshipOther = false;
                // @ts-ignore
                [showScholarshipOther, showScholarshipOther,];
            } },
        ...{ class: "modal-overlay" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal ca-modal" },
    });
    /** @type {__VLS_StyleScopedClasses['modal']} */ ;
    /** @type {__VLS_StyleScopedClasses['ca-modal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-header ca-header" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['ca-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showScholarshipOther))
                    throw 0;
                return __VLS_ctx.showScholarshipOther = false;
                // @ts-ignore
                [showScholarshipOther,];
            } },
        ...{ class: "btn-close" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ca-subheader" },
    });
    /** @type {__VLS_StyleScopedClasses['ca-subheader']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-body" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
        ...{ style: {} },
    });
    if (__VLS_ctx.scholarshipOtherEssays.filter(e => !e.essayType || e.essayType === 'scholarship').length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "empty-text" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
    }
    for (const [essay] of __VLS_vFor((__VLS_ctx.scholarshipOtherEssays.filter(e => !e.essayType || e.essayType === 'scholarship')))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (essay.id),
            ...{ class: "essay-row" },
        });
        /** @type {__VLS_StyleScopedClasses['essay-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "essay-info" },
        });
        /** @type {__VLS_StyleScopedClasses['essay-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "essay-title" },
        });
        /** @type {__VLS_StyleScopedClasses['essay-title']} */ ;
        (essay.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "essay-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['essay-meta']} */ ;
        (essay.currentWordCount);
        (essay.targetWordCount);
        if (essay.prompt) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (essay.prompt.slice(0, 35));
            (essay.prompt.length > 35 ? "..." : "");
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-badge" },
            ...{ class: (__VLS_ctx.statusColor(essay.status)) },
        });
        /** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
        (essay.status);
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showScholarshipOther))
                        throw 0;
                    __VLS_ctx.router.push('/essays/college/scholarship-other/essay/' + essay.id);
                    __VLS_ctx.showScholarshipOther = false;
                    ;
                    // @ts-ignore
                    [showScholarshipOther, statusColor, router, scholarshipOtherEssays, scholarshipOtherEssays,];
                } },
            ...{ class: "mini-view-btn" },
        });
        /** @type {__VLS_StyleScopedClasses['mini-view-btn']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showScholarshipOther))
                        throw 0;
                    return __VLS_ctx.removeEssay(essay.id);
                    // @ts-ignore
                    [removeEssay,];
                } },
            ...{ class: "mini-del-btn" },
            title: "Delete",
        });
        /** @type {__VLS_StyleScopedClasses['mini-del-btn']} */ ;
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
        ...{ style: {} },
    });
    if (__VLS_ctx.scholarshipOtherEssays.filter(e => e.essayType && e.essayType !== 'scholarship').length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "empty-text" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
    }
    for (const [essay] of __VLS_vFor((__VLS_ctx.scholarshipOtherEssays.filter(e => e.essayType && e.essayType !== 'scholarship')))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (essay.id),
            ...{ class: "essay-row" },
        });
        /** @type {__VLS_StyleScopedClasses['essay-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "essay-info" },
        });
        /** @type {__VLS_StyleScopedClasses['essay-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "essay-title" },
        });
        /** @type {__VLS_StyleScopedClasses['essay-title']} */ ;
        (essay.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "so-type-badge so-other" },
        });
        /** @type {__VLS_StyleScopedClasses['so-type-badge']} */ ;
        /** @type {__VLS_StyleScopedClasses['so-other']} */ ;
        (essay.essayType);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "essay-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['essay-meta']} */ ;
        (essay.currentWordCount);
        (essay.targetWordCount);
        if (essay.prompt) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (essay.prompt.slice(0, 35));
            (essay.prompt.length > 35 ? "..." : "");
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-badge" },
            ...{ class: (__VLS_ctx.statusColor(essay.status)) },
        });
        /** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
        (essay.status);
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showScholarshipOther))
                        throw 0;
                    __VLS_ctx.router.push('/essays/college/scholarship-other/essay/' + essay.id);
                    __VLS_ctx.showScholarshipOther = false;
                    ;
                    // @ts-ignore
                    [showScholarshipOther, statusColor, router, scholarshipOtherEssays, scholarshipOtherEssays,];
                } },
            ...{ class: "mini-view-btn" },
        });
        /** @type {__VLS_StyleScopedClasses['mini-view-btn']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showScholarshipOther))
                        throw 0;
                    return __VLS_ctx.removeEssay(essay.id);
                    // @ts-ignore
                    [removeEssay,];
                } },
            ...{ class: "mini-del-btn" },
            title: "Delete",
        });
        /** @type {__VLS_StyleScopedClasses['mini-del-btn']} */ ;
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-footer" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.openAddScholarshipOther) },
        ...{ class: "btn-add" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-add']} */ ;
}
// @ts-ignore
[openAddScholarshipOther,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
