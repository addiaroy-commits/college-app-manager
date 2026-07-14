<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
import NotificationCenter from "./NotificationCenter.vue";
import { isDemoMode } from "../services/demoMode";
const user = useUserStore();
const route = useRoute();
const router = useRouter();
const mobileOpen = ref(false);
const demoActive = computed(() => isDemoMode());
watch(() => route.fullPath, () => { mobileOpen.value = false; });

const navSections = [
    {
        label: "",
        items: [{ path: "/", label: "📊 Dashboard", name: "dashboard" }],
    },
    {
        label: "Applications",
        items: [
            { path: "/colleges", label: "🏫 College List", name: "colleges" },
            { path: "/research", label: "🔎 Research & Compare", name: "research" },
            { path: "/applications", label: "🗂️ Applications", name: "applications" },
            { path: "/essays", label: "✍️ Essays", name: "essays" },
            { path: "/ai-studio", label: "AI Studio", name: "ai-studio" },
        ],
    },
    {
        label: "Profile",
        items: [
            { path: "/majors", label: "🎓 Majors", name: "majors" },
            { path: "/brag", label: "🌟 Brag Sheet", name: "brag" },
            { path: "/documents", label: "📁 Documents", name: "documents" },
        ],
    },
    {
        label: "Money",
        items: [
            { path: "/costs", label: "💰 Costs", name: "costs" },
            { path: "/scholarships", label: "🎓 Scholarships", name: "scholarships" },
        ],
    },
    {
        label: "Progress",
        items: [
            { path: "/goals", label: "🎯 Goals", name: "goals" },
            { path: "/stats", label: "📊 Stats", name: "stats" },
            { path: "/review", label: "👥 Parent / Counselor", name: "review" },
        ],
    },
];

async function handleLogout() {
    await user.logout();
    await router.push("/login");
}
</script>

<template>
    <header class="mobile-topbar">
        <button class="mobile-menu" aria-label="Open navigation" @click="mobileOpen = true">☰</button>
        <router-link to="/" class="mobile-brand">CogApp</router-link>
        <NotificationCenter />
    </header>
    <button v-if="mobileOpen" class="sidebar-overlay" aria-label="Close navigation" @click="mobileOpen = false"></button>
    <aside class="sidebar" :class="{ open: mobileOpen }">
        <div class="sidebar-header">
            <div>
                <h1 class="app-name">CogApp</h1>
                <span v-if="demoActive" class="demo-badge">Demo workspace</span>
            </div>
            <div class="desktop-notifications"><NotificationCenter /></div>
            <button class="mobile-close" aria-label="Close navigation" @click="mobileOpen = false">✕</button>
        </div>
        <nav class="sidebar-nav">
            <div
                v-for="section in navSections"
                :key="section.label || 'home'"
                class="nav-section"
            >
                <div v-if="section.label" class="nav-section-label">
                    {{ section.label }}
                </div>
                <router-link
                    v-for="item in section.items"
                    :key="item.path"
                    :to="item.path"
                    class="nav-link"
                    :class="{ active: route.name === item.name }"
                    @click="mobileOpen = false"
                    >{{ item.label }}</router-link
                >
            </div>
        </nav>
        <div class="sidebar-footer">
            <router-link to="/settings" class="settings-link" :class="{ active: route.name === 'settings' }">⚙️ Settings</router-link>
            <button
                class="logout-btn"
                @click="handleLogout"
            >
                👤 {{ user.username }} — Logout
            </button>
        </div>
    </aside>
    <nav class="mobile-bottom-nav" aria-label="Primary navigation">
        <router-link to="/" :class="{ active: route.name === 'dashboard' }"><span>⌂</span>Home</router-link>
        <router-link to="/colleges" :class="{ active: route.name === 'colleges' }"><span>🏫</span>Colleges</router-link>
        <router-link to="/applications" :class="{ active: route.name === 'applications' }"><span>▣</span>Applications</router-link>
        <router-link to="/essays" :class="{ active: route.name === 'essays' }"><span>✎</span>Essays</router-link>
        <router-link to="/settings" :class="{ active: route.name === 'settings' }"><span>⚙</span>Settings</router-link>
    </nav>
</template>

