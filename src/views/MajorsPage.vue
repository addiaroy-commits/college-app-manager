<script setup lang="ts">
import { ref, computed } from "vue";
import {
    getAllMajors,
    majorCategories,
    useMajorStore,
} from "../stores/majorStore";
import { getUserKey } from "../stores/userKey";

const store = useMajorStore();

const STORAGE_KEY = getUserKey("top-picks");

function loadPicks(): any[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
        return [];
    }
}

function savePicks(picks: any[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
    // Also update store
    store.topPicks.splice(0, store.topPicks.length, ...picks);
}

const searchQuery = ref("");
const activeCategory = ref("All");
const showForm = ref(false);
const editId = ref<string | null>(null);
const majorSearch = ref("");
const showCustomMajorForm = ref(false);
const customMajorForm = ref({
    name: "",
    category: "",
    description: "",
});

const allMajors = computed(() => [...getAllMajors(), ...store.customMajors]);
const filteredMajors = computed(() => {
    let list = allMajors.value;
    if (activeCategory.value !== "All")
        list = list.filter((m) => m.category === activeCategory.value);
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter((m) => m.name.toLowerCase().includes(q));
    }
    return list;
});

const allPicks = ref<any[]>([]);
const majorPicks = computed(() =>
    allPicks.value
        .filter((p) => p.type === "major")
        .sort((a, b) => a.rank - b.rank),
);
const minorPicks = computed(() =>
    allPicks.value
        .filter((p) => p.type === "minor")
        .sort((a, b) => a.rank - b.rank),
);

// Load once
allPicks.value = loadPicks();

// Form data
const form = ref({
    majorId: "",
    majorName: "",
    type: "major",
    rank: 1,
    specificName: "",
    whyInterested: "",
    careerGoals: "",
    extraNotes: "",
});

function openForm(
    pick?: any,
    preset?: { majorId?: string; majorName?: string; type?: string },
) {
    if (pick) {
        editId.value = pick.id;
        form.value = JSON.parse(
            JSON.stringify({
                majorId: pick.majorId || "",
                majorName: pick.majorName || "",
                type: pick.type || "major",
                rank: pick.rank || 1,
                specificName: pick.specificName || "",
                whyInterested: pick.whyInterested || "",
                careerGoals: pick.careerGoals || "",
                extraNotes: pick.extraNotes || "",
            }),
        );
        majorSearch.value = pick.majorName || "";
    } else {
        editId.value = null;
        form.value = {
            majorId: preset?.majorId || "",
            majorName: preset?.majorName || "",
            type: preset?.type || form.value.type || "major",
            rank: 1,
            specificName: "",
            whyInterested: "",
            careerGoals: "",
            extraNotes: "",
        };
        majorSearch.value = preset?.majorName || "";
    }
    showForm.value = true;
}

function save() {
    if (!majorSearch.value.trim() && !form.value.majorName) {
        alert("Enter a name.");
        return;
    }

    const newPick = {
        id: editId.value || crypto.randomUUID(),
        majorId: form.value.majorId,
        majorName: majorSearch.value.trim() || form.value.majorName,
        type: form.value.type,
        rank: form.value.rank,
        specificName: form.value.specificName.trim(),
        whyInterested: form.value.whyInterested.trim(),
        careerGoals: form.value.careerGoals.trim(),
        extraNotes: form.value.extraNotes.trim(),
    };

    let picks = allPicks.value.slice();
    if (editId.value) {
        const idx = picks.findIndex((p) => p.id === editId.value);
        if (idx !== -1) picks.splice(idx, 1, newPick);
        else picks.push(newPick);
    } else {
        picks.push(newPick);
    }

    allPicks.value = picks;
    savePicks(picks);
    showForm.value = false;
    editId.value = null;
}

function deletePick(id: string) {
    if (!confirm("Remove?")) return;
    const picks = allPicks.value.filter((p) => p.id !== id);
    allPicks.value = picks;
    savePicks(picks);
}

function addCustomMajor() {
    const name = customMajorForm.value.name.trim();
    const category = customMajorForm.value.category;
    if (!name || !category) {
        alert("Name and Category are required.");
        return;
    }
    store.addCustomMajor({
        id: crypto.randomUUID(),
        name,
        category,
        description: customMajorForm.value.description.trim(),
        related: [],
        isCustom: true,
    });
    customMajorForm.value = { name: "", category: "", description: "" };
    showCustomMajorForm.value = false;
}
</script>

