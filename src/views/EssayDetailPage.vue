<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEssayStore } from "../stores/essayStore";
import { useCollegeStore } from "../stores/collegeStore";

const route = useRoute();
const router = useRouter();
const essayStore = useEssayStore();
const collegeStore = useCollegeStore();

const collegeId = route.params.collegeId as string;
const essayId = route.params.essayId as string;
const essay = computed(() => essayStore.essays.find((e) => e.id === essayId));
const college = computed(() =>
    collegeStore.colleges.find((c) => c.id === collegeId),
);

const backUrl = computed(() => {
    if (collegeId === "common-app") return "/essays";
    return college.value ? `/essays/college/${collegeId}` : "/essays";
});

const mode = ref<"write" | "attach">("write");
const content = ref("");
const showAI = ref(false);
const showConfetti = ref(false);
let confettiTimer: number | null = null;
const fileInput = ref<HTMLInputElement | null>(null);
void fileInput; // used as template ref
const attachedFile = ref<{ name: string; data: string; type: string } | null>(
    null,
);

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

const wordCount = computed(() =>
    content.value.trim() ? content.value.trim().split(/\s+/).length : 0,
);

const analysis = computed(() => {
    const text = content.value.trim();
    if (!text) return null;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim());
    const words = text.split(/\s+/);
    const wordMap: Record<string, number> = {};
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
    const passiveHints = words.filter(
        (w, i) =>
            w.endsWith("ed") &&
            i < words.length - 2 &&
            ["was", "were", "is", "are", "been", "being"].includes(
                words[i - 1]?.toLowerCase(),
            ),
    );
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

function changeStatus(newStatus: string) {
    if (essay.value) {
        essay.value.status = newStatus as any;
        essayStore.updateEssay(essayId, essay.value);
        if (newStatus === "Done") {
            showConfetti.value = true;
            if (confettiTimer) clearTimeout(confettiTimer);
            confettiTimer = setTimeout(() => {
                showConfetti.value = false;
            }, 3000);
        }
    }
}

function onFilePicked(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        attachedFile.value = { name: file.name, data: base64, type: file.type };
        if (essay.value) {
            essay.value.content = `FILE:|${file.name}|${base64}|${file.type}`;
            essayStore.updateEssay(essayId, essay.value);
        }
    };
    reader.readAsDataURL(file);
}

function downloadAttached() {
    if (!attachedFile.value) return;
    const a = document.createElement("a");
    a.href = `data:${attachedFile.value.type};base64,${attachedFile.value.data}`;
    a.download = attachedFile.value.name;
    a.click();
}
</script>

