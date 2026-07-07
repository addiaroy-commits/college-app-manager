<script setup lang="ts">
import { ref, computed } from "vue";
import { useCostStore, type CollegeCost } from "../stores/costStore";
import { useCollegeStore } from "../stores/collegeStore";
import { useScholarshipStore } from "../stores/scholarshipStore";

const costStore = useCostStore();
const collegeStore = useCollegeStore();
const scholarshipStore = useScholarshipStore();
const API_KEY = "zKyFKBrMRzC6NIuouJuFSY7geWfgiR6A010MUaJO";

const showForm = ref(false);
const editingId = ref<string | null>(null);
const fetching = ref(false);

const form = ref({
    collegeId: "",
    collegeName: "",
    stickerTuition: 0,
    stickerRoom: 0,
    grantsScholarships: 0,
    familyContribution: 0,
    federalLoans: 0,
    privateLoans: 0,
    loanRate: 4.5,
    notes: "",
});

const computedFields = computed(() => ({
    stickerTotal:
        (form.value.stickerTuition || 0) + (form.value.stickerRoom || 0),
    netCost:
        (form.value.stickerTuition || 0) +
        (form.value.stickerRoom || 0) -
        (form.value.grantsScholarships || 0),
    gap:
        (form.value.stickerTuition || 0) +
        (form.value.stickerRoom || 0) -
        (form.value.grantsScholarships || 0) -
        (form.value.familyContribution || 0),
}));

const totalSummary = computed(() => {
    return costStore.costs.reduce(
        (acc, c) => ({
            sticker: acc.sticker + (c.stickerTotal || 0),
            aid: acc.aid + (c.grantsScholarships || 0),
            net: acc.net + (c.netCost || 0),
            gap: acc.gap + (c.gap || 0),
            loans: acc.loans + (c.federalLoans || 0) + (c.privateLoans || 0),
        }),
        { sticker: 0, aid: 0, net: 0, gap: 0, loans: 0 },
    );
});

function fmt(n: number) {
    return "$" + (n || 0).toLocaleString();
}

const scholarshipWon = computed(() => {
    return scholarshipStore.scholarships
        .filter((s) => s.status === "Won")
        .reduce((sum, s) => sum + s.awardAmount, 0);
});

async function onCollegeChange() {
    const college = collegeStore.colleges.find(
        (c) => c.id === form.value.collegeId,
    );
    form.value.collegeName = college?.name ?? "";
    if (!college) return;

    fetching.value = true;
    try {
        const params = new URLSearchParams({
            api_key: API_KEY,
            "school.name": college.name,
            fields: "id,school.name,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,latest.cost.roomboard.oncampus",
            per_page: "1",
        });
        const res = await fetch(
            `https://api.data.gov/ed/collegescorecard/v1/schools?${params}`,
        );
        const data = await res.json();
        if (data.results?.length) {
            const s = data.results[0];
            form.value.stickerTuition =
                s["latest.cost.tuition.in_state"] ||
                s["latest.cost.tuition.out_of_state"] ||
                0;
            form.value.stickerRoom = s["latest.cost.roomboard.oncampus"] || 0;
        }
    } catch {
        /* silent */
    }
    fetching.value = false;
}

function openAddForm() {
    editingId.value = null;
    form.value = {
        collegeId: "",
        collegeName: "",
        stickerTuition: 0,
        stickerRoom: 0,
        grantsScholarships: 0,
        familyContribution: 0,
        federalLoans: 0,
        privateLoans: 0,
        loanRate: 4.5,
        notes: "",
    };
    showForm.value = true;
}

function openEditForm(cost: CollegeCost) {
    editingId.value = cost.id;
    form.value = { ...cost };
    showForm.value = true;
}

function saveCost() {
    if (!form.value.collegeId) {
        alert("Select a college.");
        return;
    }
    const data: CollegeCost = {
        id: editingId.value ?? crypto.randomUUID(),
        collegeId: form.value.collegeId,
        collegeName: form.value.collegeName,
        stickerTuition: form.value.stickerTuition,
        stickerRoom: form.value.stickerRoom,
        stickerFees: 0,
        stickerTotal: computedFields.value.stickerTotal,
        grantsScholarships: form.value.grantsScholarships,
        netCost: computedFields.value.netCost,
        familyContribution: form.value.familyContribution,
        gap: computedFields.value.gap,
        federalLoans: form.value.federalLoans,
        privateLoans: form.value.privateLoans,
        loanRate: form.value.loanRate,
        notes: form.value.notes.trim(),
    };
    if (editingId.value) {
        costStore.updateCost(editingId.value, data);
    } else {
        costStore.addCost(data);
    }
    showForm.value = false;
    editingId.value = null;
}

