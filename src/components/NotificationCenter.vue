<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useNotificationStore, type AppNotification } from "../stores/notificationStore";

const route = useRoute();
const router = useRouter();
const store = useNotificationStore();
const open = ref(false);

watch(() => route.fullPath, () => { open.value = false; });
onMounted(() => window.setTimeout(() => store.deliverBrowserNotifications(), 1200));

function dueLabel(item: AppNotification): string {
    if (item.daysAway < 0) return `${Math.abs(item.daysAway)}d overdue`;
    if (item.daysAway === 0) return "Today";
    if (item.daysAway === 1) return "Tomorrow";
    return `${item.daysAway}d`;
}
</script>

<template>
    <div class="notification-center">
        <button
            class="notification-trigger"
            :aria-label="`${store.unreadCount} unread notifications`"
            title="Notifications"
            @click="open = !open"
        >
            <span aria-hidden="true">🔔</span>
            <span v-if="store.unreadCount" class="notification-count">{{ Math.min(store.unreadCount, 99) }}</span>
        </button>
        <div v-if="open" class="notification-popover">
            <div class="notification-heading">
                <div>
                    <strong>Notifications</strong>
                    <span>{{ store.notifications.length }} active reminders</span>
                </div>
                <button v-if="store.unreadCount" @click="store.markAllRead">Mark all read</button>
            </div>
            <div v-if="store.notifications.length" class="notification-list">
                <button
                    v-for="item in store.notifications.slice(0, 12)"
                    :key="item.id"
                    class="notification-item"
                    :class="[item.urgency, { unread: !store.readIds.includes(item.id) }]"
                    @click="store.openNotification(item)"
                >
                    <span class="urgency-dot"></span>
                    <span class="notification-copy">
                        <strong>{{ item.title }}</strong>
                        <small>{{ item.detail }}</small>
                    </span>
                    <span class="notification-date">{{ dueLabel(item) }}</span>
                </button>
            </div>
            <div v-else class="notification-empty">You are all caught up.</div>
            <button class="notification-settings" @click="router.push('/settings')">Notification settings</button>
        </div>
    </div>
</template>

<style scoped>
.notification-center { position: relative; }
.notification-trigger { position: relative; width: 38px; height: 38px; border: 1px solid rgba(128,128,128,.22); border-radius: 7px; background: rgba(128,128,128,.08); color: inherit; cursor: pointer; font-size: 17px; }
.notification-count { position: absolute; top: -5px; right: -5px; min-width: 18px; height: 18px; padding: 0 4px; border-radius: 9px; background: #dc2626; color: white; font-size: 10px; font-weight: 800; display: grid; place-items: center; border: 2px solid var(--sidebar-bg, var(--bg-card)); }
.notification-popover { position: absolute; z-index: 1000; top: 46px; left: 0; width: min(390px, calc(100vw - 24px)); max-height: min(570px, calc(100vh - 80px)); display: flex; flex-direction: column; background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 18px 45px rgba(15,23,42,.22); overflow: hidden; }
.notification-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 15px 16px 12px; border-bottom: 1px solid var(--border-color); }
.notification-heading div { display: flex; flex-direction: column; gap: 2px; }
.notification-heading strong { font-size: 15px; }
.notification-heading span { color: var(--text-secondary); font-size: 11px; }
.notification-heading button, .notification-settings { border: 0; background: transparent; color: var(--primary); font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; }
.notification-list { overflow-y: auto; }
.notification-item { width: 100%; display: grid; grid-template-columns: 8px minmax(0,1fr) auto; align-items: start; gap: 10px; padding: 12px 14px; border: 0; border-bottom: 1px solid var(--border-light); background: transparent; color: inherit; text-align: left; cursor: pointer; }
.notification-item:hover, .notification-item.unread { background: var(--card-accent); }
.urgency-dot { width: 7px; height: 7px; margin-top: 5px; border-radius: 50%; background: #64748b; }
.overdue .urgency-dot { background: #dc2626; }
.urgent .urgency-dot { background: #ea580c; }
.soon .urgency-dot { background: #ca8a04; }
.notification-copy { display: flex; min-width: 0; flex-direction: column; gap: 3px; }
.notification-copy strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.notification-copy small { color: var(--text-secondary); font-size: 11px; line-height: 1.35; }
.notification-date { padding-top: 1px; color: var(--text-secondary); font-size: 10px; white-space: nowrap; }
.notification-empty { padding: 35px 18px; color: var(--text-secondary); text-align: center; font-size: 13px; }
.notification-settings { padding: 11px; border-top: 1px solid var(--border-color); }
@media (max-width: 760px) {
    .notification-popover { position: fixed; top: 62px; left: 12px; right: 12px; width: auto; max-height: calc(100vh - 78px); }
}
</style>
