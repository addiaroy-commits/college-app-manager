import { ref, computed } from "vue";
import { getAllMajors, majorCategories, useMajorStore, } from "../stores/majorStore";
import { getUserKey } from "../stores/userKey";
const store = useMajorStore();
const STORAGE_KEY = getUserKey("top-picks");
function loadPicks() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    }
    catch {
        return [];
    }
}
function savePicks(picks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
    // Also update store
    store.topPicks.splice(0, store.topPicks.length, ...picks);
}
const searchQuery = ref("");
const activeCategory = ref("All");
const showForm = ref(false);
const editId = ref(null);
const majorSearch = ref("");
const showCustomMajorForm = ref(false);
const customMajorForm = ref({
    name: "",
    category: "",
    description: "",
});
const allMajors = computed(() => [...getAllMajors(), ...store.customMajors]);
const filteredMajors = computed(() => {
    let list = allMajors.value;
    if (activeCategory.value !== "All")
        list = list.filter((m) => m.category === activeCategory.value);
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter((m) => m.name.toLowerCase().includes(q));
    }
    return list;
});
const allPicks = ref([]);
const majorPicks = computed(() => allPicks.value
    .filter((p) => p.type === "major")
    .sort((a, b) => a.rank - b.rank));
const minorPicks = computed(() => allPicks.value
    .filter((p) => p.type === "minor")
    .sort((a, b) => a.rank - b.rank));
