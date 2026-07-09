import { ref } from "vue";
import { useUserStore } from "../stores/userStore";
const userStore = useUserStore();
const username = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);
function doLogin() {
    error.value = "";
    loading.value = true;
    const result = userStore.login(username.value, password.value);
    if (result) {
        error.value = result;
        loading.value = false;
    }
    else {
        window.location.href = "/";
    }
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-login']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-login']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-link']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-link']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "auth-page" },
});
/** @type {__VLS_StyleScopedClasses['auth-page']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "auth-card" },
});
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "auth-logo" },
});
/** @type {__VLS_StyleScopedClasses['auth-logo']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "auth-subtitle" },
});
/** @type {__VLS_StyleScopedClasses['auth-subtitle']} */ ;
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "auth-error" },
    });
    /** @type {__VLS_StyleScopedClasses['auth-error']} */ ;
    (__VLS_ctx.error);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "field" },
});
/** @type {__VLS_StyleScopedClasses['field']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onKeyup: (__VLS_ctx.doLogin) },
    value: (__VLS_ctx.username),
    type: "text",
    placeholder: "Enter your username",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "field" },
});
/** @type {__VLS_StyleScopedClasses['field']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onKeyup: (__VLS_ctx.doLogin) },
    type: "password",
    placeholder: "Enter your password",
});
(__VLS_ctx.password);
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.doLogin) },
    ...{ class: "btn-login" },
    disabled: (__VLS_ctx.loading),
});
/** @type {__VLS_StyleScopedClasses['btn-login']} */ ;
(__VLS_ctx.loading ? "Signing in..." : "Sign In");
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "auth-link" },
});
/** @type {__VLS_StyleScopedClasses['auth-link']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
routerLink;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    to: "/signup",
}));
const __VLS_2 = __VLS_1({
    to: "/signup",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
// @ts-ignore
[error, error, doLogin, doLogin, doLogin, username, password, loading, loading,];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
