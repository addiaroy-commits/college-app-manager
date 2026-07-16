<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useCollegeStore } from "../stores/collegeStore";
import type { College } from "../stores/collegeStore";
import { showToast } from "../composables/useToast";
import {
    useApplicationStore,
    type ApplicationStatus,
} from "../stores/applicationStore";
import {
  calculateFitScore,
  useResearchStore,
} from "../stores/researchStore";

const store = useCollegeStore();
const applicationStore = useApplicationStore();
applicationStore.ensureApplications(store.colleges);
const researchStore = useResearchStore();
researchStore.ensureProfiles(store.colleges);
const showForm = ref(false);
const editingId = ref<string | null>(null);
const searchQuery = ref("");
const activeFilter = ref("All");
const sortBy = ref<"added" | "fit">("added");
const selectedCollege = ref<College | null>(null);
const showDatabase = ref(false);
const dbSearch = ref("");
const dbResults = ref<any[]>([]);
const dbLoading = ref(false);
const dbError = ref("");
const API_KEY = "zKyFKBrMRzC6NIuouJuFSY7geWfgiR6A010MUaJO";

function applicationStatus(collegeId: string): ApplicationStatus | null {
    return (
        applicationStore.applications.find(
            (application) => application.collegeId === collegeId,
        )?.status ?? null
    );
}

function decisionCardClass(collegeId: string): string {
    const status = applicationStatus(collegeId);
    if (status === "Accepted") return "decision-accepted";
    if (status === "Waitlisted" || status === "Deferred")
        return "decision-pending";
    if (status === "Rejected") return "decision-rejected";
    return "";
}

function isDecisionStatus(status: ApplicationStatus | null): boolean {
    return status !== null && ["Accepted", "Waitlisted", "Deferred", "Rejected"].includes(status);
}

const form = ref({
    name: "",
    category: "Target" as College["category"],
    deadline: "",
    applicationType: "" as College["applicationType"],
    applicationFee: 0,
    notes: "",
});

const filteredColleges = computed(() => {
    let list = [...store.colleges];
    if (activeFilter.value !== "All")
        list = list.filter((c) => c.category === activeFilter.value);
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (sortBy.value === "fit") {
        list.sort(
            (a, b) =>
                (fitRankByCollege.value[b.id]?.score || 0) -
                    (fitRankByCollege.value[a.id]?.score || 0) ||
                a.name.localeCompare(b.name),
        );
    }
    return list;
});

const fitRankByCollege = computed(() => {
    const ranked = store.colleges
        .map((college) => {
            const profile = researchStore.profiles.find(
                (item) => item.collegeId === college.id,
            );
            return {
                collegeId: college.id,
                score: profile
                    ? calculateFitScore(profile, researchStore.weights)
                    : 0,
            };
        })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score);
    return ranked.reduce<Record<string, { rank: number; score: number }>>(
        (map, entry, index) => {
            map[entry.collegeId] = { rank: index + 1, score: entry.score };
            return map;
        },
        {},
    );
});

async function searchColleges() {
    if (!dbSearch.value.trim()) {
        dbResults.value = [];
        return;
    }
    dbLoading.value = true;
    try {
        const params = new URLSearchParams({
            api_key: API_KEY,
            "school.name": dbSearch.value,
            fields: "id,school.name,school.city,school.state,school.school_url,latest.admissions.admission_rate.overall,latest.admissions.sat_scores.average.overall,latest.cost.tuition.in_state,latest.student.size",
            per_page: "20",
            sort: "school.name",
        });
        const res = await fetch(
            `https://api.data.gov/ed/collegescorecard/v1/schools?${params}`,
        );
        const data = await res.json();
        dbResults.value = data.results || [];
    } catch {
        dbError.value = "Connection failed.";
    }
    dbLoading.value = false;
}
let timer: ReturnType<typeof setTimeout>;
watch(dbSearch, () => {
    clearTimeout(timer);
    timer = setTimeout(searchColleges, 300);
});

const filters = ["All", "Reach", "Target", "Safety"];

function openAddForm() {
    editingId.value = null;
    form.value = {
        name: "",
        category: "Target",
        deadline: "",
        applicationType: "",
        applicationFee: 0,
        notes: "",
    };
    showForm.value = true;
}

