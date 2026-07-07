<script setup lang="ts">
import { ref, computed } from "vue";
import { useDocumentStore, type Document } from "../stores/documentStore";
import { useCollegeStore } from "../stores/collegeStore";
import { useEssayStore } from "../stores/essayStore";
import { useBragStore } from "../stores/bragStore";
import { useScholarshipStore } from "../stores/scholarshipStore";
import { saveFile, loadFile } from "../services/fileStorage";

const docStore = useDocumentStore();
const collegeStore = useCollegeStore();
const essayStore = useEssayStore();
const bragStore = useBragStore();
const scholarshipStore = useScholarshipStore();

const showUpload = ref(false);
const uploading = ref(false);
const previewDoc = ref<UnifiedDoc | null>(null);
const editingId = ref<string | null>(null);
const searchQuery = ref("");

const form = ref({
    fileName: "",
    description: "",
    type: "Other" as Document["type"],
    selectedColleges: [] as string[],
});

interface UnifiedDoc {
    id: string;
    fileName: string;
    description: string;
    type: string;
    collegeIds: string[];
    collegeNames: string;
    fileData: string;
    fileType: string;
    dateAdded: string;
    source: "vault" | "essay" | "brag" | "scholarship";
    sourceLabel: string;
}

// Merge all documents from all sources
const allDocuments = computed<UnifiedDoc[]>(() => {
    const docs: UnifiedDoc[] = [];

    // 1. Document Vault
    docStore.documents.forEach((d) => {
        docs.push({
            ...d,
            source: "vault",
            sourceLabel: "Vault",
            collegeNames: getCollegeNamesFromIds(d.collegeIds),
        });
    });

    // 2. Essay attachments
    essayStore.essays.forEach((e) => {
        if (e.content?.startsWith("FILE:")) {
            const parts = e.content.split("|");
            docs.push({
                id: "essay-" + e.id,
                fileName: parts[1] || "essay-attachment",
                description: `Essay: ${e.title} for ${e.collegeName}`,
                type: "Other",
                collegeIds: e.collegeId ? [e.collegeId] : [],
                collegeNames: e.collegeName || "",
                fileData: parts[2] || "",
                fileType: parts[3] || "application/pdf",
                dateAdded: "",
                source: "essay",
                sourceLabel: "Essay",
            });
        }
    });

    // 3. Brag Sheet attachments
    bragStore.items.forEach((item) => {
        Object.entries(item.data).forEach(([key, val]) => {
            if (typeof val === "string" && val.startsWith("FILE:")) {
                const parts = val.split("|");
                docs.push({
                    id: "brag-" + item.id + "-" + key,
                    fileName: parts[1] || "brag-attachment",
                    description: `Brag Sheet: ${item.category} - ${key}`,
                    type: "Other",
                    collegeIds: [],
                    collegeNames: "",
                    fileData: parts[2] || "",
                    fileType: parts[3] || "application/pdf",
                    dateAdded: "",
                    source: "brag",
                    sourceLabel: "Brag Sheet",
                });
            }
        });
    });

    // 4. Scholarship attachments
    scholarshipStore.scholarships.forEach((s) => {
        s.docLinks.forEach((link) => {
            docs.push({
                id: "scholarship-" + link.id,
                fileName: link.fileName,
                description: "Scholarship: " + s.name,
                type: link.type,
                collegeIds: [],
                collegeNames: "",
                fileData: "",
                fileType: "",
                dateAdded: "",
                source: "scholarship",
                sourceLabel: "Scholarship",
            });
        });
    });

    return docs;
});

const filteredDocs = computed(() => {
    if (!searchQuery.value.trim()) return allDocuments.value;
    const q = searchQuery.value.toLowerCase();
    return allDocuments.value.filter(
        (d) =>
            d.fileName.toLowerCase().includes(q) ||
            d.description.toLowerCase().includes(q) ||
            d.type.toLowerCase().includes(q) ||
            d.collegeNames.toLowerCase().includes(q) ||
            d.sourceLabel.toLowerCase().includes(q),
    );
});

const fileInput = ref<HTMLInputElement | null>(null);
const docTypes = [
    "Transcript",
    "Resume",
    "Portfolio",
    "Recommendation",
    "Other",
];

function getCollegeNamesFromIds(collegeIds: string[]): string {
    return (
        collegeIds
            .map((id) => collegeStore.colleges.find((c) => c.id === id)?.name)
            .filter(Boolean)
            .join(", ") || "None"
    );
}

function getCollegeNames(doc: UnifiedDoc): string {
    if (doc.source !== "vault") return doc.collegeNames;
    return getCollegeNamesFromIds(doc.collegeIds);
}