// Load once
allPicks.value = loadPicks();
// Form data
const form = ref({
    majorId: "",
    majorName: "",
    type: "major",
    rank: 1,
    specificName: "",
    whyInterested: "",
    careerGoals: "",
    extraNotes: "",
});
function openForm(pick, preset) {
    if (pick) {
        editId.value = pick.id;
        form.value = JSON.parse(JSON.stringify({
            majorId: pick.majorId || "",
            majorName: pick.majorName || "",
            type: pick.type || "major",
            rank: pick.rank || 1,
            specificName: pick.specificName || "",
            whyInterested: pick.whyInterested || "",
            careerGoals: pick.careerGoals || "",
            extraNotes: pick.extraNotes || "",
        }));
        majorSearch.value = pick.majorName || "";
    }
    else {
        editId.value = null;
        form.value = {
            majorId: preset?.majorId || "",
            majorName: preset?.majorName || "",
            type: preset?.type || form.value.type || "major",
            rank: 1,
            specificName: "",
            whyInterested: "",
            careerGoals: "",
            extraNotes: "",
        };
        majorSearch.value = preset?.majorName || "";
    }
    showForm.value = true;
}
function save() {
    if (!majorSearch.value.trim() && !form.value.majorName) {
        alert("Enter a name.");
        return;
    }
    const newPick = {
        id: editId.value || crypto.randomUUID(),
        majorId: form.value.majorId,
        majorName: majorSearch.value.trim() || form.value.majorName,
        type: form.value.type,
        rank: form.value.rank,
        specificName: form.value.specificName.trim(),
        whyInterested: form.value.whyInterested.trim(),
        careerGoals: form.value.careerGoals.trim(),
        extraNotes: form.value.extraNotes.trim(),
    };
    let picks = allPicks.value.slice();
    if (editId.value) {
        const idx = picks.findIndex((p) => p.id === editId.value);
        if (idx !== -1)
            picks.splice(idx, 1, newPick);
        else
            picks.push(newPick);
    }
    else {
        picks.push(newPick);
    }
    allPicks.value = picks;
    savePicks(picks);
    showForm.value = false;
    editId.value = null;
}
function deletePick(id) {
    if (!confirm("Remove?"))
        return;
    const picks = allPicks.value.filter((p) => p.id !== id);
    allPicks.value = picks;
    savePicks(picks);
}
function addCustomMajor() {
    const name = customMajorForm.value.name.trim();
    const category = customMajorForm.value.category;
    if (!name || !category) {
        alert("Name and Category are required.");
        return;
    }
    store.addCustomMajor({
        id: crypto.randomUUID(),
        name,
        category,
        description: customMajorForm.value.description.trim(),
        related: [],
        isCustom: true,
    });
    customMajorForm.value = { name: "", category: "", description: "" };
    showCustomMajorForm.value = false;
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['pick-card']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-del']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-add-pick']} */ ;
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['cat-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cat-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['major-card']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['college-row']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-small']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-add-custom']} */ ;
/** @type {__VLS_StyleScopedClasses['major-card']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-del-custom']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-del-custom']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "welcome" },
});
/** @type {__VLS_StyleScopedClasses['welcome']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "picks-row" },
});
/** @type {__VLS_StyleScopedClasses['picks-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pick-column" },
});
/** @type {__VLS_StyleScopedClasses['pick-column']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
if (__VLS_ctx.majorPicks.length > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pick-stack" },
    });
    /** @type {__VLS_StyleScopedClasses['pick-stack']} */ ;
    for (const [pick] of __VLS_vFor((__VLS_ctx.majorPicks))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.majorPicks.length > 0))
                        throw 0;
                    return __VLS_ctx.openForm(pick);
                    // @ts-ignore
                    [majorPicks, majorPicks, openForm,];
                } },
            key: (pick.id),
            ...{ class: "pick-card" },
        });
        /** @type {__VLS_StyleScopedClasses['pick-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pick-rank" },
        });
        /** @type {__VLS_StyleScopedClasses['pick-rank']} */ ;
        (pick.rank);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pick-info" },
        });
        /** @type {__VLS_StyleScopedClasses['pick-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pick-name" },
        });
        /** @type {__VLS_StyleScopedClasses['pick-name']} */ ;
        (pick.majorName);
        if (pick.specificName) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "pick-specific" },
            });
            /** @type {__VLS_StyleScopedClasses['pick-specific']} */ ;
            (pick.specificName);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.majorPicks.length > 0))
                        throw 0;
                    return __VLS_ctx.deletePick(pick.id);
                    // @ts-ignore
                    [deletePick,];
                } },
            ...{ class: "mini-del" },
        });
        /** @type {__VLS_StyleScopedClasses['mini-del']} */ ;
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.majorPicks.length < 3) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.majorPicks.length < 3))
                    throw 0;
                return __VLS_ctx.openForm(undefined, { type: 'major' });
                // @ts-ignore
                [majorPicks, openForm,];
            } },
        ...{ class: "btn-add-pick" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-add-pick']} */ ;
    (__VLS_ctx.majorPicks.length);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pick-column" },
});
/** @type {__VLS_StyleScopedClasses['pick-column']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
if (__VLS_ctx.minorPicks.length > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pick-stack" },
    });
    /** @type {__VLS_StyleScopedClasses['pick-stack']} */ ;
    for (const [pick] of __VLS_vFor((__VLS_ctx.minorPicks))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.minorPicks.length > 0))
                        throw 0;
                    return __VLS_ctx.openForm(pick);
                    // @ts-ignore
                    [majorPicks, openForm, minorPicks, minorPicks,];
                } },
            key: (pick.id),
            ...{ class: "pick-card" },
        });
        /** @type {__VLS_StyleScopedClasses['pick-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pick-rank" },
        });
        /** @type {__VLS_StyleScopedClasses['pick-rank']} */ ;
        (pick.rank);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pick-info" },
        });
        /** @type {__VLS_StyleScopedClasses['pick-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pick-name" },
        });
        /** @type {__VLS_StyleScopedClasses['pick-name']} */ ;
        (pick.majorName);
        if (pick.specificName) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "pick-specific" },
            });
            /** @type {__VLS_StyleScopedClasses['pick-specific']} */ ;
            (pick.specificName);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.minorPicks.length > 0))
                        throw 0;
                    return __VLS_ctx.deletePick(pick.id);
                    // @ts-ignore
                    [deletePick,];
                } },
            ...{ class: "mini-del" },
        });
        /** @type {__VLS_StyleScopedClasses['mini-del']} */ ;
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.minorPicks.length < 3) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.minorPicks.length < 3))
                    throw 0;
                return __VLS_ctx.openForm(undefined, { type: 'minor' });
                // @ts-ignore
                [openForm, minorPicks,];
            } },
        ...{ class: "btn-add-pick" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-add-pick']} */ ;
    (__VLS_ctx.minorPicks.length);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "toolbar" },
});
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    value: (__VLS_ctx.searchQuery),
    type: "text",
    placeholder: "🔍 Search 100+ majors and minors...",
    ...{ class: "search-bar" },
});
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "cat-filters" },
});
/** @type {__VLS_StyleScopedClasses['cat-filters']} */ ;
for (const [cat] of __VLS_vFor((__VLS_ctx.majorCategories))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                return __VLS_ctx.activeCategory = cat;
                // @ts-ignore
                [minorPicks, searchQuery, majorCategories, activeCategory,];
            } },
        key: (cat),
        ...{ class: "cat-btn" },
        ...{ class: ({ active: __VLS_ctx.activeCategory === cat }) },
    });
    /** @type {__VLS_StyleScopedClasses['cat-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    (cat === "All" ? "🌟 All" : cat);
    // @ts-ignore
    [activeCategory,];
}
if (!__VLS_ctx.showCustomMajorForm) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.showCustomMajorForm))
                    throw 0;
                return __VLS_ctx.showCustomMajorForm = true;
                // @ts-ignore
                [showCustomMajorForm, showCustomMajorForm,];
            } },
        ...{ class: "btn-add-custom" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-add-custom']} */ ;
}
if (__VLS_ctx.showCustomMajorForm) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "custom-major-form" },
    });
    /** @type {__VLS_StyleScopedClasses['custom-major-form']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.customMajorForm.name),
        type: "text",
        placeholder: "Major name...",
        ...{ class: "custom-input" },
    });
    /** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.customMajorForm.category),
        ...{ class: "custom-input" },
    });
    /** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "",
    });
    for (const [cat] of __VLS_vFor((__VLS_ctx.majorCategories.filter((c) => c !== 'All')))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (cat),
            value: (cat),
        });
        (cat);
        // @ts-ignore
        [majorCategories, showCustomMajorForm, customMajorForm, customMajorForm,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.customMajorForm.description),
        type: "text",
        placeholder: "Brief description (optional)...",
        ...{ class: "custom-input" },
    });
    /** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "custom-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['custom-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.addCustomMajor) },
        ...{ class: "custom-ok" },
    });
    /** @type {__VLS_StyleScopedClasses['custom-ok']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showCustomMajorForm))
                    throw 0;
                __VLS_ctx.showCustomMajorForm = false;
                __VLS_ctx.customMajorForm = {
                    name: '',
                    category: '',
                    description: '',
                };
                ;
                // @ts-ignore
                [showCustomMajorForm, customMajorForm, customMajorForm, addCustomMajor,];
            } },
        ...{ class: "custom-cancel" },
    });
    /** @type {__VLS_StyleScopedClasses['custom-cancel']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "major-grid" },
});
/** @type {__VLS_StyleScopedClasses['major-grid']} */ ;
for (const [major] of __VLS_vFor((__VLS_ctx.filteredMajors))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                return;
                __VLS_ctx.openForm(undefined, {
                    majorId: major.id,
                    majorName: major.name,
                    type: 'major',
                });
                // @ts-ignore
                [openForm, filteredMajors,];
            } },
        key: (major.id),
        ...{ class: "major-card" },
    });
    /** @type {__VLS_StyleScopedClasses['major-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "major-top" },
    });
    /** @type {__VLS_StyleScopedClasses['major-top']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "major-name" },
    });
    /** @type {__VLS_StyleScopedClasses['major-name']} */ ;
    (major.name);
    if (major.isCustom) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(major.isCustom))
                        throw 0;
                    return __VLS_ctx.store.removeCustomMajor(major.id);
                    // @ts-ignore
                    [store,];
                } },
            ...{ class: "mini-del-custom" },
            title: "Delete custom major",
        });
        /** @type {__VLS_StyleScopedClasses['mini-del-custom']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "major-cat" },
    });
    /** @type {__VLS_StyleScopedClasses['major-cat']} */ ;
    (major.category);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "major-desc" },
    });
    /** @type {__VLS_StyleScopedClasses['major-desc']} */ ;
    (major.description.slice(0, 100));
    // @ts-ignore
    [];
}
if (__VLS_ctx.filteredMajors.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "empty-text" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
}
if (__VLS_ctx.showForm) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showForm))
                    throw 0;
                return __VLS_ctx.showForm = false;
                // @ts-ignore
                [filteredMajors, showForm, showForm,];
            } },
        ...{ class: "modal-overlay" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal pick-modal" },
    });
    /** @type {__VLS_StyleScopedClasses['modal']} */ ;
    /** @type {__VLS_StyleScopedClasses['pick-modal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-header" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (__VLS_ctx.editId ? "Edit" : "Add");
    (__VLS_ctx.form.type === "major" ? "Major" : "Minor");
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showForm))
                    throw 0;
                return __VLS_ctx.showForm = false;
                // @ts-ignore
                [showForm, editId, form,];
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
        value: (__VLS_ctx.majorSearch),
        type: "text",
        list: "major-suggestions",
        placeholder: "Type a major or minor name...",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.datalist, __VLS_intrinsics.datalist)({
        id: "major-suggestions",
    });
    for (const [m] of __VLS_vFor((__VLS_ctx.allMajors))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option)({
            key: (m.id),
            value: (m.name),
        });
        // @ts-ignore
        [majorSearch, allMajors,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.form.specificName),
        type: "text",
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.form.type),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "major",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "minor",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.form.rank),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: (1),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: (2),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: (3),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.form.whyInterested),
        rows: "2",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.form.careerGoals),
        rows: "2",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.form.extraNotes),
        rows: "2",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showForm))
                    throw 0;
                return __VLS_ctx.save();
                // @ts-ignore
                [form, form, form, form, form, form, save,];
            } },
        ...{ class: "btn-save" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
    (__VLS_ctx.editId ? "Update" : "Save");
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showForm))
                    throw 0;
                return __VLS_ctx.showForm = false;
                // @ts-ignore
                [showForm, editId,];
            } },
        ...{ class: "btn-cancel" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-cancel']} */ ;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
