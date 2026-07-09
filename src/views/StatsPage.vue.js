import { computed } from "vue";
import { useCollegeStore } from "../stores/collegeStore";
import { useEssayStore } from "../stores/essayStore";
import { useDocumentStore } from "../stores/documentStore";
import { useScholarshipStore } from "../stores/scholarshipStore";
import { getUserKey } from "../stores/userKey";
const collegeStore = useCollegeStore();
const essayStore = useEssayStore();
const docStore = useDocumentStore();
const scholarshipStore = useScholarshipStore();
const collegeStats = computed(() => {
    const all = collegeStore.colleges;
    return {
        total: all.length,
        reach: all.filter((c) => c.category === "Reach").length,
        target: all.filter((c) => c.category === "Target").length,
        safety: all.filter((c) => c.category === "Safety").length,
    };
});
const essayStats = computed(() => {
    const all = essayStore.essays;
    return {
        total: all.length,
        notStarted: all.filter((e) => e.status === "Not Started").length,
        drafting: all.filter((e) => e.status === "Drafting").length,
        done: all.filter((e) => e.status === "Done").length,
        donePercent: all.length > 0
            ? Math.round((all.filter((e) => e.status === "Done").length /
                all.length) *
                100)
            : 0,
    };
});
const totalFees = computed(() => collegeStore.colleges.reduce((sum, c) => sum + c.applicationFee, 0));
const totalWords = computed(() => essayStore.essays.reduce((sum, e) => sum + e.currentWordCount, 0));
const docsByType = computed(() => {
    const types = {};
    docStore.documents.forEach((d) => {
        types[d.type] = (types[d.type] || 0) + 1;
    });
    return types;
});
const reachWidth = computed(() => collegeStats.value.total > 0
    ? (collegeStats.value.reach / collegeStats.value.total) * 100
    : 0);
const targetWidth = computed(() => collegeStats.value.total > 0
    ? (collegeStats.value.target / collegeStats.value.total) * 100
    : 0);
const safetyWidth = computed(() => collegeStats.value.total > 0
    ? (collegeStats.value.safety / collegeStats.value.total) * 100
    : 0);
