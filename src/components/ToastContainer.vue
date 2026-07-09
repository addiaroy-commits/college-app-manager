<script setup lang="ts">
import { useToasts } from "../composables/useToast";

const { toasts, removeToast } = useToasts();

function undo(toast: any) {
    if (toast.undoAction) toast.undoAction();
    removeToast(toast.id);
}
</script>

<template>
    <div class="toast-container">
        <div v-for="toast in toasts" :key="toast.id" class="toast">
            <span>{{ toast.message }}</span>
            <button
                v-if="toast.undoAction"
                class="toast-undo"
                @click="undo(toast)"
            >
                {{ toast.undoLabel }}
            </button>
            <button class="toast-close" @click="removeToast(toast.id)">
                ✕
            </button>
        </div>
    </div>
</template>

<style scoped>
.toast-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 100000;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.toast {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 14px;
    color: var(--text-primary);
    min-width: 280px;
    animation: toast-in 0.3s ease;
}
@keyframes toast-in {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.toast-undo {
    background: var(--primary, #5b21b6);
    color: #fff;
    border: none;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
}
.toast-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 14px;
    padding: 2px;
}
</style>
