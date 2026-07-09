<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useCollegeStore } from "../stores/collegeStore";
import { useEssayStore } from "../stores/essayStore";
import { useDocumentStore } from "../stores/documentStore";
import { useUserStore } from "../stores/userStore";
import { useScholarshipStore } from "../stores/scholarshipStore";
import { exportAllData, importAllData } from "../services/dataBackup";
import { showToast } from "../composables/useToast";

const router = useRouter();
const collegeStore = useCollegeStore();
const essayStore = useEssayStore();
const docStore = useDocumentStore();
const userStore = useUserStore();
const scholarshipStore = useScholarshipStore();

const calMonth = ref(new Date().getMonth());
const calYear = ref(new Date().getFullYear());

const collegeStats = computed(() => ({
    total: collegeStore.colleges.length,
    reach: collegeStore.colleges.filter((c) => c.category === "Reach").length,
    target: collegeStore.colleges.filter((c) => c.category === "Target").length,
    safety: collegeStore.colleges.filter((c) => c.category === "Safety").length,
}));

const essayStats = computed(() => {
    const all = essayStore.essays;
    return {
        total: all.length,
        notStarted: all.filter((e) => e.status === "Not Started").length,
        drafting: all.filter((e) => e.status === "Drafting").length,
        done: all.filter((e) => e.status === "Done").length,
    };
});

const totalFees = computed(() =>
    collegeStore.colleges.reduce((s, c) => s + c.applicationFee, 0),
);

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const deadlinesByDate = computed(() => {
    const map: Record<string, typeof collegeStore.colleges> = {};
    collegeStore.colleges.forEach((c) => {
        if (c.deadline) {
            if (!map[c.deadline]) map[c.deadline] = [];
            map[c.deadline].push(c);
        }
    });
    return map;
});

const scholarshipDeadlinesByDate = computed(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const map: Record<string, string[]> = {};
    scholarshipStore.scholarships.forEach((s) => {
        if (!s.deadline) return;
        if (new Date(s.deadline + "T00:00:00") < today) return;
        // Only "Your Scholarships"
        const isYours = !s.isSample || (s.docLinks.length > 0 || s.essayLinks.length > 0 || s.notes.trim().length > 0 || s.checklist.some((c: any) => c.status !== "Needed" && c.status !== "Not Needed"));
        if (!isYours) return;
        if (!map[s.deadline]) map[s.deadline] = [];
        map[s.deadline].push(s.name);
    });
    return map;
});

const upcomingDeadlines = computed(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const collegeDeadlines = collegeStore.colleges
        .filter((c) => c.deadline && new Date(c.deadline + "T00:00:00") >= today)
        .map((c) => ({
            name: c.name,
            deadline: c.deadline,
            type: "college" as const,
            category: c.category,
        }));
    const scholarshipDeadlines = scholarshipStore.scholarships
        .filter((s) => {
            if (!s.deadline) return false;
            if (new Date(s.deadline + "T00:00:00") < today) return false;
            // Only "Your Scholarships": user-created or customized samples
            if (!s.isSample) return true;
            return s.docLinks.length > 0 || s.essayLinks.length > 0 || s.notes.trim().length > 0 || s.checklist.some((c: any) => c.status !== "Needed" && c.status !== "Not Needed");
        })
        .map((s) => ({
            name: s.name,
            deadline: s.deadline,
            type: "scholarship" as const,
        }));
    return [...collegeDeadlines, ...scholarshipDeadlines]
        .sort(
            (a, b) =>
                new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
        )
        .slice(0, 10);
});

const calendarDays = computed(() => {
    const firstDay = new Date(calYear.value, calMonth.value, 1).getDay();
    const daysInMonth = new Date(
        calYear.value,
        calMonth.value + 1,
        0,
    ).getDate();
    const today = new Date().toISOString().split("T")[0];
    const days: {
        day: number;
        date: string;
        isToday: boolean;
        colleges: typeof collegeStore.colleges;
        scholarships: string[];
    }[] = [];

    for (let i = 0; i < firstDay; i++)
        days.push({ day: 0, date: "", isToday: false, colleges: [], scholarships: [] });
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${calYear.value}-${String(calMonth.value + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        days.push({
            day: d,
            date: dateStr,
            isToday: dateStr === today,
            colleges: deadlinesByDate.value[dateStr] || [],
            scholarships: scholarshipDeadlinesByDate.value[dateStr] || [],
        });
    }
    return days;
});

function prevMonth() {
    if (calMonth.value === 0) {
        calMonth.value = 11;
        calYear.value--;
    } else calMonth.value--;
}
function nextMonth() {
    if (calMonth.value === 11) {
        calMonth.value = 0;
        calYear.value++;
    } else calMonth.value++;
}

function appTypeLabel(type: string) {
    if (type === "ED") return "ED";
    if (type === "EA") return "EA";
    if (type === "RD") return "RD";
    return "";
}

function appTypeClass(type: string) {
    if (type === "ED") return "type-ed";
    if (type === "EA") return "type-ea";
    return "type-rd";
}

function navigateTo(path: string) {
    router.push(path);
}

const backupInput = ref<HTMLInputElement | null>(null);

function handleExport() {
    exportAllData();
    showToast("✅ Backup downloaded");
}

function handleImportClick() {
    backupInput.value?.click();
}

async function handleImport(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
        const count = await importAllData(file);
        showToast(`✅ Restored ${count} data keys — refresh to see changes`);
        setTimeout(() => location.reload(), 1500);
    } catch (e: any) {
        showToast(`❌ Import failed: ${e.message}`);
    }
    input.value = "";
}
void backupInput;
</script>

