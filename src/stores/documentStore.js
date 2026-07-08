import { defineStore } from "pinia";
import { ref } from "vue";
import { getUserKey } from "./userKey";
import { removeFile } from "../services/fileStorage";
export const useDocumentStore = defineStore("documents", () => {
    const documents = ref([]);
    (function load() {
        const saved = localStorage.getItem(getUserKey("documents"));
        if (saved)
            documents.value = JSON.parse(saved);
    })();
    function save() {
        localStorage.setItem(getUserKey("documents"), JSON.stringify(documents.value));
    }
    function addDocument(doc) {
        documents.value.push(doc);
        save();
    }
    function deleteDocument(id) {
        documents.value = documents.value.filter((d) => d.id !== id);
        save();
        removeFile(id).catch(() => { });
    }
    return { documents, addDocument, deleteDocument };
});
