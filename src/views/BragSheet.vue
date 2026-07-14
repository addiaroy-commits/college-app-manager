<script setup lang="ts">
import { ref, computed } from "vue";
import { useBragStore, type BragItem } from "../stores/bragStore";
import { getUserKey } from "../stores/userKey";

const store = useBragStore();
const activeTab = ref("sat-act");
const showForm = ref(false);
const showCustomForm = ref(false);
const editingId = ref<string | null>(null);
const customCategoryName = ref("");

const defaultTabs = [
    { id: "sat-act", label: "📝 SAT / ACT" },
    { id: "gpa", label: "📊 GPA" },
    { id: "courses", label: "📚 Courses" },
    { id: "ap-scores", label: "📝 AP Scores" },
    { id: "clubs", label: "🎭 Clubs" },
    { id: "sports", label: "🏃 Sports" },
    { id: "volunteer", label: "🤝 Volunteer/Shadow/Jobs" },
    { id: "awards", label: "🏆 Awards" },
    { id: "portfolio", label: "🎨 Portfolio" },
    { id: "skills", label: "🛠️ Skills" },
    { id: "family", label: "🏠 Family/External Situations" },
];

const customTabs = ref<{ id: string; label: string }[]>([]);
(function loadCustomTabs() {
    const saved = localStorage.getItem(getUserKey("brag-custom-tabs"));
    const legacy = localStorage.getItem("applywise-brag-custom-tabs");
    if (!saved && legacy) {
        localStorage.setItem(getUserKey("brag-custom-tabs"), legacy);
    }
    const raw = saved || legacy;
    if (raw) customTabs.value = JSON.parse(raw);
})();
function saveCustomTabs() {
    localStorage.setItem(
        getUserKey("brag-custom-tabs"),
        JSON.stringify(customTabs.value),
    );
}
const allTabs = computed(() => [...defaultTabs, ...customTabs.value]);

function addCustomTab() {
    if (!customCategoryName.value.trim()) return;
    const id = "custom-" + crypto.randomUUID().slice(0, 8);
    customTabs.value.push({
        id,
        label: "✨ " + customCategoryName.value.trim(),
    });
    saveCustomTabs();
    activeTab.value = id;
    customCategoryName.value = "";
    showCustomForm.value = false;
}
function deleteCustomTab(tabId: string) {
    store.getByCategory(tabId).forEach((i) => store.deleteItem(i.id));
    customTabs.value = customTabs.value.filter((t) => t.id !== tabId);
    saveCustomTabs();
    if (activeTab.value === tabId) activeTab.value = "gpa";
}

const isCustom = computed(
    () => !defaultTabs.find((t) => t.id === activeTab.value),
);

// ── SAT / ACT Data ──
interface TestAttempt {
    id: string;
    type: "SAT" | "ACT";
    date: string;
    totalScore: number;
    sections: Record<string, number>;
    notes: string;
    superscoreEligible: boolean;
}

interface SatActData {
    attempts: TestAttempt[];
    targetSat: number;
    targetAct: number;
    notes: string;
}

const satActData = ref<SatActData>({
    attempts: [],
    targetSat: 0,
    targetAct: 0,
    notes: "",
});

(function loadSatAct() {
    const saved = localStorage.getItem(getUserKey("sat-act"));
    if (saved) satActData.value = JSON.parse(saved);
})();

function saveSatAct() {
    localStorage.setItem(
        getUserKey("sat-act"),
        JSON.stringify(satActData.value),
    );
}

const satSuperscore = computed(() => {
    const satAttempts = satActData.value.attempts.filter(
        (a) => a.type === "SAT" && a.superscoreEligible,
    );
    if (satAttempts.length === 0) return null;
    const bestMath = Math.max(...satAttempts.map((a) => a.sections?.math || 0));
    const bestReading = Math.max(
        ...satAttempts.map((a) => a.sections?.reading || 0),
    );
    return {
        total: bestMath + bestReading,
        math: bestMath,
        reading: bestReading,
    };
});

const highestAct = computed(() => {
    const actAttempts = satActData.value.attempts.filter(
        (a) => a.type === "ACT",
    );
    if (actAttempts.length === 0) return null;
    return Math.max(...actAttempts.map((a) => a.totalScore || 0));
});

const currentSat = computed(() => {
    return (
        satSuperscore.value?.total ||
        satActData.value.attempts
            .filter((a) => a.type === "SAT")
            .reduce((max, a) => Math.max(max, a.totalScore || 0), 0) ||
        null
    );
});

const currentAct = computed(() => highestAct.value);

// Test attempt form
const showTestForm = ref(false);
const editingTestId = ref<string | null>(null);
const testForm = ref<TestAttempt>({
    id: "",
    type: "SAT",
    date: "",
    totalScore: 0,
    sections: {
        math: 0,
        reading: 0,
        english: 0,
        actMath: 0,
        actReading: 0,
        actScience: 0,
    },
    notes: "",
    superscoreEligible: true,
});

function openAddTest() {
    editingTestId.value = null;
    testForm.value = {
        id: "",
        type: "SAT",
        date: "",
        totalScore: 0,
        sections: {
            math: 0,
            reading: 0,
            english: 0,
            actMath: 0,
            actReading: 0,
            actScience: 0,
        },
        notes: "",
        superscoreEligible: true,
    };
    showTestForm.value = true;
}
function openEditTest(a: TestAttempt) {
    editingTestId.value = a.id;
    testForm.value = { ...a, sections: { ...a.sections } };
    showTestForm.value = true;
}