<template>
    <div>
        <h2>📊 Dashboard</h2>
        <p class="welcome">
            Welcome back, {{ userStore.username }}! Here's your application at a
            glance.
        </p>

        <!-- Summary Cards -->
        <div class="summary-grid">
            <div class="summary-card">
                <div class="card-header">🏫 Colleges</div>
                <div class="card-big-number">{{ collegeStats.total }}</div>
                <div class="card-detail">
                    <span class="dot reach"></span>
                    {{ collegeStats.reach }} Reach
                    <span class="dot target"></span>
                    {{ collegeStats.target }} Target
                    <span class="dot safety"></span>
                    {{ collegeStats.safety }} Safety
                </div>
                <div class="card-fee">
                    💵 Total fees: ${{ totalFees.toLocaleString() }}
                </div>
            </div>
            <div class="summary-card">
                <div class="card-header">✍️ Essays</div>
                <div class="card-big-number">{{ essayStats.total }}</div>
                <div class="card-detail">
                    {{ essayStats.notStarted }} Not Started ·
                    {{ essayStats.drafting }} Drafting ·
                    {{ essayStats.done }} Done
                </div>
            </div>
        </div>

        <div class="quick-actions">
            <button class="quick-btn" @click="navigateTo('/colleges')">
                🏫 Add College
            </button>
            <button class="quick-btn" @click="navigateTo('/essays')">
                ✍️ Add Essay
            </button>
        </div>

        <!-- Calendar + Upcoming -->
        <div class="dash-grid">
            <!-- Calendar -->
            <div class="panel cal-panel">
                <div class="cal-header">
                    <button class="cal-nav" @click="prevMonth">◀</button>
                    <h3>📅 {{ monthNames[calMonth] }} {{ calYear }}</h3>
                    <button class="cal-nav" @click="nextMonth">▶</button>
                </div>
                <div class="cal-grid">
                    <div
                        v-for="d in [
                            'Sun',
                            'Mon',
                            'Tue',
                            'Wed',
                            'Thu',
                            'Fri',
                            'Sat',
                        ]"
                        :key="d"
                        class="cal-day-header"
                    >
                        {{ d }}
                    </div>
                    <div
                        v-for="(d, i) in calendarDays"
                        :key="i"
                        class="cal-day"
                        :class="{ empty: d.day === 0, today: d.isToday }"
                    >
                        <div v-if="d.day > 0" class="cal-content">
                            <span
                                class="cal-num"
                                :class="{ today: d.isToday }"
                                >{{ d.day }}</span
                            >
                            <div
                                v-for="college in d.colleges"
                                :key="college.id"
                                class="cal-deadline"
                            >
                                <span class="cal-college-name">{{
                                    college.name
                                }}</span>
                                <span
                                    v-if="college.applicationType"
                                    class="cal-type"
                                    :class="
                                        appTypeClass(college.applicationType)
                                    "
                                    >{{
                                        appTypeLabel(college.applicationType)
                                    }}</span
                                </span
                                >
                            </div>
                            <div
                                v-for="scholarship in d.scholarships"
                                :key="scholarship"
                                class="cal-deadline cal-scholarship"
                            >
                                <span class="cal-college-name">🎓 {{ scholarship }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Upcoming Deadlines -->
            <div class="panel">
                <h3>⏰ Upcoming Deadlines</h3>
                <div v-if="upcomingDeadlines.length === 0" class="panel-empty">
                    No deadlines set yet.
                </div>
                <div
                    v-for="d in upcomingDeadlines"
                    :key="d.name + d.deadline"
                    class="upcoming-row"
                >
                    <div class="upcoming-info">
                        <div class="upcoming-name">{{ d.name }}</div>
                        <div class="upcoming-meta">
                            📅 {{ d.deadline }}
                            <span
                                v-if="d.type === 'college'"
                                class="cal-type"
                                :class="d.category?.toLowerCase()"
                                >{{ d.category }}</span
                            >
                            <span v-else class="cal-type" style="background:#ede9fe;color:#7c3aed;">🎓 Scholarship</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Documents -->
        <div class="panel">
            <h3>🕐 Recent Documents</h3>
            <div v-if="docStore.documents.length === 0" class="panel-empty">
                No documents uploaded yet.
            </div>
            <div
                v-for="doc in [...docStore.documents]
                    .sort(
                        (a, b) =>
                            new Date(b.dateAdded).getTime() -
                            new Date(a.dateAdded).getTime(),
                    )
                    .slice(0, 3)"
                :key="doc.id"
                class="doc-row"
            >
                <span>{{ doc.fileName }}</span>
                <span class="doc-date">{{
                    new Date(doc.dateAdded).toLocaleDateString()
                }}</span>
            </div>
        </div>

        <!-- Backup & Restore -->
        <div class="panel" style="margin-top:20px;">
            <h3>💾 Backup & Restore</h3>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">Export all your data as a JSON file, or restore from a previous backup.</p>
            <div style="display:flex;gap:8px;">
                <button class="quick-btn" @click="handleExport">📥 Export Backup</button>
                <button class="quick-btn" @click="handleImportClick">📤 Restore Backup</button>
                <input ref="backupInput" type="file" accept=".json" style="display:none;" @change="handleImport" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.welcome {
    color: var(--text-secondary);
    margin-bottom: 24px;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;
}
.summary-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 20px 24px;
}
.card-header {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 8px;
}
.card-big-number {
    font-size: 36px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}
