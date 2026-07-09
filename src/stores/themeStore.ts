import { defineStore } from "pinia";
import { ref } from "vue";

export type ThemeName = "purple" | "blue" | "green" | "rose";

interface ThemeVars {
  "--primary": string;
  "--primary-hover": string;
  "--primary-light": string;
  "--sidebar-bg": string;
  "--sidebar-text": string;
  "--sidebar-link": string;
  "--sidebar-active": string;
  "--accent-border": string;
  "--badge-reach": string;
  "--badge-reach-text": string;
  "--badge-target": string;
  "--badge-target-text": string;
  "--badge-safety": string;
  "--badge-safety-text": string;
  "--btn-success": string;
  "--btn-success-hover": string;
  "--btn-db": string;
  "--btn-db-hover": string;
  "--card-accent": string;
}

const themes: Record<ThemeName, { light: ThemeVars; dark: ThemeVars }> = {
  purple: {
    light: {
      "--primary": "#5b21b6",
      "--primary-hover": "#4c1d95",
      "--primary-light": "#ede4f6",
      "--sidebar-bg": "#ede4f6",
      "--sidebar-text": "#1e1b4b",
      "--sidebar-link": "#5b4d8a",
      "--sidebar-active": "rgba(94,59,148,0.18)",
      "--accent-border": "#c4b5fd",
      "--badge-reach": "#fee2e2",
      "--badge-reach-text": "#dc2626",
      "--badge-target": "#fef3c7",
      "--badge-target-text": "#d97706",
      "--badge-safety": "#d1fae5",
      "--badge-safety-text": "#059669",
      "--btn-success": "#059669",
      "--btn-success-hover": "#047857",
      "--btn-db": "#7c3aed",
      "--btn-db-hover": "#6d28d9",
      "--card-accent": "rgba(139,92,246,0.04)",
    },
    dark: {
      "--primary": "#a78bfa",
      "--primary-hover": "#c4b5fd",
      "--primary-light": "#2e1065",
      "--sidebar-bg": "#0f0a2e",
      "--sidebar-text": "#fff",
      "--sidebar-link": "rgba(255,255,255,0.5)",
      "--sidebar-active": "rgba(255,255,255,0.12)",
      "--accent-border": "#5b21b6",
      "--badge-reach": "#7f1d1d",
      "--badge-reach-text": "#fecaca",
      "--badge-target": "#78350f",
      "--badge-target-text": "#fde68a",
      "--badge-safety": "#064e3b",
      "--badge-safety-text": "#a7f3d0",
      "--btn-success": "#059669",
      "--btn-success-hover": "#047857",
      "--btn-db": "#7c3aed",
      "--btn-db-hover": "#6d28d9",
      "--card-accent": "rgba(139,92,246,0.08)",
    },
  },
  blue: {
    light: {
      "--primary": "#1e40af",
      "--primary-hover": "#1e3a8a",
      "--primary-light": "#dbeafe",
      "--sidebar-bg": "#dbeafe",
      "--sidebar-text": "#1e40af",
      "--sidebar-link": "#3b82f6",
      "--sidebar-active": "rgba(30,64,175,0.15)",
      "--accent-border": "#93c5fd",
      "--badge-reach": "#fee2e2",
      "--badge-reach-text": "#dc2626",
      "--badge-target": "#fef3c7",
      "--badge-target-text": "#d97706",
      "--badge-safety": "#d1fae5",
      "--badge-safety-text": "#059669",
      "--btn-success": "#059669",
      "--btn-success-hover": "#047857",
      "--btn-db": "#2563eb",
      "--btn-db-hover": "#1d4ed8",
      "--card-accent": "rgba(59,130,246,0.04)",
    },
    dark: {
      "--primary": "#60a5fa",
      "--primary-hover": "#93c5fd",
      "--primary-light": "#172554",
      "--sidebar-bg": "#0c1929",
      "--sidebar-text": "#fff",
      "--sidebar-link": "rgba(255,255,255,0.5)",
      "--sidebar-active": "rgba(255,255,255,0.12)",
      "--accent-border": "#1e40af",
      "--badge-reach": "#7f1d1d",
      "--badge-reach-text": "#fecaca",
      "--badge-target": "#78350f",
      "--badge-target-text": "#fde68a",
      "--badge-safety": "#064e3b",
      "--badge-safety-text": "#a7f3d0",
      "--btn-success": "#059669",
      "--btn-success-hover": "#047857",
      "--btn-db": "#2563eb",
      "--btn-db-hover": "#1d4ed8",
      "--card-accent": "rgba(59,130,246,0.08)",
    },
  },
  green: {
    light: {
      "--primary": "#065f46",
      "--primary-hover": "#064e3b",
      "--primary-light": "#d1fae5",
      "--sidebar-bg": "#d1fae5",
      "--sidebar-text": "#065f46",
      "--sidebar-link": "#059669",
      "--sidebar-active": "rgba(6,95,70,0.15)",
      "--accent-border": "#6ee7b7",
      "--badge-reach": "#fee2e2",
      "--badge-reach-text": "#dc2626",
      "--badge-target": "#fef3c7",
      "--badge-target-text": "#d97706",
      "--badge-safety": "#d1fae5",
      "--badge-safety-text": "#059669",
      "--btn-success": "#059669",
      "--btn-success-hover": "#047857",
      "--btn-db": "#065f46",
      "--btn-db-hover": "#064e3b",
      "--card-accent": "rgba(5,150,105,0.04)",
    },
    dark: {
      "--primary": "#34d399",
      "--primary-hover": "#6ee7b7",
      "--primary-light": "#064e3b",
      "--sidebar-bg": "#0a1a14",
      "--sidebar-text": "#fff",
      "--sidebar-link": "rgba(255,255,255,0.5)",
      "--sidebar-active": "rgba(255,255,255,0.12)",
      "--accent-border": "#065f46",
      "--badge-reach": "#7f1d1d",
      "--badge-reach-text": "#fecaca",
      "--badge-target": "#78350f",
      "--badge-target-text": "#fde68a",
      "--badge-safety": "#064e3b",
      "--badge-safety-text": "#a7f3d0",
      "--btn-success": "#059669",
      "--btn-success-hover": "#047857",
      "--btn-db": "#065f46",
      "--btn-db-hover": "#064e3b",
      "--card-accent": "rgba(5,150,105,0.08)",
    },
  },
  rose: {
    light: {
      "--primary": "#9d174d",
      "--primary-hover": "#831843",
      "--primary-light": "#fce7f3",
      "--sidebar-bg": "#fce7f3",
      "--sidebar-text": "#9d174d",
      "--sidebar-link": "#db2777",
      "--sidebar-active": "rgba(157,23,77,0.15)",
      "--accent-border": "#f9a8d4",
      "--badge-reach": "#fee2e2",
      "--badge-reach-text": "#dc2626",
      "--badge-target": "#fef3c7",
      "--badge-target-text": "#d97706",
      "--badge-safety": "#d1fae5",
      "--badge-safety-text": "#059669",
      "--btn-success": "#059669",
      "--btn-success-hover": "#047857",
      "--btn-db": "#9d174d",
      "--btn-db-hover": "#831843",
      "--card-accent": "rgba(219,39,119,0.04)",
    },
    dark: {
      "--primary": "#f472b6",
      "--primary-hover": "#f9a8d4",
      "--primary-light": "#4c0519",
      "--sidebar-bg": "#1a0510",
      "--sidebar-text": "#fff",
      "--sidebar-link": "rgba(255,255,255,0.5)",
      "--sidebar-active": "rgba(255,255,255,0.12)",
      "--accent-border": "#9d174d",
      "--badge-reach": "#7f1d1d",
      "--badge-reach-text": "#fecaca",
      "--badge-target": "#78350f",
      "--badge-target-text": "#fde68a",
      "--badge-safety": "#064e3b",
      "--badge-safety-text": "#a7f3d0",
      "--btn-success": "#059669",
      "--btn-success-hover": "#047857",
      "--btn-db": "#9d174d",
      "--btn-db-hover": "#831843",
      "--card-accent": "rgba(219,39,119,0.08)",
    },
  },
};

function apply(vars: any) {
  Object.entries(vars).forEach(([k, v]) =>
    document.documentElement.style.setProperty(k, String(v)),
  );
}

export const useThemeStore = defineStore("theme", () => {
  const isDark = ref(false);
  const theme = ref<ThemeName>("purple");

  const savedDark = localStorage.getItem("applywise-theme-dark");
  if (savedDark === "true") {
    isDark.value = true;
    document.documentElement.setAttribute("data-theme", "dark");
  }

  const savedTheme = localStorage.getItem(
    "applywise-theme-color",
  ) as ThemeName | null;
  if (savedTheme && themes[savedTheme]) theme.value = savedTheme;

  apply(themes[theme.value][isDark.value ? "dark" : "light"]);

  function toggle() {
    isDark.value = !isDark.value;
    localStorage.setItem("applywise-theme-dark", String(isDark.value));
    apply(themes[theme.value][isDark.value ? "dark" : "light"]);
    if (isDark.value)
      document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
  }

  function setTheme(t: ThemeName) {
    theme.value = t;
    localStorage.setItem("applywise-theme-color", t);
    apply(themes[t][isDark.value ? "dark" : "light"]);
  }

  return { isDark, theme, toggle, setTheme };
});