function removeCost(id: string) {
    if (confirm("Delete this cost entry?")) costStore.deleteCost(id);
}
</script>

<template>
    <div>
        <h2>💰 Cost Tracker</h2>
        <p class="welcome">
            Track tuition, aid, and costs. Data auto-fills from the US
            Department of Education.
        </p>

        <div v-if="costStore.costs.length > 0" class="summary-row">
            <div class="sum-box">
                <div class="sum-num green">{{ fmt(totalSummary.aid) }}</div>
                <div class="sum-label">Total Aid</div>
            </div>
            <div class="sum-box">
                <div class="sum-num">{{ fmt(totalSummary.loans) }}</div>
                <div class="sum-label">Total Loans</div>
            </div>
        </div>

        <div
            v-if="scholarshipWon > 0"
            class="summary-row"
            style="margin-bottom: 16px"
        >
            <div class="sum-box" style="border-color: #10b981">
                <div class="sum-num green" style="font-size: 20px">
                    🎓 {{ fmt(scholarshipWon) }}
                </div>
                <div class="sum-label">Scholarship Money Won</div>
            </div>
        </div>

        <button class="btn-add" @click="openAddForm">+ Add Cost Data</button>

        <div class="cost-grid">
            <div
                v-for="cost in costStore.costs"
                :key="cost.id"
                class="cost-card"
                @click="openEditForm(cost)"
            >
                <div class="cost-top">
                    <span class="cost-college">{{ cost.collegeName }}</span>
                    <button class="mini-del" @click.stop="removeCost(cost.id)">
                        🗑️
                    </button>
                </div>
                <div class="cost-detail">
                    <div class="cd-row">
                        <span>Tuition + Room</span
                        ><span class="cd-val">{{
                            fmt(cost.stickerTotal)
                        }}</span>
                    </div>
                    <div class="cd-row">
                        <span>Grants / Scholarships</span
                        ><span class="cd-val green"
                            >- {{ fmt(cost.grantsScholarships) }}</span
                        >
                    </div>
                    <div class="cd-row">
                        <span>Net Cost</span
                        ><span class="cd-val bold">{{
                            fmt(cost.netCost)
                        }}</span>
                    </div>
                    <div class="cd-row">
                        <span>Your Contribution</span
                        ><span class="cd-val"
                            >- {{ fmt(cost.familyContribution) }}</span
                        >
                    </div>
                    <div class="cd-row">
                        <span>Remaining Gap</span
                        ><span class="cd-val orange bold">{{
                            fmt(cost.gap)
                        }}</span>
                    </div>
                    <div
                        v-if="cost.federalLoans || cost.privateLoans"
                        class="cd-row"
                    >
                        <span>Loans</span
                        ><span class="cd-val"
                            >{{ fmt(cost.federalLoans + cost.privateLoans) }} @
                            {{ cost.loanRate }}%</span
                        >
                    </div>
                </div>
            </div>
            <p
                v-if="costStore.costs.length === 0 && !showForm"
                class="empty-text"
            >
                No cost data yet. Click "+ Add Cost Data" to get started!
            </p>
        </div>

        <div v-if="showForm" class="form-card">
            <h3>{{ editingId ? "Edit" : "Add" }} Cost Data</h3>
            <div class="form-grid">
                <div class="field full">
                    <label>College *</label>
                    <select v-model="form.collegeId" @change="onCollegeChange">
                        <option value="">-- Select College --</option>
                        <option
                            v-for="c in collegeStore.colleges"
                            :key="c.id"
                            :value="c.id"
                        >
                            {{ c.name }}
                        </option>
                    </select>
                    <div v-if="fetching" class="fetching">
                        🔍 Fetching real cost data...
                    </div>
                </div>
                <div class="field">
                    <label
                        >Tuition ($)
                        <span class="field-hint">auto-filled</span></label
                    ><input
                        v-model.number="form.stickerTuition"
                        type="number"
                        min="0"
                    />
                </div>
                <div class="field">
                    <label
                        >Room & Board ($)
                        <span class="field-hint">auto-filled</span></label
                    ><input
                        v-model.number="form.stickerRoom"
                        type="number"
                        min="0"
                    />
                </div>
                <div class="field">
                    <label>Grants / Scholarships ($)</label
                    ><input
                        v-model.number="form.grantsScholarships"
                        type="number"
                        min="0"
                    />
                </div>
                <div class="field">
                    <label>Your Family Contribution ($)</label
                    ><input
                        v-model.number="form.familyContribution"
                        type="number"
                        min="0"
                    />
                </div>
                <div class="field">
                    <label>Federal Loans ($)</label
                    ><input
                        v-model.number="form.federalLoans"
                        type="number"
                        min="0"
                    />
                </div>
                <div class="field">
                    <label>Private Loans ($)</label
                    ><input
                        v-model.number="form.privateLoans"
                        type="number"
                        min="0"
                    />
                </div>
                <div class="field">
                    <label>Loan Interest Rate (%)</label
                    ><input
                        v-model.number="form.loanRate"
                        type="number"
                        min="0"
                        step="0.1"
                    />
                </div>
                <div class="field full">
                    <label>Notes</label
                    ><textarea
                        v-model="form.notes"
                        rows="2"
                        placeholder="Any notes about financial aid..."
                    ></textarea>
                </div>
            </div>

            <div class="calc-box">
                <div class="calc-row">
                    <span>Sticker Total (Tuition + Room)</span
                    ><strong>{{ fmt(computedFields.stickerTotal) }}</strong>
                </div>
                <div class="calc-row">
                    <span>Net Cost (After Aid)</span
                    ><strong class="green">{{
                        fmt(computedFields.netCost)
                    }}</strong>
                </div>
                <div class="calc-row">
                    <span>Remaining Gap</span
                    ><strong class="orange">{{
                        fmt(computedFields.gap)
                    }}</strong>
                </div>
            </div>

            <div class="form-actions">
                <button class="btn-save" @click="saveCost">
                    {{ editingId ? "Update" : "Save" }}
                </button>
                <button class="btn-cancel" @click="showForm = false">
                    Cancel
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.welcome {
    color: var(--text-secondary);
    margin-bottom: 20px;
}