.card-detail {
    font-size: 13px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}
.card-fee {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--border-light);
}
.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
}
.dot.reach {
    background: #dc2626;
}
.dot.target {
    background: #d97706;
}
.dot.safety {
    background: #059669;
}

.quick-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
}
.quick-btn {
    flex: 1;
    padding: 14px;
    border: 2px dashed var(--border-color);
    border-radius: 10px;
    background: var(--bg-card);
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    cursor: pointer;
}
.quick-btn:hover {
    border-color: #1e1b4b;
    background: rgba(30, 27, 75, 0.03);
    color: #1e1b4b;
}

.dash-grid {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 16px;
    margin-bottom: 16px;
}

.panel {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 20px 24px;
    margin-bottom: 16px;
}
.panel h3 {
    margin: 0 0 16px;
    font-size: 16px;
    color: var(--text-primary);
}
.panel-empty {
    color: var(--text-secondary);
    font-size: 14px;
    text-align: center;
    padding: 20px 0;
}

/* Calendar */
.cal-panel {
    padding-bottom: 12px;
}
.cal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}
.cal-header h3 {
    margin: 0;
}
.cal-nav {
    background: none;
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 5px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
}
.cal-nav:hover {
    background: var(--border-light);
}
.cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 3px;
}
.cal-day-header {
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
    padding: 4px 0;
}
.cal-day {
    min-height: 72px;
    padding: 3px;
    border-radius: 6px;
    background: var(--bg-card);
    border: 1px solid transparent;
}
.cal-day.empty {
    background: none;
}
.cal-day.today {
    border-color: #1e1b4b;
}
.cal-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.cal-num {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
}
.cal-num.today {
    color: #1e1b4b;
    background: rgba(30, 27, 75, 0.08);
    border-radius: 10px;
    display: inline-block;
    width: 20px;
    text-align: center;
}
.cal-deadline {
    display: flex;
    flex-direction: column;
    gap: 1px;
}
.cal-college-name {
    font-size: 9px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.cal-type {
    padding: 0px 4px;
    border-radius: 3px;
    font-size: 8px;
    font-weight: 700;
    display: inline-block;
    width: fit-content;
}
.type-ed {
    background: #fee2e2;
    color: #dc2626;
}
.type-ea {
    background: #fef3c7;
    color: #d97706;
}
.type-rd {
    background: #dbeafe;
    color: #2563eb;
}

/* Upcoming */
.upcoming-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid var(--border-light);
}
.upcoming-row:last-child {
    border-bottom: none;
}
.upcoming-info {
    flex: 1;
}
.upcoming-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary);
}
.upcoming-meta {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 6px;
}
.upcoming-meta .cal-type {
    font-size: 10px;
    padding: 1px 5px;
}

.category-badge {
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
}
.category-badge.reach {
    background: #fee2e2;
    color: #dc2626;
}
.category-badge.target {
    background: #fef3c7;
    color: #d97706;
}
.category-badge.safety {
    background: #d1fae5;
    color: #059669;
}

.doc-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-light);
    font-size: 14px;
    color: var(--text-primary);
}
.doc-row:last-child {
    border-bottom: none;
}
.doc-date {
    font-size: 13px;
    color: var(--text-secondary);
}
</style>