<template>
    <div>
        <div v-if="showConfetti" class="confetti-container">
            <div
                v-for="i in 50"
                :key="i"
                class="confetti-piece"
                :style="{
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
                }"
            ></div>
        </div>

        <button class="back-btn" @click="router.push(backUrl)">
            ⬆ Back to
            {{
                collegeId === "common-app"
                    ? "Essays"
                    : college?.name || "Essays"
            }}
        </button>

        <div v-if="essay" class="detail-layout">
            <div class="detail-main">
                <div class="title-bar">
                    <input
                        v-model="essay.title"
                        class="title-input"
                        @change="essayStore.updateEssay(essayId, essay)"
                    />
                    <div class="status-pills">
                        <button
                            v-for="s in ['Not Started', 'Drafting', 'Done']"
                            :key="s"
                            class="status-pill"
                            :class="{
                                active: essay.status === s,
                                done: s === 'Done' && essay.status === 'Done',
                                drafting:
                                    s === 'Drafting' &&
                                    essay.status === 'Drafting',
                            }"
                            @click="changeStatus(s)"
                        >
                            {{ s }}
                        </button>
                    </div>
                </div>

                <div v-if="essay.prompt" class="prompt-box">
                    💬 <strong>Prompt:</strong> {{ essay.prompt }}
                </div>

                <div class="mode-tabs">
                    <button
                        :class="{ active: mode === 'write' }"
                        @click="mode = 'write'"
                    >
                        ✍️ Write
                    </button>
                    <button
                        :class="{ active: mode === 'attach' }"
                        @click="mode = 'attach'"
                    >
                        📎 Attach Document
                    </button>
                </div>

                <div v-if="mode === 'write'">
                    <div class="wc-display">
                        {{ wordCount }} / {{ essay.targetWordCount }} words
                    </div>
                    <textarea
                        v-model="content"
                        class="big-textarea"
                        placeholder="Start writing here..."
                    ></textarea>
                </div>
                <div v-else class="attach-area">
                    <p class="hint">
                        Upload your essay as a PDF or Word document.
                    </p>
                    <input
                        ref="fileInput"
                        type="file"
                        @change="onFilePicked"
                        accept=".pdf,.doc,.docx,.txt"
                    />
                    <div v-if="attachedFile" class="attached-file">
                        📎 {{ attachedFile.name }}
                        <button class="link-btn" @click="downloadAttached()">
                            Download
                        </button>
                    </div>
                </div>

                <button class="ai-toggle" @click="showAI = !showAI">
                    {{ showAI ? "🤖 Hide Analysis" : "🤖 Run AI Checker" }}
                </button>

                <div v-if="showAI && analysis" class="ai-panel">
                    <h3>🤖 Essay Analysis</h3>
                    <div class="ai-grid">
                        <div class="ai-stat">
                            <div class="ai-num">{{ analysis.wordCount }}</div>
                            <div>Words</div>
                        </div>
                        <div class="ai-stat">
                            <div class="ai-num">{{ analysis.charCount }}</div>
                            <div>Characters</div>
                        </div>
                        <div class="ai-stat">
                            <div class="ai-num">
                                {{ analysis.sentenceCount }}
                            </div>
                            <div>Sentences</div>
                        </div>
                        <div class="ai-stat">
                            <div class="ai-num">
                                {{ analysis.avgWordsPerSentence }}
                            </div>
                            <div>Words/Sentence</div>
                        </div>
                        <div class="ai-stat">
                            <div class="ai-num">
                                {{ analysis.readingTime }} min
                            </div>
                            <div>Reading Time</div>
                        </div>
                        <div class="ai-stat">
                            <div class="ai-num">
                                {{ analysis.paragraphCount }}
                            </div>
                            <div>Paragraphs</div>
                        </div>
                        <div class="ai-stat">
                            <div class="ai-num">
                                {{ analysis.passiveHints }}
                            </div>
                            <div>Passive Hints</div>
                        </div>
                        <div class="ai-stat">
                            <div class="ai-num">
                                {{ essay.targetWordCount - wordCount }}
                            </div>
                            <div>Words to Go</div>
                        </div>
                    </div>
                    <div
                        v-if="analysis.repeatedWords.length"
                        class="ai-section"
                    >
                        <h4>🔁 Repeated Words</h4>
                        <span
                            v-for="rw in analysis.repeatedWords"
                            :key="rw.word"
                            class="ai-tag"
                            >{{ rw.word }} ({{ rw.count }}×)</span
                        >
                    </div>
                    <div class="ai-section">
                        <h4>💡 Quick Tips</h4>
                        <ul class="ai-tips">
                            <li v-if="analysis.avgWordsPerSentence > 25">
                                Sentences are very long — try breaking them up.
                            </li>
                            <li v-if="analysis.avgWordsPerSentence < 10">
                                Sentences are very short — mix in longer ones
                                for flow.
                            </li>
                            <li v-if="analysis.readingTime > 3">
                                This will take over
                                {{ analysis.readingTime }} min — check word
                                limit!
                            </li>
                            <li v-if="analysis.passiveHints > 3">
                                Found {{ analysis.passiveHints }} passive voice
                                hints — try active voice.
                            </li>
                            <li v-if="wordCount > essay.targetWordCount">
                                You're
                                {{ wordCount - essay.targetWordCount }} words
                                over!
                            </li>
                            <li v-if="wordCount < essay.targetWordCount">
                                You're
                                {{ essay.targetWordCount - wordCount }} words
                                short — keep going!
                            </li>
                            <li v-if="wordCount === essay.targetWordCount">
                                🎉 Perfect word count!
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="empty-text">Essay not found.</div>
    </div>
</template>

