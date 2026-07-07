import { ref, computed, watch } from "vue";
import { useCollegeStore } from "../stores/collegeStore";
const store = useCollegeStore();
const showForm = ref(false);
const editingId = ref(null);
const searchQuery = ref("");
const activeFilter = ref("All");
const selectedCollege = ref(null);
const showDatabase = ref(false);
const dbSearch = ref("");
const dbResults = ref([]);
const dbLoading = ref(false);
const dbError = ref("");
const API_KEY = "zKyFKBrMRzC6NIuouJuFSY7geWfgiR6A010MUaJO";
const form = ref({
    name: "",
    category: "Target",
    deadline: "",
    applicationType: "",
    applicationFee: 0,
    notes: "",
});
const filteredColleges = computed(() => {
    let list = store.colleges;
    if (activeFilter.value !== "All")
        list = list.filter((c) => c.category === activeFilter.value);
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list;
});
async function searchColleges() {
    if (!dbSearch.value.trim()) {
        dbResults.value = [];
        return;
    }
    dbLoading.value = true;
    try {
        const params = new URLSearchParams({
            api_key: API_KEY,
            "school.name": dbSearch.value,
            fields: "id,school.name,school.city,school.state,school.school_url,latest.admissions.admission_rate.overall,latest.admissions.sat_scores.average.overall,latest.cost.tuition.in_state,latest.student.size",
            per_page: "20",
            sort: "school.name",
        });
        const res = await fetch(`https://api.data.gov/ed/collegescorecard/v1/schools?${params}`);
        const data = await res.json();
        dbResults.value = data.results || [];
    }
    catch {
        dbError.value = "Connection failed.";
    }
    dbLoading.value = false;
}
let timer;
watch(dbSearch, () => {
    clearTimeout(timer);
    timer = setTimeout(searchColleges, 300);
});
const filters = ["All", "Reach", "Target", "Safety"];
function openAddForm() {
    editingId.value = null;
    form.value = {
        name: "",
        category: "Target",
        deadline: "",
        applicationType: "",
        applicationFee: 0,
        notes: "",
    };
    showForm.value = true;
}
function openEditForm(college) {
    editingId.value = college.id;
    form.value = {
        name: college.name,
        category: college.category,
        deadline: college.deadline,
        applicationType: college.applicationType,
        applicationFee: college.applicationFee,
        notes: college.notes,
    };
    showForm.value = true;
}
function saveCollege() {
    if (!form.value.name.trim())
        return;
    if (!editingId.value) {
        const dup = store.colleges.find((c) => c.name.toLowerCase() === form.value.name.trim().toLowerCase());
        if (dup) {
            alert(`"${form.value.name.trim()}" is already in your list!`);
            return;
        }
    }
    const college = {
        id: editingId.value ?? crypto.randomUUID(),
        name: form.value.name.trim(),
        category: form.value.category,
        deadline: form.value.deadline,
        applicationType: form.value.applicationType,
        applicationFee: form.value.applicationFee,
        notes: form.value.notes.trim(),
    };
    if (editingId.value) {
        store.updateCollege(editingId.value, college);
    }
    else {
        store.addCollege(college);
    }
    showForm.value = false;
    editingId.value = null;
}
function removeCollege(id) {
    if (confirm("Are you sure you want to delete this college?"))
        store.deleteCollege(id);
}
function importCollege(college) {
    const name = college["school.name"];
    const dup = store.colleges.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (dup) {
        alert(`"${name}" is already in your list!`);
        showDatabase.value = false;
        return;
    }
    const city = college["school.city"];
    const state = college["school.state"];
    const accRate = college["latest.admissions.admission_rate.overall"];
    const satAvg = college["latest.admissions.sat_scores.average.overall"];
    const details = [];
    if (city && state)
        details.push(`${city}, ${state}`);
    if (accRate)
        details.push(`Accept: ${(accRate * 100).toFixed(1)}%`);
    if (satAvg)
        details.push(`SAT: ${satAvg}`);
    showDatabase.value = false;
    form.value = {
        name,
        category: accRate < 0.15 ? "Reach" : accRate < 0.4 ? "Target" : "Safety",
        deadline: "",
        applicationType: "",
        applicationFee: 0,
        notes: details.join(" · "),
    };
    showForm.value = true;
}
function openView(college) {
    selectedCollege.value = college;
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-db']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-manual']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-cancel']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['category-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['category-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['category-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-view']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['db-header']} */ ;
/** @type {__VLS_StyleScopedClasses['db-search']} */ ;
/** @type {__VLS_StyleScopedClasses['db-row']} */ ;
/** @type {__VLS_StyleScopedClasses['db-add']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header-buttons" },
});
/** @type {__VLS_StyleScopedClasses['header-buttons']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return __VLS_ctx.showDatabase = !__VLS_ctx.showDatabase;
            // @ts-ignore
            [showDatabase, showDatabase,];
        } },
    ...{ class: "btn-db" },
});
/** @type {__VLS_StyleScopedClasses['btn-db']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.openAddForm) },
    ...{ class: "btn-manual" },
});
/** @type {__VLS_StyleScopedClasses['btn-manual']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "toolbar" },
});
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    value: (__VLS_ctx.searchQuery),
    type: "text",
    placeholder: "🔍 Search colleges...",
    ...{ class: "search-input" },
});
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "filters" },
});
/** @type {__VLS_StyleScopedClasses['filters']} */ ;
for (const [f] of __VLS_vFor((__VLS_ctx.filters))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                return __VLS_ctx.activeFilter = f;
                // @ts-ignore
                [openAddForm, searchQuery, filters, activeFilter,];
            } },
        key: (f),
        ...{ class: "filter-btn" },
        ...{ class: ({ active: __VLS_ctx.activeFilter === f }) },
    });
    /** @type {__VLS_StyleScopedClasses['filter-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    (f);
    // @ts-ignore
    [activeFilter,];
}
if (__VLS_ctx.showForm) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-card" },
    });
    /** @type {__VLS_StyleScopedClasses['form-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (__VLS_ctx.editingId ? "Edit College" : "Add a College");
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
        value: (__VLS_ctx.form.name),
        type: "text",
        placeholder: "e.g. Harvard University",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.form.category),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "Reach",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "Target",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "Safety",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.form.applicationType),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "ED",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "EA",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "RD",
    });
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "0",
    });
    (__VLS_ctx.form.applicationFee);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.form.notes),
        rows: "2",
        placeholder: "Early action, rolling admissions, etc.",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.saveCollege) },
        ...{ class: "btn-save" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
    (__VLS_ctx.editingId ? "Update College" : "Save College");
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showForm))
                    throw 0;
                return __VLS_ctx.showForm = false;
                // @ts-ignore
                [showForm, showForm, editingId, editingId, form, form, form, form, form, form, saveCollege,];
            } },
        ...{ class: "btn-cancel" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-cancel']} */ ;
}
if (__VLS_ctx.showDatabase) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "db-modal" },
    });
    /** @type {__VLS_StyleScopedClasses['db-modal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "db-header" },
    });
    /** @type {__VLS_StyleScopedClasses['db-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showDatabase))
                    throw 0;
                return __VLS_ctx.showDatabase = false;
                // @ts-ignore
                [showDatabase, showDatabase,];
            } },
        ...{ class: "btn-close" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.dbSearch),
        type: "text",
        placeholder: "Type a college name...",
        ...{ class: "db-search" },
        autofocus: true,
    });
    /** @type {__VLS_StyleScopedClasses['db-search']} */ ;
    if (__VLS_ctx.dbLoading) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "db-loading" },
        });
        /** @type {__VLS_StyleScopedClasses['db-loading']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "db-results" },
    });
    /** @type {__VLS_StyleScopedClasses['db-results']} */ ;
    for (const [college] of __VLS_vFor((__VLS_ctx.dbResults))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showDatabase))
                        throw 0;
                    return __VLS_ctx.importCollege(college);
                    // @ts-ignore
                    [dbSearch, dbLoading, dbResults, importCollege,];
                } },
            key: (college.id),
            ...{ class: "db-row" },
        });
        /** @type {__VLS_StyleScopedClasses['db-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "db-info" },
        });
        /** @type {__VLS_StyleScopedClasses['db-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "db-name" },
        });
        /** @type {__VLS_StyleScopedClasses['db-name']} */ ;
        (college["school.name"]);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "db-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['db-meta']} */ ;
        (college["school.city"]);
        (college["school.state"]);
        (((college["latest.admissions.admission_rate.overall"] || 0) * 100).toFixed(0));
        (college["latest.admissions.sat_scores.average.overall"] || "—");
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ class: "db-add" },
        });
        /** @type {__VLS_StyleScopedClasses['db-add']} */ ;
        // @ts-ignore
        [];
    }
    if (__VLS_ctx.dbResults.length === 0 && __VLS_ctx.dbSearch && !__VLS_ctx.dbLoading) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "empty-text" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
        (__VLS_ctx.dbSearch);
    }
    if (__VLS_ctx.dbSearch === '') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "hint-text" },
        });
        /** @type {__VLS_StyleScopedClasses['hint-text']} */ ;
    }
}
if (__VLS_ctx.filteredColleges.length === 0 && !__VLS_ctx.showForm) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "empty-text" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "college-list" },
    });
    /** @type {__VLS_StyleScopedClasses['college-list']} */ ;
    for (const [college] of __VLS_vFor((__VLS_ctx.filteredColleges))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (college.id),
            ...{ class: "college-card" },
        });
        /** @type {__VLS_StyleScopedClasses['college-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "college-info" },
        });
        /** @type {__VLS_StyleScopedClasses['college-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "college-name" },
        });
        /** @type {__VLS_StyleScopedClasses['college-name']} */ ;
        (college.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "college-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['college-meta']} */ ;
        if (college.deadline) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (college.deadline);
        }
        if (college.applicationType) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "app-type" },
            });
            /** @type {__VLS_StyleScopedClasses['app-type']} */ ;
            (college.applicationType === "ED"
                ? "Early Decision"
                : college.applicationType === "EA"
                    ? "Early Action"
                    : "Regular Decision");
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "category-badge" },
            ...{ class: (college.category.toLowerCase()) },
        });
        /** @type {__VLS_StyleScopedClasses['category-badge']} */ ;
        (college.category);
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.filteredColleges.length === 0 && !__VLS_ctx.showForm))
                        throw 0;
                    return __VLS_ctx.openView(college);
                    // @ts-ignore
                    [showForm, dbSearch, dbSearch, dbSearch, dbLoading, dbResults, filteredColleges, filteredColleges, openView,];
                } },
            ...{ class: "btn-view" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-view']} */ ;
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.selectedCollege) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.selectedCollege))
                    throw 0;
                return __VLS_ctx.selectedCollege = null;
                // @ts-ignore
                [selectedCollege, selectedCollege,];
            } },
        ...{ class: "detail-overlay" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-overlay']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: () => { } },
        ...{ class: "detail-modal" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-modal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-header" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (__VLS_ctx.selectedCollege.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.selectedCollege))
                    throw 0;
                return __VLS_ctx.selectedCollege = null;
                // @ts-ignore
                [selectedCollege, selectedCollege,];
            } },
        ...{ class: "btn-close" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-body" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-body']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-row" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "detail-label" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "category-badge" },
        ...{ class: (__VLS_ctx.selectedCollege.category.toLowerCase()) },
    });
    /** @type {__VLS_StyleScopedClasses['category-badge']} */ ;
    (__VLS_ctx.selectedCollege.category);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-row" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "detail-label" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "detail-value" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
    (__VLS_ctx.selectedCollege.applicationType === "ED"
        ? "Early Decision"
        : __VLS_ctx.selectedCollege.applicationType === "EA"
            ? "Early Action"
            : __VLS_ctx.selectedCollege.applicationType === "RD"
                ? "Regular Decision"
                : "—");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-row" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "detail-label" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "detail-value" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
    (__VLS_ctx.selectedCollege.deadline || "Not set");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-row" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "detail-label" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "detail-value" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
    (__VLS_ctx.selectedCollege.applicationFee || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-row" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "detail-label" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "detail-value" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
    (__VLS_ctx.selectedCollege.notes || "—");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.selectedCollege))
                    throw 0;
                __VLS_ctx.openEditForm(__VLS_ctx.selectedCollege);
                __VLS_ctx.selectedCollege = null;
                ;
                // @ts-ignore
                [selectedCollege, selectedCollege, selectedCollege, selectedCollege, selectedCollege, selectedCollege, selectedCollege, selectedCollege, selectedCollege, selectedCollege, openEditForm,];
            } },
        ...{ class: "btn-icon edit" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['edit']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.selectedCollege))
                    throw 0;
                __VLS_ctx.removeCollege(__VLS_ctx.selectedCollege.id);
                __VLS_ctx.selectedCollege = null;
                ;
                // @ts-ignore
                [selectedCollege, selectedCollege, removeCollege,];
            } },
        ...{ class: "btn-icon delete" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['delete']} */ ;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
