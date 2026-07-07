<script setup lang="ts">
import { ref, computed } from "vue";
import { useGoalStore, type Goal } from "../stores/goalStore";
import { useCollegeStore } from "../stores/collegeStore";
import { useEssayStore } from "../stores/essayStore";
import { useCostStore } from "../stores/costStore";
import { useScholarshipStore } from "../stores/scholarshipStore";
import { getUserKey } from "../stores/userKey";

const goalStore = useGoalStore();
const collegeStore = useCollegeStore();
const essayStore = useEssayStore();
const costStore = useCostStore();
const scholarshipStore = useScholarshipStore();

const showForm = ref(false);
const editingId = ref<string | null>(null);

const form = ref({
    title: "",
    type: "tuition" as Goal["type"],
    target: 0,
    unit: "",
    description: "",
});

const goalTypes: { value: Goal["type"]; label: string; unit: string }[] = [
    { value: "tuition", label: "🎓 Tuition Budget", unit: "$" },
    { value: "budget", label: "💰 Total App Fee Budget", unit: "$" },
    { value: "colleges", label: "🏫 College Applications", unit: "colleges" },
    { value: "essays", label: "✍️ Essays", unit: "essays" },
    { value: "scholarship", label: "🎓 Scholarship Money Won", unit: "$" },
    { value: "sat", label: "📝 SAT Score", unit: "points" },
    { value: "act", label: "📝 ACT Score", unit: "points" },
    { value: "custom", label: "🎯 Custom Goal", unit: "" },
];

const totalFees = computed(() =>
    collegeStore.colleges.reduce((sum, c) => sum + (c.applicationFee || 0), 0),
);
const totalColleges = computed(() => collegeStore.colleges.length);
const doneEssays = computed(
    () => essayStore.essays.filter((e) => e.status === "Done").length,
);

const scholarshipWonAmount = computed(() =>
    scholarshipStore.scholarships
        .filter((s) => s.status === "Won")
        .reduce((sum, s) => sum + s.awardAmount, 0),
);

const currentSatScore = computed(() => {
    try {
        const saved = localStorage.getItem(getUserKey("sat-act"));
        if (!saved) return 0;
        const data = JSON.parse(saved);
        const satAttempts = (data.attempts || []).filter(
            (a: any) => a.type === "SAT" && a.superscoreEligible,
        );
        if (satAttempts.length === 0) return 0;
        const bestMath = Math.max(
            ...satAttempts.map((a: any) => a.sections?.math || 0),
        );
        const bestReading = Math.max(
            ...satAttempts.map((a: any) => a.sections?.reading || 0),
        );
        return bestMath + bestReading;
    } catch {
        return 0;
    }
});

const currentActScore = computed(() => {
    try {
        const saved = localStorage.getItem(getUserKey("sat-act"));
        if (!saved) return 0;
        const data = JSON.parse(saved);
        const actAttempts = (data.attempts || []).filter(
            (a: any) => a.type === "ACT",
        );
        if (actAttempts.length === 0) return 0;
        return Math.max(...actAttempts.map((a: any) => a.totalScore || 0));
    } catch {
        return 0;
    }
});

function getCollegeNetAfterAidAndLoans(
    cost: (typeof costStore.costs)[0],
): number {
    const netAfterAid =
        (cost.stickerTotal || 0) - (cost.grantsScholarships || 0);
    return Math.max(
        netAfterAid - (cost.federalLoans || 0) - (cost.privateLoans || 0),
        0,
    );
}

function getTuitionColleges(
    goal: Goal,
): { name: string; net: number; exceeds: boolean; by: number }[] {
    if (goal.type !== "tuition") return [];
    return costStore.costs.map((c) => {
        const net = getCollegeNetAfterAidAndLoans(c);
        return {
            name: c.collegeName,
            net,
            exceeds: net > goal.target,
            by: Math.max(net - goal.target, 0),
        };
    });
}

function getProgress(goal: Goal): { current: number; percent: number } {
    let current = 0;
    if (goal.type === "budget") current = totalFees.value;
    else if (goal.type === "colleges") current = totalColleges.value;
    else if (goal.type === "essays") current = doneEssays.value;
    else if (goal.type === "scholarship") current = scholarshipWonAmount.value;
    else if (goal.type === "sat") current = currentSatScore.value;
    else if (goal.type === "act") current = currentActScore.value;
    else if (goal.type === "tuition")
        current = 0; // not used — we show college list instead
    else current = 0;
    const percent =
        goal.target > 0
            ? Math.min(Math.round((current / goal.target) * 100), 100)
            : 0;
    return { current, percent };
}

