import { ref, computed } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const step = ref(0);
const steps = [
    {
        emoji: "🎓",
        title: "Welcome to CogApp",
        desc: "Your all-in-one college application organizer. Every college, every essay, every deadline, every document — all in one  place. No more spreadsheets, sticky notes, or forgotten deadlines.",
        detail: false,
    },
    {
        emoji: "🏫",
        title: "1. Build Your College List",
        desc: "Search 7,000+ real US colleges and add them to your list with one click. Each college gets a category (Reach, Target, Safety), a deadline, and application type (ED, EA, RD). Filter, search, and organize your dream schools.",
        hint: "Tip: Use the 'Search Database' button to auto-fill college info from the US Department of Education!",
    },
    {
        emoji: "🎓",
        title: "2. Explore Majors & Minors",
        desc: "Browse 100+ majors across categories like Engineering, Business, Arts, and Sciences. Set your top 3 major and minor picks, rank them, and add notes about career goals. Add your own custom majors with any category.",
        hint: "Tip: Use the category filters to quickly find majors in your field of interest!",
    },
    {
        emoji: "🌟",
        title: "3. The Brag Sheet",
        desc: "Everything colleges want to know about you — GPA, courses, AP scores, clubs, sports, awards, volunteering, skills, and more. Each category has its own tab with custom forms. Attach files, track years, and build your complete profile.",
        hint: "Tip: Use the '+' button next to tabs to create your own custom categories!",
    },
    {
        emoji: "✍️",
        title: "4. Track Every Essay",
        desc: "Click any college to add essays — unlimited per school. Set essay targets and watch your progress bar fill up. Write directly in the app with a live word counter, or attach documents. Mark essays 'Done' and get a confetti celebration!",
        hint: "Tip: Use the Common App card at the top to track all 7 Common App prompts!",
    },
    {
        emoji: "💰",
        title: "5. Track Costs & Budget",
        desc: "Add cost data for every college — tuition auto-fills from real government data. Set a tuition budget in Goals and see which colleges fit and which exceed. Track aid, loans, and your family contribution.",
        hint: "Tip: Pick a college from the dropdown and tuition fills automatically!",
    },
    {
        emoji: "🎯",
        title: "6. Set Goals & Track Stats",
        desc: "Set goals for how many colleges to apply to, how many essays to write, and your budget. The Stats page shows charts and progress rings. Watch your numbers grow as you complete each milestone.",
        hint: "Tip: The Tuition Budget goal automatically checks your cost tracker data!",
    },
    {
        emoji: "📁",
        title: "7. Document Vault",
        desc: "Upload transcripts, resumes, and portfolios. Every attachment from essays and the Brag Sheet automatically appears here. Search, preview, download — one unified place for every file in your application.",
        hint: "Tip: Use the search bar to find any document by name, type, or source!",
    },
    {
        emoji: "🎓",
        title: "8. Explore Scholarships",
        desc: "Find, organize, and complete scholarship applications. Track deadlines, required materials, and award amounts. Use the AI assistant to check eligibility and get essay outlines. Every dollar counts!",
        hint: "Tip: Use the match score to find scholarships that best fit your profile!",
    },
    {
        emoji: "🚀",
        title: "You're Ready!",
        desc: "Your entire college application journey — organized, tracked, and stress-free. Explore each tab in the sidebar. Add data, track progress, and take control of your future.",
        hint: "Start with the Dashboard to see your calendar and summary!",
    },
];
const isLast = computed(() => step.value === steps.length - 1);
const isFirst = computed(() => step.value === 0);
function next() {
    if (step.value < steps.length - 1) {
        step.value++;
    }
    else {
        finish();
    }
}
function prev() {
    if (step.value > 0)
        step.value--;
}
function skip() {
    finish();
}
function finish() {
    localStorage.setItem("applywise-onboarded", "true");
    router.push("/");
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['skip-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['next']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['prev']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "onboard-screen" },
});
/** @type {__VLS_StyleScopedClasses['onboard-screen']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.skip) },
    ...{ class: "skip-btn" },
});
/** @type {__VLS_StyleScopedClasses['skip-btn']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "onboard-body" },
});
/** @type {__VLS_StyleScopedClasses['onboard-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "onboard-emoji" },
    key: ('e' + __VLS_ctx.step),
});
/** @type {__VLS_StyleScopedClasses['onboard-emoji']} */ ;
(__VLS_ctx.steps[__VLS_ctx.step].emoji);
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "onboard-title" },
    key: ('t' + __VLS_ctx.step),
});
/** @type {__VLS_StyleScopedClasses['onboard-title']} */ ;
(__VLS_ctx.steps[__VLS_ctx.step].title);
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "onboard-desc" },
    key: ('d' + __VLS_ctx.step),
});
/** @type {__VLS_StyleScopedClasses['onboard-desc']} */ ;
(__VLS_ctx.steps[__VLS_ctx.step].desc);
if (__VLS_ctx.steps[__VLS_ctx.step].hint) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "onboard-hint" },
        key: ('h' + __VLS_ctx.step),
    });
    /** @type {__VLS_StyleScopedClasses['onboard-hint']} */ ;
    (__VLS_ctx.steps[__VLS_ctx.step].hint);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "onboard-bottom" },
});
/** @type {__VLS_StyleScopedClasses['onboard-bottom']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "onboard-dots" },
});
/** @type {__VLS_StyleScopedClasses['onboard-dots']} */ ;
for (const [_, i] of __VLS_vFor((__VLS_ctx.steps))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        key: (i),
        ...{ class: "dot" },
        ...{ class: ({ active: i === __VLS_ctx.step, done: i < __VLS_ctx.step }) },
    });
    /** @type {__VLS_StyleScopedClasses['dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    /** @type {__VLS_StyleScopedClasses['done']} */ ;
    // @ts-ignore
    [skip, step, step, step, step, step, step, step, step, step, step, step, steps, steps, steps, steps, steps, steps,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "onboard-buttons" },
});
/** @type {__VLS_StyleScopedClasses['onboard-buttons']} */ ;
if (!__VLS_ctx.isFirst) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.prev) },
        ...{ class: "nav-btn prev" },
    });
    /** @type {__VLS_StyleScopedClasses['nav-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['prev']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.next) },
    ...{ class: "nav-btn next" },
});
/** @type {__VLS_StyleScopedClasses['nav-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['next']} */ ;
(__VLS_ctx.isLast ? "🎉 Let's Go!" : "Next →");
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "step-counter" },
});
/** @type {__VLS_StyleScopedClasses['step-counter']} */ ;
(__VLS_ctx.step + 1);
(__VLS_ctx.steps.length);
// @ts-ignore
[step, steps, isFirst, prev, next, isLast,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
