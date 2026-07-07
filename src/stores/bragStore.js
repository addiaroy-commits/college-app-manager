import { defineStore } from "pinia";
import { ref } from "vue";
import { getUserKey } from "./userKey";
export const useBragStore = defineStore("brag", () => {
    const items = ref([]);
    (function load() {
        const saved = localStorage.getItem(getUserKey("brag"));
        if (saved)
            items.value = JSON.parse(saved);
    })();
    function save() {
        localStorage.setItem(getUserKey("brag"), JSON.stringify(items.value));
    }
    function addItem(item) {
        items.value.push(item);
        save();
    }
    function updateItem(id, updated) {
        const idx = items.value.findIndex((i) => i.id === id);
        if (idx !== -1) {
            items.value[idx] = updated;
            save();
        }
    }
    function deleteItem(id) {
        items.value = items.value.filter((i) => i.id !== id);
        save();
    }
    function getByCategory(cat) {
        return items.value.filter((i) => i.category === cat);
    }
    return { items, addItem, updateItem, deleteItem, getByCategory };
});
