import { ref, computed } from "vue";
import { useGoalStore } from "../stores/goalStore";
import { useCollegeStore } from "../stores/collegeStore";
import { useEssayStore } from "../stores/essayStore";
import { useCostStore } from "../stores/costStore";
import { useScholarshipStore } from "../stores/scholarshipStore";
import { getUserKey } from "../stores/userKey";
const goalStore = useGoalStore();
const collegeStore = useCollegeStore();
const essayStore = useEssayStore();
const costStore = useCostStore();
const scholarshipStore = useScholarshipStore();
const showForm = ref(false);
const editingId = ref(null);
const form = ref({
    title: "",
    type: "tuition",
    target: 0,
    unit: "",
    description: "",
});
const goalTypes = [
    { value: "tuition", label: "🎓 Tuition Budget", unit: "$" },
    { value: "budget", label: "💰 Total App Fee Budget", unit: "$" },
    { value: "colleges", label: "🏫 College Applications", unit: "colleges" },
    { value: "essays", label: "✍️ Essays", unit: "essays" },
    { value: "scholarship", label: "🎓 Scholarship Money Won", unit: "$" },
    { value: "sat", label: "📝 SAT Score", unit: "points" },
    { value: "act", label: "📝 ACT Score", unit: "points" },
    { value: "custom", label: "🎯 Custom Goal", unit: "" },
];
const totalFees = computed(() => collegeStore.colleges.reduce((sum, c) => sum + (c.applicationFee || 0), 0));
const totalColleges = computed(() => collegeStore.colleges.length);
const doneEssays = computed(() => essayStore.essays.filter((e) => e.status === "Done").length);
const scholarshipWonAmount = computed(() => scholarshipStore.scholarships
    .filter((s) => s.status === "Won")
    .reduce((sum, s) => sum + s.awardAmount, 0));
