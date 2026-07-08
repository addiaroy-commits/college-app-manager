import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
const router = useRouter();
const userStore = useUserStore();
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref("");
const success = ref("");
function doSignup() {
    error.value = "";
    success.value = "";
    if (password.value !== confirmPassword.value) {
        error.value = "Passwords don't match";
        return;
    }
    const result = userStore.signup(username.value, password.value);
    if (result) {
        error.value = result;
    }
    else {
        success.value = "Account created! Redirecting to login...";
        // Log user in automatically
        userStore.login(username.value, password.value);
        setTimeout(() => {
            router.push("/onboarding");
        }, 1500);
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
/** @type {__VLS_StyleScopedClasses['btn-signup']} */ ;
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
if (__VLS_ctx.success) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "auth-success" },
    });
    /** @type {__VLS_StyleScopedClasses['auth-success']} */ ;
    (__VLS_ctx.success);
}
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
    ...{ onKeyup: (__VLS_ctx.doSignup) },
    value: (__VLS_ctx.username),
    type: "text",
    placeholder: "Choose a username",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "field" },
});
/** @type {__VLS_StyleScopedClasses['field']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onKeyup: (__VLS_ctx.doSignup) },
    type: "password",
    placeholder: "At least 4 characters",
});
(__VLS_ctx.password);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "field" },
});
/** @type {__VLS_StyleScopedClasses['field']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onKeyup: (__VLS_ctx.doSignup) },
    type: "password",
    placeholder: "Re-enter your password",
});
(__VLS_ctx.confirmPassword);
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.doSignup) },
    ...{ class: "btn-signup" },
});
/** @type {__VLS_StyleScopedClasses['btn-signup']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "auth-link" },
});
/** @type {__VLS_StyleScopedClasses['auth-link']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
routerLink;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    to: "/login",
}));
const __VLS_2 = __VLS_1({
    to: "/login",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
// @ts-ignore
[success, success, error, error, doSignup, doSignup, doSignup, doSignup, username, password, confirmPassword,];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
