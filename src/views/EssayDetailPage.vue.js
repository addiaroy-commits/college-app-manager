import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEssayStore } from "../stores/essayStore";
import { useCollegeStore } from "../stores/collegeStore";
const route = useRoute();
const router = useRouter();
const essayStore = useEssayStore();
const collegeStore = useCollegeStore();
const collegeId = route.params.collegeId;
const essayId = route.params.essayId;
const essay = computed(() => essayStore.essays.find((e) => e.id === essayId));
const college = computed(() => collegeStore.colleges.find((c) => c.id === collegeId));
const backUrl = computed(() => {
    if (collegeId === "common-app")
        return "/essays";
    return college.value ? `/essays/college/${collegeId}` : "/essays";
});
const mode = ref("write");
const content = ref("");
const showAI = ref(false);
const showConfetti = ref(false);
let confettiTimer = null;
const fileInput = ref(null);
void fileInput;
const attachedFile = ref(null);
if (essay.value) {
    content.value = essay.value.content;
    if (essay.value.content && essay.value.content.startsWith("FILE:")) {
        mode.value = "attach";
        const parts = essay.value.content.split("|");
        attachedFile.value = {
            name: parts[1] || "document",
            data: parts[2] || "",
            type: parts[3] || "application/pdf",
        };
    }
}
watch(content, () => {
    if (essay.value) {
        essay.value.currentWordCount = wordCount.value;
        essay.value.content =
            mode.value === "attach" && attachedFile.value
                ? `FILE:|${attachedFile.value.name}|${attachedFile.value.data}|${attachedFile.value.type}`
                : content.value;
        essayStore.updateEssay(essayId, essay.value);
    }
});
const wordCount = computed(() => content.value.trim() ? content.value.trim().split(/\s+/).length : 0);
const analysis = computed(() => {
    const text = content.value.trim();
    if (!text)
        return null;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
    const words = text.split(/\s+/);
    const wordMap = {};
    words.forEach((w) => {
        const l = w.toLowerCase();
        wordMap[l] = (wordMap[l] || 0) + 1;
    });
    const repeated = Object.entries(wordMap)
        .filter(([word, c]) => c > 3 && word.length > 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    const chars = text.replace(/\s/g, "").length;
    const paras = text.split(/\n\s*\n/).filter((p) => p.trim());
    const passiveHints = words.filter((w, i) => w.endsWith("ed") &&
        i < words.length - 2 &&
        ["was", "were", "is", "are", "been", "being"].includes(words[i - 1]?.toLowerCase()));
    return {
        wordCount: words.length,
        charCount: chars,
        sentenceCount: sentences.length,
        avgWordsPerSentence: sentences.length
            ? Math.round(words.length / sentences.length)
            : 0,
        readingTime: Math.max(1, Math.round(words.length / 200)),
        paragraphCount: paras.length,
        repeatedWords: repeated.map(([w, c]) => ({ word: w, count: c })),
        passiveHints: passiveHints.length,
    };
});
function changeStatus(newStatus) {
    if (essay.value) {
        essay.value.status = newStatus;
        essayStore.updateEssay(essayId, essay.value);
        if (newStatus === "Done") {
            showConfetti.value = true;
            if (confettiTimer)
                clearTimeout(confettiTimer);
            confettiTimer = setTimeout(() => {
                showConfetti.value = false;
            }, 3000);
        }
    }
}
function onFilePicked(e) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file)
        return;
    const reader = new FileReader();
    reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        attachedFile.value = { name: file.name, data: base64, type: file.type };
        if (essay.value) {
            essay.value.content = `FILE:|${file.name}|${base64}|${file.type}`;
            essayStore.updateEssay(essayId, essay.value);
        }
    };
    reader.readAsDataURL(file);
}
function downloadAttached() {
    if (!attachedFile.value)
        return;
    const a = document.createElement("a");
    a.href = `data:${attachedFile.value.type};base64,${attachedFile.value.data}`;
    a.download = attachedFile.value.name;
    a.click();
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['title-input']} */ ;
/** @type {__VLS_StyleScopedClasses['status-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['status-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['status-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['drafting']} */ ;
/** @type {__VLS_StyleScopedClasses['done']} */ ;
/** @type {__VLS_StyleScopedClasses['mode-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['mode-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['big-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-section']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-tips']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
if (__VLS_ctx.showConfetti) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "confetti-container" },
    });
    /** @type {__VLS_StyleScopedClasses['confetti-container']} */ ;
    for (const [i] of __VLS_vFor((50))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (i),
            ...{ class: "confetti-piece" },
            ...{ style: ({
                    left: Math.random() * 100 + '%',
                    animationDelay: Math.random() * 2 + 's',
                    backgroundColor: [
                        '#ff6b6b',
                        '#ffd93d',
                        '#6bcb77',
                        '#4d96ff',
                        '#ff922b',
                        '#cc5de8',
                    ][i % 6],
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['confetti-piece']} */ ;
        // @ts-ignore
        [showConfetti,];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return __VLS_ctx.router.push(__VLS_ctx.backUrl);
            // @ts-ignore
            [router, backUrl,];
        } },
    ...{ class: "back-btn" },
});
/** @type {__VLS_StyleScopedClasses['back-btn']} */ ;
(__VLS_ctx.collegeId === "common-app"
    ? "Essays"
    : __VLS_ctx.college?.name || "Essays");