function saveTest() {
    if (!testForm.value.date || testForm.value.totalScore <= 0) {
        alert("Date and score required.");
        return;
    }
    if (editingTestId.value) {
        const idx = satActData.value.attempts.findIndex(
            (a) => a.id === editingTestId.value,
        );
        if (idx !== -1)
            satActData.value.attempts[idx] = {
                ...testForm.value,
                id: editingTestId.value,
            };
    } else {
        satActData.value.attempts.push({
            ...testForm.value,
            id: crypto.randomUUID(),
        });
    }
    saveSatAct();
    showTestForm.value = false;
}

function deleteTest(id: string) {
    if (!confirm("Delete this attempt?")) return;
    satActData.value.attempts = satActData.value.attempts.filter(
        (a) => a.id !== id,
    );
    saveSatAct();
}

// ── SAT / ACT Data ──
const satGoalPercent = computed(() =>
    satActData.value.targetSat > 0
        ? Math.min(
              Math.round(
                  ((currentSat.value || 0) / satActData.value.targetSat) * 100,
              ),
              100,
          )
        : 0,
);
const actGoalPercent = computed(() =>
    satActData.value.targetAct > 0
        ? Math.min(
              Math.round(
                  ((currentAct.value || 0) / satActData.value.targetAct) * 100,
              ),
              100,
          )
        : 0,
);

const apTests = [
    "AP Art History",
    "AP Biology",
    "AP Calculus AB",
    "AP Calculus BC",
    "AP Chemistry",
    "AP Chinese Language and Culture",
    "AP Comparative Government and Politics",
    "AP Computer Science A",
    "AP Computer Science Principles",
    "AP English Language and Composition",
    "AP English Literature and Composition",
    "AP Environmental Science",
    "AP European History",
    "AP French Language and Culture",
    "AP German Language and Culture",
    "AP Human Geography",
    "AP Italian Language and Culture",
    "AP Japanese Language and Culture",
    "AP Latin",
    "AP Macroeconomics",
    "AP Microeconomics",
    "AP Music Theory",
    "AP Physics 1: Algebra-Based",
    "AP Physics 2: Algebra-Based",
    "AP Physics C: Electricity and Magnetism",
    "AP Physics C: Mechanics",
    "AP Psychology",
    "AP Research",
    "AP Seminar",
    "AP Spanish Language and Culture",
    "AP Spanish Literature and Culture",
    "AP Statistics",
    "AP Studio Art: 2-D Design",
    "AP Studio Art: 3-D Design",
    "AP Studio Art: Drawing",
    "AP United States Government and Politics",
    "AP United States History",
    "AP World History: Modern",
];

const scoreOptions = [1, 2, 3, 4, 5];

const textareaFields = [
    "notes",
    "description",
    "details",
    "achievements",
    "impact",
    "supportReceived",
];

const fieldLabels: Record<string, Record<string, string>> = {
    gpa: {
        unweightedGPA: "Unweighted GPA",
        unweightedScale: "UW Scale",
        weightedGPA: "Weighted GPA",
        weightedScale: "W Scale",
        classRank: "Class Rank (e.g. 15/400)",
        notes: "Additional Notes",
    },
    courses: {
        year: "Year",
        courseName: "Course Name",
        grade: "Grade Received",
        credits: "Credits",
        courseType: "Type (Honors/AP/IB/Regular)",
        notes: "Notes",
    },
    "ap-scores": { testName: "Test Name", score: "Score", year: "Year Taken" },
    clubs: {
        clubName: "Club/Organization Name",
        role: "Your Role/Position",
        grades: "Grades Participated",
        hoursWeek: "Hours per Week",
        weeksYear: "Weeks per Year",
        description: "What You Did / Accomplishments",
    },
    sports: {
        sportName: "Sport",
        role: "Position/Role",
        years: "Years Played",
        achievements: "Achievements/Awards",
        hours: "Hours per Week",
        league: "League/Level (Varsity, JV, Club)",
    },
    volunteer: {
        type: "Type",
        organization: "Organization/Company Name",
        role: "Your Role/Title",
        years: "When",
        hours: "Total Hours",
        description: "What You Did / What You Learned",
    },
    awards: {
        awardName: "Award/Honor Name",
        level: "Level",
        year: "Year Awarded",
        organization: "Awarding Organization",
        description: "Description",
    },
    portfolio: {
        title: "Project/Portfolio Title",
        type: "Type",
        link: "Link/URL",
        year: "Year",
        description: "Description",
    },
    skills: {
        skillName: "Skill",
        category: "Category",
        proficiency: "Proficiency",
        years: "Years Experience",
        notes: "Notes/Certification",
    },
    family: {
        situation: "Situation Type",
        title: "Brief Title",
        description: "Describe the situation",
        impact: "How did it affect you?",
        years: "When",
        supportReceived: "Support/Resources Received",
    },
};

const yearOptions = ["Freshman", "Sophomore", "Junior", "Senior", "Summer"];
const gradeOptions = ["9th", "10th", "11th", "12th"];
const levelOptions = [
    "School",
    "District",
    "State",
    "National",
    "International",
];
const proficiencyOptions = ["Beginner", "Intermediate", "Advanced", "Expert"];
const skillCatOptions = ["Language", "Tech", "Music", "Art", "Other"];
const portfolioTypeOptions = [
    "Art",
    "Research",
    "Project",
    "Writing",
    "Performance",
    "Other",
];
const volunteerTypeOptions = [
    "Volunteer",
    "Job Shadow",
    "Internship",
    "Part-time Job",
    "Summer Program",
    "Other",
];
const courseTypeOptions = ["Regular", "Honors", "AP", "IB", "Dual Enrollment"];
const situationOptions = [
    "Family Responsibility",
    "Health/Medical",
    "Financial Hardship",
    "Living Situation",
    "Personal Challenge",
    "Other",
];
const leagueOptions = [
    "Varsity",
    "Junior Varsity",
    "Club",
    "Intramural",
    "Travel",
];