<style scoped>
.back-btn {
    background: none;
    border: none;
    color: #1e1b4b;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    margin-bottom: 16px;
}
.back-btn:hover {
    text-decoration: underline;
}
.detail-layout {
    display: flex;
    gap: 24px;
}
.detail-main {
    flex: 1;
}
.title-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}
.title-input {
    flex: 1;
    font-size: 22px;
    font-weight: 700;
    border: none;
    border-bottom: 2px solid var(--border-color);
    padding: 4px 0;
    background: transparent;
    color: var(--text-primary);
    font-family: inherit;
}
.title-input:focus {
    outline: none;
    border-bottom-color: #1e1b4b;
}
.status-pills {
    display: flex;
    gap: 6px;
}
.status-pill {
    padding: 5px 14px;
    border: 1px solid var(--border-color);
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    background: var(--bg-card);
    color: var(--text-secondary);
    cursor: pointer;
}
.status-pill.active.drafting {
    background: #dbeafe;
    color: #2563eb;
    border-color: #2563eb;
}
.status-pill.active.done {
    background: #d1fae5;
    color: #059669;
    border-color: #059669;
}
.status-pill.active:not(.drafting):not(.done) {
    background: #f3f4f6;
    color: #374151;
    border-color: #374151;
}
.prompt-box {
    background: rgba(30, 27, 75, 0.04);
    border-left: 3px solid #1e1b4b;
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 16px;
    font-size: 14px;
    color: var(--text-secondary);
}
.mode-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    border-bottom: 2px solid var(--border-color);
}
.mode-tabs button {
    padding: 8px 18px;
    border: none;
    background: none;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
}
.mode-tabs button.active {
    color: #1e1b4b;
    border-bottom-color: #1e1b4b;
}
.wc-display {
    font-size: 14px;
    font-weight: 600;
    color: #1e1b4b;
    margin-bottom: 8px;
    padding: 6px 14px;
    background: rgba(30, 27, 75, 0.05);
    border-radius: 8px;
    display: inline-block;
}
.big-textarea {
    width: 100%;
    min-height: 350px;
    padding: 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 15px;
    font-family: inherit;
    line-height: 1.7;
    resize: vertical;
    background: var(--bg-input);
    color: var(--text-primary);
    box-sizing: border-box;
}
.big-textarea:focus {
    outline: none;
    border-color: #1e1b4b;
    box-shadow: 0 0 0 3px rgba(30, 27, 75, 0.08);
}
.attach-area {
    padding: 24px;
    border: 2px dashed var(--border-color);
    border-radius: 10px;
    text-align: center;
}
.hint {
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 12px;
}
.attached-file {
    margin-top: 14px;
    padding: 10px 16px;
    background: var(--border-light);
    border-radius: 8px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
}
.link-btn {
    background: none;
    border: none;
    color: #1e1b4b;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
}

.ai-toggle {
    margin: 20px 0 12px;
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}
.ai-toggle:hover {
    opacity: 0.9;
}
.ai-panel {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 20px 24px;
    margin-bottom: 24px;
}
.ai-panel h3 {
    margin: 0 0 16px;
    font-size: 16px;
    color: var(--text-primary);
}
.ai-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 16px;
}
.ai-stat {
    text-align: center;
    padding: 10px;
    background: var(--border-light);
    border-radius: 8px;
    font-size: 12px;
    color: var(--text-secondary);
}
.ai-num {
    font-size: 20px;
    font-weight: 700;
    color: #1e1b4b;
}
.ai-section {
    margin-top: 14px;
}
.ai-section h4 {
    font-size: 14px;
    color: var(--text-primary);
    margin-bottom: 8px;
}
.ai-tag {
    display: inline-block;
    padding: 3px 10px;
    background: #fef3c7;
    color: #d97706;
    border-radius: 12px;
    font-size: 12px;
    margin: 2px 4px 2px 0;
}
.ai-tips {
    font-size: 13px;
    color: var(--text-secondary);
    padding-left: 18px;
}
.ai-tips li {
    margin-bottom: 4px;
}

.confetti-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
}
.confetti-piece {
    position: absolute;
    top: -20px;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    animation: confetti-fall 3s ease-in forwards;
}
@keyframes confetti-fall {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
    }
}
.empty-text {
    color: var(--text-secondary);
    text-align: center;
    padding: 40px 0;
}
</style>