if (__VLS_ctx.essay) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-layout" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-layout']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-main" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-main']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "title-bar" },
    });
    /** @type {__VLS_StyleScopedClasses['title-bar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onChange: (...[$event]) => {
                if (!(__VLS_ctx.essay))
                    throw 0;
                return __VLS_ctx.essayStore.updateEssay(__VLS_ctx.essayId, __VLS_ctx.essay);
                // @ts-ignore
                [collegeId, college, essay, essay, essayStore, essayId,];
            } },
        ...{ class: "title-input" },
    });
    (__VLS_ctx.essay.title);
    /** @type {__VLS_StyleScopedClasses['title-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "status-pills" },
    });
    /** @type {__VLS_StyleScopedClasses['status-pills']} */ ;
    for (const [s] of __VLS_vFor((['Not Started', 'Drafting', 'Done']))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.essay))
                        throw 0;
                    return __VLS_ctx.changeStatus(s);
                    // @ts-ignore
                    [essay, changeStatus,];
                } },
            key: (s),
            ...{ class: "status-pill" },
            ...{ class: ({
                    active: __VLS_ctx.essay.status === s,
                    done: s === 'Done' && __VLS_ctx.essay.status === 'Done',
                    drafting: s === 'Drafting' &&
                        __VLS_ctx.essay.status === 'Drafting',
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['status-pill']} */ ;
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        /** @type {__VLS_StyleScopedClasses['done']} */ ;
        /** @type {__VLS_StyleScopedClasses['drafting']} */ ;
        (s);
        // @ts-ignore
        [essay, essay, essay,];
    }
    if (__VLS_ctx.essay.prompt) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "prompt-box" },
        });
        /** @type {__VLS_StyleScopedClasses['prompt-box']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.essay.prompt);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mode-tabs" },
    });
    /** @type {__VLS_StyleScopedClasses['mode-tabs']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.essay))
                    throw 0;
                return __VLS_ctx.mode = 'write';
                // @ts-ignore
                [essay, essay, mode,];
            } },
        ...{ class: ({ active: __VLS_ctx.mode === 'write' }) },
    });
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.essay))
                    throw 0;
                return __VLS_ctx.mode = 'attach';
                // @ts-ignore
                [mode, mode,];
            } },
        ...{ class: ({ active: __VLS_ctx.mode === 'attach' }) },
    });
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    if (__VLS_ctx.mode === 'write') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "wc-display" },
        });
        /** @type {__VLS_StyleScopedClasses['wc-display']} */ ;
        (__VLS_ctx.wordCount);
        (__VLS_ctx.essay.targetWordCount);
        __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
            value: (__VLS_ctx.content),
            ...{ class: "big-textarea" },
            placeholder: "Start writing here...",
        });
        /** @type {__VLS_StyleScopedClasses['big-textarea']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "attach-area" },
        });
        /** @type {__VLS_StyleScopedClasses['attach-area']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "hint" },
        });
        /** @type {__VLS_StyleScopedClasses['hint']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            ...{ onChange: (__VLS_ctx.onFilePicked) },
            ref: "fileInput",
            type: "file",
            accept: ".pdf,.doc,.docx,.txt",
        });
        if (__VLS_ctx.attachedFile) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "attached-file" },
            });
            /** @type {__VLS_StyleScopedClasses['attached-file']} */ ;
            (__VLS_ctx.attachedFile.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.essay))
                            throw 0;
                        if (!!(__VLS_ctx.mode === 'write'))
                            throw 0;
                        if (!(__VLS_ctx.attachedFile))
                            throw 0;
                        return __VLS_ctx.downloadAttached();
                        // @ts-ignore
                        [essay, mode, mode, wordCount, content, onFilePicked, attachedFile, attachedFile, downloadAttached,];
                    } },
                ...{ class: "link-btn" },
            });
            /** @type {__VLS_StyleScopedClasses['link-btn']} */ ;
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.essay))
                    throw 0;
                return __VLS_ctx.showAI = !__VLS_ctx.showAI;
                // @ts-ignore
                [showAI, showAI,];
            } },
        ...{ class: "ai-toggle" },
    });
    /** @type {__VLS_StyleScopedClasses['ai-toggle']} */ ;
    (__VLS_ctx.showAI ? "🤖 Hide Analysis" : "🤖 Run AI Checker");
    if (__VLS_ctx.showAI && __VLS_ctx.analysis) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-panel" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-panel']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-grid" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-grid']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-stat" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-stat']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-num" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-num']} */ ;
        (__VLS_ctx.analysis.wordCount);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-stat" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-stat']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-num" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-num']} */ ;
        (__VLS_ctx.analysis.charCount);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-stat" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-stat']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-num" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-num']} */ ;
        (__VLS_ctx.analysis.sentenceCount);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-stat" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-stat']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-num" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-num']} */ ;
        (__VLS_ctx.analysis.avgWordsPerSentence);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-stat" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-stat']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-num" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-num']} */ ;
        (__VLS_ctx.analysis.readingTime);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-stat" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-stat']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-num" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-num']} */ ;
        (__VLS_ctx.analysis.paragraphCount);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-stat" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-stat']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-num" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-num']} */ ;
        (__VLS_ctx.analysis.passiveHints);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-stat" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-stat']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-num" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-num']} */ ;
        (__VLS_ctx.essay.targetWordCount - __VLS_ctx.wordCount);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        if (__VLS_ctx.analysis.repeatedWords.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "ai-section" },
            });
            /** @type {__VLS_StyleScopedClasses['ai-section']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
            for (const [rw] of __VLS_vFor((__VLS_ctx.analysis.repeatedWords))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    key: (rw.word),
                    ...{ class: "ai-tag" },
                });
                /** @type {__VLS_StyleScopedClasses['ai-tag']} */ ;
                (rw.word);
                (rw.count);
                // @ts-ignore
                [essay, wordCount, showAI, showAI, analysis, analysis, analysis, analysis, analysis, analysis, analysis, analysis, analysis, analysis,];
            }
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "ai-section" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
            ...{ class: "ai-tips" },
        });
        /** @type {__VLS_StyleScopedClasses['ai-tips']} */ ;
        if (__VLS_ctx.analysis.avgWordsPerSentence > 25) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
        }
        if (__VLS_ctx.analysis.avgWordsPerSentence < 10) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
        }
        if (__VLS_ctx.analysis.readingTime > 3) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
            (__VLS_ctx.analysis.readingTime);
        }
        if (__VLS_ctx.analysis.passiveHints > 3) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
            (__VLS_ctx.analysis.passiveHints);
        }
        if (__VLS_ctx.wordCount > __VLS_ctx.essay.targetWordCount) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
            (__VLS_ctx.wordCount - __VLS_ctx.essay.targetWordCount);
        }
        if (__VLS_ctx.wordCount < __VLS_ctx.essay.targetWordCount) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
            (__VLS_ctx.essay.targetWordCount - __VLS_ctx.wordCount);
        }
        if (__VLS_ctx.wordCount === __VLS_ctx.essay.targetWordCount) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
        }
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-text" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
}
// @ts-ignore
[essay, essay, essay, essay, essay, wordCount, wordCount, wordCount, wordCount, wordCount, analysis, analysis, analysis, analysis, analysis, analysis,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
