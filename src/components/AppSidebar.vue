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
const collapsed = ref(localStorage.getItem("cogapp-sidebar-collapsed") === "true");
const demoActive = computed(() => isDemoMode());
watch(() => route.fullPath, () => { mobileOpen.value = false; });
watch(collapsed, (value) => {
    localStorage.setItem("cogapp-sidebar-collapsed", String(value));
});

interface SidebarItem {
    path: string;
    label: string;
    symbol: string;
    name: string;
    featured?: "dashboard" | "ai";
}

interface SidebarSection {
    label: string;
    items: SidebarItem[];
}

const navSections: SidebarSection[] = [
    {
        label: "",
        items: [
            { path: "/", label: "Dashboard", symbol: "D", name: "dashboard", featured: "dashboard" },
            { path: "/ai-studio", label: "AI Studio", symbol: "✦", name: "ai-studio", featured: "ai" },
        ],
    },
    {
        label: "Applications",
        items: [
            { path: "/colleges", label: "College List", symbol: "🏫", name: "colleges" },
            { path: "/research", label: "Research & Compare", symbol: "🔎", name: "research" },
            { path: "/applications", label: "Applications", symbol: "🗂️", name: "applications" },
            { path: "/essays", label: "Essays", symbol: "✍️", name: "essays" },
        ],
    },
    {
        label: "Profile",
        items: [
            { path: "/majors", label: "Majors", symbol: "🎓", name: "majors" },
            { path: "/brag", label: "Brag Sheet", symbol: "🌟", name: "brag" },
            { path: "/documents", label: "Documents", symbol: "📁", name: "documents" },
        ],
    },
    {
        label: "Money",
        items: [
            { path: "/costs", label: "Costs", symbol: "💰", name: "costs" },
            { path: "/scholarships", label: "Scholarships", symbol: "🎓", name: "scholarships" },
        ],
    },
    {
        label: "Progress",
        items: [
            { path: "/goals", label: "Goals", symbol: "🎯", name: "goals" },
            { path: "/stats", label: "Stats", symbol: "📊", name: "stats" },
            { path: "/review", label: "Parent / Counselor", symbol: "👥", name: "review" },
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
    <aside class="sidebar" :class="{ open: mobileOpen, collapsed }">
        <div class="sidebar-header">
            <div class="brand-copy">
                <h1 class="app-name">CogApp</h1>
                <span v-if="demoActive" class="demo-badge">Demo workspace</span>
            </div>
            <div class="desktop-notifications"><NotificationCenter /></div>
            <button
                class="collapse-button"
                :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
                :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
                @click="collapsed = !collapsed"
            >{{ collapsed ? '›' : '‹' }}</button>
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
                    :class="[
                        { active: route.name === item.name },
                        item.featured ? `featured-${item.featured}` : '',
                    ]"
                    :title="collapsed ? item.label : undefined"
                    @click="mobileOpen = false"
                >
                    <span class="nav-symbol" :class="{ letter: item.featured === 'dashboard' }">{{ item.symbol }}</span>
                    <span class="nav-text">{{ item.label }}</span>
                </router-link>
            </div>
        </nav>
        <div class="sidebar-footer">
            <router-link to="/settings" class="settings-link" :class="{ active: route.name === 'settings' }" :title="collapsed ? 'Settings' : undefined">
                <span class="footer-symbol">⚙</span><span class="footer-text">Settings</span>
            </router-link>
            <button
                class="logout-btn"
                @click="handleLogout"
            >
                <span class="footer-symbol">↪</span><span class="footer-text">{{ user.username }} — Logout</span>
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
    height: 100dvh;
    min-height: 0;
    overflow: hidden;
    background: var(--sidebar-bg);
    color: var(--sidebar-text);
    display: flex;
    flex-direction: column;
    transition: width 0.22s ease, flex-basis 0.22s ease, background 0.3s;
}
.sidebar.collapsed {
    width: 72px;
    flex-basis: 72px;
}
.sidebar-header {
    min-height: 94px;
    padding: 22px 16px;
    border-bottom: 1px solid rgba(128, 128, 128, 0.15);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
}
.collapse-button {
    display: grid;
    width: 28px;
    height: 28px;
    flex: 0 0 auto;
    place-items: center;
    border: 1px solid rgba(128, 128, 128, 0.24);
    border-radius: 6px;
    background: transparent;
    color: var(--sidebar-text);
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
}
.collapse-button:hover { background: rgba(128, 128, 128, 0.12); }
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
    scrollbar-width: thin;
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
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border-radius: 8px;
    color: var(--sidebar-link);
    text-decoration: none;
    font-size: 14px;
    transition: all 0.2s;
}
.nav-symbol {
    display: inline-flex;
    width: 20px;
    min-width: 20px;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    line-height: 1;
}
.nav-symbol.letter {
    font-size: 12px;
    font-weight: 900;
}
.nav-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.nav-link.featured-dashboard {
    min-height: 48px;
    padding-top: 12px;
    padding-bottom: 12px;
    color: var(--sidebar-text);
    font-size: 16px;
    font-weight: 850;
}
.nav-link.featured-dashboard .nav-symbol {
    display: none;
}
.nav-link.featured-ai {
    min-height: 42px;
    color: var(--sidebar-text);
    font-size: 14px;
    font-weight: 800;
}
.nav-link.featured-ai .nav-symbol {
    color: var(--primary);
    font-size: 17px;
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
    flex: 0 0 auto;
    padding: 12px;
    border-top: 1px solid rgba(128, 128, 128, 0.15);
}
.settings-link { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding: 9px; border: 1px solid rgba(128,128,128,.2); border-radius: 7px; color: var(--sidebar-text); font-size: 13px; text-decoration: none; }
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}
.logout-btn:hover {
    background: rgba(255, 0, 0, 0.12);
}
.footer-symbol {
    display: inline-flex;
    width: 18px;
    min-width: 18px;
    justify-content: center;
    font-size: 15px;
}
.footer-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.sidebar.collapsed .sidebar-header {
    justify-content: center;
    padding: 22px 12px;
}
.sidebar.collapsed .brand-copy,
.sidebar.collapsed .desktop-notifications,
.sidebar.collapsed .nav-section-label,
.sidebar.collapsed .nav-text,
.sidebar.collapsed .footer-text {
    display: none;
}
.sidebar.collapsed .sidebar-nav { padding-inline: 9px; }
.sidebar.collapsed .nav-section + .nav-section { margin-top: 4px; }
.sidebar.collapsed .nav-link {
    justify-content: center;
    min-height: 42px;
    padding: 10px;
}
.sidebar.collapsed .nav-link.featured-dashboard .nav-symbol { display: inline-flex; }
.sidebar.collapsed .nav-link.featured-dashboard { min-height: 46px; }
.sidebar.collapsed .sidebar-footer { padding: 10px; }
.sidebar.collapsed .settings-link,
.sidebar.collapsed .logout-btn {
    justify-content: center;
    padding-inline: 8px;
}

