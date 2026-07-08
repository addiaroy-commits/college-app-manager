import AppSidebar from "./components/AppSidebar.vue";
import { useRoute } from "vue-router";
import { ref } from "vue";
const route = useRoute();
const sidebarOpen = ref(false);
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['app-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['main-content']} */ ;
/** @type {__VLS_StyleScopedClasses['hamburger']} */ ;
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
    const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
        ...{ 'onClose': {} },
        open: (__VLS_ctx.sidebarOpen),
    }));
    const __VLS_19 = __VLS_18({
        ...{ 'onClose': {} },
        open: (__VLS_ctx.sidebarOpen),
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    let __VLS_22;
    const __VLS_23 = {
        /** @type {typeof __VLS_22.close} */
        onClose: (...[$event]) => {
            if (!!(__VLS_ctx.route.meta.guest))
                throw 0;
            return __VLS_ctx.sidebarOpen = false;
            // @ts-ignore
            [sidebarOpen, sidebarOpen,];
        },
    };
    var __VLS_20;
    var __VLS_21;
    __VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
        ...{ class: "main-content" },
    });
    /** @type {__VLS_StyleScopedClasses['main-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!!(__VLS_ctx.route.meta.guest))
                    throw 0;
                return __VLS_ctx.sidebarOpen = !__VLS_ctx.sidebarOpen;
                // @ts-ignore
                [sidebarOpen, sidebarOpen,];
            } },
        ...{ class: "hamburger" },
    });
    /** @type {__VLS_StyleScopedClasses['hamburger']} */ ;
    let __VLS_24;
    /** @ts-ignore @type { | typeof __VLS_components.routerView | typeof __VLS_components.RouterView | typeof __VLS_components['router-view'] | typeof __VLS_components.routerView | typeof __VLS_components.RouterView | typeof __VLS_components['router-view']} */
    routerView;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
    {
        const { default: __VLS_29 } = __VLS_27.slots;
        const [{ Component }] = __VLS_vSlot(__VLS_29);
        let __VLS_30;
        /** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
        transition;
        // @ts-ignore
        const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
            name: "slide-fade",
            mode: "out-in",
        }));
        const __VLS_32 = __VLS_31({
            name: "slide-fade",
            mode: "out-in",
        }, ...__VLS_functionalComponentArgsRest(__VLS_31));
        const { default: __VLS_35 } = __VLS_33.slots;
        const __VLS_36 = (Component);
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({}));
        const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
        // @ts-ignore
        [];
        var __VLS_33;
        // @ts-ignore
        [];
        __VLS_27.slots['' /* empty slot name completion */];
    }
    var __VLS_27;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
