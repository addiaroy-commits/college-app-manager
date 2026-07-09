import { useToasts } from "../composables/useToast";
const { toasts, removeToast } = useToasts();
function undo(toast) {
    if (toast.undoAction)
        toast.undoAction();
    removeToast(toast.id);
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "toast-container" },
});
/** @type {__VLS_StyleScopedClasses['toast-container']} */ ;
for (const [toast] of __VLS_vFor((__VLS_ctx.toasts))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (toast.id),
        ...{ class: "toast" },
    });
    /** @type {__VLS_StyleScopedClasses['toast']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (toast.message);
    if (toast.undoAction) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(toast.undoAction))
                        throw 0;
                    return __VLS_ctx.undo(toast);
                    // @ts-ignore
                    [toasts, undo,];
                } },
            ...{ class: "toast-undo" },
        });
        /** @type {__VLS_StyleScopedClasses['toast-undo']} */ ;
        (toast.undoLabel);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                return __VLS_ctx.removeToast(toast.id);
                // @ts-ignore
                [removeToast,];
            } },
        ...{ class: "toast-close" },
    });
    /** @type {__VLS_StyleScopedClasses['toast-close']} */ ;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