.mobile-topbar, .mobile-close, .mobile-bottom-nav, .sidebar-overlay { display: none; }

@media (max-width: 760px) {
    .mobile-topbar { position: fixed; z-index: 800; top: 0; left: 0; right: 0; height: 58px; display: grid; grid-template-columns: 40px 1fr 40px; align-items: center; gap: 8px; padding: 0 12px; border-bottom: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); }
    .mobile-menu { width: 38px; height: 38px; border: 1px solid var(--border-color); border-radius: 7px; background: var(--bg-card); color: var(--text-primary); font-size: 18px; }
    .mobile-brand { color: var(--text-primary); font-size: 18px; font-weight: 800; text-align: center; text-decoration: none; }
    .sidebar, .sidebar.collapsed { position: fixed; z-index: 1000; inset: 0 auto 0 0; width: min(86vw, 310px); height: 100dvh; min-height: 0; transform: translateX(-105%); box-shadow: 12px 0 35px rgba(15,23,42,.2); transition: transform .22s ease; }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay { position: fixed; z-index: 900; inset: 0; display: block; width: 100%; border: 0; background: rgba(15,23,42,.48); }
    .sidebar-header { padding: 19px 17px; }
    .sidebar.collapsed .sidebar-header { justify-content: space-between; padding: 19px 17px; }
    .sidebar.collapsed .brand-copy { display: block; }
    .sidebar.collapsed .nav-section-label,
    .sidebar.collapsed .nav-text,
    .sidebar.collapsed .footer-text { display: initial; }
    .sidebar.collapsed .nav-link { justify-content: flex-start; padding: 10px 16px; }
    .sidebar.collapsed .nav-link.featured-dashboard .nav-symbol { display: none; }
    .sidebar.collapsed .settings-link,
    .sidebar.collapsed .logout-btn { justify-content: flex-start; }
    .collapse-button { display: none; }
    .desktop-notifications { display: none; }
    .mobile-close { display: grid; width: 36px; height: 36px; place-items: center; border: 1px solid rgba(128,128,128,.2); border-radius: 7px; background: transparent; color: var(--sidebar-text); }
    .sidebar-nav { padding-bottom: 16px; }
    .mobile-bottom-nav { position: fixed; z-index: 750; bottom: 0; left: 0; right: 0; height: calc(64px + env(safe-area-inset-bottom)); display: grid; grid-template-columns: repeat(5,1fr); padding: 5px 5px env(safe-area-inset-bottom); border-top: 1px solid var(--border-color); background: var(--bg-card); }
    .mobile-bottom-nav a { display: flex; min-width: 0; flex-direction: column; align-items: center; justify-content: center; gap: 2px; border-radius: 6px; color: var(--text-secondary); font-size: 9px; text-decoration: none; }
    .mobile-bottom-nav a span { font-size: 17px; line-height: 1; }
    .mobile-bottom-nav a.active { background: var(--card-accent); color: var(--primary); font-weight: 800; }
}
</style>