function progressColor(percent: number) {
    if (percent >= 100) return "#059669";
    if (percent >= 50) return "#d97706";
    return "#1e1b4b";
}

function openAddForm() {
    editingId.value = null;
    const type = goalTypes[0];
    form.value = {
        title: type.label,
        type: type.value,
        target: 0,
        unit: type.unit,
        description: "",
    };
    showForm.value = true;
}

function openEditForm(goal: Goal) {
    editingId.value = goal.id;
    form.value = { ...goal };
    showForm.value = true;
}

function onTypeChange() {
    const type = goalTypes.find((t) => t.value === form.value.type);
    if (type) {
        form.value.unit = type.unit;
        form.value.title = type.label;
    }
}

function saveGoal() {
    if (!form.value.title.trim()) {
        alert("Please enter a goal title.");
        return;
    }
    if (form.value.target <= 0) {
        alert("Please set a target greater than 0.");
        return;
    }
    const goal: Goal = {
        id: editingId.value ?? crypto.randomUUID(),
        title: form.value.title.trim(),
        type: form.value.type,
        target: form.value.target,
        unit: form.value.unit,
        description: form.value.description.trim(),
    };
    if (editingId.value) {
        goalStore.updateGoal(editingId.value, goal);
    } else {
        goalStore.addGoal(goal);
    }
    showForm.value = false;
    editingId.value = null;
}

function removeGoal(id: string) {
    if (confirm("Delete this goal?")) goalStore.deleteGoal(id);
}
function fmt(n: number) {
    return "$" + n.toLocaleString();
}
</script>

<template>
    <div>
        <div class="page-header">
            <h2>🎯 My Goals</h2>
            <button class="btn-add" @click="openAddForm">+ Add Goal</button>
        </div>
        <p class="welcome">Set your targets and track your progress.</p>

        <div v-if="showForm" class="form-card">
            <h3>{{ editingId ? "Edit Goal" : "New Goal" }}</h3>
            <div class="form-grid">
                <div class="field">
                    <label>Goal Type</label>
                    <select v-model="form.type" @change="onTypeChange">
                        <option
                            v-for="t in goalTypes"
                            :key="t.value"
                            :value="t.value"
                        >
                            {{ t.label }}
                        </option>
                    </select>
                </div>
                <div class="field">
                    <label>Target ({{ form.unit || "number" }})</label>
                    <input
                        v-model.number="form.target"
                        type="number"
                        min="1"
                        :placeholder="
                            form.type === 'tuition' ? 'e.g. 30000' : 'e.g. 5'
                        "
                    />
                </div>
                <div class="field">
                    <label>Goal Title</label
                    ><input v-model="form.title" type="text" />
                </div>
                <div class="field">
                    <label>Description</label
                    ><input
                        v-model="form.description"
                        type="text"
                        placeholder="Why this matters"
                    />
                </div>
            </div>
            <div class="form-actions">
                <button class="btn-save" @click="saveGoal">
                    {{ editingId ? "Update Goal" : "Add Goal" }}
                </button>
                <button class="btn-cancel" @click="showForm = false">
                    Cancel
                </button>
            </div>
        </div>

        <p v-if="goalStore.goals.length === 0 && !showForm" class="empty-text">
            No goals set yet.
        </p>

        <div v-else class="goal-list">
            <div
                v-for="goal in goalStore.goals"
                :key="goal.id"
                class="goal-card"
            >
                <div class="goal-info">
                    <div class="goal-title">
                        {{ goal.title }}
                        <span class="goal-type">{{
                            goal.type === "tuition"
                                ? "🎓"
                                : goal.type === "budget"
                                  ? "💰"
                                  : goal.type === "colleges"
                                    ? "🏫"
                                    : goal.type === "essays"
                                      ? "✍️"
                                      : goal.type === "scholarship"
                                        ? "🎓"
                                        : goal.type === "sat"
                                          ? "📝"
                                          : goal.type === "act"
                                            ? "📝"
                                            : "🎯"
                        }}</span>
                    </div>
                    <div v-if="goal.description" class="goal-desc">
                        {{ goal.description }}
                    </div>

                    <!-- Tuition: show college list instead of progress bar -->
                    <div v-if="goal.type === 'tuition'">
                        <div class="tuition-header">
                            🎓 Budget: {{ fmt(goal.target) }} per year
                        </div>
                        <div
                            v-if="costStore.costs.length === 0"
                            class="tuition-empty"
                        >
                            Add cost data in 💰 Cost Tracker first.
                        </div>
                        <div
                            v-for="col in getTuitionColleges(goal)"
                            :key="col.name"
                            class="tuition-row"
                        >
                            <div class="tuition-name">{{ col.name }}</div>
                            <div class="tuition-right">
                                <span class="tuition-net">{{
                                    fmt(col.net)
                                }}</span>
                                <span v-if="col.exceeds" class="tuition-bad red"
                                    >⚠️ +{{ fmt(col.by) }}</span
                                >
                                <span v-else class="tuition-bad green"
                                    >✅ Within</span
                                >
                            </div>
                        </div>
                    </div>

                    <!-- Other goals: progress bar -->
                    <div v-else class="progress-section">
                        <div class="progress-bar">
                            <div
                                class="progress-fill"
                                :style="{
                                    width: getProgress(goal).percent + '%',
                                    background: progressColor(
                                        getProgress(goal).percent,
                                    ),
                                }"
                            ></div>
                        </div>
                        <div class="progress-text">
                            {{ getProgress(goal).current.toLocaleString() }} /
                            {{ goal.target.toLocaleString() }} {{ goal.unit }}
                            <span class="progress-pct"
                                >{{ getProgress(goal).percent }}%</span
                            >
                        </div>
                    </div>

                    <div
                        v-if="
                            goal.type !== 'tuition' &&
                            getProgress(goal).percent >= 100
                        "
                        class="goal-complete"
                    >
                        🎉 Goal achieved!
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-icon edit" @click="openEditForm(goal)">
                        ✏️
                    </button>
                    <button
                        class="btn-icon delete"
                        @click="removeGoal(goal.id)"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}
