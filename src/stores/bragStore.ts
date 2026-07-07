import { defineStore } from "pinia";
import { ref } from "vue";
import { getUserKey } from "./userKey";

export interface BragItem {
  id: string;
  category: string;
  customCategory?: string;
  data: Record<string, any>;
}

export const useBragStore = defineStore("brag", () => {
  const items = ref<BragItem[]>([]);

  (function load() {
    const saved = localStorage.getItem(getUserKey("brag"));
    if (saved) items.value = JSON.parse(saved);
  })();

  function save() {
    localStorage.setItem(getUserKey("brag"), JSON.stringify(items.value));
  }
  function addItem(item: BragItem) {
    items.value.push(item);
    save();
  }
  function updateItem(id: string, updated: BragItem) {
    const idx = items.value.findIndex((i) => i.id === id);
    if (idx !== -1) {
      items.value[idx] = updated;
      save();
    }
  }
  function deleteItem(id: string) {
    items.value = items.value.filter((i) => i.id !== id);
    save();
  }
  function getByCategory(cat: string) {
    return items.value.filter((i) => i.category === cat);
  }

  return { items, addItem, updateItem, deleteItem, getByCategory };
});
