import { ref, computed } from "vue";
import { useDocumentStore } from "../stores/documentStore";
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
const previewDoc = ref(null);
const editingId = ref(null);
const searchQuery = ref("");
const form = ref({
    fileName: "",
    description: "",
    type: "Other",
    selectedColleges: [],
});
// Merge all documents from all sources
const allDocuments = computed(() => {
    const docs = [];
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
    if (!searchQuery.value.trim())
        return allDocuments.value;
    const q = searchQuery.value.toLowerCase();
    return allDocuments.value.filter((d) => d.fileName.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        d.collegeNames.toLowerCase().includes(q) ||
        d.sourceLabel.toLowerCase().includes(q));
});
const fileInput = ref(null);
const docTypes = [
    "Transcript",
    "Resume",
    "Portfolio",
    "Recommendation",
    "Other",
];
function getCollegeNamesFromIds(collegeIds) {
    return (collegeIds
        .map((id) => collegeStore.colleges.find((c) => c.id === id)?.name)
        .filter(Boolean)
        .join(", ") || "None");
}
function getCollegeNames(doc) {
    if (doc.source !== "vault")
        return doc.collegeNames;
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
function openEditForm(doc) {
    if (doc.source !== "vault")
        return; // can't edit essay/brag docs
    editingId.value = doc.id;
    form.value = {
        fileName: doc.fileName,
        description: doc.description,
        type: doc.type,
        selectedColleges: [...doc.collegeIds],
    };
    showUpload.value = true;
}
function onFilePicked(event) {
    const input = event.target;
    const file = input.files?.[0];
    if (file)
        form.value.fileName = file.name;
}
function toggleCollege(collegeId) {
    const idx = form.value.selectedColleges.indexOf(collegeId);
    idx === -1
        ? form.value.selectedColleges.push(collegeId)
        : form.value.selectedColleges.splice(idx, 1);
}
function saveDocument() {
    const input = fileInput.value;
    const hasNewFile = input?.files?.length && input.files[0];
    if (editingId.value && !hasNewFile) {
        const idx = docStore.documents.findIndex((d) => d.id === editingId.value);
        if (idx !== -1) {
            docStore.documents[idx] = {
                ...docStore.documents[idx],
                fileName: form.value.fileName || docStore.documents[idx].fileName,
                description: form.value.description.trim(),
                type: form.value.type,
                collegeIds: [...form.value.selectedColleges],
            };
            localStorage.setItem("applywise-documents", JSON.stringify(docStore.documents));
        }
        showUpload.value = false;
        editingId.value = null;
        return;
    }
    if (!hasNewFile && !editingId.value)
        return;
    uploading.value = true;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = async () => {
        const base64 = reader.result.split(",")[1];
        const docId = editingId.value || crypto.randomUUID();
        // Store file in IndexedDB
        await saveFile(docId, base64, file.type, form.value.fileName || file.name);
        // Store metadata in localStorage (fileData stripped — data lives in IndexedDB)
        if (editingId.value) {
            const idx = docStore.documents.findIndex((d) => d.id === editingId.value);
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
                localStorage.setItem("applywise-documents", JSON.stringify(docStore.documents));
            }
        }
        else {
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
function openPreview(doc) {
    previewDoc.value = doc;
}
async function downloadDocument(doc) {
    let data = doc.fileData;
    // If fileData is empty, load from IndexedDB
    if (!data || data.length < 100) {
        const stored = await loadFile(doc.id);
        if (stored)
            data = stored.data;
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
function removeDocument(id, source) {
    if (source !== "vault") {
        alert("Cannot delete from here. Remove the attachment from its source (Essay or Brag Sheet).");
        return;
    }
    if (confirm("Delete this document?"))
        docStore.deleteDocument(id);
}
function typeBadgeClass(type) {
    const map = {
        Transcript: "type-transcript",
        Resume: "type-resume",
        Portfolio: "type-portfolio",
        Recommendation: "type-recommendation",
        Other: "type-other",
    };
    return map[type] ?? "type-other";
}
function sourceBadgeClass(source) {
    if (source === "essay")
        return "src-essay";
    if (source === "brag")
        return "src-brag";
    return "src-vault";
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-add']} */ ;
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['chip']} */ ;
/** @type {__VLS_StyleScopedClasses['chip']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-cancel']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-card']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.openAddForm) },
    ...{ class: "btn-add" },
});
/** @type {__VLS_StyleScopedClasses['btn-add']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    value: (__VLS_ctx.searchQuery),
    type: "text",
    placeholder: "🔍 Search all documents...",
    ...{ class: "search-bar" },
});
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
if (__VLS_ctx.showUpload) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-card" },
    });
    /** @type {__VLS_StyleScopedClasses['form-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (__VLS_ctx.editingId ? "Edit" : "Upload");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    (__VLS_ctx.editingId ? "(leave empty to keep current)" : "*");
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onChange: (__VLS_ctx.onFilePicked) },
        ref: "fileInput",
        type: "file",
        accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (__VLS_ctx.form.fileName),
        type: "text",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_ctx.form.type),
    });
    for (const [t] of __VLS_vFor((__VLS_ctx.docTypes))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (t),
            value: (t),
        });
        (t);
        // @ts-ignore
        [openAddForm, searchQuery, showUpload, editingId, editingId, onFilePicked, form, form, docTypes,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        value: (__VLS_ctx.form.description),
        rows: "2",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "college-chips" },
    });
    /** @type {__VLS_StyleScopedClasses['college-chips']} */ ;
    for (const [college] of __VLS_vFor((__VLS_ctx.collegeStore.colleges))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showUpload))
                        throw 0;
                    return __VLS_ctx.toggleCollege(college.id);
                    // @ts-ignore
                    [form, collegeStore, toggleCollege,];
                } },
            key: (college.id),
            ...{ class: "chip" },
            ...{ class: ({
                    selected: __VLS_ctx.form.selectedColleges.includes(college.id),
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['chip']} */ ;
        /** @type {__VLS_StyleScopedClasses['selected']} */ ;
        (college.name);
        // @ts-ignore
        [form,];
    }
    if (__VLS_ctx.collegeStore.colleges.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "hint" },
        });
        /** @type {__VLS_StyleScopedClasses['hint']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.saveDocument) },
        ...{ class: "btn-save" },
        disabled: (__VLS_ctx.uploading),
    });
    /** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
    (__VLS_ctx.uploading
        ? "Saving..."
        : __VLS_ctx.editingId
            ? "Update"
            : "Upload");
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showUpload))
                    throw 0;
                return __VLS_ctx.showUpload = false;
                // @ts-ignore
                [showUpload, editingId, collegeStore, saveDocument, uploading, uploading,];
            } },
        ...{ class: "btn-cancel" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-cancel']} */ ;
}
if (__VLS_ctx.filteredDocs.length === 0 && !__VLS_ctx.showUpload) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "empty-text" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
    (__VLS_ctx.searchQuery
        ? 'No documents match "' + __VLS_ctx.searchQuery + '"'
        : "No documents yet. Upload files or attach them in Essays & Brag Sheet!");
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "doc-list" },
    });
    /** @type {__VLS_StyleScopedClasses['doc-list']} */ ;
    for (const [doc] of __VLS_vFor((__VLS_ctx.filteredDocs))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.filteredDocs.length === 0 && !__VLS_ctx.showUpload))
                        throw 0;
                    return __VLS_ctx.openPreview(doc);
                    // @ts-ignore
                    [searchQuery, searchQuery, showUpload, filteredDocs, filteredDocs, openPreview,];
                } },
            key: (doc.id),
            ...{ class: "doc-card" },
        });
        /** @type {__VLS_StyleScopedClasses['doc-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "doc-thumb" },
        });
        /** @type {__VLS_StyleScopedClasses['doc-thumb']} */ ;
        if (doc.fileType.startsWith('image')) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                src: ('data:' + doc.fileType + ';base64,' + doc.fileData),
                ...{ class: "thumb-img" },
            });
            /** @type {__VLS_StyleScopedClasses['thumb-img']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "thumb-icon" },
            });
            /** @type {__VLS_StyleScopedClasses['thumb-icon']} */ ;
            (doc.fileName.endsWith(".pdf") ? "📄" : "📎");
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "doc-info" },
        });
        /** @type {__VLS_StyleScopedClasses['doc-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "doc-name" },
        });
        /** @type {__VLS_StyleScopedClasses['doc-name']} */ ;
        (doc.fileName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "doc-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['doc-meta']} */ ;
        if (doc.description) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (doc.description);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.getCollegeNames(doc) || "—");
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "source-badge" },
            ...{ class: (__VLS_ctx.sourceBadgeClass(doc.source)) },
        });
        /** @type {__VLS_StyleScopedClasses['source-badge']} */ ;
        (doc.sourceLabel);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "type-badge" },
            ...{ class: (__VLS_ctx.typeBadgeClass(doc.type)) },
        });
        /** @type {__VLS_StyleScopedClasses['type-badge']} */ ;
        (doc.type);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-actions" },
        });
        /** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
        if (doc.source === 'vault') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.filteredDocs.length === 0 && !__VLS_ctx.showUpload))
                            throw 0;
                        if (!(doc.source === 'vault'))
                            throw 0;
                        return __VLS_ctx.openEditForm(doc);
                        // @ts-ignore
                        [getCollegeNames, sourceBadgeClass, typeBadgeClass, openEditForm,];
                    } },
                ...{ class: "btn-icon edit" },
                title: "Edit",
            });
            /** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
            /** @type {__VLS_StyleScopedClasses['edit']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.filteredDocs.length === 0 && !__VLS_ctx.showUpload))
                        throw 0;
                    return __VLS_ctx.downloadDocument(doc);
                    // @ts-ignore
                    [downloadDocument,];
                } },
            ...{ class: "btn-icon download" },
            title: "Download",
        });
        /** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
        /** @type {__VLS_StyleScopedClasses['download']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.filteredDocs.length === 0 && !__VLS_ctx.showUpload))
                        throw 0;
                    return __VLS_ctx.removeDocument(doc.id, doc.source);
                    // @ts-ignore
                    [removeDocument,];
                } },
            ...{ class: "btn-icon delete" },
            title: "Delete",
        });
        /** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
        /** @type {__VLS_StyleScopedClasses['delete']} */ ;
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.previewDoc) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.previewDoc))
                    throw 0;
                return __VLS_ctx.previewDoc = null;
                // @ts-ignore
                [previewDoc, previewDoc,];
            } },
        ...{ class: "preview-overlay" },
    });
    /** @type {__VLS_StyleScopedClasses['preview-overlay']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: () => { } },
        ...{ class: "preview-modal" },
    });
    /** @type {__VLS_StyleScopedClasses['preview-modal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "preview-header" },
    });
    /** @type {__VLS_StyleScopedClasses['preview-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (__VLS_ctx.previewDoc.fileName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.previewDoc))
                    throw 0;
                return __VLS_ctx.previewDoc = null;
                // @ts-ignore
                [previewDoc, previewDoc,];
            } },
        ...{ class: "btn-close" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "preview-body" },
    });
    /** @type {__VLS_StyleScopedClasses['preview-body']} */ ;
    if (__VLS_ctx.previewDoc.fileType.startsWith('image')) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: ('data:' +
                __VLS_ctx.previewDoc.fileType +
                ';base64,' +
                __VLS_ctx.previewDoc.fileData),
            ...{ class: "preview-image" },
        });
        /** @type {__VLS_StyleScopedClasses['preview-image']} */ ;
    }
    else if (__VLS_ctx.previewDoc.fileType === 'application/pdf') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.iframe, __VLS_intrinsics.iframe)({
            src: ('data:application/pdf;base64,' + __VLS_ctx.previewDoc.fileData),
            ...{ class: "preview-pdf" },
        });
        /** @type {__VLS_StyleScopedClasses['preview-pdf']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "preview-fallback" },
        });
        /** @type {__VLS_StyleScopedClasses['preview-fallback']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "fallback-icon" },
        });
        /** @type {__VLS_StyleScopedClasses['fallback-icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.previewDoc))
                        throw 0;
                    if (!!(__VLS_ctx.previewDoc.fileType.startsWith('image')))
                        throw 0;
                    if (!!(__VLS_ctx.previewDoc.fileType === 'application/pdf'))
                        throw 0;
                    return __VLS_ctx.downloadDocument(__VLS_ctx.previewDoc);
                    // @ts-ignore
                    [downloadDocument, previewDoc, previewDoc, previewDoc, previewDoc, previewDoc, previewDoc,];
                } },
            ...{ class: "btn-save" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "preview-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['preview-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.previewDoc.type);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.getCollegeNames(__VLS_ctx.previewDoc));
}
// @ts-ignore
[getCollegeNames, previewDoc, previewDoc,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