.page-header h2 {
    margin-bottom: 0;
}
.btn-add {
    background: #1e1b4b;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}
.btn-add:hover {
    background: #2d2868;
}
.welcome {
    color: var(--text-secondary);
    margin-bottom: 24px;
}

.form-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 24px;
    margin-bottom: 24px;
}
.form-card h3 {
    margin: 0 0 16px;
    font-size: 18px;
    color: var(--text-primary);
}
.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}
.field {
    margin-bottom: 16px;
}
.field label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 4px;
}
.field input,
.field select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    background: var(--bg-input);
    color: var(--text-primary);
    box-sizing: border-box;
}
.field input:focus,
.field select:focus {
    outline: none;
    border-color: #1e1b4b;
    box-shadow: 0 0 0 2px rgba(30, 27, 75, 0.15);
}
.form-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}
.btn-save {
    background: #059669;
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}
.btn-save:hover {
    background: #047857;
}
.btn-cancel {
    background: var(--border-light);
    color: var(--text-primary);
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
}

.goal-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.goal-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 20px 24px;
    display: flex;
    gap: 16px;
}
.goal-info {
    flex: 1;
}
.goal-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
}
.goal-type {
    font-size: 18px;
}
.goal-desc {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 4px;
}

/* Tuition */
.tuition-header {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 10px 0 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-light);
}
.tuition-empty {
    font-size: 13px;
    color: var(--text-secondary);
    padding: 10px 0;
}
.tuition-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px solid var(--border-light);
}
.tuition-row:last-child {
    border-bottom: none;
}
.tuition-name {
    font-size: 14px;
    color: var(--text-primary);
}
.tuition-right {
    display: flex;
    align-items: center;
    gap: 8px;
}
.tuition-net {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
}
.tuition-bad {
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}
.tuition-bad.red {
    background: #fee2e2;
    color: #dc2626;
}
.tuition-bad.green {
    background: #d1fae5;
    color: #059669;
}

/* Progress */
.progress-section {
    margin-top: 12px;
}
.progress-bar {
    height: 10px;
    background: var(--border-light);
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 6px;
}
.progress-fill {
    height: 100%;
    border-radius: 5px;
    transition: width 0.5s ease;
}
.progress-text {
    font-size: 13px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 8px;
}
.progress-pct {
    font-weight: 600;
    color: var(--text-primary);
}

.goal-complete {
    margin-top: 8px;
    padding: 8px 12px;
    background: #d1fae5;
    color: #059669;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
}

.card-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
    align-items: flex-start;
}
.btn-icon {
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
}
.btn-icon.edit:hover {
    background: #fef3c7;
}
.btn-icon.delete:hover {
    background: #fee2e2;
}
.empty-text {
    color: var(--text-secondary);
    font-size: 15px;
    text-align: center;
    padding: 40px 0;
}
</style>