function openEditForm(college: any) {
    editingId.value = college.id;
    form.value = {
        name: college.name,
        category: college.category,
        deadline: college.deadline,
        applicationType: college.applicationType,
        applicationFee: college.applicationFee,
        notes: college.notes,
    };
    showForm.value = true;
}

function saveCollege() {
    if (!form.value.name.trim()) return;
    if (!editingId.value) {
        const dup = store.colleges.find(
            (c) =>
                c.name.toLowerCase() === form.value.name.trim().toLowerCase(),
        );
        if (dup) {
            alert(`"${form.value.name.trim()}" is already in your list!`);
            return;
        }
    }
    const college: any = {
        id: editingId.value ?? crypto.randomUUID(),
        name: form.value.name.trim(),
        category: form.value.category,
        deadline: form.value.deadline,
        applicationType: form.value.applicationType,
        applicationFee: form.value.applicationFee,
        notes: form.value.notes.trim(),
    };
    if (editingId.value) {
        store.updateCollege(editingId.value, college);
    } else {
        store.addCollege(college);
    }
    showForm.value = false;
    editingId.value = null;
}

function removeCollege(id: string) {
    const college = store.colleges.find((c) => c.id === id);
    if (!college) return;
    const snapshot = { ...college };
    store.deleteCollege(id);
    showToast(`"${snapshot.name}" deleted`, () => {
        store.addCollege(snapshot);
        showToast(`"${snapshot.name}" restored`);
    });
}

function importCollege(college: any) {
    const name = college["school.name"];
    const dup = store.colleges.find(
        (c) => c.name.toLowerCase() === name.toLowerCase(),
    );
    if (dup) {
        alert(`"${name}" is already in your list!`);
        showDatabase.value = false;
        return;
    }
    const city = college["school.city"];
    const state = college["school.state"];
    const accRate = college["latest.admissions.admission_rate.overall"];
    const satAvg = college["latest.admissions.sat_scores.average.overall"];
    const details: string[] = [];
    if (city && state) details.push(`${city}, ${state}`);
    if (accRate) details.push(`Accept: ${(accRate * 100).toFixed(1)}%`);
    if (satAvg) details.push(`SAT: ${satAvg}`);
    showDatabase.value = false;
    form.value = {
        name,
        category:
            accRate < 0.15 ? "Reach" : accRate < 0.4 ? "Target" : "Safety",
        deadline: "",
        applicationType: "",
        applicationFee: 0,
        notes: details.join(" · "),
    };
    showForm.value = true;
}

function openView(college: any) {
    selectedCollege.value = college;
}
</script>

