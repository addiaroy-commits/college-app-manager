import { defineStore } from "pinia";
import { ref } from "vue";
import { getUserKey } from "./userKey";
export const useEssayStore = defineStore("essays", () => {
    const essays = ref([]);
    (function load() {
        const saved = localStorage.getItem(getUserKey("essays"));
        if (saved)
            essays.value = JSON.parse(saved);
    })();
    function save() {
        localStorage.setItem(getUserKey("essays"), JSON.stringify(essays.value));
    }
    function addEssay(essay) {
        essays.value.push(essay);
        save();
    }
    function updateEssay(id, updated) {
        const idx = essays.value.findIndex((e) => e.id === id);
        if (idx !== -1) {
            essays.value[idx] = updated;
            save();
        }
    }
    function deleteEssay(id) {
        essays.value = essays.value.filter((e) => e.id !== id);
        save();
    }
    function getEssaysByCollege(collegeId) {
        return essays.value.filter((e) => e.collegeId === collegeId);
    }
    return { essays, addEssay, updateEssay, deleteEssay, getEssaysByCollege };
});
