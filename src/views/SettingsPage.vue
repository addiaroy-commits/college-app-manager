<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
import { usePreferenceStore } from "../stores/preferenceStore";
import { useNotificationStore } from "../stores/notificationStore";
import { useThemeStore, type ThemeName } from "../stores/themeStore";
import { exportAllData, importAllData } from "../services/dataBackup";
import { enableDemoMode, exitDemoMode, isDemoMode } from "../services/demoMode";
import { showToast } from "../composables/useToast";

const router = useRouter();
const user = useUserStore();
const preferenceStore = usePreferenceStore();
const notificationStore = useNotificationStore();
const theme = useThemeStore();
const backupInput = ref<HTMLInputElement | null>(null);
const busy = ref(false);
const reviewMessageDraft = ref(preferenceStore.preferences.reviewMessage);
const demoActive = computed(() => isDemoMode());

const themeOptions: { value: ThemeName; label: string; color: string }[] = [
    { value: "purple", label: "Lilac", color: "#7c3aed" },
    { value: "blue", label: "Ocean", color: "#2563eb" },
    { value: "green", label: "Forest", color: "#059669" },
    { value: "rose", label: "Rose", color: "#db2777" },
];

async function copyAccountId() {
    if (!user.currentUser?.id) return;
    try {
        await navigator.clipboard.writeText(user.currentUser.id);
        showToast("Account ID copied");
    } catch {
        showToast("Your browser blocked clipboard access");
    }
}

async function setBrowserNotifications(enabled: boolean) {
    if (!enabled) {
        preferenceStore.update({ browserNotifications: false });
        return;
    }
    try {
        const result = await notificationStore.requestBrowserPermission();
        if (result === "granted") showToast("Browser notifications enabled");
        else if (result === "unsupported") showToast("This browser does not support notifications");
        else showToast("Notification permission was not granted");
    } catch {
        preferenceStore.update({ browserNotifications: false });
        showToast("Browser notifications could not be enabled");
    }
}

function setTheme(value: ThemeName) {
    theme.setTheme(value);
}

async function exportBackup() {
    busy.value = true;
    try {
        await exportAllData();
        showToast("Full backup downloaded");
    } catch (error: any) {
        showToast(error?.message || "Backup failed");
    } finally {
        busy.value = false;
    }
}

async function restoreBackup(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!confirm("Restore this backup into your account? Current matching data will be replaced.")) {
        input.value = "";
        return;
    }
    busy.value = true;
    try {
        const count = await importAllData(file);
        showToast(`Restored ${count} records`);
        window.setTimeout(() => location.reload(), 900);
    } catch (error: any) {
        showToast(error?.message || "Restore failed");
    } finally {
        busy.value = false;
        input.value = "";
    }
}

function startDemo() {
    if (!confirm("Open a disposable sample workspace? Your real account data will stay untouched.")) return;
    enableDemoMode();
    location.assign("/");
}

function leaveDemo() {
    exitDemoMode();
    location.assign("/");
}
</script>