const gpaScaleOptions = [
    { value: "4.0", label: "4.0 scale", max: 4.0 },
    { value: "5.0", label: "5.0 scale", max: 5.0 },
    { value: "100", label: "100-point scale", max: 100 },
    { value: "custom", label: "Custom" },
];

const form = ref<Record<string, any>>({});

const customFields = computed(() => {
    if (isCustom.value) return ["title", "description", "details"];
    return Object.keys(fieldLabels[activeTab.value] || {});
});

const categoryItems = computed(() => store.getByCategory(activeTab.value));

function initForm() {
    form.value = {};
    customFields.value.forEach((field) => {
        if (field === "years" || field === "grades") form.value[field] = [];
        else if (field === "score") form.value[field] = null;
        else if (
            [
                "credits",
                "hoursWeek",
                "weeksYear",
                "hours",
                "unweightedGPA",
                "weightedGPA",
            ].includes(field)
        )
            form.value[field] = 0;
        else if (field === "unweightedScale" || field === "weightedScale")
            form.value[field] = "4.0";
        else if (textareaFields.includes(field)) {
            form.value[field] = "";
            form.value[field + "_mode"] = "write";
            form.value[field + "_file"] = null;
        } else form.value[field] = "";
    });
}

function openAddForm() {
    editingId.value = null;
    initForm();
    showForm.value = true;
}

function openEditForm(item: BragItem) {
    editingId.value = item.id;
    form.value = { ...item.data };
    customFields.value.forEach((field) => {
        if (
            (field === "years" || field === "grades") &&
            !Array.isArray(form.value[field])
        )
            form.value[field] = [];
        if (field === "score" && form.value[field] === undefined)
            form.value[field] = null;
        if (textareaFields.includes(field)) {
            if (!form.value[field + "_mode"])
                form.value[field + "_mode"] = form.value[field]?.startsWith(
                    "FILE:",
                )
                    ? "attach"
                    : "write";
            if (
                !form.value[field + "_file"] &&
                form.value[field]?.startsWith("FILE:")
            ) {
                const parts = form.value[field].split("|");
                form.value[field + "_file"] = {
                    name: parts[1] || "",
                    data: parts[2] || "",
                    type: parts[3] || "",
                };
            }
        }
    });
    showForm.value = true;
}

function onAttachFile(field: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        if (!form.value[field + "_file"]) form.value[field + "_file"] = {};
        form.value[field + "_file"] = {
            name: file.name,
            data: base64,
            type: file.type,
        };
        form.value[field] = `FILE:|${file.name}|${base64}|${file.type}`;
    };
    reader.readAsDataURL(file);
}

function downloadAttached(field: string) {
    const f = form.value[field + "_file"];
    if (!f?.data) return;
    const a = document.createElement("a");
    a.href = `data:${f.type};base64,${f.data}`;
    a.download = f.name;
    a.click();
}

function clearAttach(field: string) {
    form.value[field] = "";
    form.value[field + "_file"] = null;
    form.value[field + "_mode"] = "write";
}

function prepareFormBeforeSave() {
    if (
        activeTab.value === "ap-scores" &&
        form.value.testName === "__OTHER__" &&
        form.value._customTestName
    ) {
        form.value.testName = form.value._customTestName.trim();
        delete form.value._customTestName;
    }
    // Clean up mode/file keys before saving
    const clean: Record<string, any> = {};
    Object.keys(form.value).forEach((k) => {
        if (!k.endsWith("_mode") && !k.endsWith("_file"))
            clean[k] = form.value[k];
    });
    // Add back attachment data as needed
    textareaFields.forEach((f) => {
        if (form.value[f + "_mode"] === "attach" && form.value[f + "_file"]) {
            clean[f] =
                `FILE:|${form.value[f + "_file"].name}|${form.value[f + "_file"].data}|${form.value[f + "_file"].type}`;
        }
    });
    form.value = clean;
}

function saveItem() {
    if (activeTab.value === "ap-scores") {
        if (!form.value.testName) {
            alert("Select an AP test.");
            return;
        }
        if (!form.value.score) {
            alert("Select a score (1-5).");
            return;
        }
    }
    if (activeTab.value === "gpa") {
        const uwScale = gpaScaleOptions.find(
            (s) => s.value === (form.value.unweightedScale || "4.0"),
        );
        const wScale = gpaScaleOptions.find(
            (s) => s.value === (form.value.weightedScale || "4.0"),
        );
        const uwMax = uwScale?.max ?? 5;
        const wMax = wScale?.max ?? 5;
        if (
            form.value.unweightedGPA &&
            (form.value.unweightedGPA < 0 || form.value.unweightedGPA > uwMax)
        ) {
            alert(
                "Unweighted GPA must be 0-" +
                    uwMax +
                    " on " +
                    (uwScale?.label || "selected") +
                    " scale.",
            );
            return;
        }
        if (
            form.value.weightedGPA &&
            (form.value.weightedGPA < 0 || form.value.weightedGPA > wMax)
        ) {
            alert(
                "Weighted GPA must be 0-" +
                    wMax +
                    " on " +
                    (wScale?.label || "selected") +
                    " scale.",
            );
            return;
        }
    }
    prepareFormBeforeSave();
    store.addItem({
        id: editingId.value ?? crypto.randomUUID(),
        category: activeTab.value,
        data: { ...form.value },
    });
    showForm.value = false;
    editingId.value = null;
}

