import { defineStore } from "pinia";
import { ref } from "vue";
import { getUserKey } from "./userKey";
import { removeFile } from "../services/fileStorage";

export interface Document {
  id: string;
  fileName: string;
  description: string;
  type: "Transcript" | "Resume" | "Portfolio" | "Recommendation" | "Other";
  collegeIds: string[];
  fileData: string;
  fileType: string;
  dateAdded: string;
}

export const useDocumentStore = defineStore("documents", () => {
  const documents = ref<Document[]>([]);

  (function load() {
    const saved = localStorage.getItem(getUserKey("documents"));
    if (saved) documents.value = JSON.parse(saved);
  })();

  function save() {
    localStorage.setItem(
      getUserKey("documents"),
      JSON.stringify(documents.value),
    );
  }
  function addDocument(doc: Document) {
    documents.value.push(doc);
    save();
  }
  function deleteDocument(id: string) {
    documents.value = documents.value.filter((d) => d.id !== id);
    save();
    removeFile(id).catch(() => {});
  }

  return { documents, addDocument, deleteDocument };
});
