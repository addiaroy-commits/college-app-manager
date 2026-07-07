import { defineStore } from "pinia";
import { ref } from "vue";
import { getUserKey } from "./userKey";
export const useCostStore = defineStore("costs", () => {
    const costs = ref([]);
    (function load() {
        const saved = localStorage.getItem(getUserKey("costs"));
        if (saved)
            costs.value = JSON.parse(saved);
    })();
    function save() {
        localStorage.setItem(getUserKey("costs"), JSON.stringify(costs.value));
    }
    function addCost(cost) {
        costs.value.push(cost);
        save();
    }
    function updateCost(id, updated) {
        const idx = costs.value.findIndex((c) => c.id === id);
        if (idx !== -1) {
            costs.value[idx] = updated;
            save();
        }
    }
    function deleteCost(id) {
        costs.value = costs.value.filter((c) => c.id !== id);
        save();
    }
    function getCostByCollege(collegeId) {
        return costs.value.find((c) => c.collegeId === collegeId);
    }
    return { costs, addCost, updateCost, deleteCost, getCostByCollege };
});