function openAddForm() {
    editingId.value = null;
    form.value = {
        fileName: "",
        description: "",
        type: "Other",
        selectedColleges: [],
    };
    showUpload.value = true;
}

function openEditForm(doc: any) {
    if (doc.source !== "vault") return; // can't edit essay/brag docs
    editingId.value = doc.id;
    form.value = {
        fileName: doc.fileName,
        description: doc.description,
        type: doc.type,
        selectedColleges: [...doc.collegeIds],
    };
    showUpload.value = true;
}

function onFilePicked(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) form.value.fileName = file.name;
}

function toggleCollege(collegeId: string) {
    const idx = form.value.selectedColleges.indexOf(collegeId);
    idx === -1
        ? form.value.selectedColleges.push(collegeId)
        : form.value.selectedColleges.splice(idx, 1);
}

function saveDocument() {
    const input = fileInput.value;
    const hasNewFile = input?.files?.length && input.files[0];

    if (editingId.value && !hasNewFile) {
        const idx = docStore.documents.findIndex(
            (d) => d.id === editingId.value,
        );
        if (idx !== -1) {
            docStore.documents[idx] = {
                ...docStore.documents[idx],
                fileName:
                    form.value.fileName || docStore.documents[idx].fileName,
                description: form.value.description.trim(),
                type: form.value.type,
                collegeIds: [...form.value.selectedColleges],
            };
            localStorage.setItem(
                "applywise-documents",
                JSON.stringify(docStore.documents),
            );
        }
        showUpload.value = false;
        editingId.value = null;
        return;
    }

    if (!hasNewFile && !editingId.value) return;
    uploading.value = true;
    const file = input!.files![0];
    const reader = new FileReader();
    reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const docId = editingId.value || crypto.randomUUID();

        // Store file in IndexedDB
        await saveFile(
            docId,
            base64,
            file.type,
            form.value.fileName || file.name,
        );

        // Store metadata in localStorage (fileData stripped — data lives in IndexedDB)
        if (editingId.value) {
            const idx = docStore.documents.findIndex(
                (d) => d.id === editingId.value,
            );
            if (idx !== -1) {
                docStore.documents[idx] = {
                    id: editingId.value,
                    fileName: form.value.fileName || file.name,
                    description: form.value.description.trim(),
                    type: form.value.type,
                    collegeIds: [...form.value.selectedColleges],
                    fileData: "",
                    fileType: file.type,
                    dateAdded: docStore.documents[idx].dateAdded,
                };
                localStorage.setItem(
                    "applywise-documents",
                    JSON.stringify(docStore.documents),
                );
            }
        } else {
            docStore.addDocument({
                id: docId,
                fileName: form.value.fileName || file.name,
                description: form.value.description.trim(),
                type: form.value.type,
                collegeIds: [...form.value.selectedColleges],
                fileData: "",
                fileType: file.type,
                dateAdded: new Date().toISOString(),
            });
        }
        uploading.value = false;
        showUpload.value = false;
        editingId.value = null;
    };
    reader.readAsDataURL(file);
}

function openPreview(doc: UnifiedDoc) {
    previewDoc.value = doc;
}

async function downloadDocument(doc: UnifiedDoc) {
    let data = doc.fileData;
    // If fileData is empty, load from IndexedDB
    if (!data || data.length < 100) {
        const stored = await loadFile(doc.id);
        if (stored) data = stored.data;
    }
    if (!data) {
        alert("File data not available.");
        return;
    }
    const a = document.createElement("a");
    a.href = `data:${doc.fileType};base64,${data}`;
    a.download = doc.fileName;
    a.click();
}

function removeDocument(id: string, source: string) {
    if (source !== "vault") {
        alert(
            "Cannot delete from here. Remove the attachment from its source (Essay or Brag Sheet).",
        );
        return;
    }
    if (confirm("Delete this document?")) docStore.deleteDocument(id);
}

function typeBadgeClass(type: string) {
    const map: Record<string, string> = {
        Transcript: "type-transcript",
        Resume: "type-resume",
        Portfolio: "type-portfolio",
        Recommendation: "type-recommendation",
        Other: "type-other",
    };
    return map[type] ?? "type-other";
}

function sourceBadgeClass(source: string) {
    if (source === "essay") return "src-essay";
    if (source === "brag") return "src-brag";
    return "src-vault";
}
</script>