<style scoped>
.sidebar {
    width: 240px;
    flex: 0 0 240px;
    background: var(--sidebar-bg);
    color: var(--sidebar-text);
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    transition: background 0.3s;
}
.sidebar-header {
    padding: 24px 20px 32px;
    border-bottom: 1px solid rgba(128, 128, 128, 0.15);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
}
.app-name {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    color: var(--sidebar-text);
    letter-spacing: 0;
}
.demo-badge { display: inline-block; margin-top: 5px; padding: 3px 6px; border-radius: 4px; background: #fef3c7; color: #92400e; font-size: 9px; font-weight: 800; }
.sidebar-nav {
    display: flex;
    flex-direction: column;
    padding: 12px 8px;
    gap: 4px;
    flex: 1;
    overflow-y: auto;
}
.nav-section + .nav-section {
    margin-top: 8px;
}
.nav-section-label {
    padding: 6px 16px 4px;
    color: var(--sidebar-link);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
}
.nav-link {
    display: block;
    padding: 10px 16px;
    border-radius: 8px;
    color: var(--sidebar-link);
    text-decoration: none;
    font-size: 14px;
    transition: all 0.2s;
}
.nav-link:hover {
    background: rgba(128, 128, 128, 0.12);
    color: var(--sidebar-text);
}
.nav-link.active {
    background: var(--sidebar-active);
    color: var(--sidebar-text);
    font-weight: 600;
}
.sidebar-footer {
    padding: 12px;
    border-top: 1px solid rgba(128, 128, 128, 0.15);
}
.settings-link { display: block; margin-bottom: 8px; padding: 9px; border: 1px solid rgba(128,128,128,.2); border-radius: 7px; color: var(--sidebar-text); font-size: 13px; text-decoration: none; }
.settings-link:hover, .settings-link.active { background: rgba(128,128,128,.12); }

.logout-btn {
    width: 100%;
    padding: 8px;
    border: 1px solid rgba(128, 128, 128, 0.2);
    border-radius: 8px;
    background: rgba(128, 128, 128, 0.06);
    color: var(--sidebar-text);
    font-size: 13px;
    cursor: pointer;
    margin-bottom: 8px;
    transition: all 0.2s;
}
.logout-btn:hover {
    background: rgba(255, 0, 0, 0.12);
}

.mobile-topbar, .mobile-close, .mobile-bottom-nav, .sidebar-overlay { display: none; }

@media (max-width: 760px) {
    .mobile-topbar { position: fixed; z-index: 800; top: 0; left: 0; right: 0; height: 58px; display: grid; grid-template-columns: 40px 1fr 40px; align-items: center; gap: 8px; padding: 0 12px; border-bottom: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); }
    .mobile-menu { width: 38px; height: 38px; border: 1px solid var(--border-color); border-radius: 7px; background: var(--bg-card); color: var(--text-primary); font-size: 18px; }
    .mobile-brand { color: var(--text-primary); font-size: 18px; font-weight: 800; text-align: center; text-decoration: none; }
    .sidebar { position: fixed; z-index: 1000; inset: 0 auto 0 0; width: min(86vw, 310px); min-height: 100dvh; transform: translateX(-105%); box-shadow: 12px 0 35px rgba(15,23,42,.2); transition: transform .22s ease; }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay { position: fixed; z-index: 900; inset: 0; display: block; width: 100%; border: 0; background: rgba(15,23,42,.48); }
    .sidebar-header { padding: 19px 17px; }
    .desktop-notifications { display: none; }
    .mobile-close { display: grid; width: 36px; height: 36px; place-items: center; border: 1px solid rgba(128,128,128,.2); border-radius: 7px; background: transparent; color: var(--sidebar-text); }
    .sidebar-nav { padding-bottom: 16px; }
    .mobile-bottom-nav { position: fixed; z-index: 750; bottom: 0; left: 0; right: 0; height: calc(64px + env(safe-area-inset-bottom)); display: grid; grid-template-columns: repeat(5,1fr); padding: 5px 5px env(safe-area-inset-bottom); border-top: 1px solid var(--border-color); background: var(--bg-card); }
    .mobile-bottom-nav a { display: flex; min-width: 0; flex-direction: column; align-items: center; justify-content: center; gap: 2px; border-radius: 6px; color: var(--text-secondary); font-size: 9px; text-decoration: none; }
    .mobile-bottom-nav a span { font-size: 17px; line-height: 1; }
    .mobile-bottom-nav a.active { background: var(--card-accent); color: var(--primary); font-weight: 800; }
}
</style>
