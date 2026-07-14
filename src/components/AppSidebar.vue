<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useThemeStore, type ThemeName } from "../stores/themeStore";
import { useUserStore } from "../stores/userStore";
const user = useUserStore();
const route = useRoute();
const theme = useThemeStore();
const showThemes = ref(false);

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
        ],
    },
];

const themeOptions: { value: ThemeName; label: string }[] = [
    { value: "purple", label: "💜 Lilac" },
    { value: "blue", label: "💙 Ocean" },
    { value: "green", label: "💚 Forest" },
    { value: "rose", label: "💗 Rose" },
];

function doReload() { location.reload(); }
function changeTheme(t: ThemeName) {
    theme.setTheme(t);
    showThemes.value = false;
    doReload();
}
</script>

<template>
    <aside class="sidebar">
        <div class="sidebar-header">
            <h1 class="app-name">CogApp</h1>
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
                    >{{ item.label }}</router-link
                >
            </div>
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
</template>

<style scoped>
.sidebar {
    width: 240px;
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
}
.app-name {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    color: var(--sidebar-text);
    letter-spacing: -0.5px;
}
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
</style>
