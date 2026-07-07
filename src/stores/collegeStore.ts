import { defineStore } from "pinia";
import { ref } from "vue";
import { getUserKey } from "./userKey";

export interface College {
  id: string;
  name: string;
  category: "Reach" | "Target" | "Safety";
  deadline: string;
  applicationType: "ED" | "EA" | "RD" | "";
  applicationFee: number;
  notes: string;
}

export const useCollegeStore = defineStore("colleges", () => {
  const colleges = ref<College[]>([]);

  (function load() {
    const saved = localStorage.getItem(getUserKey("colleges"));
    if (saved) colleges.value = JSON.parse(saved);
  })();

  function save() {
    localStorage.setItem(
      getUserKey("colleges"),
      JSON.stringify(colleges.value),
    );
  }
  function addCollege(college: College) {
    colleges.value.push(college);
    save();
  }
  function updateCollege(id: string, updated: College) {
    const idx = colleges.value.findIndex((c) => c.id === id);
    if (idx !== -1) {
      colleges.value[idx] = updated;
      save();
    }
  }
  function deleteCollege(id: string) {
    colleges.value = colleges.value.filter((c) => c.id !== id);
    save();
  }

  return { colleges, addCollege, updateCollege, deleteCollege };
});