<template>
    <div>
        <h2>🎓 Majors & Minors Explorer</h2>
        <p class="welcome">
            Explore 100+ majors and minors. Set your top 3 picks for each!
        </p>

        <div class="picks-row">
            <div class="pick-column">
                <h3>⭐ Top Majors</h3>
                <div v-if="majorPicks.length > 0" class="pick-stack">
                    <div
                        v-for="pick in majorPicks"
                        :key="pick.id"
                        class="pick-card"
                        @click="openForm(pick)"
                    >
                        <div class="pick-rank">#{{ pick.rank }}</div>
                        <div class="pick-info">
                            <div class="pick-name">{{ pick.majorName }}</div>
                            <div v-if="pick.specificName" class="pick-specific">
                                📌 {{ pick.specificName }}
                            </div>
                        </div>
                        <button
                            class="mini-del"
                            @click.stop="deletePick(pick.id)"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
                <button
                    v-if="majorPicks.length < 3"
                    class="btn-add-pick"
                    @click="openForm(undefined, { type: 'major' })"
                >
                    + Add Major ({{ majorPicks.length }}/3)
                </button>
            </div>
            <div class="pick-column">
                <h3>📚 Top Minors</h3>
                <div v-if="minorPicks.length > 0" class="pick-stack">
                    <div
                        v-for="pick in minorPicks"
                        :key="pick.id"
                        class="pick-card"
                        @click="openForm(pick)"
                    >
                        <div class="pick-rank">#{{ pick.rank }}</div>
                        <div class="pick-info">
                            <div class="pick-name">{{ pick.majorName }}</div>
                            <div v-if="pick.specificName" class="pick-specific">
                                📌 {{ pick.specificName }}
                            </div>
                        </div>
                        <button
                            class="mini-del"
                            @click.stop="deletePick(pick.id)"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
                <button
                    v-if="minorPicks.length < 3"
                    class="btn-add-pick"
                    @click="openForm(undefined, { type: 'minor' })"
                >
                    + Add Minor ({{ minorPicks.length }}/3)
                </button>
            </div>
        </div>

        <div class="toolbar">
            <input
                v-model="searchQuery"
                type="text"
                placeholder="🔍 Search 100+ majors and minors..."
                class="search-bar"
            />
            <div class="cat-filters">
                <button
                    v-for="cat in majorCategories"
                    :key="cat"
                    class="cat-btn"
                    :class="{ active: activeCategory === cat }"
                    @click="activeCategory = cat"
                >
                    {{ cat === "All" ? "🌟 All" : cat }}
                </button>
            </div>

            <!-- Custom Major -->
            <button
                v-if="!showCustomMajorForm"
                class="btn-add-custom"
                @click="showCustomMajorForm = true"
            >
                + Add Custom Major
            </button>
            <div v-if="showCustomMajorForm" class="custom-major-form">
                <input
                    v-model="customMajorForm.name"
                    type="text"
                    placeholder="Major name..."
                    class="custom-input"
                />
                <select v-model="customMajorForm.category" class="custom-input">
                    <option value="">-- Category * --</option>
                    <option
                        v-for="cat in majorCategories.filter(
                            (c) => c !== 'All',
                        )"
                        :key="cat"
                        :value="cat"
                    >
                        {{ cat }}
                    </option>
                </select>
                <input
                    v-model="customMajorForm.description"
                    type="text"
                    placeholder="Brief description (optional)..."
                    class="custom-input"
                />
                <div class="custom-actions">
                    <button class="custom-ok" @click="addCustomMajor">
                        Save
                    </button>
                    <button
                        class="custom-cancel"
                        @click="
                            showCustomMajorForm = false;
                            customMajorForm = {
                                name: '',
                                category: '',
                                description: '',
                            };
                        "
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>

        <div class="major-grid">
            <div
                v-for="major in filteredMajors"
                :key="major.id"
                class="major-card"
                @click="
                    openForm(undefined, {
                        majorId: major.id,
                        majorName: major.name,
                        type: 'major',
                    })
                "
            >
                <div class="major-top">
                    <span class="major-name">{{ major.name }}</span>
                    <button
                        v-if="major.isCustom"
                        class="mini-del-custom"
                        @click.stop="store.removeCustomMajor(major.id)"
                        title="Delete custom major"
                    >
                        ✕
                    </button>
                </div>
                <div class="major-cat">{{ major.category }}</div>
                <div class="major-desc">
                    {{ major.description.slice(0, 100) }}...
                </div>
            </div>
            <p v-if="filteredMajors.length === 0" class="empty-text">
                No results.
            </p>
        </div>

        <!-- Form Modal -->
        <div v-if="showForm" class="modal-overlay" @click="showForm = false">
            <div class="modal pick-modal" @click.stop>
                <div class="modal-header">
                    <h3>
                        {{ editId ? "Edit" : "Add" }}
                        {{ form.type === "major" ? "Major" : "Minor" }}
                    </h3>
                    <button class="btn-close" @click="showForm = false">
                        ✕
                    </button>
                </div>
                <div class="modal-body">
                    <div class="field">
                        <label>Name *</label
                        ><input
                            v-model="majorSearch"
                            type="text"
                            list="major-suggestions"
                            placeholder="Type a major or minor name..."
                        />
                        <datalist id="major-suggestions">
                            <option
                                v-for="m in allMajors"
                                :key="m.id"
                                :value="m.name"
                            />
                        </datalist>
                    </div>
                    <div class="field">
                        <label>Specific Name (optional)</label
                        ><input v-model="form.specificName" type="text" />
                    </div>
                    <div class="form-grid">
                        <div class="field">
                            <label>Type</label
                            ><select v-model="form.type">
                                <option value="major">🎓 Major</option>
                                <option value="minor">📚 Minor</option>
                            </select>
                        </div>
                        <div class="field">
                            <label>Rank</label
                            ><select v-model.number="form.rank">
                                <option :value="1">#1</option>
                                <option :value="2">#2</option>
                                <option :value="3">#3</option>
                            </select>
                        </div>
                    </div>
                    <div class="field">
                        <label>Why interested?</label
                        ><textarea
                            v-model="form.whyInterested"
                            rows="2"
                        ></textarea>
                    </div>
                    <div class="field">
                        <label>Career Goals</label
                        ><textarea
                            v-model="form.careerGoals"
                            rows="2"
                        ></textarea>
                    </div>
                    <div class="field">
                        <label>Extra Notes</label
                        ><textarea
                            v-model="form.extraNotes"
                            rows="2"
                        ></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-save" @click="save()">
                        {{ editId ? "Update" : "Save" }}
                    </button>
                    <button class="btn-cancel" @click="showForm = false">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.welcome {
    color: var(--text-secondary);
    margin-bottom: 20px;
}
.picks-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
}
.pick-column h3 {
    font-size: 16px;
    color: var(--text-primary);
    margin-bottom: 10px;
}
.pick-stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 8px;
}
.pick-card {
    background: linear-gradient(
        135deg,
        var(--bg-card),
        rgba(245, 158, 11, 0.04)
    );
    border: 1px solid var(--accent-border, #c4b5fd);
    border-radius: 10px;
    padding: 12px 14px;
    display: flex;
    gap: 10px;
    cursor: pointer;
    align-items: center;
}
.pick-card:hover {
    box-shadow: var(--shadow);
}
.pick-rank {
    font-size: 22px;
    font-weight: 800;
    color: var(--primary, #5b21b6);
    width: 28px;
    text-align: center;
}
.pick-info {
    flex: 1;
}
.pick-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary);
}
.pick-specific {
    font-size: 12px;
    color: var(--primary, #5b21b6);
    margin-top: 2px;
}
.pick-colleges {
    font-size: 11px;
    color: var(--text-secondary);
    margin-top: 2px;
}
.mini-del {
    background: none;
    border: none;
    font-size: 14px;
    cursor: pointer;
    padding: 2px 4px;
}
.mini-del:hover {
    background: #fee2e2;
    border-radius: 4px;
}
.btn-add-pick {
    background: none;
    border: 2px dashed var(--border-color);
    color: var(--text-secondary);
    padding: 10px;
    border-radius: 10px;
    font-size: 13px;
    cursor: pointer;
    width: 100%;
}
.btn-add-pick:hover {
    border-color: var(--primary, #5b21b6);
    color: var(--primary, #5b21b6);
}
.toolbar {
    margin-bottom: 16px;
}
.search-bar {
    width: 100%;
    padding: 12px 18px;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    font-size: 15px;
    margin-bottom: 12px;
    background: var(--bg-input);
    color: var(--text-primary);
    font-family: inherit;
    box-sizing: border-box;
}
.search-bar:focus {
    outline: none;
    border-color: var(--primary, #5b21b6);
    box-shadow: 0 0 0 2px rgba(91, 33, 182, 0.15);
}
.cat-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
.cat-btn {
    padding: 5px 12px;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    background: var(--bg-card);
    color: var(--text-secondary);
}
.cat-btn:hover {
    background: var(--border-light);
}
.cat-btn.active {
    background: var(--primary, #5b21b6);
    color: #fff;
    border-color: var(--primary, #5b21b6);
}
.major-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 10px;
}
.major-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 16px 18px;
    cursor: pointer;
    transition: all 0.15s;
}
.major-card:hover {
    box-shadow: var(--shadow);
    border-color: var(--primary, #5b21b6);
}
.major-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}
.major-name {
    font-weight: 700;
    font-size: 15px;
    color: var(--text-primary);
}
.major-cat {
    font-size: 11px;
    color: var(--primary, #5b21b6);
    font-weight: 600;
    margin-bottom: 4px;
}
.major-desc {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.4;
}
.field {
    margin-bottom: 12px;
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
    border-color: var(--primary, #5b21b6);
    box-shadow: 0 0 0 2px rgba(91, 33, 182, 0.15);
}
.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
.add-college-row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
}
.college-select {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    background: var(--bg-input);
    color: var(--text-primary);
}
.college-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
}
.college-chip-name {
    font-weight: 600;
    font-size: 13px;
    color: var(--primary, #5b21b6);
    min-width: 100px;
    white-space: nowrap;
}
.college-row input {
    flex: 1;
}
.btn-small {
    background: none;
    border: 1px dashed var(--border-color);
    color: var(--text-secondary);
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
}
.btn-small:hover {
    border-color: var(--primary, #5b21b6);
    color: var(--primary, #5b21b6);
}
.btn-save {
    background: var(--primary, #5b21b6);
    color: #fff;
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
.pick-modal {
    max-width: 580px;
}
.modal-overlay {
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
.modal {
    background: var(--bg-card);
    border-radius: 12px;
    width: 100%;
    max-width: 580px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border-color);
}
.modal-header h3 {
    margin: 0;
    font-size: 17px;
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
.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 18px 24px;
}
.modal-footer {
    display: flex;
    gap: 8px;
    padding: 14px 24px;
    border-top: 1px solid var(--border-color);
}
.empty-text {
    color: var(--text-secondary);
    font-size: 14px;
    text-align: center;
    padding: 40px 0;
}

.btn-add-custom {
    background: none;
    border: 2px dashed var(--border-color);
    color: var(--primary, #5b21b6);
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    margin-top: 8px;
}
.btn-add-custom:hover {
    border-color: var(--primary, #5b21b6);
    background: rgba(91, 33, 182, 0.04);
}
.custom-major-form {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-top: 8px;
    padding: 10px;
    background: var(--border-light);
    border-radius: 10px;
}
.custom-input {
    padding: 6px 10px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
    background: var(--bg-input);
    color: var(--text-primary);
    min-width: 120px;
}
.custom-actions {
    display: flex;
    gap: 6px;
}
.custom-ok {
    background: var(--primary, #5b21b6);
    color: #fff;
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
}
.custom-cancel {
    background: var(--border-light);
    color: var(--text-secondary);
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
}

.mini-del-custom {
    background: none;
    border: none;
    font-size: 12px;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 1px 5px;
    border-radius: 4px;
    opacity: 0;
    transition: opacity 0.15s;
}
.major-card:hover .mini-del-custom {
    opacity: 1;
}
.mini-del-custom:hover {
    background: #fee2e2;
    color: #dc2626;
}
</style>
