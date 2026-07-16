<script setup lang="ts">
import AppSidebar from "./components/AppSidebar.vue";
import ToastContainer from "./components/ToastContainer.vue";
import { useRoute } from "vue-router";
import { useThemeStore } from "./stores/themeStore";

const route = useRoute();
useThemeStore();
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
        <AppSidebar />
        <main class="main-content">
            <router-view v-slot="{ Component }">
                <transition name="slide-fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </main>
    </div>
    <ToastContainer />
</template>

<style scoped>
.guest-layout {
    min-height: 100vh;
}
.app-layout {
    display: flex;
    height: 100dvh;
    overflow: hidden;
}
.main-content {
    flex: 1;
    min-width: 0;
    height: 100dvh;
    padding: 32px;
    overflow: auto;
    overscroll-behavior: contain;
    background: var(--bg-page);
    transition: background 0.3s;
}

@media (max-width: 760px) {
    .app-layout { display: block; height: 100dvh; overflow: hidden; }
    .main-content { width: 100%; height: 100dvh; padding: 76px 14px 86px; overflow-x: hidden; overflow-y: auto; }
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
