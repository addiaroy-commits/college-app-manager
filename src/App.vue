<script setup lang="ts">
import AppSidebar from "./components/AppSidebar.vue";
import ToastContainer from "./components/ToastContainer.vue";
import { useRoute } from "vue-router";

const route = useRoute();
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
    min-height: 100vh;
}
.main-content {
    flex: 1;
    padding: 32px;
    background: var(--bg-page);
    transition: background 0.3s;
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