function updateItem() {
    if (!editingId.value) return;
    if (activeTab.value === "ap-scores") {
        if (!form.value.testName) {
            alert("Select an AP test.");
            return;
        }
        if (!form.value.score) {
            alert("Select a score (1-5).");
            return;
        }
    }
    if (activeTab.value === "gpa") {
        const uwScale = gpaScaleOptions.find(
            (s) => s.value === (form.value.unweightedScale || "4.0"),
        );
        const wScale = gpaScaleOptions.find(
            (s) => s.value === (form.value.weightedScale || "4.0"),
        );
        const uwMax = uwScale?.max ?? 5;
        const wMax = wScale?.max ?? 5;
        if (
            form.value.unweightedGPA &&
            (form.value.unweightedGPA < 0 || form.value.unweightedGPA > uwMax)
        ) {
            alert(
                "Unweighted GPA must be 0-" +
                    uwMax +
                    " on " +
                    (uwScale?.label || "selected") +
                    " scale.",
            );
            return;
        }
        if (
            form.value.weightedGPA &&
            (form.value.weightedGPA < 0 || form.value.weightedGPA > wMax)
        ) {
            alert(
                "Weighted GPA must be 0-" +
                    wMax +
                    " on " +
                    (wScale?.label || "selected") +
                    " scale.",
            );
            return;
        }
    }
    prepareFormBeforeSave();
    store.updateItem(editingId.value, {
        id: editingId.value,
        category: activeTab.value,
        data: { ...form.value },
    });
    showForm.value = false;
    editingId.value = null;
}

function removeItem(id: string) {
    if (confirm("Delete this entry?")) store.deleteItem(id);
}

function formatValue(_key: string, val: any): string {
    if (val === null || val === undefined) return "—";
    if (Array.isArray(val)) return val.join(", ");
    const s = String(val);
    if (s.startsWith("FILE:")) {
        const parts = s.split("|");
        return "📎 " + (parts[1] || "file");
    }
    if (s.length > 60) return s.slice(0, 60) + "...";
    return s;
}

function getItemTitle(item: BragItem): string {
    const d = item.data;
    if (activeTab.value === "gpa")
        return d.unweightedGPA
            ? `GPA: ${d.unweightedGPA}${d.unweightedScale ? " (" + d.unweightedScale + ")" : ""}`
            : "GPA Entry";
    if (activeTab.value === "courses") return d.courseName || "Course";
    if (activeTab.value === "ap-scores") return d.testName || "Test";
    if (activeTab.value === "clubs") return d.clubName || "Club";
    if (activeTab.value === "sports") return d.sportName || "Sport";
    if (activeTab.value === "volunteer")
        return (
            `${d.type || ""}${d.organization ? " at " + d.organization : ""}` ||
            "Activity"
        );
    if (activeTab.value === "awards") return d.awardName || "Award";
    if (activeTab.value === "portfolio") return d.title || "Project";
    if (activeTab.value === "skills") return d.skillName || "Skill";
    if (activeTab.value === "family") return d.title || "Situation";
    if (isCustom.value) return d.title || "Entry";
    return "Entry";
}

function currentTabLabel(): string {
    return (
        allTabs.value
            .find((t) => t.id === activeTab.value)
            ?.label?.replace(/^[^\s]+\s/, "") || ""
    );
}
function toggleCheckbox(field: string, opt: string) {
    if (!form.value[field]) form.value[field] = [];
    const arr = form.value[field] as string[];
    const idx = arr.indexOf(opt);
    idx === -1 ? arr.push(opt) : arr.splice(idx, 1);
}
</script>

