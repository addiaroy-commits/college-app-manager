import { defineStore } from "pinia";
import { ref } from "vue";
import { getUserKey } from "./userKey";

export interface CollegeCost {
  id: string;
  collegeId: string;
  collegeName: string;
  stickerTuition: number;
  stickerRoom: number;
  stickerFees: number;
  stickerTotal: number;
  grantsScholarships: number;
  netCost: number;
  familyContribution: number;
  gap: number;
  federalLoans: number;
  privateLoans: number;
  loanRate: number;
  notes: string;
}

export const useCostStore = defineStore("costs", () => {
  const costs = ref<CollegeCost[]>([]);

  (function load() {
    const saved = localStorage.getItem(getUserKey("costs"));
    if (saved) costs.value = JSON.parse(saved);
  })();

  function save() {
    localStorage.setItem(getUserKey("costs"), JSON.stringify(costs.value));
  }

  function addCost(cost: CollegeCost) {
    costs.value.push(cost);
    save();
  }
  function updateCost(id: string, updated: CollegeCost) {
    const idx = costs.value.findIndex((c) => c.id === id);
    if (idx !== -1) {
      costs.value[idx] = updated;
      save();
    }
  }
  function deleteCost(id: string) {
    costs.value = costs.value.filter((c) => c.id !== id);
    save();
  }
  function getCostByCollege(collegeId: string) {
    return costs.value.find((c) => c.collegeId === collegeId);
  }

  return { costs, addCost, updateCost, deleteCost, getCostByCollege };
});
