import { ref } from "vue";
const toasts = ref([]);
let nextId = 0;
export function showToast(message, undoAction, undoLabel = "Undo") {
    const id = nextId++;
    toasts.value.push({ id, message, undoAction, undoLabel });
    if (undoAction) {
        setTimeout(() => removeToast(id), 5000);
    }
    else {
        setTimeout(() => removeToast(id), 3000);
    }
}
function removeToast(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
}
export function useToasts() {
    return { toasts, removeToast };
}