<template>
    <div>
        <h2>🌟 Brag Sheet</h2>
        <p class="welcome">
            Your personal highlight reel — everything colleges need to see.
        </p>

        <div class="tabs">
            <button
                v-for="tab in allTabs"
                :key="tab.id"
                class="tab"
                :class="{ active: activeTab === tab.id }"
                @click="
                    activeTab = tab.id;
                    showForm = false;
                "
            >
                {{ tab.label
                }}<span
                    v-if="store.getByCategory(tab.id).length"
                    class="tab-count"
                    >{{ store.getByCategory(tab.id).length }}</span
                ><span
                    v-if="!defaultTabs.find((t) => t.id === tab.id)"
                    class="tab-close"
                    @click.stop="deleteCustomTab(tab.id)"
                    >✕</span
                >
            </button>
            <button
                v-if="!showCustomForm"
                class="tab add-tab"
                @click="showCustomForm = true"
            >
                ＋
            </button>
            <div v-if="showCustomForm" class="custom-tab-form">
                <input
                    v-model="customCategoryName"
                    type="text"
                    placeholder="Category name..."
                    class="custom-input"
                    @keyup.enter="addCustomTab"
                /><button class="custom-ok" @click="addCustomTab">✓</button
                ><button
                    class="custom-cancel"
                    @click="
                        showCustomForm = false;
                        customCategoryName = '';
                    "
                >
                    ✕
                </button>
            </div>
        </div>

        <!-- ── SAT / ACT Special Tab ── -->
        <div v-if="activeTab === 'sat-act'" class="sat-act-section">
            <!-- Current Scores -->
            <div class="sa-card">
                <h4>📊 Current Scores</h4>
                <div class="sa-scores-grid">
                    <div class="sa-score-box">
                        <div class="sa-score-num">{{ currentSat || "—" }}</div>
                        <div class="sa-score-label">SAT Total</div>
                    </div>
                    <div class="sa-score-box">
                        <div class="sa-score-num">
                            {{ satSuperscore?.math || "—" }}
                        </div>
                        <div class="sa-score-label">SAT Math</div>
                    </div>
                    <div class="sa-score-box">
                        <div class="sa-score-num">
                            {{ satSuperscore?.reading || "—" }}
                        </div>
                        <div class="sa-score-label">SAT Reading</div>
                    </div>
                    <div class="sa-score-box">
                        <div class="sa-score-num">{{ currentAct || "—" }}</div>
                        <div class="sa-score-label">ACT Composite</div>
                    </div>
                </div>
                <div v-if="satSuperscore" class="sa-superscore-badge">
                    ✨ SAT Superscore: {{ satSuperscore.total }} (M{{
                        satSuperscore.math
                    }}
                    R{{ satSuperscore.reading }})
                </div>
            </div>

            <!-- Test History -->
            <div class="sa-card">
                <h4>
                    📋 Test History
                    <button class="btn-add-sm" @click="openAddTest">
                        + Add Attempt
                    </button>
                </h4>
                <p v-if="satActData.attempts.length === 0" class="empty-text">
                    No test attempts recorded yet.
                </p>
                <div v-else class="sa-attempt-list">
                    <div
                        v-for="a in satActData.attempts"
                        :key="a.id"
                        class="sa-attempt-row"
                        @click="openEditTest(a)"
                    >
                        <div class="sa-att-info">
                            <span
                                class="sa-att-type"
                                :class="
                                    a.type === 'SAT' ? 'sat-badge' : 'act-badge'
                                "
                                >{{ a.type }}</span
                            >
                            <span class="sa-att-date">{{ a.date }}</span>
                            <span class="sa-att-score">{{ a.totalScore }}</span>
                            <span
                                v-if="a.superscoreEligible"
                                class="sa-ss-badge"
                                >Superscore ✓</span
                            >
                        </div>
                        <button class="mini-del" @click.stop="deleteTest(a.id)">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>

            <!-- Target Scores -->
            <div class="sa-card">
                <h4>🎯 Target Scores</h4>
                <div class="sa-target-grid">
                    <div class="sa-target-box">
                        <label>Goal SAT</label>
                        <input
                            v-model.number="satActData.targetSat"
                            type="number"
                            min="400"
                            max="1600"
                            step="10"
                            @change="saveSatAct"
                        />
                        <div
                            v-if="satActData.targetSat > 0"
                            class="mini-bar"
                            style="margin-top: 6px"
                        >
                            <div
                                class="mini-fill"
                                :style="{
                                    width: satGoalPercent + '%',
                                    background:
                                        satGoalPercent >= 100
                                            ? '#10b981'
                                            : satGoalPercent >= 50
                                              ? '#f59e0b'
                                              : '#1e1b4b',
                                }"
                            ></div>
                        </div>
                        <span class="mini-label"
                            >{{ currentSat || 0 }}/{{
                                satActData.targetSat
                            }}
                            ({{ satGoalPercent }}%)</span
                        >
                    </div>
                    <div class="sa-target-box">
                        <label>Goal ACT</label>
                        <input
                            v-model.number="satActData.targetAct"
                            type="number"
                            min="1"
                            max="36"
                            @change="saveSatAct"
                        />
                        <div
                            v-if="satActData.targetAct > 0"
                            class="mini-bar"
                            style="margin-top: 6px"
                        >
                            <div
                                class="mini-fill"
                                :style="{
                                    width: actGoalPercent + '%',
                                    background:
                                        actGoalPercent >= 100
                                            ? '#10b981'
                                            : actGoalPercent >= 50
                                              ? '#f59e0b'
                                              : '#1e1b4b',
                                }"
                            ></div>
                        </div>
                        <span class="mini-label"
                            >{{ currentAct || 0 }}/{{
                                satActData.targetAct
                            }}
                            ({{ actGoalPercent }}%)</span
                        >
                    </div>
                </div>
            </div>

            <!-- Test Attempt Form Modal -->
            <div
                v-if="showTestForm"
                class="modal-overlay"
                @click="showTestForm = false"
            >
                <div class="modal" @click.stop style="max-width: 500px">
                    <div class="modal-header">
                        <h3>
                            {{ editingTestId ? "Edit" : "Add" }} Test Attempt
                        </h3>
                        <button class="btn-close" @click="showTestForm = false">
                            ✕
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="field">
                            <label>Test Type</label
                            ><select v-model="testForm.type">
                                <option value="SAT">SAT</option>
                                <option value="ACT">ACT</option>
                            </select>
                        </div>
                        <div class="field">
                            <label>Date</label
                            ><input v-model="testForm.date" type="date" />
                        </div>
                        <div class="field">
                            <label>Total Score</label
                            ><input
                                v-model.number="testForm.totalScore"
                                type="number"
                                :min="testForm.type === 'SAT' ? 400 : 1"
                                :max="testForm.type === 'SAT' ? 1600 : 36"
                            />
                        </div>
                        <template v-if="testForm.type === 'SAT'">
                            <div class="form-grid">
                                <div class="field">
                                    <label>Math</label
                                    ><input
                                        v-model.number="testForm.sections.math"
                                        type="number"
                                        min="200"
                                        max="800"
                                    />
                                </div>
                                <div class="field">
                                    <label>Reading & Writing</label
                                    ><input
                                        v-model.number="
                                            testForm.sections.reading
                                        "
                                        type="number"
                                        min="200"
                                        max="800"
                                    />
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="form-grid">
                                <div class="field">
                                    <label>English</label
                                    ><input
                                        v-model.number="
                                            testForm.sections.english
                                        "
                                        type="number"
                                        min="1"
                                        max="36"
                                    />
                                </div>
                                <div class="field">
                                    <label>Math</label
                                    ><input
                                        v-model.number="
                                            testForm.sections.actMath
                                        "
                                        type="number"
                                        min="1"
                                        max="36"
                                    />
                                </div>
                                <div class="field">
                                    <label>Reading</label
                                    ><input
                                        v-model.number="
                                            testForm.sections.actReading
                                        "
                                        type="number"
                                        min="1"
                                        max="36"
                                    />
                                </div>
                                <div class="field">
                                    <label>Science</label
                                    ><input
                                        v-model.number="
                                            testForm.sections.actScience
                                        "
                                        type="number"
                                        min="1"
                                        max="36"
                                    />
                                </div>
                            </div>
                        </template>
                        <div class="field">
                            <label>Notes</label
                            ><input v-model="testForm.notes" type="text" />
                        </div>
                        <div class="field check">
                            <label
                                ><input
                                    v-model="testForm.superscoreEligible"
                                    type="checkbox"
                                />
                                Superscore Eligible</label
                            >
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-save" @click="saveTest">
                            {{ editingTestId ? "Update" : "Add" }}</button
                        ><button
                            class="btn-cancel"
                            @click="showTestForm = false"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <template v-if="activeTab !== 'sat-act'">
            <button class="btn-add" @click="openAddForm">
                + Add {{ currentTabLabel() }} Entry
            </button>

            <div class="item-grid">
                <div
                    v-for="item in categoryItems"
                    :key="item.id"
                    class="item-card"
                    @click="openEditForm(item)"
                >
                    <div class="item-top">
                        <span class="item-title">{{ getItemTitle(item) }}</span
                        ><button
                            class="mini-del"
                            @click.stop="removeItem(item.id)"
                        >
                            🗑️
                        </button>
                    </div>
                    <div class="item-details">
                        <template
                            v-for="field in customFields.filter(
                                (f) =>
                                    ![
                                        'notes',
                                        'description',
                                        'details',
                                        'impact',
                                        'supportReceived',
                                        'achievements',
                                    ].includes(f),
                            )"
                            :key="field"
                        >
                            <span
                                v-if="
                                    (activeTab === 'ap-scores' &&
                                        field === 'score') ||
                                    (activeTab === 'sports' &&
                                        field === 'league')
                                "
                                class="score-badge"
                                :class="
                                    activeTab === 'ap-scores'
                                        ? 'score-' + item.data[field]
                                        : 'league-' +
                                          (item.data[field] || '')
                                              .toLowerCase()
                                              .replace(/\s+/g, '-')
                                "
                                >{{ item.data[field] }}</span
                            >
                            <span v-else class="item-tag"
                                >{{ fieldLabels[activeTab]?.[field] || field }}:
                                {{ formatValue(field, item.data[field]) }}</span
                            >
                        </template>
                    </div>
                </div>
                <p
                    v-if="categoryItems.length === 0 && !showForm"
                    class="empty-text"
                >
                    No entries yet.
                </p>
            </div>

            <div v-if="showForm" class="form-card">
                <h3>
                    {{ editingId ? "Edit" : "Add" }}
                    {{ currentTabLabel() }} Entry
                </h3>
                <div class="form-grid">
                    <div
                        v-for="field in customFields"
                        :key="field"
                        class="field"
                        :class="{ full: textareaFields.includes(field) }"
                    >
                        <label>{{
                            fieldLabels[activeTab]?.[field] || field
                        }}</label>

                        <!-- AP Test Dropdown -->
                        <select
                            v-if="
                                field === 'testName' &&
                                activeTab === 'ap-scores'
                            "
                            v-model="form[field]"
                        >
                            <option value="">-- Select AP Test --</option>
                            <option
                                v-for="test in apTests"
                                :key="test"
                                :value="test"
                            >
                                {{ test }}
                            </option>
                            <option value="__OTHER__">✨ Other (custom)</option>
                        </select>
                        <input
                            v-if="
                                field === 'testName' &&
                                activeTab === 'ap-scores' &&
                                form[field] === '__OTHER__'
                            "
                            v-model="form._customTestName"
                            type="text"
                            placeholder="Type custom AP test..."
                            style="margin-top: 6px"
                        />
                        <select
                            v-else-if="
                                field === 'score' && activeTab === 'ap-scores'
                            "
                            v-model="form[field]"
                        >
                            <option :value="null">-- Select Score --</option>
                            <option
                                v-for="s in scoreOptions"
                                :key="s"
                                :value="s"
                            >
                                {{ s }}
                            </option>
                        </select>

                        <!-- Textarea with Write/Attach toggle -->
                        <div
                            v-else-if="textareaFields.includes(field)"
                            class="attach-group"
                        >
                            <div class="toggle-row">
                                <button
                                    class="mini-toggle"
                                    :class="{
                                        active:
                                            form[field + '_mode'] !== 'attach',
                                    }"
                                    @click="form[field + '_mode'] = 'write'"
                                >
                                    ✍️ Write
                                </button>
                                <button
                                    class="mini-toggle"
                                    :class="{
                                        active:
                                            form[field + '_mode'] === 'attach',
                                    }"
                                    @click="form[field + '_mode'] = 'attach'"
                                >
                                    📎 Attach
                                </button>
                            </div>
                            <textarea
                                v-if="form[field + '_mode'] !== 'attach'"
                                v-model="form[field]"
                                rows="3"
                                :placeholder="
                                    fieldLabels[activeTab]?.[field] || field
                                "
                            ></textarea>
                            <div v-else class="attach-box">
                                <input
                                    v-if="!form[field + '_file']?.name"
                                    type="file"
                                    @change="onAttachFile(field, $event)"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                />
                                <div v-else class="attached-preview">
                                    📎 {{ form[field + "_file"]?.name }}
                                    <button
                                        class="link-btn"
                                        @click="downloadAttached(field)"
                                    >
                                        Download
                                    </button>
                                    <button
                                        class="link-btn clear"
                                        @click="clearAttach(field)"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Dropdowns -->
                        <select
                            v-else-if="
                                field === 'type' && activeTab === 'volunteer'
                            "
                            v-model="form[field]"
                        >
                            <option value="">-- Select --</option>
                            <option
                                v-for="o in volunteerTypeOptions"
                                :key="o"
                                :value="o"
                            >
                                {{ o }}
                            </option>
                        </select>
                        <select
                            v-else-if="
                                field === 'type' && activeTab === 'portfolio'
                            "
                            v-model="form[field]"
                        >
                            <option value="">-- Select --</option>
                            <option
                                v-for="o in portfolioTypeOptions"
                                :key="o"
                                :value="o"
                            >
                                {{ o }}
                            </option>
                        </select>
                        <select
                            v-else-if="field === 'courseType'"
                            v-model="form[field]"
                        >
                            <option value="">-- Select --</option>
                            <option
                                v-for="o in courseTypeOptions"
                                :key="o"
                                :value="o"
                            >
                                {{ o }}
                            </option>
                        </select>
                        <select
                            v-else-if="field === 'situation'"
                            v-model="form[field]"
                        >
                            <option value="">-- Select --</option>
                            <option
                                v-for="o in situationOptions"
                                :key="o"
                                :value="o"
                            >
                                {{ o }}
                            </option>
                        </select>
                        <select
                            v-else-if="field === 'league'"
                            v-model="form[field]"
                        >
                            <option value="">-- Select --</option>
                            <option
                                v-for="o in leagueOptions"
                                :key="o"
                                :value="o"
                            >
                                {{ o }}
                            </option>
                        </select>
                        <select
                            v-else-if="field === 'year' || field === 'level'"
                            v-model="form[field]"
                        >
                            <option value="">-- Select --</option>
                            <option
                                v-for="o in field === 'year'
                                    ? yearOptions
                                    : levelOptions"
                                :key="o"
                                :value="o"
                            >
                                {{ o }}
                            </option>
                        </select>
                        <select
                            v-else-if="field === 'proficiency'"
                            v-model="form[field]"
                        >
                            <option value="">-- Select --</option>
                            <option
                                v-for="o in proficiencyOptions"
                                :key="o"
                                :value="o"
                            >
                                {{ o }}
                            </option>
                        </select>
                        <select
                            v-else-if="
                                field === 'category' && activeTab === 'skills'
                            "
                            v-model="form[field]"
                        >
                            <option value="">-- Select --</option>
                            <option
                                v-for="o in skillCatOptions"
                                :key="o"
                                :value="o"
                            >
                                {{ o }}
                            </option>
                        </select>

                        <!-- Checkboxes -->
                        <div
                            v-else-if="field === 'years' || field === 'grades'"
                            class="checkbox-group"
                        >
                            <label
                                v-for="opt in field === 'years'
                                    ? yearOptions
                                    : gradeOptions"
                                :key="opt"
                                class="chip"
                                :class="{
                                    selected: (form[field] || []).includes(opt),
                                }"
                                @click="toggleCheckbox(field, opt)"
                                >{{ opt }}</label
                            >
                        </div>

                        <!-- Numbers -->
                        <input
                            v-else-if="
                                [
                                    'unweightedGPA',
                                    'weightedGPA',
                                    'credits',
                                    'hoursWeek',
                                    'weeksYear',
                                    'hours',
                                ].includes(field)
                            "
                            v-model.number="form[field]"
                            type="number"
                            min="0"
                            :step="field.includes('GPA') ? '0.01' : '1'"
                        />
                        <select
                            v-if="
                                activeTab === 'gpa' && field === 'unweightedGPA'
                            "
                            v-model="form.unweightedScale"
                            style="margin-top: 4px"
                        >
                            <option
                                v-for="s in gpaScaleOptions"
                                :key="s.value"
                                :value="s.value"
                            >
                                {{ s.label }}
                            </option>
                        </select>
                        <select
                            v-if="
                                activeTab === 'gpa' && field === 'weightedGPA'
                            "
                            v-model="form.weightedScale"
                            style="margin-top: 4px"
                        >
                            <option
                                v-for="s in gpaScaleOptions"
                                :key="s.value"
                                :value="s.value"
                            >
                                {{ s.label }}
                            </option>
                        </select>

                        <!-- Default text -->
                        <input v-else v-model="form[field]" type="text" />
                    </div>
                </div>
                <div class="form-actions">
                    <button
                        class="btn-save"
                        @click="editingId ? updateItem() : saveItem()"
                    >
                        {{ editingId ? "Update" : "Save" }}</button
                    ><button class="btn-cancel" @click="showForm = false">
                        Cancel
                    </button>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.welcome {
    color: var(--text-secondary);
    margin-bottom: 20px;
}
.tabs {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 16px;
    background: var(--border-light);
    padding: 4px;
    border-radius: 10px;
}
.tab {
    padding: 8px 14px;
    border: none;
    background: transparent;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 6px;
}
.tab:hover {
    color: var(--text-primary);
    background: var(--bg-card);
}
.tab.active {
    background: var(--bg-card);
    color: #1e1b4b;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.tab-count {
    background: #1e1b4b;
    color: #fff;
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 10px;
}
.tab-close {
    font-size: 10px;
    margin-left: 2px;
    opacity: 0.5;
}
.tab-close:hover {
    opacity: 1;
    color: #dc2626;
}
.add-tab {
    color: #059669;
    font-size: 16px;
    padding: 8px 12px;
    border-radius: 8px;
}
.add-tab:hover {
    background: #d1fae5;
}
.custom-tab-form {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 4px;
}
.custom-input {
    width: 130px;
    padding: 4px 8px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 12px;
    background: var(--bg-input);
    color: var(--text-primary);
}
.custom-ok,
.custom-cancel {
    background: none;
    border: none;
    font-size: 14px;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
}
.custom-ok {
    color: #059669;
}
.custom-ok:hover {
    background: #d1fae5;
}
.custom-cancel {
    color: var(--text-secondary);
}
.custom-cancel:hover {
    background: var(--border-light);
}