<template>
    <div class="settings-page">
        <div class="settings-heading">
            <div>
                <h2>Settings</h2>
                <p>Manage your account, reminders, review view, and data protection.</p>
            </div>
            <span v-if="demoActive" class="demo-state">Demo workspace</span>
        </div>

        <section class="settings-section">
            <div class="section-title">
                <h3>Account</h3>
                <span>Signed in and remembered on this device</span>
            </div>
            <div class="account-row">
                <div class="account-avatar">{{ user.username.slice(0, 1).toUpperCase() }}</div>
                <div class="account-copy">
                    <strong>{{ user.username }}</strong>
                    <span>Firebase account ID: {{ user.currentUser?.id.slice(0, 12) }}...</span>
                </div>
                <button class="secondary-btn" @click="copyAccountId">Copy ID</button>
            </div>
            <div class="protection-row">
                <span class="status-dot"></span>
                <div><strong>Protected</strong><small>Saved locally first, then synchronized to your private Firestore account.</small></div>
            </div>
        </section>

        <section class="settings-section">
            <div class="section-title">
                <h3>Appearance</h3>
                <span>Changes apply immediately</span>
            </div>
            <div class="theme-row">
                <button
                    v-for="option in themeOptions"
                    :key="option.value"
                    class="theme-choice"
                    :class="{ selected: theme.theme === option.value }"
                    @click="setTheme(option.value)"
                ><span :style="{ background: option.color }"></span>{{ option.label }}</button>
                <label class="compact-toggle"><input type="checkbox" :checked="theme.isDark" @change="theme.toggle()" /> Dark mode</label>
            </div>
        </section>

        <section class="settings-section">
            <div class="section-title">
                <h3>Notifications</h3>
                <span>Deadlines, tasks, letters, scholarships, and visits</span>
            </div>
            <label class="setting-line">
                <span><strong>In-app reminders</strong><small>Show active reminders in the notification center.</small></span>
                <input type="checkbox" :checked="preferenceStore.preferences.notificationsEnabled" @change="preferenceStore.update({ notificationsEnabled: ($event.target as HTMLInputElement).checked })" />
            </label>
            <label class="setting-line" :class="{ muted: !preferenceStore.preferences.notificationsEnabled }">
                <span><strong>Browser notifications</strong><small>Notify you while CogApp is open, even in another tab.</small></span>
                <input type="checkbox" :disabled="!preferenceStore.preferences.notificationsEnabled" :checked="preferenceStore.preferences.browserNotifications" @change="setBrowserNotifications(($event.target as HTMLInputElement).checked)" />
            </label>
            <label class="reminder-line">
                <span><strong>Reminder window</strong><small>Show deadlines this many days ahead.</small></span>
                <select :value="preferenceStore.preferences.reminderDays" @change="preferenceStore.update({ reminderDays: Number(($event.target as HTMLSelectElement).value) })">
                    <option :value="7">7 days</option><option :value="14">14 days</option><option :value="30">30 days</option><option :value="60">60 days</option>
                </select>
            </label>
        </section>

        <section class="settings-section">
            <div class="section-title">
                <h3>Parent & Counselor View</h3>
                <span>A clean, read-only progress summary</span>
            </div>
            <label class="setting-line">
                <span><strong>Show financial estimates</strong><small>Off by default for privacy.</small></span>
                <input type="checkbox" :checked="preferenceStore.preferences.reviewShowFinancials" @change="preferenceStore.update({ reviewShowFinancials: ($event.target as HTMLInputElement).checked })" />
            </label>
            <label class="message-field"><span>Note for your reviewer</span><textarea v-model="reviewMessageDraft" rows="3" maxlength="500" placeholder="Add context, a question, or what you want feedback on..." @change="preferenceStore.update({ reviewMessage: reviewMessageDraft })"></textarea></label>
            <button class="primary-btn" @click="router.push('/review')">Open review view</button>
        </section>

        <section class="settings-section">
            <div class="section-title">
                <h3>Backup & Restore</h3>
                <span>Includes account data and uploaded documents</span>
            </div>
            <p class="section-note">These are the same full-backup tools available on your Dashboard.</p>
            <div class="button-row">
                <button class="primary-btn" :disabled="busy" @click="exportBackup">{{ busy ? "Working..." : "Export Backup" }}</button>
                <button class="secondary-btn" :disabled="busy" @click="backupInput?.click()">Restore Backup</button>
                <input ref="backupInput" hidden type="file" accept=".json,application/json" @change="restoreBackup" />
            </div>
        </section>

        <section class="settings-section demo-section">
            <div class="section-title">
                <h3>Demo Mode</h3>
                <span>Explore a realistic application workspace without touching your data</span>
            </div>
            <p class="section-note">Demo changes stay on this device, never sync to your real account, and are erased when you exit.</p>
            <button v-if="!demoActive" class="secondary-btn" @click="startDemo">Enter Demo Mode</button>
            <button v-else class="danger-btn" @click="leaveDemo">Exit Demo and return to my data</button>
        </section>
    </div>