<template>
    <div>
        <div class="page-header">
            <h2>🏫 College List</h2>
            <div class="header-buttons">
                <button class="btn-db" @click="showDatabase = !showDatabase">
                    🔍 Search Database
                </button>
                <button class="btn-manual" @click="openAddForm">
                    + Add manually
                </button>
            </div>
        </div>

        <div class="toolbar">
            <input
                v-model="searchQuery"
                type="text"
                placeholder="🔍 Search colleges..."
                class="search-input"
            />
            <div class="filters">
                <button
                    v-for="f in filters"
                    :key="f"
                    class="filter-btn"
                    :class="{ active: activeFilter === f }"
                    @click="activeFilter = f"
                >
                    {{ f }}
                </button>
            </div>
            <select v-model="sortBy" class="sort-select" aria-label="College sort order">
                <option value="added">Sort: Added order</option>
                <option value="fit">Sort: Best fit</option>
            </select>
        </div>

        <!-- Add / Edit Form -->
        <div v-if="showForm" class="form-card">
            <h3>{{ editingId ? "Edit College" : "Add a College" }}</h3>
            <div class="form-grid">
                <div class="field">
                    <label>College Name *</label>
                    <input
                        v-model="form.name"
                        type="text"
                        placeholder="e.g. Harvard University"
                    />
                </div>
                <div class="field">
                    <label>Category</label>
                    <select v-model="form.category">
                        <option value="Reach">Reach</option>
                        <option value="Target">Target</option>
                        <option value="Safety">Safety</option>
                    </select>
                </div>
                <div class="field">
                    <label>Application Type</label>
                    <select v-model="form.applicationType">
                        <option value="">-- Select --</option>
                        <option value="ED">Early Decision</option>
                        <option value="EA">Early Action</option>
                        <option value="RD">Regular Decision</option>
                    </select>
                </div>
                <div class="field">
                    <label>Deadline</label>
                    <input v-model="form.deadline" type="date" />
                </div>
                <div class="field">
                    <label>Application Fee ($)</label>
                    <input
                        v-model.number="form.applicationFee"
                        type="number"
                        min="0"
                    />
                </div>
            </div>
            <div class="field">
                <label>Notes</label>
                <textarea
                    v-model="form.notes"
                    rows="2"
                    placeholder="Early action, rolling admissions, etc."
                ></textarea>
            </div>
            <div class="form-actions">
                <button class="btn-save" @click="saveCollege">
                    {{ editingId ? "Update College" : "Save College" }}
                </button>
                <button class="btn-cancel" @click="showForm = false">
                    Cancel
                </button>
            </div>
        </div>

        <!-- Database Search -->
        <div v-if="showDatabase" class="db-modal">
            <div class="db-header">
                <h3>🔍 Search All US Colleges</h3>
                <button class="btn-close" @click="showDatabase = false">
                    ✕
                </button>
            </div>
            <input
                v-model="dbSearch"
                type="text"
                placeholder="Type a college name..."
                class="db-search"
                autofocus
            />
            <div v-if="dbLoading" class="db-loading">🔍 Searching...</div>
            <div class="db-results">
                <div
                    v-for="college in dbResults"
                    :key="college.id"
                    class="db-row"
                    @click="importCollege(college)"
                >
                    <div class="db-info">
                        <div class="db-name">{{ college["school.name"] }}</div>
                        <div class="db-meta">
                            {{ college["school.city"] }},
                            {{ college["school.state"] }} ·
                            {{
                                (
                                    (college[
                                        "latest.admissions.admission_rate.overall"
                                    ] || 0) * 100
                                ).toFixed(0)
                            }}% accept · SAT
                            {{
                                college[
                                    "latest.admissions.sat_scores.average.overall"
                                ] || "—"
                            }}
                        </div>
                    </div>
                    <button class="db-add">+ Add</button>
                </div>
                <p
                    v-if="dbResults.length === 0 && dbSearch && !dbLoading"
                    class="empty-text"
                >
                    No results for "{{ dbSearch }}"
                </p>
                <p v-if="dbSearch === ''" class="hint-text">
                    Start typing to search 7,000+ US colleges
                </p>
            </div>
        </div>

        <!-- Empty State -->
        <p v-if="filteredColleges.length === 0 && !showForm" class="empty-text">
            No colleges match your search or filter. Try changing them!
        </p>

        <!-- College Cards -->
        <div v-else class="college-list">
            <div
                v-for="college in filteredColleges"
                :key="college.id"
                class="college-card"
                :class="decisionCardClass(college.id)"
            >
                <div class="college-info">
                    <div class="college-name-row">
                        <div class="college-name">{{ college.name }}</div>
                        <span
                            v-if="fitRankByCollege[college.id]"
                            class="fit-rank"
                        >
                            #{{ fitRankByCollege[college.id].rank }} fit ·
                            {{ fitRankByCollege[college.id].score }}
                        </span>
                    </div>
                    <div class="college-meta">
                        <span v-if="college.deadline"
                            >📅 {{ college.deadline }}</span
                        >
                        <span v-if="college.applicationType" class="app-type">{{
                            college.applicationType === "ED"
                                ? "Early Decision"
                                : college.applicationType === "EA"
                                  ? "Early Action"
                                  : "Regular Decision"
                        }}</span>
                    </div>
                </div>
                <span
                    class="category-badge"
                    :class="college.category.toLowerCase()"
                    >{{ college.category }}</span
                >
                <span
                    v-if="isDecisionStatus(applicationStatus(college.id))"
                    class="decision-badge"
                    :class="decisionCardClass(college.id)"
                >
                    {{ applicationStatus(college.id) }}
                </span>
                <button class="btn-view" @click="openView(college)">
                    View
                </button>
                <router-link
                    :to="{ path: '/research', query: { tab: 'notes', college: college.id } }"
                    class="btn-research"
                >
                    Research
                </router-link>
            </div>
        </div>

        <!-- Detail Modal -->
        <div
            v-if="selectedCollege"
            class="detail-overlay"
            @click="selectedCollege = null"
        >
            <div class="detail-modal" @click.stop>
                <div class="detail-header">
                    <h3>{{ selectedCollege.name }}</h3>
                    <button class="btn-close" @click="selectedCollege = null">
                        ✕
                    </button>
                </div>
                <div class="detail-body">
                    <div class="detail-row">
                        <span class="detail-label">Category</span>
                        <span
                            class="category-badge"
                            :class="selectedCollege.category.toLowerCase()"
                            >{{ selectedCollege.category }}</span
                        >
                    </div>
                    <div v-if="isDecisionStatus(applicationStatus(selectedCollege.id))" class="detail-row">
                        <span class="detail-label">Decision</span>
                        <span class="decision-badge" :class="decisionCardClass(selectedCollege.id)">
                            {{ applicationStatus(selectedCollege.id) }}
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Application Type</span>
                        <span class="detail-value">{{
                            selectedCollege.applicationType === "ED"
                                ? "Early Decision"
                                : selectedCollege.applicationType === "EA"
                                  ? "Early Action"
                                  : selectedCollege.applicationType === "RD"
                                    ? "Regular Decision"
                                    : "—"
                        }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Deadline</span>
                        <span class="detail-value">{{
                            selectedCollege.deadline || "Not set"
                        }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Application Fee</span>
                        <span class="detail-value"
                            >${{ selectedCollege.applicationFee || 0 }}</span
                        >
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Notes</span>
                        <span class="detail-value">{{
                            selectedCollege.notes || "—"
                        }}</span>
                    </div>
                </div>
                <div class="detail-footer">
                    <button
                        class="btn-icon edit"
                        @click="
                            openEditForm(selectedCollege);
                            selectedCollege = null;
                        "
                    >
                        ✏️ Edit
                    </button>
                    <button
                        class="btn-icon delete"
                        @click="
                            removeCollege(selectedCollege.id);
                            selectedCollege = null;
                        "
                    >
                        🗑️ Delete
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
    margin-bottom: 20px;
}
.page-header h2 {
    margin-bottom: 0;
}
.header-buttons {
    display: flex;
    gap: 8px;
}

.btn-db {
    background: #7c3aed;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}
.btn-db:hover {
    background: #6d28d9;
}
.btn-manual {
    background: none;
    border: 1px dashed var(--border-color);
    color: var(--text-secondary);
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
}
.btn-manual:hover {
    border-color: #1e1b4b;
    color: #1e1b4b;
    background: rgba(30, 27, 75, 0.03);
}

.toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}
.search-input {
    flex: 1;
    min-width: 200px;
    padding: 8px 14px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    background: var(--bg-input);
    color: var(--text-primary);
}
.search-input:focus {
    outline: none;
    border-color: #1e1b4b;
    box-shadow: 0 0 0 2px rgba(30, 27, 75, 0.15);
}
.filters {
    display: flex;
    gap: 6px;
}
.sort-select {
    padding: 8px 10px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-input);
    color: var(--text-primary);
    font: inherit;
    font-size: 12px;
}
.filter-btn {
    padding: 8px 16px;
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    color: var(--text-secondary);
}
.filter-btn:hover {
    background: var(--border-light);
}
.filter-btn.active {
    background: #1e1b4b;
    color: white;
    border-color: #1e1b4b;
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
    font-weight: 600;
    cursor: pointer;
}
.btn-cancel:hover {
    background: var(--border-color);
}
.form-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
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

