<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEssayStore, type Essay } from "../stores/essayStore";
import { useCollegeStore } from "../stores/collegeStore";

const route = useRoute();
const router = useRouter();
const essayStore = useEssayStore();
const collegeStore = useCollegeStore();

const collegeId = route.params.collegeId as string;
const college = computed(() =>
    collegeStore.colleges.find((c) => c.id === collegeId),
);

const showEditor = ref(false);
const editingId = ref<string | null>(null);
const essayContent = ref("");

const form = ref({
    title: "",
    prompt: "",
    targetWordCount: 650,
    status: "Not Started" as Essay["status"],
});

const collegeEssays = computed(() =>
    essayStore.essays.filter((e) => e.collegeId === collegeId),
);

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
    if (!form.value.title.trim()) return;
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
    } else {
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

function statusColor(s: string) {
    if (s === "Done") return "status-done";
    if (s === "Drafting") return "status-drafting";
    return "status-not-started";
}
</script>

<template>
    <div>
        <button class="back-btn" @click="router.push('/essays')">
            ⬆ Back to All Colleges
        </button>
        <div class="page-header">
            <h2>📝 {{ college?.name ?? "College" }}</h2>
            <span
                class="category-badge"
                :class="college?.category?.toLowerCase()"
                >{{ college?.category }}</span
            >
        </div>

        <p v-if="collegeEssays.length === 0 && !showEditor" class="empty-text">
            No essays yet for {{ college?.name }}.
        </p>

        <div
            v-for="essay in collegeEssays"
            :key="essay.id"
            class="essay-card"
            @click="
                router.push(
                    '/essays/college/' + collegeId + '/essay/' + essay.id,
                )
            "
        >
            <div class="essay-info">
                <div class="essay-title">{{ essay.title }}</div>
                <div class="essay-meta">
                    📝 {{ essay.currentWordCount }} /
                    {{ essay.targetWordCount }} words · 💬
                    {{
                        essay.prompt
                            ? essay.prompt.slice(0, 50) + "..."
                            : "No prompt"
                    }}
                </div>
            </div>
            <span class="status-badge" :class="statusColor(essay.status)">{{
                essay.status
            }}</span>
        </div>

        <button class="btn-add" @click="openAddEssay" style="margin-top: 20px">
            + Add Essay
        </button>

        <!-- Editor Modal -->
        <div
            v-if="showEditor"
            class="modal-overlay"
            @click="showEditor = false"
        >
            <div class="modal" @click.stop>
                <div class="modal-header">
                    <h3>{{ editingId ? "Edit" : "New" }} Essay</h3>
                    <button class="btn-close" @click="showEditor = false">
                        ✕
                    </button>
                </div>
                <div class="modal-body">
                    <div class="field">
                        <label>Title *</label
                        ><input v-model="form.title" type="text" />
                    </div>
                    <div class="field">
                        <label>Prompt</label
                        ><textarea v-model="form.prompt" rows="2"></textarea>
                    </div>
                    <div class="form-row">
                        <div class="field">
                            <label>Target Words</label
                            ><input
                                v-model.number="form.targetWordCount"
                                type="number"
                            />
                        </div>
                        <div class="field" v-if="editingId">
                            <label>Status</label
                            ><select v-model="form.status">
                                <option value="Not Started">Not Started</option>
                                <option value="Drafting">Drafting</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                    </div>
                    <div v-if="editingId" class="editor-area">
                        <div class="word-counter">
                            {{ currentWordCount }} /
                            {{ form.targetWordCount }} words
                        </div>
                        <textarea
                            v-model="essayContent"
                            class="essay-textarea"
                        ></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-save" @click="saveEssay">
                        {{ editingId ? "Save" : "Add" }}
                    </button>
                    <button class="btn-cancel" @click="showEditor = false">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
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
.page-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
}
.page-header h2 {
    margin-bottom: 0;
}
.essay-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
    cursor: pointer;
}
.essay-card:hover {
    box-shadow: var(--shadow);
    border-color: #1e1b4b;
}
.essay-info {
    flex: 1;
}
.essay-title {
    font-weight: 600;
    font-size: 15px;
    color: var(--text-primary);
}
.essay-meta {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 3px;
}
.status-badge {
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
}
.status-not-started {
    background: #f3f4f6;
    color: #6b7280;
}
.status-drafting {
    background: #dbeafe;
    color: #2563eb;
}
.status-done {
    background: #d1fae5;
    color: #059669;
}
.category-badge {
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}
.category-badge.reach {
    background: #fee2e2;
    color: #dc2626;
}
.category-badge.target {
    background: #fef3c7;
    color: #d97706;
}
.category-badge.safety {
    background: #d1fae5;
    color: #059669;
}
.btn-add {
    background: #1e1b4b;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}
.btn-save {
    background: #059669;
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}
.btn-cancel {
    background: var(--border-light);
    color: var(--text-primary);
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
}
.btn-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--text-secondary);
}
.empty-text {
    color: var(--text-secondary);
    text-align: center;
    padding: 40px 0;
}
.field {
    margin-bottom: 14px;
}
.field label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 4px;
}
.field input,
.field select,
.field textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    background: var(--bg-input);
    color: var(--text-primary);
    box-sizing: border-box;
}
.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
}
.editor-area {
    margin-top: 10px;
    border-top: 1px solid var(--border-color);
    padding-top: 14px;
}
.word-counter {
    font-size: 13px;
    font-weight: 600;
    color: #1e1b4b;
    margin-bottom: 8px;
    padding: 6px 12px;
    background: rgba(30, 27, 75, 0.05);
    border-radius: 6px;
    display: inline-block;
}
.essay-textarea {
    width: 100%;
    min-height: 180px;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    line-height: 1.6;
    resize: vertical;
    background: var(--bg-input);
    color: var(--text-primary);
    box-sizing: border-box;
}
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9998;
    padding: 32px;
}
.modal {
    background: var(--bg-card);
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px;
    border-bottom: 1px solid var(--border-color);
}
.modal-header h3 {
    margin: 0;
    font-size: 17px;
    color: var(--text-primary);
}
.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
}
.modal-footer {
    display: flex;
    gap: 8px;
    padding: 14px 24px;
    border-top: 1px solid var(--border-color);
}
</style>