</template>

<style scoped>
.settings-page { max-width: 900px; margin: 0 auto; }
.settings-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
.settings-heading p { font-size: 14px; }
.demo-state { padding: 6px 10px; border-radius: 6px; background: #fef3c7; color: #92400e; font-size: 11px; font-weight: 800; }
.settings-section { padding: 22px 0; border-top: 1px solid var(--border-color); }
.settings-section:first-of-type { border-top: 0; }
.section-title { display: flex; justify-content: space-between; align-items: baseline; gap: 20px; margin-bottom: 16px; }
.section-title h3 { font-size: 16px; }
.section-title span, .section-note { color: var(--text-secondary); font-size: 12px; }
.account-row { display: flex; align-items: center; gap: 13px; }
.account-avatar { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 7px; background: var(--primary); color: #fff; font-weight: 800; }
.account-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 3px; }
.account-copy span { overflow: hidden; color: var(--text-secondary); font-size: 11px; text-overflow: ellipsis; }
.protection-row { display: flex; align-items: flex-start; gap: 9px; margin-top: 16px; padding: 12px; border: 1px solid #a7f3d0; border-radius: 7px; background: rgba(16,185,129,.06); }
.status-dot { width: 8px; height: 8px; margin-top: 5px; border-radius: 50%; background: #059669; }
.protection-row div { display: flex; flex-direction: column; gap: 2px; }
.protection-row strong { color: #047857; font-size: 12px; }
.protection-row small { color: var(--text-secondary); font-size: 11px; }
.theme-row, .button-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.theme-choice { display: flex; align-items: center; gap: 7px; padding: 8px 11px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-card); color: var(--text-primary); cursor: pointer; }
.theme-choice span { width: 13px; height: 13px; border-radius: 3px; }
.theme-choice:hover { border-color: var(--interactive-border); background: var(--interactive-soft); }
.theme-choice.selected { border-color: var(--primary); background: var(--primary); color: var(--primary-contrast); box-shadow: var(--interactive-shadow); }
.theme-choice.selected span { border: 1px solid color-mix(in srgb, var(--primary-contrast) 65%, transparent); }
.compact-toggle { display: flex; align-items: center; gap: 7px; padding: 8px 4px; font-size: 12px; }
.setting-line, .reminder-line { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 13px 0; border-bottom: 1px solid var(--border-light); }
.setting-line span, .reminder-line span { display: flex; flex-direction: column; gap: 3px; }
.setting-line strong, .reminder-line strong { font-size: 13px; }
.setting-line small, .reminder-line small { color: var(--text-secondary); font-size: 11px; }
.setting-line input { width: 18px; height: 18px; accent-color: var(--primary); }
.setting-line.muted { opacity: .55; }
.reminder-line select { min-width: 112px; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-input); color: var(--text-primary); }
.message-field { display: flex; flex-direction: column; gap: 7px; margin: 14px 0; font-size: 12px; font-weight: 700; }
.message-field textarea { width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-input); color: var(--text-primary); font: inherit; resize: vertical; }
.primary-btn, .secondary-btn, .danger-btn { padding: 9px 13px; border-radius: 6px; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.primary-btn { border: 1px solid var(--primary); background: var(--primary); color: #fff; }
.secondary-btn { border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); }
.danger-btn { border: 1px solid #ef4444; background: transparent; color: #dc2626; }
button:disabled { opacity: .55; cursor: wait; }
.section-note { margin: -4px 0 14px; line-height: 1.55; }
@media (max-width: 620px) {
    .settings-page { width: 100%; }
    .settings-heading, .section-title { flex-direction: column; align-items: flex-start; gap: 5px; }
    .account-row { align-items: flex-start; flex-wrap: wrap; }
    .account-copy { min-width: calc(100% - 58px); }
    .setting-line, .reminder-line { align-items: flex-start; }
    .theme-choice { flex: 1 1 calc(50% - 8px); justify-content: center; }
    .button-row button { flex: 1 1 140px; }
}
</style>