const currentSatScore = computed(() => {
    try {
        const saved = localStorage.getItem(getUserKey("sat-act"));
        if (!saved)
            return 0;
        const data = JSON.parse(saved);
        const satAttempts = (data.attempts || []).filter((a) => a.type === "SAT" && a.superscoreEligible);
        if (satAttempts.length === 0)
            return 0;
        const bestMath = Math.max(...satAttempts.map((a) => a.sections?.math || 0));
        const bestReading = Math.max(...satAttempts.map((a) => a.sections?.reading || 0));
        return bestMath + bestReading;
    }
    catch {
        return 0;
    }
});
const currentActScore = computed(() => {
    try {
        const saved = localStorage.getItem(getUserKey("sat-act"));
        if (!saved)
            return 0;
        const data = JSON.parse(saved);
        const actAttempts = (data.attempts || []).filter((a) => a.type === "ACT");
        if (actAttempts.length === 0)
            return 0;
        return Math.max(...actAttempts.map((a) => a.totalScore || 0));
    }
    catch {
        return 0;
    }
});
function getCollegeNetAfterAidAndLoans(cost) {
    const netAfterAid = (cost.stickerTotal || 0) - (cost.grantsScholarships || 0);
    return Math.max(netAfterAid - (cost.federalLoans || 0) - (cost.privateLoans || 0), 0);
}
function getTuitionColleges(goal) {
    if (goal.type !== "tuition")
        return [];
    return costStore.costs.map((c) => {
        const net = getCollegeNetAfterAidAndLoans(c);
        return {
            name: c.collegeName,
            net,
            exceeds: net > goal.target,
            by: Math.max(net - goal.target, 0),
        };
    });
}
function getProgress(goal) {
    let current = 0;
    if (goal.type === "budget")
        current = totalFees.value;
    else if (goal.type === "colleges")
        current = totalColleges.value;
    else if (goal.type === "essays")
        current = doneEssays.value;
    else if (goal.type === "scholarship")
        current = scholarshipWonAmount.value;
    else if (goal.type === "sat")
        current = currentSatScore.value;
    else if (goal.type === "act")
        current = currentActScore.value;
    else if (goal.type === "tuition")
        current = 0; // not used — we show college list instead
    else
        current = 0;
    const percent = goal.target > 0
        ? Math.min(Math.round((current / goal.target) * 100), 100)
        : 0;
    return { current, percent };
}
function progressColor(percent) {
    if (percent >= 100)
        return "#059669";
    if (percent >= 50)
        return "#d97706";
    return "#1e1b4b";
}
function openAddForm() {
    editingId.value = null;
    const type = goalTypes[0];
    form.value = {
        title: type.label,
        type: type.value,
        target: 0,
        unit: type.unit,
        description: "",
    };
    showForm.value = true;
}
function openEditForm(goal) {
    editingId.value = goal.id;
    form.value = { ...goal };
    showForm.value = true;
}
function onTypeChange() {
    const type = goalTypes.find((t) => t.value === form.value.type);
    if (type) {
        form.value.unit = type.unit;
        form.value.title = type.label;
    }
}
function saveGoal() {
    if (!form.value.title.trim()) {
        alert("Please enter a goal title.");
        return;
    }
    if (form.value.target <= 0) {
        alert("Please set a target greater than 0.");
        return;
    }
    const goal = {
        id: editingId.value ?? crypto.randomUUID(),
        title: form.value.title.trim(),
        type: form.value.type,
        target: form.value.target,
        unit: form.value.unit,
        description: form.value.description.trim(),
    };
    if (editingId.value) {
        goalStore.updateGoal(editingId.value, goal);
    }
    else {
        goalStore.addGoal(goal);
    }
    showForm.value = false;
    editingId.value = null;
}
function removeGoal(id) {
    if (confirm("Delete this goal?"))
        goalStore.deleteGoal(id);
}
function fmt(n) {
    return "$" + n.toLocaleString();
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-add']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
/** @type {__VLS_StyleScopedClasses['tuition-row']} */ ;
/** @type {__VLS_StyleScopedClasses['tuition-bad']} */ ;
/** @type {__VLS_StyleScopedClasses['tuition-bad']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.openAddForm) },
    ...{ class: "btn-add" },
});
/** @type {__VLS_StyleScopedClasses['btn-add']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "welcome" },
});
/** @type {__VLS_StyleScopedClasses['welcome']} */ ;
if (__VLS_ctx.showForm) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-card" },
    });
    /** @type {__VLS_StyleScopedClasses['form-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (__VLS_ctx.editingId ? "Edit Goal" : "New Goal");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        ...{ onChange: (__VLS_ctx.onTypeChange) },
        value: (__VLS_ctx.form.type),
    });
    for (const [t] of __VLS_vFor((__VLS_ctx.goalTypes))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (t.value),
            value: (t.value),
        });
        (t.label);
        // @ts-ignore
        [openAddForm, showForm, editingId, onTypeChange, form, goalTypes,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    (__VLS_ctx.form.unit || "number");
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "1",
        placeholder: (__VLS_ctx.form.type === 'tuition' ? 'e.g. 30000' : 'e.g. 5'),
    });
    (__VLS_ctx.form.target);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.form.title),
        type: "text",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.form.description),
        type: "text",
        placeholder: "Why this matters",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.saveGoal) },
        ...{ class: "btn-save" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
    (__VLS_ctx.editingId ? "Update Goal" : "Add Goal");
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showForm))
                    throw 0;
                return __VLS_ctx.showForm = false;
                // @ts-ignore
                [showForm, editingId, form, form, form, form, form, saveGoal,];
            } },
        ...{ class: "btn-cancel" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-cancel']} */ ;
}
if (__VLS_ctx.goalStore.goals.length === 0 && !__VLS_ctx.showForm) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "empty-text" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "goal-list" },
    });
    /** @type {__VLS_StyleScopedClasses['goal-list']} */ ;
    for (const [goal] of __VLS_vFor((__VLS_ctx.goalStore.goals))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (goal.id),
            ...{ class: "goal-card" },
        });
        /** @type {__VLS_StyleScopedClasses['goal-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "goal-info" },
        });
        /** @type {__VLS_StyleScopedClasses['goal-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "goal-title" },
        });
        /** @type {__VLS_StyleScopedClasses['goal-title']} */ ;
        (goal.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "goal-type" },
        });
        /** @type {__VLS_StyleScopedClasses['goal-type']} */ ;
        (goal.type === "tuition"
            ? "🎓"
            : goal.type === "budget"
                ? "💰"
                : goal.type === "colleges"
                    ? "🏫"
                    : goal.type === "essays"
                        ? "✍️"
                        : goal.type === "scholarship"
                            ? "🎓"
                            : goal.type === "sat"
                                ? "📝"
                                : goal.type === "act"
                                    ? "📝"
                                    : "🎯");
        if (goal.description) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "goal-desc" },
            });
            /** @type {__VLS_StyleScopedClasses['goal-desc']} */ ;
            (goal.description);
        }
        if (goal.type === 'tuition') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "tuition-header" },
            });
            /** @type {__VLS_StyleScopedClasses['tuition-header']} */ ;
            (__VLS_ctx.fmt(goal.target));
            if (__VLS_ctx.costStore.costs.length === 0) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "tuition-empty" },
                });
                /** @type {__VLS_StyleScopedClasses['tuition-empty']} */ ;
            }
            for (const [col] of __VLS_vFor((__VLS_ctx.getTuitionColleges(goal)))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (col.name),
                    ...{ class: "tuition-row" },
                });
                /** @type {__VLS_StyleScopedClasses['tuition-row']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "tuition-name" },
                });
                /** @type {__VLS_StyleScopedClasses['tuition-name']} */ ;
                (col.name);
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "tuition-right" },
                });
                /** @type {__VLS_StyleScopedClasses['tuition-right']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "tuition-net" },
                });
                /** @type {__VLS_StyleScopedClasses['tuition-net']} */ ;
                (__VLS_ctx.fmt(col.net));
                if (col.exceeds) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "tuition-bad red" },
                    });
                    /** @type {__VLS_StyleScopedClasses['tuition-bad']} */ ;
                    /** @type {__VLS_StyleScopedClasses['red']} */ ;
                    (__VLS_ctx.fmt(col.by));
                }
                else {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "tuition-bad green" },
                    });
                    /** @type {__VLS_StyleScopedClasses['tuition-bad']} */ ;
                    /** @type {__VLS_StyleScopedClasses['green']} */ ;
                }
                // @ts-ignore
                [showForm, goalStore, goalStore, fmt, fmt, fmt, costStore, getTuitionColleges,];
            }
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "progress-section" },
            });
            /** @type {__VLS_StyleScopedClasses['progress-section']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "progress-bar" },
            });
            /** @type {__VLS_StyleScopedClasses['progress-bar']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "progress-fill" },
                ...{ style: ({
                        width: __VLS_ctx.getProgress(goal).percent + '%',
                        background: __VLS_ctx.progressColor(__VLS_ctx.getProgress(goal).percent),
                    }) },
            });
            /** @type {__VLS_StyleScopedClasses['progress-fill']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "progress-text" },
            });
            /** @type {__VLS_StyleScopedClasses['progress-text']} */ ;
            (__VLS_ctx.getProgress(goal).current.toLocaleString());
            (goal.target.toLocaleString());
            (goal.unit);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "progress-pct" },
            });
            /** @type {__VLS_StyleScopedClasses['progress-pct']} */ ;
            (__VLS_ctx.getProgress(goal).percent);
        }
        if (goal.type !== 'tuition' &&
            __VLS_ctx.getProgress(goal).percent >= 100) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "goal-complete" },
            });
            /** @type {__VLS_StyleScopedClasses['goal-complete']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-actions" },
        });
        /** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.goalStore.goals.length === 0 && !__VLS_ctx.showForm))
                        throw 0;
                    return __VLS_ctx.openEditForm(goal);
                    // @ts-ignore
                    [getProgress, getProgress, getProgress, getProgress, getProgress, progressColor, openEditForm,];
                } },
            ...{ class: "btn-icon edit" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
        /** @type {__VLS_StyleScopedClasses['edit']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.goalStore.goals.length === 0 && !__VLS_ctx.showForm))
                        throw 0;
                    return __VLS_ctx.removeGoal(goal.id);
                    // @ts-ignore
                    [removeGoal,];
                } },
            ...{ class: "btn-icon delete" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
        /** @type {__VLS_StyleScopedClasses['delete']} */ ;
        // @ts-ignore
        [];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
