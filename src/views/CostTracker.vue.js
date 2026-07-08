import { ref, computed } from "vue";
import { useCostStore } from "../stores/costStore";
import { useCollegeStore } from "../stores/collegeStore";
import { useScholarshipStore } from "../stores/scholarshipStore";
const costStore = useCostStore();
const collegeStore = useCollegeStore();
const scholarshipStore = useScholarshipStore();
const API_KEY = "zKyFKBrMRzC6NIuouJuFSY7geWfgiR6A010MUaJO";
const showForm = ref(false);
const editingId = ref(null);
const fetching = ref(false);
const form = ref({
    collegeId: "",
    collegeName: "",
    stickerTuition: 0,
    stickerRoom: 0,
    grantsScholarships: 0,
    familyContribution: 0,
    federalLoans: 0,
    privateLoans: 0,
    loanRate: 4.5,
    notes: "",
});
const computedFields = computed(() => ({
    stickerTotal: (form.value.stickerTuition || 0) + (form.value.stickerRoom || 0),
    netCost: (form.value.stickerTuition || 0) +
        (form.value.stickerRoom || 0) -
        (form.value.grantsScholarships || 0),
    gap: (form.value.stickerTuition || 0) +
        (form.value.stickerRoom || 0) -
        (form.value.grantsScholarships || 0) -
        (form.value.familyContribution || 0),
}));
const totalSummary = computed(() => {
    return costStore.costs.reduce((acc, c) => ({
        sticker: acc.sticker + (c.stickerTotal || 0),
        aid: acc.aid + (c.grantsScholarships || 0),
        net: acc.net + (c.netCost || 0),
        gap: acc.gap + (c.gap || 0),
        loans: acc.loans + (c.federalLoans || 0) + (c.privateLoans || 0),
    }), { sticker: 0, aid: 0, net: 0, gap: 0, loans: 0 });
});
function fmt(n) {
    return "$" + (n || 0).toLocaleString();
}
const scholarshipWon = computed(() => {
    return scholarshipStore.scholarships
        .filter((s) => s.status === "Won")
        .reduce((sum, s) => sum + s.awardAmount, 0);
});
async function onCollegeChange() {
    const college = collegeStore.colleges.find((c) => c.id === form.value.collegeId);
    form.value.collegeName = college?.name ?? "";
    if (!college)
        return;
    fetching.value = true;
    try {
        const params = new URLSearchParams({
            api_key: API_KEY,
            "school.name": college.name,
            fields: "id,school.name,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,latest.cost.roomboard.oncampus",
            per_page: "1",
        });
        const res = await fetch(`https://api.data.gov/ed/collegescorecard/v1/schools?${params}`);
        const data = await res.json();
        if (data.results?.length) {
            const s = data.results[0];
            form.value.stickerTuition =
                s["latest.cost.tuition.in_state"] ||
                    s["latest.cost.tuition.out_of_state"] ||
                    0;
            form.value.stickerRoom = s["latest.cost.roomboard.oncampus"] || 0;
        }
    }
    catch {
        /* silent */
    }
    fetching.value = false;
}
function openAddForm() {
    editingId.value = null;
    form.value = {
        collegeId: "",
        collegeName: "",
        stickerTuition: 0,
        stickerRoom: 0,
        grantsScholarships: 0,
        familyContribution: 0,
        federalLoans: 0,
        privateLoans: 0,
        loanRate: 4.5,
        notes: "",
    };
    showForm.value = true;
}
function openEditForm(cost) {
    editingId.value = cost.id;
    form.value = { ...cost };
    showForm.value = true;
}
function saveCost() {
    if (!form.value.collegeId) {
        alert("Select a college.");
        return;
    }
    const data = {
        id: editingId.value ?? crypto.randomUUID(),
        collegeId: form.value.collegeId,
        collegeName: form.value.collegeName,
        stickerTuition: form.value.stickerTuition,
        stickerRoom: form.value.stickerRoom,
        stickerFees: 0,
        stickerTotal: computedFields.value.stickerTotal,
        grantsScholarships: form.value.grantsScholarships,
        netCost: computedFields.value.netCost,
        familyContribution: form.value.familyContribution,
        gap: computedFields.value.gap,
        federalLoans: form.value.federalLoans,
        privateLoans: form.value.privateLoans,
        loanRate: form.value.loanRate,
        notes: form.value.notes.trim(),
    };
    if (editingId.value) {
        costStore.updateCost(editingId.value, data);
    }
    else {
        costStore.addCost(data);
    }
    showForm.value = false;
    editingId.value = null;
}
function removeCost(id) {
    if (confirm("Delete this cost entry?"))
        costStore.deleteCost(id);
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['sum-num']} */ ;
/** @type {__VLS_StyleScopedClasses['sum-num']} */ ;
/** @type {__VLS_StyleScopedClasses['cost-card']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-del']} */ ;
/** @type {__VLS_StyleScopedClasses['cd-val']} */ ;
/** @type {__VLS_StyleScopedClasses['cd-val']} */ ;
/** @type {__VLS_StyleScopedClasses['green']} */ ;
/** @type {__VLS_StyleScopedClasses['cd-val']} */ ;
/** @type {__VLS_StyleScopedClasses['orange']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['calc-row']} */ ;
/** @type {__VLS_StyleScopedClasses['calc-row']} */ ;
/** @type {__VLS_StyleScopedClasses['green']} */ ;
/** @type {__VLS_StyleScopedClasses['calc-row']} */ ;
/** @type {__VLS_StyleScopedClasses['orange']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "welcome" },
});
/** @type {__VLS_StyleScopedClasses['welcome']} */ ;
if (__VLS_ctx.costStore.costs.length > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "summary-row" },
    });
    /** @type {__VLS_StyleScopedClasses['summary-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sum-box" },
    });
    /** @type {__VLS_StyleScopedClasses['sum-box']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sum-num green" },
    });
    /** @type {__VLS_StyleScopedClasses['sum-num']} */ ;
    /** @type {__VLS_StyleScopedClasses['green']} */ ;
    (__VLS_ctx.fmt(__VLS_ctx.totalSummary.aid));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sum-label" },
    });
    /** @type {__VLS_StyleScopedClasses['sum-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sum-box" },
    });
    /** @type {__VLS_StyleScopedClasses['sum-box']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sum-num" },
    });
    /** @type {__VLS_StyleScopedClasses['sum-num']} */ ;
    (__VLS_ctx.fmt(__VLS_ctx.totalSummary.loans));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sum-label" },
    });
    /** @type {__VLS_StyleScopedClasses['sum-label']} */ ;
}
if (__VLS_ctx.scholarshipWon > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "summary-row" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['summary-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sum-box" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['sum-box']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sum-num green" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['sum-num']} */ ;
    /** @type {__VLS_StyleScopedClasses['green']} */ ;
    (__VLS_ctx.fmt(__VLS_ctx.scholarshipWon));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sum-label" },
    });
    /** @type {__VLS_StyleScopedClasses['sum-label']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.openAddForm) },
    ...{ class: "btn-add" },
});
/** @type {__VLS_StyleScopedClasses['btn-add']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "cost-grid" },
});
/** @type {__VLS_StyleScopedClasses['cost-grid']} */ ;
for (const [cost] of __VLS_vFor((__VLS_ctx.costStore.costs))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                return __VLS_ctx.openEditForm(cost);
                // @ts-ignore
                [costStore, costStore, fmt, fmt, fmt, totalSummary, totalSummary, scholarshipWon, scholarshipWon, openAddForm, openEditForm,];
            } },
        key: (cost.id),
        ...{ class: "cost-card" },
    });
    /** @type {__VLS_StyleScopedClasses['cost-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cost-top" },
    });
    /** @type {__VLS_StyleScopedClasses['cost-top']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "cost-college" },
    });
    /** @type {__VLS_StyleScopedClasses['cost-college']} */ ;
    (cost.collegeName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                return __VLS_ctx.removeCost(cost.id);
                // @ts-ignore
                [removeCost,];
            } },
        ...{ class: "mini-del" },
    });
    /** @type {__VLS_StyleScopedClasses['mini-del']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cost-detail" },
    });
    /** @type {__VLS_StyleScopedClasses['cost-detail']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cd-row" },
    });
    /** @type {__VLS_StyleScopedClasses['cd-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "cd-val" },
    });
    /** @type {__VLS_StyleScopedClasses['cd-val']} */ ;
    (__VLS_ctx.fmt(cost.stickerTotal));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cd-row" },
    });
    /** @type {__VLS_StyleScopedClasses['cd-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "cd-val green" },
    });
    /** @type {__VLS_StyleScopedClasses['cd-val']} */ ;
    /** @type {__VLS_StyleScopedClasses['green']} */ ;
    (__VLS_ctx.fmt(cost.grantsScholarships));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cd-row" },
    });
    /** @type {__VLS_StyleScopedClasses['cd-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "cd-val bold" },
    });
    /** @type {__VLS_StyleScopedClasses['cd-val']} */ ;
    /** @type {__VLS_StyleScopedClasses['bold']} */ ;
    (__VLS_ctx.fmt(cost.netCost));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cd-row" },
    });
    /** @type {__VLS_StyleScopedClasses['cd-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "cd-val" },
    });
    /** @type {__VLS_StyleScopedClasses['cd-val']} */ ;
    (__VLS_ctx.fmt(cost.familyContribution));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cd-row" },
    });
    /** @type {__VLS_StyleScopedClasses['cd-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "cd-val orange bold" },
    });
    /** @type {__VLS_StyleScopedClasses['cd-val']} */ ;
    /** @type {__VLS_StyleScopedClasses['orange']} */ ;
    /** @type {__VLS_StyleScopedClasses['bold']} */ ;
    (__VLS_ctx.fmt(cost.gap));
    if (cost.federalLoans || cost.privateLoans) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "cd-row" },
        });
        /** @type {__VLS_StyleScopedClasses['cd-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "cd-val" },
        });
        /** @type {__VLS_StyleScopedClasses['cd-val']} */ ;
        (__VLS_ctx.fmt(cost.federalLoans + cost.privateLoans));
        (cost.loanRate);
    }
    // @ts-ignore
    [fmt, fmt, fmt, fmt, fmt, fmt,];
}
if (__VLS_ctx.costStore.costs.length === 0 && !__VLS_ctx.showForm) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "empty-text" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
}
if (__VLS_ctx.showForm) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-card" },
    });
    /** @type {__VLS_StyleScopedClasses['form-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (__VLS_ctx.editingId ? "Edit" : "Add");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field full" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    /** @type {__VLS_StyleScopedClasses['full']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        ...{ onChange: (__VLS_ctx.onCollegeChange) },
        value: (__VLS_ctx.form.collegeId),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "",
    });
    for (const [c] of __VLS_vFor((__VLS_ctx.collegeStore.colleges))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (c.id),
            value: (c.id),
        });
        (c.name);
        // @ts-ignore
        [costStore, showForm, showForm, editingId, onCollegeChange, form, collegeStore,];
    }
    if (__VLS_ctx.fetching) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "fetching" },
        });
        /** @type {__VLS_StyleScopedClasses['fetching']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "field-hint" },
    });
    /** @type {__VLS_StyleScopedClasses['field-hint']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "0",
    });
    (__VLS_ctx.form.stickerTuition);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "field-hint" },
    });
    /** @type {__VLS_StyleScopedClasses['field-hint']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "0",
    });
    (__VLS_ctx.form.stickerRoom);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "0",
    });
    (__VLS_ctx.form.grantsScholarships);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "0",
    });
    (__VLS_ctx.form.familyContribution);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "0",
    });
    (__VLS_ctx.form.federalLoans);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "0",
    });
    (__VLS_ctx.form.privateLoans);
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
    (__VLS_ctx.form.loanRate);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field full" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    /** @type {__VLS_StyleScopedClasses['full']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.form.notes),
        rows: "2",
        placeholder: "Any notes about financial aid...",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "calc-box" },
    });
    /** @type {__VLS_StyleScopedClasses['calc-box']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "calc-row" },
    });
    /** @type {__VLS_StyleScopedClasses['calc-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.fmt(__VLS_ctx.computedFields.stickerTotal));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "calc-row" },
    });
    /** @type {__VLS_StyleScopedClasses['calc-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "green" },
    });
    /** @type {__VLS_StyleScopedClasses['green']} */ ;
    (__VLS_ctx.fmt(__VLS_ctx.computedFields.netCost));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "calc-row" },
    });
    /** @type {__VLS_StyleScopedClasses['calc-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "orange" },
    });
    /** @type {__VLS_StyleScopedClasses['orange']} */ ;
    (__VLS_ctx.fmt(__VLS_ctx.computedFields.gap));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.saveCost) },
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
                [fmt, fmt, fmt, showForm, editingId, form, form, form, form, form, form, form, form, fetching, computedFields, computedFields, computedFields, saveCost,];
            } },
        ...{ class: "btn-cancel" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-cancel']} */ ;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
