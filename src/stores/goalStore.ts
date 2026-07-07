import { defineStore } from "pinia";
import { ref } from "vue";
import { getUserKey } from "./userKey";

export interface Goal {
  id: string;
  title: string;
  type:
    | "tuition"
    | "budget"
    | "colleges"
    | "essays"
    | "scholarship"
    | "sat"
    | "act"
    | "custom";
  target: number;
  unit: string;
  description: string;
}

export const useGoalStore = defineStore("goals", () => {
  const goals = ref<Goal[]>([]);

  (function load() {
    const saved = localStorage.getItem(getUserKey("goals"));
    if (saved) goals.value = JSON.parse(saved);
  })();

  function save() {
    localStorage.setItem(getUserKey("goals"), JSON.stringify(goals.value));
  }
  function addGoal(goal: Goal) {
    goals.value.push(goal);
    save();
  }
  function updateGoal(id: string, updated: Goal) {
    const idx = goals.value.findIndex((g) => g.id === id);
    if (idx !== -1) {
      goals.value[idx] = updated;
      save();
    }
  }
  function deleteGoal(id: string) {
    goals.value = goals.value.filter((g) => g.id !== id);
    save();
  }

  return { goals, addGoal, updateGoal, deleteGoal };
});