.empty-text {
    color: var(--text-secondary);
    font-size: 15px;
    text-align: center;
    padding: 40px 0;
}

.college-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.college-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 16px 20px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.college-card.decision-accepted {
    border-color: #86d8b0;
    background: #f0fdf4;
    box-shadow: inset 4px 0 0 #16a36a;
}
.college-card.decision-pending {
    border-color: #c4c8cf;
    background: #f4f5f7;
    box-shadow: inset 4px 0 0 #7a818c;
}
.college-card.decision-rejected {
    border-color: #f3aaa7;
    background: #fff1f1;
    box-shadow: inset 4px 0 0 #dc4b4b;
}
.decision-badge {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 4px 8px;
    border: 1px solid transparent;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
}
.decision-badge.decision-accepted {
    border-color: #86d8b0;
    background: #dcfce7;
    color: #087443;
}
.decision-badge.decision-pending {
    border-color: #c4c8cf;
    background: #e5e7eb;
    color: #4b5563;
}
.decision-badge.decision-rejected {
    border-color: #f3aaa7;
    background: #fee2e2;
    color: #b42323;
}
.college-info {
    flex: 1;
}
.college-name-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}
.college-name {
    font-weight: 600;
    font-size: 16px;
    color: var(--text-primary);
}
.fit-rank {
    padding: 3px 6px;
    border-radius: 5px;
    background: var(--primary-light);
    color: var(--primary);
    font-size: 10px;
    font-weight: 700;
}
.college-meta {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 4px;
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
}
.app-type {
    background: #ede4f6;
    color: #5b21b6;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
}

