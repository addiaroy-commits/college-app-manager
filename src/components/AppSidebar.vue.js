import { ref } from "vue";
import { useRoute } from "vue-router";
import { useThemeStore } from "../stores/themeStore";
import { useUserStore } from "../stores/userStore";
const user = useUserStore();
const route = useRoute();
const theme = useThemeStore();
const showThemes = ref(false);
const navItems = [
    { path: "/", label: "📊 Dashboard", name: "dashboard" },
    { path: "/colleges", label: "🏫 College List", name: "colleges" },
    { path: "/majors", label: "🎓 Majors", name: "majors" },
    { path: "/brag", label: "🌟 Brag Sheet", name: "brag" },
    { path: "/essays", label: "✍️ Essays", name: "essays" },
    { path: "/costs", label: "💰 Costs", name: "costs" },
    { path: "/goals", label: "🎯 Goals", name: "goals" },
    { path: "/scholarships", label: "🎓 Scholarships", name: "scholarships" },
    { path: "/stats", label: "📊 Stats", name: "stats" },
    { path: "/documents", label: "📁 Documents", name: "documents" },
];
const themeOptions = [
    { value: "purple", label: "💜 Lilac" },
    { value: "blue", label: "💙 Ocean" },
    { value: "green", label: "💚 Forest" },
    { value: "rose", label: "💗 Rose" },
];
function doReload() { location.reload(); }
function changeTheme(t) {
    theme.setTheme(t);
    showThemes.value = false;
    doReload();
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['logout-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-dropdown-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-option']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-option']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-toggle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
    ...{ class: "sidebar" },
});
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "sidebar-header" },
});
/** @type {__VLS_StyleScopedClasses['sidebar-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "app-name" },
});
/** @type {__VLS_StyleScopedClasses['app-name']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    ...{ class: "sidebar-nav" },
});
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
for (const [item] of __VLS_vFor((__VLS_ctx.navItems))) {
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        key: (item.path),
        to: (item.path),
        ...{ class: "nav-link" },
        ...{ class: ({ active: __VLS_ctx.route.name === item.name }) },
    }));
    const __VLS_2 = __VLS_1({
        key: (item.path),
        to: (item.path),
        ...{ class: "nav-link" },
        ...{ class: ({ active: __VLS_ctx.route.name === item.name }) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    const { default: __VLS_5 } = __VLS_3.slots;
    (item.label);
    // @ts-ignore
    [navItems, route,];
    var __VLS_3;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "sidebar-footer" },
});
/** @type {__VLS_StyleScopedClasses['sidebar-footer']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.user.logout();
            __VLS_ctx.doReload();
            ;
            // @ts-ignore
            [user, doReload,];
        } },
    ...{ class: "logout-btn" },
});
/** @type {__VLS_StyleScopedClasses['logout-btn']} */ ;
(__VLS_ctx.user.username);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "theme-dropdown" },
});
/** @type {__VLS_StyleScopedClasses['theme-dropdown']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return __VLS_ctx.showThemes = !__VLS_ctx.showThemes;
            // @ts-ignore
            [user, showThemes, showThemes,];
        } },
    ...{ class: "theme-dropdown-btn" },
});
/** @type {__VLS_StyleScopedClasses['theme-dropdown-btn']} */ ;
(__VLS_ctx.themeOptions.find((t) => t.value === __VLS_ctx.theme.theme)
    ?.label || "💜 Lilac");
if (__VLS_ctx.showThemes) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "theme-menu" },
    });
    /** @type {__VLS_StyleScopedClasses['theme-menu']} */ ;
    for (const [opt] of __VLS_vFor((__VLS_ctx.themeOptions))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showThemes))
                        throw 0;
                    return __VLS_ctx.changeTheme(opt.value);
                    // @ts-ignore
                    [showThemes, themeOptions, themeOptions, theme, changeTheme,];
                } },
            key: (opt.value),
            ...{ class: "theme-option" },
            ...{ class: ({ active: __VLS_ctx.theme.theme === opt.value }) },
        });
        /** @type {__VLS_StyleScopedClasses['theme-option']} */ ;
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        (opt.label);
        // @ts-ignore
        [theme,];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.theme.toggle();
            __VLS_ctx.doReload();
            ;
            // @ts-ignore
            [doReload, theme,];
        } },
    ...{ class: "theme-toggle" },
});
/** @type {__VLS_StyleScopedClasses['theme-toggle']} */ ;
(__VLS_ctx.theme.isDark ? "☀️ Light Mode" : "🌙 Dark Mode");
// @ts-ignore
[theme,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
