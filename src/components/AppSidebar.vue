<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useThemeStore, type ThemeName } from "../stores/themeStore";
import { useUserStore } from "../stores/userStore";

defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

const user = useUserStore();
const route = useRoute();
const theme = useThemeStore();
const showThemes = ref(false);

const navItems = [
    { path: "/", label: "📊 Dashboard", name: "dashboard" },
    { path: "/colleges", label: "🏫 College List", name: "colleges" },
    { path: "/majors", label: "🎓 Majors", name: "majors" },
    { path: "/brag", label: "🌟 Brag Sheet", name: "brag" },
    { path: "/essays", label: "✍️ Essays", name: "essays" },
    { path: "/costs", label: "💰 Costs", name: "costs" },
    { path: "/goals", label: "🎯 Goals", name: "goals" },
    { path: "/scholarships", label: "🎓 Scholarships", name: "scholarships" },
    { path: "/stats", label: "📊 Stats", name: "stats" },
    { path: "/documents", label: "📁 Documents", name: "documents" },
];

const themeOptions: { value: ThemeName; label: string }[] = [
    { value: "purple", label: "💜 Lilac" },
    { value: "blue", label: "💙 Ocean" },
    { value: "green", label: "💚 Forest" },
    { value: "rose", label: "💗 Rose" },
];

function changeTheme(t: ThemeName) {
    theme.setTheme(t);
    showThemes.value = false;
    location.reload();
}
function doReload() {
    location.reload();
}
function navClick() {
    emit("close");
}
</script>

<template>
    <aside class="sidebar" :class="{ open: open }">
        <div class="sidebar-header">
            <h1 class="app-name">CogApp</h1>
            <button class="sidebar-close" @click="emit('close')">✕</button>
        </div>
        <nav class="sidebar-nav">
            <router-link
                v-for="item in navItems"
                :key="item.path"
                :to="item.path"
                class="nav-link"
                :class="{ active: route.name === item.name }"
                @click="navClick()"
                >{{ item.label }}</router-link
            >
        </nav>
        <div class="sidebar-footer">
            <button
                class="logout-btn"
                @click="
                    user.logout();
                    doReload();
                "
            >
                👤 {{ user.username }} — Logout
            </button>
            <div class="theme-dropdown">
                <button
                    class="theme-dropdown-btn"
                    @click="showThemes = !showThemes"
                >
                    🎨
                    {{
                        themeOptions.find((t) => t.value === theme.theme)
                            ?.label || "💜 Lilac"
                    }}
                </button>
                <div v-if="showThemes" class="theme-menu">
                    <button
                        v-for="opt in themeOptions"
                        :key="opt.value"
                        class="theme-option"
                        :class="{ active: theme.theme === opt.value }"
                        @click="changeTheme(opt.value)"
                    >
                        {{ opt.label }}
                    </button>
                </div>
            </div>
            <button
                class="theme-toggle"
                @click="
                    theme.toggle();
                    doReload();
                "
            >
                {{ theme.isDark ? "☀️ Light Mode" : "🌙 Dark Mode" }}
            </button>
        </div>
    </aside>
    <div v-if="open" class="sidebar-overlay" @click="emit('close')"></div>
</template>

<style scoped>
.sidebar {
    width: 240px;
    background: var(--sidebar-bg);
    color: var(--sidebar-text);
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    transition:
        background 0.3s,
        transform 0.25s;
    flex-shrink: 0;
}
.sidebar-header {
    padding: 24px 20px 32px;
    border-bottom: 1px solid rgba(128, 128, 128, 0.15);
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.app-name {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    color: var(--sidebar-text);
    letter-spacing: -0.5px;
}
.sidebar-close {
    display: none;
    background: none;
    border: none;
    color: var(--sidebar-text);
    font-size: 20px;
    cursor: pointer;
    padding: 4px 8px;
}
.sidebar-nav {
    display: flex;
    flex-direction: column;
    padding: 12px 8px;
    gap: 4px;
    flex: 1;
    overflow-y: auto;
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
.theme-dropdown {
    position: relative;
    margin-bottom: 8px;
}
.theme-dropdown-btn {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid rgba(128, 128, 128, 0.2);
    border-radius: 8px;
    background: rgba(128, 128, 128, 0.06);
    color: var(--sidebar-text);
    font-size: 13px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
}
.theme-dropdown-btn:hover {
    background: rgba(128, 128, 128, 0.12);
}
.theme-menu {
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    background: var(--sidebar-bg);
    border: 1px solid rgba(128, 128, 128, 0.2);
    border-radius: 8px;
    overflow: hidden;
    z-index: 100;
    margin-bottom: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.theme-option {
    width: 100%;
    padding: 8px 12px;
    border: none;
    background: transparent;
    color: var(--sidebar-link);
    font-size: 13px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s;
}
.theme-option:hover {
    background: rgba(128, 128, 128, 0.1);
    color: var(--sidebar-text);
}
.theme-option.active {
    background: rgba(128, 128, 128, 0.15);
    color: var(--sidebar-text);
    font-weight: 600;
}
.theme-toggle {
    width: 100%;
    padding: 8px;
    border: 1px solid rgba(128, 128, 128, 0.2);
    border-radius: 8px;
    background: rgba(128, 128, 128, 0.06);
    color: var(--sidebar-text);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
}
.theme-toggle:hover {
    background: rgba(128, 128, 128, 0.15);
}

/* Overlay behind sidebar on mobile */
.sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
}

@media (max-width: 768px) {
    .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        z-index: 999;
        transform: translateX(-100%);
        box-shadow: 4px 0 12px rgba(0, 0, 0, 0.15);
    }
    .sidebar.open {
        transform: translateX(0);
    }
    .sidebar-close {
        display: block;
    }
    .sidebar-overlay {
        display: block;
    }
}
</style>
