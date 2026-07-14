<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useCollegeStore } from "../stores/collegeStore";
import { useEssayStore } from "../stores/essayStore";
import { useDocumentStore } from "../stores/documentStore";
import { useUserStore } from "../stores/userStore";
import { useScholarshipStore } from "../stores/scholarshipStore";
import { useApplicationStore } from "../stores/applicationStore";
import { useResearchStore } from "../stores/researchStore";
import { exportAllData, importAllData } from "../services/dataBackup";
import { showToast } from "../composables/useToast";

const router = useRouter();
const collegeStore = useCollegeStore();
const essayStore = useEssayStore();
const docStore = useDocumentStore();
const userStore = useUserStore();
const scholarshipStore = useScholarshipStore();
const applicationStore = useApplicationStore();
const researchStore = useResearchStore();
applicationStore.ensureApplications(collegeStore.colleges);

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

const commandStats = computed(() => ({
    openTasks: applicationStore.tasks.filter((task) => task.status !== "Done")
        .length,
    submitted: applicationStore.applications.filter((application) =>
        ["Submitted", "Accepted", "Waitlisted", "Rejected"].includes(
            application.status,
        ),
    ).length,
    pendingLetters: applicationStore.recommendations.filter(
        (recommendation) =>
            !["Submitted", "Declined"].includes(recommendation.status),
    ).length,
}));

function isTrackedScholarship(
    scholarship: (typeof scholarshipStore.scholarships)[number],
): boolean {
    if (!scholarship.isSample) return true;
    return (
        scholarship.docLinks.length > 0 ||
        scholarship.essayLinks.length > 0 ||
        scholarship.notes.trim().length > 0 ||
        scholarship.checklist.some(
            (item) =>
                item.status !== "Needed" && item.status !== "Not Needed",
        )
    );
}

const upcomingDeadlines = computed(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const collegeDeadlines = collegeStore.colleges
        .filter((c) => c.deadline && new Date(c.deadline + "T00:00:00") >= today)
        .map((c) => ({
            name: c.name,
            deadline: c.deadline,
            type: "college" as const,
            meta: c.applicationType || c.category,
        }));
    const scholarshipDeadlines = scholarshipStore.scholarships
        .filter((s) => {
            if (!s.deadline) return false;
            if (new Date(s.deadline + "T00:00:00") < today) return false;
            return isTrackedScholarship(s);
        })
        .map((s) => ({
            name: s.name,
            deadline: s.deadline,
            type: "scholarship" as const,
            meta: "Scholarship",
        }));
    const taskDeadlines = applicationStore.tasks
        .filter((task) => task.status !== "Done" && task.dueDate)
        .map((task) => ({
            name: task.title,
            deadline: task.dueDate,
            type: "task" as const,
            meta:
                collegeStore.colleges.find(
                    (college) => college.id === task.collegeId,
                )?.name || task.type,
        }));
    const recommendationDeadlines = applicationStore.recommendations
        .filter(
            (recommendation) =>
                !["Submitted", "Declined"].includes(recommendation.status) &&
                recommendation.dueDate,
        )
        .map((recommendation) => ({
            name: `${recommendation.name}'s recommendation`,
            deadline: recommendation.dueDate,
            type: "recommendation" as const,
            meta: recommendation.role || "Recommendation",
        }));
    const visitDates = researchStore.visits
        .filter(
            (visit) =>
                visit.date &&
                new Date(`${visit.date}T00:00:00`) >= today,
        )
        .map((visit) => ({
            name: `${
                collegeStore.colleges.find(
                    (college) => college.id === visit.collegeId,
                )?.name || "College"
            }: ${visit.type}`,
            deadline: visit.date,
            type: "visit" as const,
            meta: visit.contact || "Visit or interview",
        }));
    return [
        ...collegeDeadlines,
        ...scholarshipDeadlines,
        ...taskDeadlines,
        ...recommendationDeadlines,
        ...visitDates,
    ]
        .sort(
            (a, b) =>
                new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
        )
        .slice(0, 10);
});

function deadlineLabel(value: string): string {
    const due = new Date(`${value}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.round((due.getTime() - today.getTime()) / 86400000);
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
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
            <div class="summary-card command-card" @click="navigateTo('/applications')">
                <div class="card-header">🗂️ Application Command Center</div>
                <div class="card-big-number">{{ commandStats.openTasks }}</div>
                <div class="card-detail">
                    Open tasks · {{ commandStats.submitted }} submitted ·
                    {{ commandStats.pendingLetters }} pending letters
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
            <button class="quick-btn" @click="navigateTo('/applications')">
                🗂️ Plan Applications
            </button>
        </div>

        <div class="panel">
            <div class="panel-heading">
                <div>
                    <h3>⏰ Next Up</h3>
                    <p>Your closest deadlines and overdue action items.</p>
                </div>
                <button class="calendar-link" @click="navigateTo('/applications?tab=calendar')">
                    Open full calendar
                </button>
            </div>
            <div v-if="upcomingDeadlines.length === 0" class="panel-empty">
                No deadlines set yet.
            </div>
            <div
                v-for="deadline in upcomingDeadlines"
                :key="deadline.name + deadline.deadline + deadline.type"
                class="upcoming-row"
            >
                <span class="deadline-type" :class="deadline.type">
                    {{ deadline.type }}
                </span>
                <div class="upcoming-info">
                    <div class="upcoming-name">{{ deadline.name }}</div>
                    <div class="upcoming-meta">{{ deadline.meta }}</div>
                </div>
                <div class="deadline-date">
                    <strong>{{ deadlineLabel(deadline.deadline) }}</strong>
                    <span>{{ deadline.deadline }}</span>
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}
.command-card {
    cursor: pointer;
}
.command-card:hover {
    border-color: var(--accent-border);
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

.panel-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 12px;
}
.panel-heading p {
    margin-top: 4px;
    font-size: 12px;
}
.panel-heading h3 {
    margin: 0;
}
.calendar-link {
    padding: 7px 10px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-card);
    color: var(--primary);
    font: inherit;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
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
}
.deadline-type {
    width: 98px;
    padding: 4px 7px;
    border-radius: 5px;
    font-size: 10px;
    font-weight: 700;
    text-align: center;
    text-transform: capitalize;
}
.deadline-type.college {
    background: #dbeafe;
    color: #1d4ed8;
}
.deadline-type.scholarship {
    background: #ede9fe;
    color: #6d28d9;
}
.deadline-type.task {
    background: #fef3c7;
    color: #92400e;
}
.deadline-type.recommendation {
    background: #d1fae5;
    color: #047857;
}
.deadline-type.visit {
    background: #fce7f3;
    color: #be185d;
}
.deadline-date {
    display: flex;
    align-items: flex-end;
    flex-direction: column;
}
.deadline-date strong {
    font-size: 12px;
}
.deadline-date span {
    margin-top: 2px;
    color: var(--text-secondary);
    font-size: 10px;
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

@media (max-width: 980px) {
    .summary-grid {
        grid-template-columns: 1fr;
    }
}
</style>