.btn-add {
    background: #1e1b4b;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 20px;
}
.item-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
}
.item-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 14px 16px;
    cursor: pointer;
    transition: all 0.15s;
}
.item-card:hover {
    box-shadow: var(--shadow);
    border-color: #1e1b4b;
}
.item-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 6px;
}
.item-title {
    font-weight: 600;
    font-size: 14px;
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
.item-details {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}
.item-tag {
    font-size: 11px;
    color: var(--text-secondary);
    background: var(--border-light);
    padding: 2px 8px;
    border-radius: 4px;
}

/* AP Score Badges */
.score-badge {
    font-size: 12px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 12px;
    color: #fff;
    display: inline-block;
}
.score-5 {
    background: #ec4899;
}
.score-4 {
    background: #f97316;
}
.score-3 {
    background: #92400e;
}
.score-2 {
    background: #92400e;
}
.score-1 {
    background: #9ca3af;
}

/* Sports League Badges */
.score-badge[class*="league-"] {
    background: #a16207;
}
.league-varsity {
    background: #f59e0b;
    color: #1e1b4b;
}
.league-jv {
    background: #94a3b8;
}
.league-junior-varsity {
    background: #94a3b8;
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

/* Attach Group */
.attach-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.toggle-row {
    display: flex;
    gap: 4px;
}
.mini-toggle {
    padding: 4px 10px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    background: var(--bg-card);
    color: var(--text-secondary);
}
.mini-toggle.active {
    background: #1e1b4b;
    color: #fff;
    border-color: #1e1b4b;
}
.attach-box {
    padding: 12px;
    border: 2px dashed var(--border-color);
    border-radius: 8px;
}
.attached-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-primary);
}
.link-btn {
    background: none;
    border: none;
    color: #1e1b4b;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    font-size: 12px;
}
.link-btn.clear {
    color: #dc2626;
}

.checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
.chip {
    padding: 6px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    background: var(--bg-card);
    color: var(--text-secondary);
    user-select: none;
    transition: all 0.15s;
}
.chip:hover {
    background: var(--border-light);
}
.chip.selected {
    background: #1e1b4b;
    color: #fff;
    border-color: #1e1b4b;
}
.form-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}
.btn-save {
    background: #059669;
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
.empty-text {
    color: var(--text-secondary);
    font-size: 14px;
    text-align: center;
    padding: 30px 0;
}
.sat-act-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
}
.sa-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 16px 18px;
}
.sa-card h4 {
    margin: 0 0 12px;
    font-size: 15px;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
}
.sa-scores-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
}
.sa-score-box {
    text-align: center;
    padding: 12px;
    background: var(--border-light);
    border-radius: 8px;
}
.sa-score-num {
    font-size: 28px;
    font-weight: 800;
    color: #1e1b4b;
}
.sa-score-label {
    font-size: 11px;
    color: var(--text-secondary);
    margin-top: 2px;
}
.sa-superscore-badge {
    margin-top: 10px;
    padding: 8px 12px;
    background: #ede9fe;
    color: #7c3aed;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    text-align: center;
}
.sa-attempt-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.sa-attempt-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
}
.sa-attempt-row:hover {
    border-color: #1e1b4b;
    background: rgba(30, 27, 75, 0.03);
}
.sa-att-info {
    display: flex;
    align-items: center;
    gap: 10px;
}
.sa-att-type {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    color: #fff;
}
.sat-badge {
    background: #2563eb;
}
.act-badge {
    background: #059669;
}
.sa-att-date {
    font-size: 13px;
    color: var(--text-primary);
}
.sa-att-score {
    font-weight: 700;
    font-size: 15px;
    color: #1e1b4b;
}
.sa-ss-badge {
    font-size: 10px;
    background: #ede9fe;
    color: #7c3aed;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
}
.sa-target-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
.sa-target-box label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 4px;
}
.sa-target-box input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 14px;
    background: var(--bg-input);
    color: var(--text-primary);
    box-sizing: border-box;
}
.sa-compare-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.sa-compare-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 13px;
}
.sa-compare-row:nth-child(odd) {
    background: var(--border-light);
}
.sa-compare-status {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 10px;
    color: #fff;
}
.sa-above {
    background: #10b981;
}
.sa-within {
    background: #f59e0b;
    color: #1e1b4b;
}
.sa-below {
    background: #dc2626;
}
.sa-no-data {
    background: #9ca3af;
}
.btn-add-sm {
    background: #1e1b4b;
    color: #fff;
    border: none;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    margin-left: auto;
}
.field.check label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-primary);
}
.field.check input {
    width: auto;
}
</style>
