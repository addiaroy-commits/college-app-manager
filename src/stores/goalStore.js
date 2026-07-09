import { defineStore } from "pinia";
import { ref } from "vue";
import { getUserKey } from "./userKey";
export const useGoalStore = defineStore("goals", () => {
    const goals = ref([]);
    (function load() {
        const saved = localStorage.getItem(getUserKey("goals"));
        if (saved)
            goals.value = JSON.parse(saved);
    })();
    function save() {
        localStorage.setItem(getUserKey("goals"), JSON.stringify(goals.value));
    }
    function addGoal(goal) {
        goals.value.push(goal);
        save();
    }
    function updateGoal(id, updated) {
        const idx = goals.value.findIndex((g) => g.id === id);
        if (idx !== -1) {
            goals.value[idx] = updated;
            save();
        }
    }
    function deleteGoal(id) {
        goals.value = goals.value.filter((g) => g.id !== id);
        save();
    }
    return { goals, addGoal, updateGoal, deleteGoal };
});
