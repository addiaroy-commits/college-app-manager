import { defineStore } from "pinia";
import { ref } from "vue";
import { getUserKey } from "./userKey";
export const useCollegeStore = defineStore("colleges", () => {
    const colleges = ref([]);
    (function load() {
        const saved = localStorage.getItem(getUserKey("colleges"));
        if (saved)
            colleges.value = JSON.parse(saved);
    })();
    function save() {
        localStorage.setItem(getUserKey("colleges"), JSON.stringify(colleges.value));
    }
    function addCollege(college) {
        colleges.value.push(college);
        save();
    }
    function updateCollege(id, updated) {
        const idx = colleges.value.findIndex((c) => c.id === id);
        if (idx !== -1) {
            colleges.value[idx] = updated;
            save();
        }
    }
    function deleteCollege(id) {
        colleges.value = colleges.value.filter((c) => c.id !== id);
        save();
    }
    return { colleges, addCollege, updateCollege, deleteCollege };
});
