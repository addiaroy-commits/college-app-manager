import { defineStore } from "pinia";
import { ref } from "vue";
import { getUserKey } from "./userKey";

export interface Essay {
  id: string;
  title: string;
  collegeId: string;
  collegeName: string;
  prompt: string;
  targetWordCount: number;
  currentWordCount: number;
  status: "Not Started" | "Drafting" | "Done";
  content: string;
  essayType?:
    | "college"
    | "common-app"
    | "scholarship"
    | "award"
    | "competition"
    | "fellowship"
    | "other";
}

export const useEssayStore = defineStore("essays", () => {
  const essays = ref<Essay[]>([]);

  (function load() {
    const saved = localStorage.getItem(getUserKey("essays"));
    if (saved) essays.value = JSON.parse(saved);
  })();

  function save() {
    localStorage.setItem(getUserKey("essays"), JSON.stringify(essays.value));
  }
  function addEssay(essay: Essay) {
    essays.value.push(essay);
    save();
  }
  function updateEssay(id: string, updated: Essay) {
    const idx = essays.value.findIndex((e) => e.id === id);
    if (idx !== -1) {
      essays.value[idx] = updated;
      save();
    }
  }
  function deleteEssay(id: string) {
    essays.value = essays.value.filter((e) => e.id !== id);
    save();
  }
  function getEssaysByCollege(collegeId: string) {
    return essays.value.filter((e) => e.collegeId === collegeId);
  }

  return { essays, addEssay, updateEssay, deleteEssay, getEssaysByCollege };
});