.category-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
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

.btn-view {
    background: var(--border-light);
    color: var(--text-primary);
    border: none;
    padding: 6px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    flex-shrink: 0;
}
.btn-view:hover {
    background: var(--border-color);
}
.btn-research {
    padding: 6px 10px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--primary);
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
}
.btn-research:hover {
    border-color: var(--accent-border);
    background: var(--primary-light);
}

.detail-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 32px;
}
.detail-modal {
    background: var(--bg-card);
    border-radius: 12px;
    width: 100%;
    max-width: 480px;
    overflow: hidden;
}
.detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-color);
}
.detail-header h3 {
    margin: 0;
    font-size: 20px;
    color: var(--text-primary);
}
.btn-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 4px 8px;
    border-radius: 6px;
}
.btn-close:hover {
    background: var(--border-light);
}
.detail-body {
    padding: 24px;
}
.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-light);
}
.detail-row:last-child {
    border-bottom: none;
    align-items: flex-start;
}
.detail-label {
    font-size: 14px;
    color: var(--text-secondary);
    font-weight: 500;
}
.detail-value {
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 500;
    text-align: right;
    max-width: 60%;
}
.detail-footer {
    display: flex;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid var(--border-color);
    justify-content: flex-end;
}
.detail-footer .btn-icon.edit {
    background: #fef3c7;
    color: #d97706;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    border: none;
    cursor: pointer;
}
.detail-footer .btn-icon.delete {
    background: #fee2e2;
    color: #dc2626;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    border: none;
    cursor: pointer;
}

.db-modal {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 24px;
}
.db-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
    background: #ede4f6;
}
.db-header h3 {
    margin: 0;
    font-size: 16px;
    color: #1e1b4b;
}
.db-search {
    width: 100%;
    padding: 12px 20px;
    border: none;
    border-bottom: 1px solid var(--border-color);
    font-size: 14px;
    font-family: inherit;
    background: var(--bg-input);
    color: var(--text-primary);
    box-sizing: border-box;
}
.db-search:focus {
    outline: none;
}
.db-loading {
    text-align: center;
    padding: 20px;
    color: var(--text-secondary);
    font-size: 14px;
}
.db-results {
    max-height: 400px;
    overflow-y: auto;
}
.db-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
}
.db-row:hover {
    background: var(--border-light);
}
.db-info {
    flex: 1;
}
.db-name {
    font-weight: 600;
    font-size: 15px;
    color: var(--text-primary);
}
.db-meta {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 2px;
}
.db-add {
    background: #059669;
    color: white;
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
}
.db-add:hover {
    background: #047857;
}
.hint-text {
    color: var(--text-secondary);
    font-size: 14px;
    text-align: center;
    padding: 30px 0;
}

@media (max-width: 720px) {
    .page-header {
        align-items: stretch;
        flex-direction: column;
        gap: 12px;
    }

    .header-buttons,
    .quick-actions {
        flex-wrap: wrap;
    }

    .college-card {
        align-items: center;
        flex-wrap: wrap;
    }

    .college-info {
        flex-basis: 100%;
    }
}
</style>
