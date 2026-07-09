import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEssayStore } from "../stores/essayStore";
import { useCollegeStore } from "../stores/collegeStore";
const route = useRoute();
const router = useRouter();
const essayStore = useEssayStore();
const collegeStore = useCollegeStore();
const collegeId = route.params.collegeId;
const college = computed(() => collegeStore.colleges.find((c) => c.id === collegeId));
const showEditor = ref(false);
const editingId = ref(null);
const essayContent = ref("");
const form = ref({
    title: "",
    prompt: "",
    targetWordCount: 650,
    status: "Not Started",
});
const collegeEssays = computed(() => essayStore.essays.filter((e) => e.collegeId === collegeId));
const currentWordCount = computed(() => {
    const text = essayContent.value.trim();
    return text ? text.split(/\s+/).length : 0;
});
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
    if (editingId.value) {
        essayStore.updateEssay(editingId.value, {
            id: editingId.value,
            title: form.value.title.trim(),
            collegeId,
            collegeName: college.value?.name ?? "",
            prompt: form.value.prompt.trim(),
            targetWordCount: form.value.targetWordCount,
            currentWordCount: currentWordCount.value,
            status: form.value.status,
            content: essayContent.value,
        });
    }
    else {
        essayStore.addEssay({
            id: crypto.randomUUID(),
            title: form.value.title.trim(),
            collegeId,
            collegeName: college.value?.name ?? "",
            prompt: form.value.prompt.trim(),
            targetWordCount: form.value.targetWordCount,
            currentWordCount: 0,
            status: "Not Started",
            content: "",
        });
    }
    showEditor.value = false;
    editingId.value = null;
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
/** @type {__VLS_StyleScopedClasses['back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['essay-card']} */ ;
/** @type {__VLS_StyleScopedClasses['category-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['category-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['category-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return __VLS_ctx.router.push('/essays');
            // @ts-ignore
            [router,];
        } },
    ...{ class: "back-btn" },
});
/** @type {__VLS_StyleScopedClasses['back-btn']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
(__VLS_ctx.college?.name ?? "College");
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "category-badge" },
    ...{ class: (__VLS_ctx.college?.category?.toLowerCase()) },
});
/** @type {__VLS_StyleScopedClasses['category-badge']} */ ;
(__VLS_ctx.college?.category);
if (__VLS_ctx.collegeEssays.length === 0 && !__VLS_ctx.showEditor) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "empty-text" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
    (__VLS_ctx.college?.name);
}
for (const [essay] of __VLS_vFor((__VLS_ctx.collegeEssays))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                return;
                __VLS_ctx.router.push('/essays/college/' + __VLS_ctx.collegeId + '/essay/' + essay.id);
                // @ts-ignore
                [router, college, college, college, college, collegeEssays, collegeEssays, showEditor, collegeId,];
            } },
        key: (essay.id),
        ...{ class: "essay-card" },
    });
    /** @type {__VLS_StyleScopedClasses['essay-card']} */ ;
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
    (essay.prompt
        ? essay.prompt.slice(0, 50) + "..."
        : "No prompt");
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "status-badge" },
        ...{ class: (__VLS_ctx.statusColor(essay.status)) },
    });
    /** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
    (essay.status);
    // @ts-ignore
    [statusColor,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.openAddEssay) },
    ...{ class: "btn-add" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['btn-add']} */ ;
if (__VLS_ctx.showEditor) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showEditor))
                    throw 0;
                return __VLS_ctx.showEditor = false;
                // @ts-ignore
                [showEditor, showEditor, openAddEssay,];
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
    (__VLS_ctx.editingId ? "Edit" : "New");
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showEditor))
                    throw 0;
                return __VLS_ctx.showEditor = false;
                // @ts-ignore
                [showEditor, editingId,];
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
        value: (__VLS_ctx.form.title),
        type: "text",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.form.prompt),
        rows: "2",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-row" },
    });
    /** @type {__VLS_StyleScopedClasses['form-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
    });
    (__VLS_ctx.form.targetWordCount);
    if (__VLS_ctx.editingId) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "field" },
        });
        /** @type {__VLS_StyleScopedClasses['field']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
            value: (__VLS_ctx.form.status),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "Not Started",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "Drafting",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "Done",
        });
    }
    if (__VLS_ctx.editingId) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "editor-area" },
        });
        /** @type {__VLS_StyleScopedClasses['editor-area']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "word-counter" },
        });
        /** @type {__VLS_StyleScopedClasses['word-counter']} */ ;
        (__VLS_ctx.currentWordCount);
        (__VLS_ctx.form.targetWordCount);
        __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
            value: (__VLS_ctx.essayContent),
            ...{ class: "essay-textarea" },
        });
        /** @type {__VLS_StyleScopedClasses['essay-textarea']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modal-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.saveEssay) },
        ...{ class: "btn-save" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
    (__VLS_ctx.editingId ? "Save" : "Add");
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showEditor))
                    throw 0;
                return __VLS_ctx.showEditor = false;
                // @ts-ignore
                [showEditor, editingId, editingId, editingId, form, form, form, form, form, currentWordCount, essayContent, saveEssay,];
            } },
        ...{ class: "btn-cancel" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-cancel']} */ ;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