<template>
    <div>
        <div class="page-header">
            <h2>📁 Document Vault</h2>
            <button class="btn-add" @click="openAddForm">
                + Upload Document
            </button>
        </div>

        <input
            v-model="searchQuery"
            type="text"
            placeholder="🔍 Search all documents..."
            class="search-bar"
        />

        <!-- Upload/Edit Form -->
        <div v-if="showUpload" class="form-card">
            <h3>{{ editingId ? "Edit" : "Upload" }} Document</h3>
            <div class="form-grid">
                <div class="field">
                    <label
                        >Choose File
                        {{
                            editingId ? "(leave empty to keep current)" : "*"
                        }}</label
                    ><input
                        ref="fileInput"
                        type="file"
                        @change="onFilePicked"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                    />
                </div>
                <div class="field">
                    <label>File Name</label
                    ><input v-model="form.fileName" type="text" />
                </div>
                <div class="field">
                    <label>Type</label
                    ><select v-model="form.type">
                        <option v-for="t in docTypes" :key="t" :value="t">
                            {{ t }}
                        </option>
                    </select>
                </div>
                <div class="field">
                    <label>Description</label
                    ><textarea v-model="form.description" rows="2"></textarea>
                </div>
            </div>
            <div class="field">
                <label>Link to Colleges</label>
                <div class="college-chips">
                    <label
                        v-for="college in collegeStore.colleges"
                        :key="college.id"
                        class="chip"
                        :class="{
                            selected: form.selectedColleges.includes(
                                college.id,
                            ),
                        }"
                        @click="toggleCollege(college.id)"
                        >{{ college.name }}</label
                    ><span
                        v-if="collegeStore.colleges.length === 0"
                        class="hint"
                        >No colleges yet.</span
                    >
                </div>
            </div>
            <div class="form-actions">
                <button
                    class="btn-save"
                    @click="saveDocument"
                    :disabled="uploading"
                >
                    {{
                        uploading
                            ? "Saving..."
                            : editingId
                              ? "Update"
                              : "Upload"
                    }}</button
                ><button class="btn-cancel" @click="showUpload = false">
                    Cancel
                </button>
            </div>
        </div>

        <p v-if="filteredDocs.length === 0 && !showUpload" class="empty-text">
            {{
                searchQuery
                    ? 'No documents match "' + searchQuery + '"'
                    : "No documents yet. Upload files or attach them in Essays & Brag Sheet!"
            }}
        </p>

        <div v-else class="doc-list">
            <div
                v-for="doc in filteredDocs"
                :key="doc.id"
                class="doc-card"
                @click="openPreview(doc)"
            >
                <div class="doc-thumb">
                    <img
                        v-if="doc.fileType.startsWith('image')"
                        :src="
                            'data:' + doc.fileType + ';base64,' + doc.fileData
                        "
                        class="thumb-img"
                    /><span v-else class="thumb-icon">{{
                        doc.fileName.endsWith(".pdf") ? "📄" : "📎"
                    }}</span>
                </div>
                <div class="doc-info">
                    <div class="doc-name">{{ doc.fileName }}</div>
                    <div class="doc-meta">
                        <span v-if="doc.description">{{
                            doc.description
                        }}</span>
                        <span>🏫 {{ getCollegeNames(doc) || "—" }}</span>
                        <span
                            class="source-badge"
                            :class="sourceBadgeClass(doc.source)"
                            >{{ doc.sourceLabel }}</span
                        >
                    </div>
                </div>
                <span class="type-badge" :class="typeBadgeClass(doc.type)">{{
                    doc.type
                }}</span>
                <div class="card-actions">
                    <button
                        v-if="doc.source === 'vault'"
                        class="btn-icon edit"
                        @click.stop="openEditForm(doc)"
                        title="Edit"
                    >
                        ✏️
                    </button>
                    <button
                        class="btn-icon download"
                        @click.stop="downloadDocument(doc)"
                        title="Download"
                    >
                        ⬇️
                    </button>
                    <button
                        class="btn-icon delete"
                        @click.stop="removeDocument(doc.id, doc.source)"
                        title="Delete"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>

        <!-- Preview Modal -->
        <div
            v-if="previewDoc"
            class="preview-overlay"
            @click="previewDoc = null"
        >
            <div class="preview-modal" @click.stop>
                <div class="preview-header">
                    <h3>{{ previewDoc.fileName }}</h3>
                    <button class="btn-close" @click="previewDoc = null">
                        ✕
                    </button>
                </div>
                <div class="preview-body">
                    <img
                        v-if="previewDoc.fileType.startsWith('image')"
                        :src="
                            'data:' +
                            previewDoc.fileType +
                            ';base64,' +
                            previewDoc.fileData
                        "
                        class="preview-image"
                    />
                    <iframe
                        v-else-if="previewDoc.fileType === 'application/pdf'"
                        :src="
                            'data:application/pdf;base64,' + previewDoc.fileData
                        "
                        class="preview-pdf"
                    ></iframe>
                    <div v-else class="preview-fallback">
                        <div class="fallback-icon">📎</div>
                        <p>Preview not available.</p>
                        <button
                            class="btn-save"
                            @click="downloadDocument(previewDoc!)"
                        >
                            ⬇️ Download
                        </button>
                    </div>
                </div>
                <div class="preview-footer">
                    <span>{{ previewDoc.type }}</span
                    ><span>🏫 {{ getCollegeNames(previewDoc) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}
.page-header h2 {
    margin-bottom: 0;
}
.btn-add {
    background: #1e1b4b;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}
.btn-add:hover {
    background: #2d2868;
}

.search-bar {
    width: 100%;
    padding: 10px 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 18px;
    background: var(--bg-input);
    color: var(--text-primary);
    font-family: inherit;
    box-sizing: border-box;
}
.search-bar:focus {
    outline: none;
    border-color: #1e1b4b;
    box-shadow: 0 0 0 2px rgba(30, 27, 75, 0.15);
}

.form-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 24px;
    margin-bottom: 24px;
}
.form-card h3 {
    margin: 0 0 16px;
    font-size: 18px;
    color: var(--text-primary);
}
.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}
.field {
    margin-bottom: 16px;
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
.field input:focus,
.field select:focus,
.field textarea:focus {
    outline: none;
    border-color: #1e1b4b;
    box-shadow: 0 0 0 2px rgba(30, 27, 75, 0.15);
}
.college-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
.chip {
    padding: 6px 14px;
    border: 1px solid var(--border-color);
    border-radius: 20px;
    font-size: 13px;
    cursor: pointer;
    user-select: none;
    background: var(--bg-card);
    color: var(--text-secondary);
}
.chip:hover {
    background: var(--border-light);
}
.chip.selected {
    background: #1e1b4b;
    color: #fff;
    border-color: #1e1b4b;
}
.hint {
    color: var(--text-secondary);
    font-size: 13px;
    padding: 6px 0;
}
.form-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}
.btn-save {
    background: #059669;
    color: #fff;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}
.btn-save:hover {
    background: #047857;
}
.btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
.btn-cancel {
    background: var(--border-light);
    color: var(--text-primary);
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}
.btn-cancel:hover {
    background: var(--border-color);
}

.doc-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.doc-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
}
.doc-card:hover {
    box-shadow: var(--shadow);
}
.doc-thumb {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--border-light);
}
.thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.thumb-icon {
    font-size: 24px;
}
.doc-info {
    flex: 1;
}
.doc-name {
    font-weight: 600;
    font-size: 15px;
    color: var(--text-primary);
}
.doc-meta {
    display: flex;
    gap: 14px;
    margin-top: 4px;
    font-size: 13px;
    color: var(--text-secondary);
    flex-wrap: wrap;
    align-items: center;
}
.source-badge {
    padding: 1px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
}
.src-vault {
    background: #ede4f6;
    color: #5b21b6;
}
.src-essay {
    background: #dbeafe;
    color: #2563eb;
}
.src-brag {
    background: #fef3c7;
    color: #d97706;
}
.type-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
}
.type-transcript {
    background: #ede9fe;
    color: #7c3aed;
}
.type-resume {
    background: #dbeafe;
    color: #2563eb;
}
.type-portfolio {
    background: #fce7f3;
    color: #db2777;
}
.type-recommendation {
    background: #fef3c7;
    color: #d97706;
}
.type-other {
    background: #f3f4f6;
    color: #6b7280;
}
.card-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
}
.btn-icon {
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
}
.btn-icon.edit:hover {
    background: #fef3c7;
}
.btn-icon.download:hover {
    background: #dbeafe;
}
.btn-icon.delete:hover {
    background: #fee2e2;
}
.empty-text {
    color: var(--text-secondary);
    font-size: 15px;
    text-align: center;
    padding: 40px 0;
}

.preview-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 32px;
}
.preview-modal {
    background: var(--bg-card);
    border-radius: 12px;
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border-color);
}
.preview-header h3 {
    margin: 0;
    font-size: 16px;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.btn-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 4px 8px;
    border-radius: 6px;
}
.btn-close:hover {
    background: var(--border-light);
    color: var(--text-primary);
}
.preview-body {
    flex: 1;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
}
.preview-image {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
}
.preview-pdf {
    width: 100%;
    height: 70vh;
    border: none;
}
.preview-fallback {
    text-align: center;
    padding: 40px;
    color: var(--text-secondary);
}
.fallback-icon {
    font-size: 64px;
    margin-bottom: 16px;
}
.preview-footer {
    display: flex;
    justify-content: space-between;
    padding: 12px 24px;
    border-top: 1px solid var(--border-color);
    font-size: 13px;
    color: var(--text-secondary);
}
</style>
