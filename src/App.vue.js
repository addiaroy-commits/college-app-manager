import AppSidebar from "./components/AppSidebar.vue";
import ToastContainer from "./components/ToastContainer.vue";
import { useRoute } from "vue-router";
const route = useRoute();
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.route.meta.guest) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "guest-layout" },
    });
    /** @type {__VLS_StyleScopedClasses['guest-layout']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.routerView | typeof __VLS_components.RouterView | typeof __VLS_components['router-view'] | typeof __VLS_components.routerView | typeof __VLS_components.RouterView | typeof __VLS_components['router-view']} */
    routerView;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    {
        const { default: __VLS_5 } = __VLS_3.slots;
        const [{ Component }] = __VLS_vSlot(__VLS_5);
        let __VLS_6;
        /** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
        transition;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
            name: "fade",
            mode: "out-in",
        }));
        const __VLS_8 = __VLS_7({
            name: "fade",
            mode: "out-in",
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        const { default: __VLS_11 } = __VLS_9.slots;
        const __VLS_12 = (Component);
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({}));
        const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
        // @ts-ignore
        [route,];
        var __VLS_9;
        // @ts-ignore
        [];
        __VLS_3.slots['' /* empty slot name completion */];
    }
    var __VLS_3;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "app-layout" },
    });
    /** @type {__VLS_StyleScopedClasses['app-layout']} */ ;
    const __VLS_17 = AppSidebar;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({}));
    const __VLS_19 = __VLS_18({}, ...__VLS_functionalComponentArgsRest(__VLS_18));
    __VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
        ...{ class: "main-content" },
    });
    /** @type {__VLS_StyleScopedClasses['main-content']} */ ;
    let __VLS_22;
    /** @ts-ignore @type { | typeof __VLS_components.routerView | typeof __VLS_components.RouterView | typeof __VLS_components['router-view'] | typeof __VLS_components.routerView | typeof __VLS_components.RouterView | typeof __VLS_components['router-view']} */
    routerView;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({}));
    const __VLS_24 = __VLS_23({}, ...__VLS_functionalComponentArgsRest(__VLS_23));
    {
        const { default: __VLS_27 } = __VLS_25.slots;
        const [{ Component }] = __VLS_vSlot(__VLS_27);
        let __VLS_28;
        /** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
        transition;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
            name: "slide-fade",
            mode: "out-in",
        }));
        const __VLS_30 = __VLS_29({
            name: "slide-fade",
            mode: "out-in",
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        const { default: __VLS_33 } = __VLS_31.slots;
        const __VLS_34 = (Component);
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({}));
        const __VLS_36 = __VLS_35({}, ...__VLS_functionalComponentArgsRest(__VLS_35));
        // @ts-ignore
        [];
        var __VLS_31;
        // @ts-ignore
        [];
        __VLS_25.slots['' /* empty slot name completion */];
    }
    var __VLS_25;
}
const __VLS_39 = ToastContainer;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({}));
const __VLS_41 = __VLS_40({}, ...__VLS_functionalComponentArgsRest(__VLS_40));
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
