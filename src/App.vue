<script setup lang="ts">
import AppSidebar from "./components/AppSidebar.vue";
import { useRoute } from "vue-router";
import { ref } from "vue";

const route = useRoute();
const sidebarOpen = ref(false);
</script>

<template>
    <div v-if="route.meta.guest" class="guest-layout">
        <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
                <component :is="Component" />
            </transition>
        </router-view>
    </div>
    <div v-else class="app-layout">
        <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
        <main class="main-content">
            <button class="hamburger" @click="sidebarOpen = !sidebarOpen">
                ☰
            </button>
            <router-view v-slot="{ Component }">
                <transition name="slide-fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </main>
    </div>
</template>

<style scoped>
.guest-layout {
    min-height: 100vh;
}
.app-layout {
    display: flex;
    min-height: 100vh;
}
.main-content {
    flex: 1;
    padding: 32px;
    background: var(--bg-page);
    transition: background 0.3s;
    overflow-x: hidden;
}
.hamburger {
    display: none;
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 1000;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 20px;
    cursor: pointer;
    color: var(--text-primary);
}
@media (max-width: 768px) {
    .app-layout {
        flex-direction: column;
    }
    .main-content {
        padding: 56px 16px 16px;
        width: 100%;
    }
    .hamburger {
        display: block;
    }
}

/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
    transition: all 0.2s ease-in;
}
.slide-fade-enter-from {
    opacity: 0;
    transform: translateY(12px);
}
.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>
