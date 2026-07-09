import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useCollegeStore } from "../stores/collegeStore";
import { useEssayStore } from "../stores/essayStore";
import { useDocumentStore } from "../stores/documentStore";
import { useUserStore } from "../stores/userStore";
import { useScholarshipStore } from "../stores/scholarshipStore";
import { exportAllData, importAllData } from "../services/dataBackup";
import { showToast } from "../composables/useToast";
const router = useRouter();
const collegeStore = useCollegeStore();
const essayStore = useEssayStore();
const docStore = useDocumentStore();
const userStore = useUserStore();
const scholarshipStore = useScholarshipStore();
const calMonth = ref(new Date().getMonth());
const calYear = ref(new Date().getFullYear());
const collegeStats = computed(() => ({
    total: collegeStore.colleges.length,
    reach: collegeStore.colleges.filter((c) => c.category === "Reach").length,
    target: collegeStore.colleges.filter((c) => c.category === "Target").length,
    safety: collegeStore.colleges.filter((c) => c.category === "Safety").length,
}));
const essayStats = computed(() => {
    const all = essayStore.essays;
    return {
        total: all.length,
        notStarted: all.filter((e) => e.status === "Not Started").length,
        drafting: all.filter((e) => e.status === "Drafting").length,
        done: all.filter((e) => e.status === "Done").length,
    };
});
const totalFees = computed(() => collegeStore.colleges.reduce((s, c) => s + c.applicationFee, 0));
const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];
const deadlinesByDate = computed(() => {
    const map = {};
    collegeStore.colleges.forEach((c) => {
        if (c.deadline) {
            if (!map[c.deadline])
                map[c.deadline] = [];
            map[c.deadline].push(c);
        }
    });
    return map;
});
const scholarshipDeadlinesByDate = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const map = {};
    scholarshipStore.scholarships.forEach((s) => {
        if (!s.deadline)
            return;
        if (new Date(s.deadline + "T00:00:00") < today)
            return;
        // Only "Your Scholarships"
        const isYours = !s.isSample || (s.docLinks.length > 0 || s.essayLinks.length > 0 || s.notes.trim().length > 0 || s.checklist.some((c) => c.status !== "Needed" && c.status !== "Not Needed"));
        if (!isYours)
            return;
        if (!map[s.deadline])
            map[s.deadline] = [];
        map[s.deadline].push(s.name);
    });
    return map;
});
const upcomingDeadlines = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const collegeDeadlines = collegeStore.colleges
        .filter((c) => c.deadline && new Date(c.deadline + "T00:00:00") >= today)
        .map((c) => ({
        name: c.name,
        deadline: c.deadline,
        type: "college",
        category: c.category,
    }));
    const scholarshipDeadlines = scholarshipStore.scholarships
        .filter((s) => {
        if (!s.deadline)
            return false;
        if (new Date(s.deadline + "T00:00:00") < today)
            return false;
        // Only "Your Scholarships": user-created or customized samples
        if (!s.isSample)
            return true;
        return s.docLinks.length > 0 || s.essayLinks.length > 0 || s.notes.trim().length > 0 || s.checklist.some((c) => c.status !== "Needed" && c.status !== "Not Needed");
    })
        .map((s) => ({
        name: s.name,
        deadline: s.deadline,
        type: "scholarship",
    }));
    return [...collegeDeadlines, ...scholarshipDeadlines]
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 10);
});
const calendarDays = computed(() => {
    const firstDay = new Date(calYear.value, calMonth.value, 1).getDay();
    const daysInMonth = new Date(calYear.value, calMonth.value + 1, 0).getDate();
    const today = new Date().toISOString().split("T")[0];
    const days = [];
    for (let i = 0; i < firstDay; i++)
        days.push({ day: 0, date: "", isToday: false, colleges: [], scholarships: [] });
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${calYear.value}-${String(calMonth.value + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        days.push({
            day: d,
            date: dateStr,
            isToday: dateStr === today,
            colleges: deadlinesByDate.value[dateStr] || [],
            scholarships: scholarshipDeadlinesByDate.value[dateStr] || [],
        });
    }
    return days;
});
function prevMonth() {
    if (calMonth.value === 0) {
        calMonth.value = 11;
        calYear.value--;
    }
    else
        calMonth.value--;
}
function nextMonth() {
    if (calMonth.value === 11) {
        calMonth.value = 0;
        calYear.value++;
    }
    else
        calMonth.value++;
}
function appTypeLabel(type) {
    if (type === "ED")
        return "ED";
    if (type === "EA")
        return "EA";
    if (type === "RD")
        return "RD";
    return "";
}
function appTypeClass(type) {
    if (type === "ED")
        return "type-ed";
    if (type === "EA")
        return "type-ea";
    return "type-rd";
}
function navigateTo(path) {
    router.push(path);
}
const backupInput = ref(null);
function handleExport() {
    exportAllData();
    showToast("✅ Backup downloaded");
}
function handleImportClick() {
    backupInput.value?.click();
}
async function handleImport(event) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file)
        return;
    try {
        const count = await importAllData(file);
        showToast(`✅ Restored ${count} data keys — refresh to see changes`);
        setTimeout(() => location.reload(), 1500);
    }
    catch (e) {
        showToast(`❌ Import failed: ${e.message}`);
    }
    input.value = "";
}
void backupInput;
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-day']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-day']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-num']} */ ;
/** @type {__VLS_StyleScopedClasses['today']} */ ;
/** @type {__VLS_StyleScopedClasses['upcoming-row']} */ ;
/** @type {__VLS_StyleScopedClasses['upcoming-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-type']} */ ;
/** @type {__VLS_StyleScopedClasses['category-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['reach']} */ ;
/** @type {__VLS_StyleScopedClasses['category-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['target']} */ ;
/** @type {__VLS_StyleScopedClasses['category-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['safety']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "welcome" },
});
/** @type {__VLS_StyleScopedClasses['welcome']} */ ;
(__VLS_ctx.userStore.username);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "summary-grid" },
});
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "summary-card" },
});
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-header" },
});
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-big-number" },
});
/** @type {__VLS_StyleScopedClasses['card-big-number']} */ ;
(__VLS_ctx.collegeStats.total);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-detail" },
});
/** @type {__VLS_StyleScopedClasses['card-detail']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "dot reach" },
});
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['reach']} */ ;
(__VLS_ctx.collegeStats.reach);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "dot target" },
});
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['target']} */ ;
(__VLS_ctx.collegeStats.target);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "dot safety" },
});
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['safety']} */ ;
(__VLS_ctx.collegeStats.safety);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-fee" },
});
/** @type {__VLS_StyleScopedClasses['card-fee']} */ ;
(__VLS_ctx.totalFees.toLocaleString());
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "summary-card" },
});
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-header" },
});
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-big-number" },
});
/** @type {__VLS_StyleScopedClasses['card-big-number']} */ ;
(__VLS_ctx.essayStats.total);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-detail" },
});
/** @type {__VLS_StyleScopedClasses['card-detail']} */ ;
(__VLS_ctx.essayStats.notStarted);
(__VLS_ctx.essayStats.drafting);
(__VLS_ctx.essayStats.done);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "quick-actions" },
});
/** @type {__VLS_StyleScopedClasses['quick-actions']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return __VLS_ctx.navigateTo('/colleges');
            // @ts-ignore
            [userStore, collegeStats, collegeStats, collegeStats, collegeStats, totalFees, essayStats, essayStats, essayStats, essayStats, navigateTo,];
        } },
    ...{ class: "quick-btn" },
});
/** @type {__VLS_StyleScopedClasses['quick-btn']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return __VLS_ctx.navigateTo('/essays');
            // @ts-ignore
            [navigateTo,];
        } },
    ...{ class: "quick-btn" },
});
/** @type {__VLS_StyleScopedClasses['quick-btn']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dash-grid" },
});
/** @type {__VLS_StyleScopedClasses['dash-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel cal-panel" },
});
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-panel']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "cal-header" },
});
/** @type {__VLS_StyleScopedClasses['cal-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.prevMonth) },
    ...{ class: "cal-nav" },
});
/** @type {__VLS_StyleScopedClasses['cal-nav']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
(__VLS_ctx.monthNames[__VLS_ctx.calMonth]);
(__VLS_ctx.calYear);
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.nextMonth) },
    ...{ class: "cal-nav" },
});
/** @type {__VLS_StyleScopedClasses['cal-nav']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "cal-grid" },
});
/** @type {__VLS_StyleScopedClasses['cal-grid']} */ ;
for (const [d] of __VLS_vFor(([
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
]))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (d),
        ...{ class: "cal-day-header" },
    });
    /** @type {__VLS_StyleScopedClasses['cal-day-header']} */ ;
    (d);
    // @ts-ignore
    [prevMonth, monthNames, calMonth, calYear, nextMonth,];
}
for (const [d, i] of __VLS_vFor((__VLS_ctx.calendarDays))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (i),
        ...{ class: "cal-day" },
        ...{ class: ({ empty: d.day === 0, today: d.isToday }) },
    });
    /** @type {__VLS_StyleScopedClasses['cal-day']} */ ;
    /** @type {__VLS_StyleScopedClasses['empty']} */ ;
    /** @type {__VLS_StyleScopedClasses['today']} */ ;
    if (d.day > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "cal-content" },
        });
        /** @type {__VLS_StyleScopedClasses['cal-content']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "cal-num" },
            ...{ class: ({ today: d.isToday }) },
        });
        /** @type {__VLS_StyleScopedClasses['cal-num']} */ ;
        /** @type {__VLS_StyleScopedClasses['today']} */ ;
        (d.day);
        for (const [college] of __VLS_vFor((d.colleges))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (college.id),
                ...{ class: "cal-deadline" },
            });
            /** @type {__VLS_StyleScopedClasses['cal-deadline']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "cal-college-name" },
            });
            /** @type {__VLS_StyleScopedClasses['cal-college-name']} */ ;
            (college.name);
            if (college.applicationType) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "cal-type" },
                    ...{ class: (__VLS_ctx.appTypeClass(college.applicationType)) },
                });
                /** @type {__VLS_StyleScopedClasses['cal-type']} */ ;
                (__VLS_ctx.appTypeLabel(college.applicationType));
            }
            // @ts-ignore
            [calendarDays, appTypeClass, appTypeLabel,];
        }
        for (const [scholarship] of __VLS_vFor((d.scholarships))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (scholarship),
                ...{ class: "cal-deadline cal-scholarship" },
            });
            /** @type {__VLS_StyleScopedClasses['cal-deadline']} */ ;
            /** @type {__VLS_StyleScopedClasses['cal-scholarship']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "cal-college-name" },
            });
            /** @type {__VLS_StyleScopedClasses['cal-college-name']} */ ;
            (scholarship);
            // @ts-ignore
            [];
        }
    }
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel" },
});
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
if (__VLS_ctx.upcomingDeadlines.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "panel-empty" },
    });
    /** @type {__VLS_StyleScopedClasses['panel-empty']} */ ;
}
for (const [d] of __VLS_vFor((__VLS_ctx.upcomingDeadlines))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (d.name + d.deadline),
        ...{ class: "upcoming-row" },
    });
    /** @type {__VLS_StyleScopedClasses['upcoming-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "upcoming-info" },
    });
    /** @type {__VLS_StyleScopedClasses['upcoming-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "upcoming-name" },
    });
    /** @type {__VLS_StyleScopedClasses['upcoming-name']} */ ;
    (d.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "upcoming-meta" },
    });
    /** @type {__VLS_StyleScopedClasses['upcoming-meta']} */ ;
    (d.deadline);
    if (d.type === 'college') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "cal-type" },
            ...{ class: (d.category?.toLowerCase()) },
        });
        /** @type {__VLS_StyleScopedClasses['cal-type']} */ ;
        (d.category);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "cal-type" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['cal-type']} */ ;
    }
    // @ts-ignore
    [upcomingDeadlines, upcomingDeadlines,];
}
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
for (const [doc] of __VLS_vFor(([...__VLS_ctx.docStore.documents]
    .sort((a, b) => new Date(b.dateAdded).getTime() -
    new Date(a.dateAdded).getTime())
    .slice(0, 3)))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (doc.id),
        ...{ class: "doc-row" },
    });
    /** @type {__VLS_StyleScopedClasses['doc-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (doc.fileName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "doc-date" },
    });
    /** @type {__VLS_StyleScopedClasses['doc-date']} */ ;
    (new Date(doc.dateAdded).toLocaleDateString());
    // @ts-ignore
    [docStore, docStore,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ style: {} },
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ style: {} },
});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.handleExport) },
    ...{ class: "quick-btn" },
});
/** @type {__VLS_StyleScopedClasses['quick-btn']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.handleImportClick) },
    ...{ class: "quick-btn" },
});
/** @type {__VLS_StyleScopedClasses['quick-btn']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onChange: (__VLS_ctx.handleImport) },
    ref: "backupInput",
    type: "file",
    accept: ".json",
    ...{ style: {} },
});
// @ts-ignore
[handleExport, handleImportClick, handleImport,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