.summary-row {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}
.sum-box {
    flex: 1;
    min-width: 150px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 16px;
    text-align: center;
}
.sum-num {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
}
.sum-num.green {
    color: #059669;
}
.sum-num.orange {
    color: #d97706;
}
.sum-label {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 2px;
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
    margin-bottom: 20px;
}

.cost-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
}
.cost-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 18px 20px;
    cursor: pointer;
    transition: all 0.15s;
}
.cost-card:hover {
    box-shadow: var(--shadow);
    border-color: #1e1b4b;
}
.cost-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}
.cost-college {
    font-weight: 700;
    font-size: 16px;
    color: var(--text-primary);
}
.mini-del {
    background: none;
    border: none;
    font-size: 14px;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 4px;
}
.mini-del:hover {
    background: #fee2e2;
}
.cost-detail {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.cd-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: var(--text-secondary);
}
.cd-val {
    font-weight: 500;
}
.cd-val.bold {
    font-weight: 700;
    color: var(--text-primary);
}
.cd-val.green {
    color: #059669;
    font-weight: 600;
}
.cd-val.orange {
    color: #d97706;
    font-weight: 700;
}

.fetching {
    font-size: 13px;
    color: #7c3aed;
    margin-top: 4px;
    font-weight: 500;
}

.form-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 24px;
    margin-bottom: 20px;
}
.form-card h3 {
    margin: 0 0 16px;
    font-size: 17px;
    color: var(--text-primary);
}
.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
}
.field {
    margin-bottom: 12px;
}
.field.full {
    grid-column: span 2;
}
.field label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 4px;
}
.field-hint {
    font-weight: 400;
    font-size: 11px;
    color: #7c3aed;
    font-style: italic;
}
.field input,
.field select,
.field textarea {
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
.field select:focus,
.field textarea:focus {
    outline: none;
    border-color: #1e1b4b;
    box-shadow: 0 0 0 2px rgba(30, 27, 75, 0.15);
}

.calc-box {
    background: rgba(30, 27, 75, 0.03);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 14px 18px;
    margin-top: 16px;
}
.calc-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 14px;
    color: var(--text-secondary);
}
.calc-row strong {
    color: var(--text-primary);
}
.calc-row strong.green {
    color: #059669;
}
.calc-row strong.orange {
    color: #d97706;
}

.form-actions {
    display: flex;
    gap: 8px;
    margin-top: 14px;
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
.btn-cancel {
    background: var(--border-light);
    color: var(--text-primary);
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
}
.empty-text {
    color: var(--text-secondary);
    font-size: 14px;
    text-align: center;
    padding: 30px 0;
}
</style>