const scholarshipStats = computed(() => {
    const all = scholarshipStore.scholarships;
    const byStatus = {};
    all.forEach((s) => {
        byStatus[s.status] = (byStatus[s.status] || 0) + 1;
    });
    return {
        total: all.length,
        won: all.filter((s) => s.status === "Won"),
        wonAmount: all
            .filter((s) => s.status === "Won")
            .reduce((sum, s) => sum + s.awardAmount, 0),
        totalPossible: all.reduce((sum, s) => sum + s.awardAmount, 0),
        submitted: all.filter((s) => s.status === "Submitted").length,
        byStatus,
    };
});
const doneDeg = computed(() => (essayStats.value.donePercent / 100) * 360);
// SAT/ACT Stats
const satActStats = computed(() => {
    try {
        const saved = localStorage.getItem(getUserKey("sat-act"));
        if (!saved)
            return null;
        const data = JSON.parse(saved);
        const satAttempts = (data.attempts || []).filter((a) => a.type === "SAT" && a.superscoreEligible);
        const actAttempts = (data.attempts || []).filter((a) => a.type === "ACT");
        let superscore = null;
        if (satAttempts.length > 0) {
            const bestMath = Math.max(...satAttempts.map((a) => a.sections?.math || 0));
            const bestReading = Math.max(...satAttempts.map((a) => a.sections?.reading || 0));
            superscore = {
                total: bestMath + bestReading,
                math: bestMath,
                reading: bestReading,
            };
        }
        const highestAct = actAttempts.length > 0
            ? Math.max(...actAttempts.map((a) => a.totalScore || 0))
            : null;
        const currentSat = superscore?.total ||
            satAttempts.reduce((max, a) => Math.max(max, a.totalScore || 0), 0) ||
            null;
        return {
            highestSat: currentSat,
            superscore,
            highestAct,
            attempts: (data.attempts || []).length,
            targetSat: data.targetSat || 0,
            targetAct: data.targetAct || 0,
            satGoalPercent: data.targetSat > 0
                ? Math.min(Math.round(((currentSat || 0) / data.targetSat) * 100), 100)
                : 0,
            actGoalPercent: data.targetAct > 0
                ? Math.min(Math.round(((highestAct || 0) / data.targetAct) * 100), 100)
                : 0,
        };
    }
    catch {
        return null;
    }
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['stat-box']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-type-row']} */ ;
/** @type {__VLS_StyleScopedClasses['fact-row']} */ ;
/** @type {__VLS_StyleScopedClasses['fact-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "welcome" },
});
/** @type {__VLS_StyleScopedClasses['welcome']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-row" },
});
/** @type {__VLS_StyleScopedClasses['stat-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-box" },
});
/** @type {__VLS_StyleScopedClasses['stat-box']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-number" },
});
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
(__VLS_ctx.collegeStats.total);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-box" },
});
/** @type {__VLS_StyleScopedClasses['stat-box']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-number" },
});
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
(__VLS_ctx.essayStats.total);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-box" },
});
/** @type {__VLS_StyleScopedClasses['stat-box']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-number" },
});
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
(__VLS_ctx.docStore.documents.length);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-box highlight" },
});
/** @type {__VLS_StyleScopedClasses['stat-box']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-number" },
});
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
(__VLS_ctx.totalFees.toLocaleString());
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-grid" },
});
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel" },
});
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
if (__VLS_ctx.collegeStats.total === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "panel-empty" },
    });
    /** @type {__VLS_StyleScopedClasses['panel-empty']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bar-row" },
    });
    /** @type {__VLS_StyleScopedClasses['bar-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "bar-label" },
    });
    /** @type {__VLS_StyleScopedClasses['bar-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bar-track" },
    });
    /** @type {__VLS_StyleScopedClasses['bar-track']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bar-fill reach" },
        ...{ style: ({ width: __VLS_ctx.reachWidth + '%' }) },
    });
    /** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
    /** @type {__VLS_StyleScopedClasses['reach']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "bar-num" },
    });
    /** @type {__VLS_StyleScopedClasses['bar-num']} */ ;
    (__VLS_ctx.collegeStats.reach);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bar-row" },
    });
    /** @type {__VLS_StyleScopedClasses['bar-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "bar-label" },
    });
    /** @type {__VLS_StyleScopedClasses['bar-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bar-track" },
    });
    /** @type {__VLS_StyleScopedClasses['bar-track']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bar-fill target" },
        ...{ style: ({ width: __VLS_ctx.targetWidth + '%' }) },
    });
    /** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
    /** @type {__VLS_StyleScopedClasses['target']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "bar-num" },
    });
    /** @type {__VLS_StyleScopedClasses['bar-num']} */ ;
    (__VLS_ctx.collegeStats.target);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bar-row" },
    });
    /** @type {__VLS_StyleScopedClasses['bar-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "bar-label" },
    });
    /** @type {__VLS_StyleScopedClasses['bar-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bar-track" },
    });
    /** @type {__VLS_StyleScopedClasses['bar-track']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bar-fill safety" },
        ...{ style: ({ width: __VLS_ctx.safetyWidth + '%' }) },
    });
    /** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
    /** @type {__VLS_StyleScopedClasses['safety']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "bar-num" },
    });
    /** @type {__VLS_StyleScopedClasses['bar-num']} */ ;
    (__VLS_ctx.collegeStats.safety);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel center-panel" },
});
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['center-panel']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
if (__VLS_ctx.essayStats.total === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "panel-empty" },
    });
    /** @type {__VLS_StyleScopedClasses['panel-empty']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ring-container" },
    });
    /** @type {__VLS_StyleScopedClasses['ring-container']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 120 120",
        ...{ class: "ring-svg" },
    });
    /** @type {__VLS_StyleScopedClasses['ring-svg']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "60",
        cy: "60",
        r: "50",
        ...{ class: "ring-bg" },
    });
    /** @type {__VLS_StyleScopedClasses['ring-bg']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "60",
        cy: "60",
        r: "50",
        ...{ class: "ring-fill" },
        ...{ style: ({
                strokeDasharray: (__VLS_ctx.doneDeg * 3.14 * 50) / 180 +
                    ' ' +
                    3.14 * 100,
            }) },
    });
    /** @type {__VLS_StyleScopedClasses['ring-fill']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ring-text" },
    });
    /** @type {__VLS_StyleScopedClasses['ring-text']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ring-percent" },
    });
    /** @type {__VLS_StyleScopedClasses['ring-percent']} */ ;
    (__VLS_ctx.essayStats.donePercent);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "ring-sub" },
    });
    /** @type {__VLS_StyleScopedClasses['ring-sub']} */ ;
    (__VLS_ctx.essayStats.done);
    (__VLS_ctx.essayStats.total);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "essay-legend" },
});
/** @type {__VLS_StyleScopedClasses['essay-legend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "legend-dot not-started" },
});
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['not-started']} */ ;
(__VLS_ctx.essayStats.notStarted);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "legend-dot drafting" },
});
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['drafting']} */ ;
(__VLS_ctx.essayStats.drafting);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "legend-dot done" },
});
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['done']} */ ;
(__VLS_ctx.essayStats.done);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-grid" },
});
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel" },
});
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
if (__VLS_ctx.docStore.documents.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "panel-empty" },
    });
    /** @type {__VLS_StyleScopedClasses['panel-empty']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "doc-type-list" },
    });
    /** @type {__VLS_StyleScopedClasses['doc-type-list']} */ ;
    for (const [count, type] of __VLS_vFor((__VLS_ctx.docsByType))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (type),
            ...{ class: "doc-type-row" },
        });
        /** @type {__VLS_StyleScopedClasses['doc-type-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (type);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "doc-type-count" },
        });
        /** @type {__VLS_StyleScopedClasses['doc-type-count']} */ ;
        (count);
        // @ts-ignore
        [collegeStats, collegeStats, collegeStats, collegeStats, collegeStats, essayStats, essayStats, essayStats, essayStats, essayStats, essayStats, essayStats, essayStats, docStore, docStore, totalFees, reachWidth, targetWidth, safetyWidth, doneDeg, docsByType,];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel" },
});
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "fact-row" },
});
/** @type {__VLS_StyleScopedClasses['fact-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
(__VLS_ctx.totalWords.toLocaleString());
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "fact-row" },
});
/** @type {__VLS_StyleScopedClasses['fact-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
(__VLS_ctx.collegeStats.total);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "fact-row" },
});
/** @type {__VLS_StyleScopedClasses['fact-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
(__VLS_ctx.collegeStats.total > 0
    ? Math.round(__VLS_ctx.totalFees / __VLS_ctx.collegeStats.total).toLocaleString()
    : 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "fact-row" },
});
/** @type {__VLS_StyleScopedClasses['fact-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
(__VLS_ctx.collegeStore.colleges.filter((c) => c.deadline).length);
if (__VLS_ctx.satActStats) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-row" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['stat-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-card" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-num" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-num']} */ ;
    (__VLS_ctx.satActStats.highestSat || "—");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-card" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-num" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-num']} */ ;
    (__VLS_ctx.satActStats.superscore?.total || "—");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-card" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-num" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-num']} */ ;
    (__VLS_ctx.satActStats.highestAct || "—");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-card" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-num" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-num']} */ ;
    (__VLS_ctx.satActStats.attempts);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
    if (__VLS_ctx.satActStats.targetSat > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "stat-card" },
        });
        /** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "stat-num" },
        });
        /** @type {__VLS_StyleScopedClasses['stat-num']} */ ;
        (__VLS_ctx.satActStats.satGoalPercent);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "stat-label" },
        });
        /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
        (__VLS_ctx.satActStats.targetSat);
    }
    if (__VLS_ctx.satActStats.targetAct > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "stat-card" },
        });
        /** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "stat-num" },
        });
        /** @type {__VLS_StyleScopedClasses['stat-num']} */ ;
        (__VLS_ctx.satActStats.actGoalPercent);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "stat-label" },
        });
        /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
        (__VLS_ctx.satActStats.targetAct);
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-row" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['stat-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-num" },
});
/** @type {__VLS_StyleScopedClasses['stat-num']} */ ;
(__VLS_ctx.scholarshipStats.total);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-num green" },
});
/** @type {__VLS_StyleScopedClasses['stat-num']} */ ;
/** @type {__VLS_StyleScopedClasses['green']} */ ;
(__VLS_ctx.scholarshipStats.submitted);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-num gold" },
});
/** @type {__VLS_StyleScopedClasses['stat-num']} */ ;
/** @type {__VLS_StyleScopedClasses['gold']} */ ;
(__VLS_ctx.scholarshipStats.wonAmount >= 1000
    ? (__VLS_ctx.scholarshipStats.wonAmount / 1000).toFixed(0) +
        "k"
    : __VLS_ctx.scholarshipStats.wonAmount);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-num purple" },
});
/** @type {__VLS_StyleScopedClasses['stat-num']} */ ;
/** @type {__VLS_StyleScopedClasses['purple']} */ ;
(__VLS_ctx.scholarshipStats.totalPossible >= 1000
    ? (__VLS_ctx.scholarshipStats.totalPossible / 1000).toFixed(0) + "k"
    : __VLS_ctx.scholarshipStats.totalPossible);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
// @ts-ignore
[collegeStats, collegeStats, collegeStats, totalFees, totalWords, collegeStore, satActStats, satActStats, satActStats, satActStats, satActStats, satActStats, satActStats, satActStats, satActStats, satActStats, satActStats, scholarshipStats, scholarshipStats, scholarshipStats, scholarshipStats, scholarshipStats, scholarshipStats, scholarshipStats, scholarshipStats,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
