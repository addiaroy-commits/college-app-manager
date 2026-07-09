import { ref } from "vue";

interface Toast {
  id: number;
  message: string;
  undoAction?: () => void;
  undoLabel?: string;
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

export function showToast(message: string, undoAction?: () => void, undoLabel = "Undo") {
  const id = nextId++;
  toasts.value.push({ id, message, undoAction, undoLabel });
  if (undoAction) {
    setTimeout(() => removeToast(id), 5000);
  } else {
    setTimeout(() => removeToast(id), 3000);
  }
}

function removeToast(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

export function useToasts() {
  return { toasts, removeToast };
}
