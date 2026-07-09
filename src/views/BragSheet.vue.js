import { ref, computed } from "vue";
import { useBragStore } from "../stores/bragStore";
import { getUserKey } from "../stores/userKey";
const store = useBragStore();
const activeTab = ref("sat-act");
const showForm = ref(false);
const showCustomForm = ref(false);
const editingId = ref(null);
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
const customTabs = ref([]);
(function loadCustomTabs() {
    const saved = localStorage.getItem("applywise-brag-custom-tabs");
    if (saved)
        customTabs.value = JSON.parse(saved);
})();
function saveCustomTabs() {
    localStorage.setItem("applywise-brag-custom-tabs", JSON.stringify(customTabs.value));
}
const allTabs = computed(() => [...defaultTabs, ...customTabs.value]);
function addCustomTab() {
    if (!customCategoryName.value.trim())
        return;
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
function deleteCustomTab(tabId) {
    store.getByCategory(tabId).forEach((i) => store.deleteItem(i.id));
    customTabs.value = customTabs.value.filter((t) => t.id !== tabId);
    saveCustomTabs();
    if (activeTab.value === tabId)
        activeTab.value = "gpa";
}
const isCustom = computed(() => !defaultTabs.find((t) => t.id === activeTab.value));
const satActData = ref({
    attempts: [],
    targetSat: 0,
    targetAct: 0,
    notes: "",
});
(function loadSatAct() {
    const saved = localStorage.getItem(getUserKey("sat-act"));
    if (saved)
        satActData.value = JSON.parse(saved);
})();
function saveSatAct() {
    localStorage.setItem(getUserKey("sat-act"), JSON.stringify(satActData.value));
}
const satSuperscore = computed(() => {
    const satAttempts = satActData.value.attempts.filter((a) => a.type === "SAT" && a.superscoreEligible);
    if (satAttempts.length === 0)
        return null;
    const bestMath = Math.max(...satAttempts.map((a) => a.sections?.math || 0));
    const bestReading = Math.max(...satAttempts.map((a) => a.sections?.reading || 0));
    return {
        total: bestMath + bestReading,
        math: bestMath,
        reading: bestReading,
    };
});
const highestAct = computed(() => {
    const actAttempts = satActData.value.attempts.filter((a) => a.type === "ACT");
    if (actAttempts.length === 0)
        return null;
    return Math.max(...actAttempts.map((a) => a.totalScore || 0));
});
const currentSat = computed(() => {
    return (satSuperscore.value?.total ||
        satActData.value.attempts
            .filter((a) => a.type === "SAT")
            .reduce((max, a) => Math.max(max, a.totalScore || 0), 0) ||
        null);
});
const currentAct = computed(() => highestAct.value);
// Test attempt form
const showTestForm = ref(false);
const editingTestId = ref(null);
const testForm = ref({
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
function openEditTest(a) {
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
        const idx = satActData.value.attempts.findIndex((a) => a.id === editingTestId.value);
        if (idx !== -1)
            satActData.value.attempts[idx] = {
                ...testForm.value,
                id: editingTestId.value,
            };
    }
    else {
        satActData.value.attempts.push({
            ...testForm.value,
            id: crypto.randomUUID(),
        });
    }
    saveSatAct();
    showTestForm.value = false;
}
function deleteTest(id) {
    if (!confirm("Delete this attempt?"))
        return;
    satActData.value.attempts = satActData.value.attempts.filter((a) => a.id !== id);
    saveSatAct();
}
// ── SAT / ACT Data ──
const satGoalPercent = computed(() => satActData.value.targetSat > 0
    ? Math.min(Math.round(((currentSat.value || 0) / satActData.value.targetSat) * 100), 100)
    : 0);
const actGoalPercent = computed(() => satActData.value.targetAct > 0
    ? Math.min(Math.round(((currentAct.value || 0) / satActData.value.targetAct) * 100), 100)
    : 0);
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
const fieldLabels = {
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
const form = ref({});
const customFields = computed(() => {
    if (isCustom.value)
        return ["title", "description", "details"];
    return Object.keys(fieldLabels[activeTab.value] || {});
});
const categoryItems = computed(() => store.getByCategory(activeTab.value));
function initForm() {
    form.value = {};
    customFields.value.forEach((field) => {
        if (field === "years" || field === "grades")
            form.value[field] = [];
        else if (field === "score")
            form.value[field] = null;
        else if ([
            "credits",
            "hoursWeek",
            "weeksYear",
            "hours",
            "unweightedGPA",
            "weightedGPA",
        ].includes(field))
            form.value[field] = 0;
        else if (field === "unweightedScale" || field === "weightedScale")
            form.value[field] = "4.0";
        else if (textareaFields.includes(field)) {
            form.value[field] = "";
            form.value[field + "_mode"] = "write";
            form.value[field + "_file"] = null;
        }
        else
            form.value[field] = "";
    });
}
function openAddForm() {
    editingId.value = null;
    initForm();
    showForm.value = true;
}
function openEditForm(item) {
    editingId.value = item.id;
    form.value = { ...item.data };
    customFields.value.forEach((field) => {
        if ((field === "years" || field === "grades") &&
            !Array.isArray(form.value[field]))
            form.value[field] = [];
        if (field === "score" && form.value[field] === undefined)
            form.value[field] = null;
        if (textareaFields.includes(field)) {
            if (!form.value[field + "_mode"])
                form.value[field + "_mode"] = form.value[field]?.startsWith("FILE:")
                    ? "attach"
                    : "write";
            if (!form.value[field + "_file"] &&
                form.value[field]?.startsWith("FILE:")) {
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
function onAttachFile(field, event) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file)
        return;
    const reader = new FileReader();
    reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        if (!form.value[field + "_file"])
            form.value[field + "_file"] = {};
        form.value[field + "_file"] = {
            name: file.name,
            data: base64,
            type: file.type,
        };
        form.value[field] = `FILE:|${file.name}|${base64}|${file.type}`;
    };
    reader.readAsDataURL(file);
}
function downloadAttached(field) {
    const f = form.value[field + "_file"];
    if (!f?.data)
        return;
    const a = document.createElement("a");
    a.href = `data:${f.type};base64,${f.data}`;
    a.download = f.name;
    a.click();
}
function clearAttach(field) {
    form.value[field] = "";
    form.value[field + "_file"] = null;
    form.value[field + "_mode"] = "write";
}
function prepareFormBeforeSave() {
    if (activeTab.value === "ap-scores" &&
        form.value.testName === "__OTHER__" &&
        form.value._customTestName) {
        form.value.testName = form.value._customTestName.trim();
        delete form.value._customTestName;
    }
    // Clean up mode/file keys before saving
    const clean = {};
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
        const uwScale = gpaScaleOptions.find((s) => s.value === (form.value.unweightedScale || "4.0"));
        const wScale = gpaScaleOptions.find((s) => s.value === (form.value.weightedScale || "4.0"));
        const uwMax = uwScale?.max ?? 5;
        const wMax = wScale?.max ?? 5;
        if (form.value.unweightedGPA &&
            (form.value.unweightedGPA < 0 || form.value.unweightedGPA > uwMax)) {
            alert("Unweighted GPA must be 0-" +
                uwMax +
                " on " +
                (uwScale?.label || "selected") +
                " scale.");
            return;
        }
        if (form.value.weightedGPA &&
            (form.value.weightedGPA < 0 || form.value.weightedGPA > wMax)) {
            alert("Weighted GPA must be 0-" +
                wMax +
                " on " +
                (wScale?.label || "selected") +
                " scale.");
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
    if (!editingId.value)
        return;
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
        const uwScale = gpaScaleOptions.find((s) => s.value === (form.value.unweightedScale || "4.0"));
        const wScale = gpaScaleOptions.find((s) => s.value === (form.value.weightedScale || "4.0"));
        const uwMax = uwScale?.max ?? 5;
        const wMax = wScale?.max ?? 5;
        if (form.value.unweightedGPA &&
            (form.value.unweightedGPA < 0 || form.value.unweightedGPA > uwMax)) {
            alert("Unweighted GPA must be 0-" +
                uwMax +
                " on " +
                (uwScale?.label || "selected") +
                " scale.");
            return;
        }
        if (form.value.weightedGPA &&
            (form.value.weightedGPA < 0 || form.value.weightedGPA > wMax)) {
            alert("Weighted GPA must be 0-" +
                wMax +
                " on " +
                (wScale?.label || "selected") +
                " scale.");
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
function removeItem(id) {
    if (confirm("Delete this entry?"))
        store.deleteItem(id);
}
function formatValue(_key, val) {
    if (val === null || val === undefined)
        return "—";
    if (Array.isArray(val))
        return val.join(", ");
    const s = String(val);
    if (s.startsWith("FILE:")) {
        const parts = s.split("|");
        return "📎 " + (parts[1] || "file");
    }
    if (s.length > 60)
        return s.slice(0, 60) + "...";
    return s;
}
function getItemTitle(item) {
    const d = item.data;
    if (activeTab.value === "gpa")
        return d.unweightedGPA
            ? `GPA: ${d.unweightedGPA}${d.unweightedScale ? " (" + d.unweightedScale + ")" : ""}`
            : "GPA Entry";
    if (activeTab.value === "courses")
        return d.courseName || "Course";
    if (activeTab.value === "ap-scores")
        return d.testName || "Test";
    if (activeTab.value === "clubs")
        return d.clubName || "Club";
    if (activeTab.value === "sports")
        return d.sportName || "Sport";
    if (activeTab.value === "volunteer")
        return (`${d.type || ""}${d.organization ? " at " + d.organization : ""}` ||
            "Activity");
    if (activeTab.value === "awards")
        return d.awardName || "Award";
    if (activeTab.value === "portfolio")
        return d.title || "Project";
    if (activeTab.value === "skills")
        return d.skillName || "Skill";
    if (activeTab.value === "family")
        return d.title || "Situation";
    if (isCustom.value)
        return d.title || "Entry";
    return "Entry";
}
function currentTabLabel() {
    return (allTabs.value
        .find((t) => t.id === activeTab.value)
        ?.label?.replace(/^[^\s]+\s/, "") || "");
}
function toggleCheckbox(field, opt) {
    if (!form.value[field])
        form.value[field] = [];
    const arr = form.value[field];
    const idx = arr.indexOf(opt);
    idx === -1 ? arr.push(opt) : arr.splice(idx, 1);
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['tab']} */ ;
/** @type {__VLS_StyleScopedClasses['tab']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-close']} */ ;
/** @type {__VLS_StyleScopedClasses['add-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-ok']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-ok']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-cancel']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-cancel']} */ ;
/** @type {__VLS_StyleScopedClasses['item-card']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-del']} */ ;
/** @type {__VLS_StyleScopedClasses['score-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['link-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['chip']} */ ;
/** @type {__VLS_StyleScopedClasses['chip']} */ ;
/** @type {__VLS_StyleScopedClasses['sa-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sa-attempt-row']} */ ;
/** @type {__VLS_StyleScopedClasses['sa-target-box']} */ ;
/** @type {__VLS_StyleScopedClasses['sa-compare-row']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['check']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "welcome" },
});
/** @type {__VLS_StyleScopedClasses['welcome']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tabs" },
});
/** @type {__VLS_StyleScopedClasses['tabs']} */ ;
for (const [tab] of __VLS_vFor((__VLS_ctx.allTabs))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.activeTab = tab.id;
                __VLS_ctx.showForm = false;
                ;
                // @ts-ignore
                [allTabs, activeTab, showForm,];
            } },
        key: (tab.id),
        ...{ class: "tab" },
        ...{ class: ({ active: __VLS_ctx.activeTab === tab.id }) },
    });
    /** @type {__VLS_StyleScopedClasses['tab']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    (tab.label);
    if (__VLS_ctx.store.getByCategory(tab.id).length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "tab-count" },
        });
        /** @type {__VLS_StyleScopedClasses['tab-count']} */ ;
        (__VLS_ctx.store.getByCategory(tab.id).length);
    }
    if (!__VLS_ctx.defaultTabs.find((t) => t.id === tab.id)) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.defaultTabs.find((t) => t.id === tab.id)))
                        throw 0;
                    return __VLS_ctx.deleteCustomTab(tab.id);
                    // @ts-ignore
                    [activeTab, store, store, defaultTabs, deleteCustomTab,];
                } },
            ...{ class: "tab-close" },
        });
        /** @type {__VLS_StyleScopedClasses['tab-close']} */ ;
    }
    // @ts-ignore
    [];
}
if (!__VLS_ctx.showCustomForm) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.showCustomForm))
                    throw 0;
                return __VLS_ctx.showCustomForm = true;
                // @ts-ignore
                [showCustomForm, showCustomForm,];
            } },
        ...{ class: "tab add-tab" },
    });
    /** @type {__VLS_StyleScopedClasses['tab']} */ ;
    /** @type {__VLS_StyleScopedClasses['add-tab']} */ ;
}
if (__VLS_ctx.showCustomForm) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "custom-tab-form" },
    });
    /** @type {__VLS_StyleScopedClasses['custom-tab-form']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onKeyup: (__VLS_ctx.addCustomTab) },
        value: (__VLS_ctx.customCategoryName),
        type: "text",
        placeholder: "Category name...",
        ...{ class: "custom-input" },
    });
    /** @type {__VLS_StyleScopedClasses['custom-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.addCustomTab) },
        ...{ class: "custom-ok" },
    });
    /** @type {__VLS_StyleScopedClasses['custom-ok']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showCustomForm))
                    throw 0;
                __VLS_ctx.showCustomForm = false;
                __VLS_ctx.customCategoryName = '';
                ;
                // @ts-ignore
                [showCustomForm, showCustomForm, addCustomTab, addCustomTab, customCategoryName, customCategoryName,];
            } },
        ...{ class: "custom-cancel" },
    });
    /** @type {__VLS_StyleScopedClasses['custom-cancel']} */ ;
}
if (__VLS_ctx.activeTab === 'sat-act') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sat-act-section" },
    });
    /** @type {__VLS_StyleScopedClasses['sat-act-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sa-card" },
    });
    /** @type {__VLS_StyleScopedClasses['sa-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sa-scores-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['sa-scores-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sa-score-box" },
    });
    /** @type {__VLS_StyleScopedClasses['sa-score-box']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sa-score-num" },
    });
    /** @type {__VLS_StyleScopedClasses['sa-score-num']} */ ;
    (__VLS_ctx.currentSat || "—");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sa-score-label" },
    });
    /** @type {__VLS_StyleScopedClasses['sa-score-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sa-score-box" },
    });
    /** @type {__VLS_StyleScopedClasses['sa-score-box']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sa-score-num" },
    });
    /** @type {__VLS_StyleScopedClasses['sa-score-num']} */ ;
    (__VLS_ctx.satSuperscore?.math || "—");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sa-score-label" },
    });
    /** @type {__VLS_StyleScopedClasses['sa-score-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sa-score-box" },
    });
    /** @type {__VLS_StyleScopedClasses['sa-score-box']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sa-score-num" },
    });
    /** @type {__VLS_StyleScopedClasses['sa-score-num']} */ ;
    (__VLS_ctx.satSuperscore?.reading || "—");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sa-score-label" },
    });
    /** @type {__VLS_StyleScopedClasses['sa-score-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sa-score-box" },
    });
    /** @type {__VLS_StyleScopedClasses['sa-score-box']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sa-score-num" },
    });
    /** @type {__VLS_StyleScopedClasses['sa-score-num']} */ ;
    (__VLS_ctx.currentAct || "—");
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sa-score-label" },
    });
    /** @type {__VLS_StyleScopedClasses['sa-score-label']} */ ;
    if (__VLS_ctx.satSuperscore) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "sa-superscore-badge" },
        });
        /** @type {__VLS_StyleScopedClasses['sa-superscore-badge']} */ ;
        (__VLS_ctx.satSuperscore.total);
        (__VLS_ctx.satSuperscore.math);
        (__VLS_ctx.satSuperscore.reading);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sa-card" },
    });
    /** @type {__VLS_StyleScopedClasses['sa-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.openAddTest) },
        ...{ class: "btn-add-sm" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-add-sm']} */ ;
    if (__VLS_ctx.satActData.attempts.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "empty-text" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "sa-attempt-list" },
        });
        /** @type {__VLS_StyleScopedClasses['sa-attempt-list']} */ ;
        for (const [a] of __VLS_vFor((__VLS_ctx.satActData.attempts))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'sat-act'))
                            throw 0;
                        if (!!(__VLS_ctx.satActData.attempts.length === 0))
                            throw 0;
                        return __VLS_ctx.openEditTest(a);
                        // @ts-ignore
                        [activeTab, currentSat, satSuperscore, satSuperscore, satSuperscore, satSuperscore, satSuperscore, satSuperscore, currentAct, openAddTest, satActData, satActData, openEditTest,];
                    } },
                key: (a.id),
                ...{ class: "sa-attempt-row" },
            });
            /** @type {__VLS_StyleScopedClasses['sa-attempt-row']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "sa-att-info" },
            });
            /** @type {__VLS_StyleScopedClasses['sa-att-info']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "sa-att-type" },
                ...{ class: (a.type === 'SAT' ? 'sat-badge' : 'act-badge') },
            });
            /** @type {__VLS_StyleScopedClasses['sa-att-type']} */ ;
            (a.type);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "sa-att-date" },
            });
            /** @type {__VLS_StyleScopedClasses['sa-att-date']} */ ;
            (a.date);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "sa-att-score" },
            });
            /** @type {__VLS_StyleScopedClasses['sa-att-score']} */ ;
            (a.totalScore);
            if (a.superscoreEligible) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "sa-ss-badge" },
                });
                /** @type {__VLS_StyleScopedClasses['sa-ss-badge']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.activeTab === 'sat-act'))
                            throw 0;
                        if (!!(__VLS_ctx.satActData.attempts.length === 0))
                            throw 0;
                        return __VLS_ctx.deleteTest(a.id);
                        // @ts-ignore
                        [deleteTest,];
                    } },
                ...{ class: "mini-del" },
            });
            /** @type {__VLS_StyleScopedClasses['mini-del']} */ ;
            // @ts-ignore
            [];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sa-card" },
    });
    /** @type {__VLS_StyleScopedClasses['sa-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sa-target-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['sa-target-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sa-target-box" },
    });
    /** @type {__VLS_StyleScopedClasses['sa-target-box']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onChange: (__VLS_ctx.saveSatAct) },
        type: "number",
        min: "400",
        max: "1600",
        step: "10",
    });
    (__VLS_ctx.satActData.targetSat);
    if (__VLS_ctx.satActData.targetSat > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mini-bar" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['mini-bar']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mini-fill" },
            ...{ style: ({
                    width: __VLS_ctx.satGoalPercent + '%',
                    background: __VLS_ctx.satGoalPercent >= 100
                        ? '#10b981'
                        : __VLS_ctx.satGoalPercent >= 50
                            ? '#f59e0b'
                            : '#1e1b4b',
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['mini-fill']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "mini-label" },
    });
    /** @type {__VLS_StyleScopedClasses['mini-label']} */ ;
    (__VLS_ctx.currentSat || 0);
    (__VLS_ctx.satActData.targetSat);
    (__VLS_ctx.satGoalPercent);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sa-target-box" },
    });
    /** @type {__VLS_StyleScopedClasses['sa-target-box']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onChange: (__VLS_ctx.saveSatAct) },
        type: "number",
        min: "1",
        max: "36",
    });
    (__VLS_ctx.satActData.targetAct);
    if (__VLS_ctx.satActData.targetAct > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mini-bar" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['mini-bar']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mini-fill" },
            ...{ style: ({
                    width: __VLS_ctx.actGoalPercent + '%',
                    background: __VLS_ctx.actGoalPercent >= 100
                        ? '#10b981'
                        : __VLS_ctx.actGoalPercent >= 50
                            ? '#f59e0b'
                            : '#1e1b4b',
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['mini-fill']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "mini-label" },
    });
    /** @type {__VLS_StyleScopedClasses['mini-label']} */ ;
    (__VLS_ctx.currentAct || 0);
    (__VLS_ctx.satActData.targetAct);
    (__VLS_ctx.actGoalPercent);
    if (__VLS_ctx.showTestForm) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab === 'sat-act'))
                        throw 0;
                    if (!(__VLS_ctx.showTestForm))
                        throw 0;
                    return __VLS_ctx.showTestForm = false;
                    // @ts-ignore
                    [currentSat, currentAct, satActData, satActData, satActData, satActData, satActData, satActData, saveSatAct, saveSatAct, satGoalPercent, satGoalPercent, satGoalPercent, satGoalPercent, actGoalPercent, actGoalPercent, actGoalPercent, actGoalPercent, showTestForm, showTestForm,];
                } },
            ...{ class: "modal-overlay" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: () => { } },
            ...{ class: "modal" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['modal']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "modal-header" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        (__VLS_ctx.editingTestId ? "Edit" : "Add");
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab === 'sat-act'))
                        throw 0;
                    if (!(__VLS_ctx.showTestForm))
                        throw 0;
                    return __VLS_ctx.showTestForm = false;
                    // @ts-ignore
                    [showTestForm, editingTestId,];
                } },
            ...{ class: "btn-close" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "modal-body" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "field" },
        });
        /** @type {__VLS_StyleScopedClasses['field']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
            value: (__VLS_ctx.testForm.type),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "SAT",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "ACT",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "field" },
        });
        /** @type {__VLS_StyleScopedClasses['field']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            type: "date",
        });
        (__VLS_ctx.testForm.date);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "field" },
        });
        /** @type {__VLS_StyleScopedClasses['field']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            type: "number",
            min: (__VLS_ctx.testForm.type === 'SAT' ? 400 : 1),
            max: (__VLS_ctx.testForm.type === 'SAT' ? 1600 : 36),
        });
        (__VLS_ctx.testForm.totalScore);
        if (__VLS_ctx.testForm.type === 'SAT') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "form-grid" },
            });
            /** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "field" },
            });
            /** @type {__VLS_StyleScopedClasses['field']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                type: "number",
                min: "200",
                max: "800",
            });
            (__VLS_ctx.testForm.sections.math);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "field" },
            });
            /** @type {__VLS_StyleScopedClasses['field']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                type: "number",
                min: "200",
                max: "800",
            });
            (__VLS_ctx.testForm.sections.reading);
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "form-grid" },
            });
            /** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "field" },
            });
            /** @type {__VLS_StyleScopedClasses['field']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                type: "number",
                min: "1",
                max: "36",
            });
            (__VLS_ctx.testForm.sections.english);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "field" },
            });
            /** @type {__VLS_StyleScopedClasses['field']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                type: "number",
                min: "1",
                max: "36",
            });
            (__VLS_ctx.testForm.sections.actMath);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "field" },
            });
            /** @type {__VLS_StyleScopedClasses['field']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                type: "number",
                min: "1",
                max: "36",
            });
            (__VLS_ctx.testForm.sections.actReading);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "field" },
            });
            /** @type {__VLS_StyleScopedClasses['field']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                type: "number",
                min: "1",
                max: "36",
            });
            (__VLS_ctx.testForm.sections.actScience);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "field" },
        });
        /** @type {__VLS_StyleScopedClasses['field']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            value: (__VLS_ctx.testForm.notes),
            type: "text",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "field check" },
        });
        /** @type {__VLS_StyleScopedClasses['field']} */ ;
        /** @type {__VLS_StyleScopedClasses['check']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            type: "checkbox",
        });
        (__VLS_ctx.testForm.superscoreEligible);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "modal-footer" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.saveTest) },
            ...{ class: "btn-save" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
        (__VLS_ctx.editingTestId ? "Update" : "Add");
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab === 'sat-act'))
                        throw 0;
                    if (!(__VLS_ctx.showTestForm))
                        throw 0;
                    return __VLS_ctx.showTestForm = false;
                    // @ts-ignore
                    [showTestForm, editingTestId, testForm, testForm, testForm, testForm, testForm, testForm, testForm, testForm, testForm, testForm, testForm, testForm, testForm, testForm, saveTest,];
                } },
            ...{ class: "btn-cancel" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-cancel']} */ ;
    }
}
if (__VLS_ctx.activeTab !== 'sat-act') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.openAddForm) },
        ...{ class: "btn-add" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-add']} */ ;
    (__VLS_ctx.currentTabLabel());
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "item-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['item-grid']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.categoryItems))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab !== 'sat-act'))
                        throw 0;
                    return __VLS_ctx.openEditForm(item);
                    // @ts-ignore
                    [activeTab, openAddForm, currentTabLabel, categoryItems, openEditForm,];
                } },
            key: (item.id),
            ...{ class: "item-card" },
        });
        /** @type {__VLS_StyleScopedClasses['item-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "item-top" },
        });
        /** @type {__VLS_StyleScopedClasses['item-top']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "item-title" },
        });
        /** @type {__VLS_StyleScopedClasses['item-title']} */ ;
        (__VLS_ctx.getItemTitle(item));
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab !== 'sat-act'))
                        throw 0;
                    return __VLS_ctx.removeItem(item.id);
                    // @ts-ignore
                    [getItemTitle, removeItem,];
                } },
            ...{ class: "mini-del" },
        });
        /** @type {__VLS_StyleScopedClasses['mini-del']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "item-details" },
        });
        /** @type {__VLS_StyleScopedClasses['item-details']} */ ;
        for (const [field] of __VLS_vFor((__VLS_ctx.customFields.filter((f) => ![
            'notes',
            'description',
            'details',
            'impact',
            'supportReceived',
            'achievements',
        ].includes(f))))) {
            __VLS_asFunctionalElement(__VLS_intrinsics.template)({
                key: (field),
            });
            if ((__VLS_ctx.activeTab === 'ap-scores' &&
                field === 'score') ||
                (__VLS_ctx.activeTab === 'sports' &&
                    field === 'league')) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "score-badge" },
                    ...{ class: (__VLS_ctx.activeTab === 'ap-scores'
                            ? 'score-' + item.data[field]
                            : 'league-' +
                                (item.data[field] || '')
                                    .toLowerCase()
                                    .replace(/\s+/g, '-')) },
                });
                /** @type {__VLS_StyleScopedClasses['score-badge']} */ ;
                (item.data[field]);
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "item-tag" },
                });
                /** @type {__VLS_StyleScopedClasses['item-tag']} */ ;
                (__VLS_ctx.fieldLabels[__VLS_ctx.activeTab]?.[field] || field);
                (__VLS_ctx.formatValue(field, item.data[field]));
            }
            // @ts-ignore
            [activeTab, activeTab, activeTab, activeTab, customFields, fieldLabels, formatValue,];
        }
        // @ts-ignore
        [];
    }
    if (__VLS_ctx.categoryItems.length === 0 && !__VLS_ctx.showForm) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "empty-text" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
    }
    if (__VLS_ctx.showForm) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-card" },
        });
        /** @type {__VLS_StyleScopedClasses['form-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        (__VLS_ctx.editingId ? "Edit" : "Add");
        (__VLS_ctx.currentTabLabel());
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-grid" },
        });
        /** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
        for (const [field] of __VLS_vFor((__VLS_ctx.customFields))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (field),
                ...{ class: "field" },
                ...{ class: ({ full: __VLS_ctx.textareaFields.includes(field) }) },
            });
            /** @type {__VLS_StyleScopedClasses['field']} */ ;
            /** @type {__VLS_StyleScopedClasses['full']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
            (__VLS_ctx.fieldLabels[__VLS_ctx.activeTab]?.[field] || field);
            if (field === 'testName' &&
                __VLS_ctx.activeTab === 'ap-scores') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
                    value: (__VLS_ctx.form[field]),
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                    value: "",
                });
                for (const [test] of __VLS_vFor((__VLS_ctx.apTests))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                        key: (test),
                        value: (test),
                    });
                    (test);
                    // @ts-ignore
                    [activeTab, activeTab, showForm, showForm, currentTabLabel, categoryItems, customFields, fieldLabels, editingId, textareaFields, form, apTests,];
                }
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                    value: "__OTHER__",
                });
            }
            if (field === 'testName' &&
                __VLS_ctx.activeTab === 'ap-scores' &&
                __VLS_ctx.form[field] === '__OTHER__') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                    value: (__VLS_ctx.form._customTestName),
                    type: "text",
                    placeholder: "Type custom AP test...",
                    ...{ style: {} },
                });
            }
            else if (field === 'score' && __VLS_ctx.activeTab === 'ap-scores') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
                    value: (__VLS_ctx.form[field]),
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                    value: (null),
                });
                for (const [s] of __VLS_vFor((__VLS_ctx.scoreOptions))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                        key: (s),
                        value: (s),
                    });
                    (s);
                    // @ts-ignore
                    [activeTab, activeTab, form, form, form, scoreOptions,];
                }
            }
            else if (__VLS_ctx.textareaFields.includes(field)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "attach-group" },
                });
                /** @type {__VLS_StyleScopedClasses['attach-group']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "toggle-row" },
                });
                /** @type {__VLS_StyleScopedClasses['toggle-row']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.activeTab !== 'sat-act'))
                                throw 0;
                            if (!(__VLS_ctx.showForm))
                                throw 0;
                            if (!!(field === 'testName' &&
                                __VLS_ctx.activeTab === 'ap-scores' &&
                                __VLS_ctx.form[field] === '__OTHER__'))
                                throw 0;
                            if (!!(field === 'score' && __VLS_ctx.activeTab === 'ap-scores'))
                                throw 0;
                            if (!(__VLS_ctx.textareaFields.includes(field)))
                                throw 0;
                            return __VLS_ctx.form[field + '_mode'] = 'write';
                            // @ts-ignore
                            [textareaFields, form,];
                        } },
                    ...{ class: "mini-toggle" },
                    ...{ class: ({
                            active: __VLS_ctx.form[field + '_mode'] !== 'attach',
                        }) },
                });
                /** @type {__VLS_StyleScopedClasses['mini-toggle']} */ ;
                /** @type {__VLS_StyleScopedClasses['active']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!(__VLS_ctx.activeTab !== 'sat-act'))
                                throw 0;
                            if (!(__VLS_ctx.showForm))
                                throw 0;
                            if (!!(field === 'testName' &&
                                __VLS_ctx.activeTab === 'ap-scores' &&
                                __VLS_ctx.form[field] === '__OTHER__'))
                                throw 0;
                            if (!!(field === 'score' && __VLS_ctx.activeTab === 'ap-scores'))
                                throw 0;
                            if (!(__VLS_ctx.textareaFields.includes(field)))
                                throw 0;
                            return __VLS_ctx.form[field + '_mode'] = 'attach';
                            // @ts-ignore
                            [form, form,];
                        } },
                    ...{ class: "mini-toggle" },
                    ...{ class: ({
                            active: __VLS_ctx.form[field + '_mode'] === 'attach',
                        }) },
                });
                /** @type {__VLS_StyleScopedClasses['mini-toggle']} */ ;
                /** @type {__VLS_StyleScopedClasses['active']} */ ;
                if (__VLS_ctx.form[field + '_mode'] !== 'attach') {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
                        value: (__VLS_ctx.form[field]),
                        rows: "3",
                        placeholder: (__VLS_ctx.fieldLabels[__VLS_ctx.activeTab]?.[field] || field),
                    });
                }
                else {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                        ...{ class: "attach-box" },
                    });
                    /** @type {__VLS_StyleScopedClasses['attach-box']} */ ;
                    if (!__VLS_ctx.form[field + '_file']?.name) {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                            ...{ onChange: (...[$event]) => {
                                    if (!(__VLS_ctx.activeTab !== 'sat-act'))
                                        throw 0;
                                    if (!(__VLS_ctx.showForm))
                                        throw 0;
                                    if (!!(field === 'testName' &&
                                        __VLS_ctx.activeTab === 'ap-scores' &&
                                        __VLS_ctx.form[field] === '__OTHER__'))
                                        throw 0;
                                    if (!!(field === 'score' && __VLS_ctx.activeTab === 'ap-scores'))
                                        throw 0;
                                    if (!(__VLS_ctx.textareaFields.includes(field)))
                                        throw 0;
                                    if (!!(__VLS_ctx.form[field + '_mode'] !== 'attach'))
                                        throw 0;
                                    if (!(!__VLS_ctx.form[field + '_file']?.name))
                                        throw 0;
                                    return __VLS_ctx.onAttachFile(field, $event);
                                    // @ts-ignore
                                    [activeTab, fieldLabels, form, form, form, form, onAttachFile,];
                                } },
                            type: "file",
                            accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt",
                        });
                    }
                    else {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                            ...{ class: "attached-preview" },
                        });
                        /** @type {__VLS_StyleScopedClasses['attached-preview']} */ ;
                        (__VLS_ctx.form[field + "_file"]?.name);
                        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                            ...{ onClick: (...[$event]) => {
                                    if (!(__VLS_ctx.activeTab !== 'sat-act'))
                                        throw 0;
                                    if (!(__VLS_ctx.showForm))
                                        throw 0;
                                    if (!!(field === 'testName' &&
                                        __VLS_ctx.activeTab === 'ap-scores' &&
                                        __VLS_ctx.form[field] === '__OTHER__'))
                                        throw 0;
                                    if (!!(field === 'score' && __VLS_ctx.activeTab === 'ap-scores'))
                                        throw 0;
                                    if (!(__VLS_ctx.textareaFields.includes(field)))
                                        throw 0;
                                    if (!!(__VLS_ctx.form[field + '_mode'] !== 'attach'))
                                        throw 0;
                                    if (!!(!__VLS_ctx.form[field + '_file']?.name))
                                        throw 0;
                                    return __VLS_ctx.downloadAttached(field);
                                    // @ts-ignore
                                    [form, downloadAttached,];
                                } },
                            ...{ class: "link-btn" },
                        });
                        /** @type {__VLS_StyleScopedClasses['link-btn']} */ ;
                        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                            ...{ onClick: (...[$event]) => {
                                    if (!(__VLS_ctx.activeTab !== 'sat-act'))
                                        throw 0;
                                    if (!(__VLS_ctx.showForm))
                                        throw 0;
                                    if (!!(field === 'testName' &&
                                        __VLS_ctx.activeTab === 'ap-scores' &&
                                        __VLS_ctx.form[field] === '__OTHER__'))
                                        throw 0;
                                    if (!!(field === 'score' && __VLS_ctx.activeTab === 'ap-scores'))
                                        throw 0;
                                    if (!(__VLS_ctx.textareaFields.includes(field)))
                                        throw 0;
                                    if (!!(__VLS_ctx.form[field + '_mode'] !== 'attach'))
                                        throw 0;
                                    if (!!(!__VLS_ctx.form[field + '_file']?.name))
                                        throw 0;
                                    return __VLS_ctx.clearAttach(field);
                                    // @ts-ignore
                                    [clearAttach,];
                                } },
                            ...{ class: "link-btn clear" },
                        });
                        /** @type {__VLS_StyleScopedClasses['link-btn']} */ ;
                        /** @type {__VLS_StyleScopedClasses['clear']} */ ;
                    }
                }
            }
            else if (field === 'type' && __VLS_ctx.activeTab === 'volunteer') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
                    value: (__VLS_ctx.form[field]),
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                    value: "",
                });
                for (const [o] of __VLS_vFor((__VLS_ctx.volunteerTypeOptions))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                        key: (o),
                        value: (o),
                    });
                    (o);
                    // @ts-ignore
                    [activeTab, form, volunteerTypeOptions,];
                }
            }
            else if (field === 'type' && __VLS_ctx.activeTab === 'portfolio') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
                    value: (__VLS_ctx.form[field]),
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                    value: "",
                });
                for (const [o] of __VLS_vFor((__VLS_ctx.portfolioTypeOptions))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                        key: (o),
                        value: (o),
                    });
                    (o);
                    // @ts-ignore
                    [activeTab, form, portfolioTypeOptions,];
                }
            }
            else if (field === 'courseType') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
                    value: (__VLS_ctx.form[field]),
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                    value: "",
                });
                for (const [o] of __VLS_vFor((__VLS_ctx.courseTypeOptions))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                        key: (o),
                        value: (o),
                    });
                    (o);
                    // @ts-ignore
                    [form, courseTypeOptions,];
                }
            }
            else if (field === 'situation') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
                    value: (__VLS_ctx.form[field]),
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                    value: "",
                });
                for (const [o] of __VLS_vFor((__VLS_ctx.situationOptions))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                        key: (o),
                        value: (o),
                    });
                    (o);
                    // @ts-ignore
                    [form, situationOptions,];
                }
            }
            else if (field === 'league') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
                    value: (__VLS_ctx.form[field]),
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                    value: "",
                });
                for (const [o] of __VLS_vFor((__VLS_ctx.leagueOptions))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                        key: (o),
                        value: (o),
                    });
                    (o);
                    // @ts-ignore
                    [form, leagueOptions,];
                }
            }
            else if (field === 'year' || field === 'level') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
                    value: (__VLS_ctx.form[field]),
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                    value: "",
                });
                for (const [o] of __VLS_vFor((field === 'year'
                    ? __VLS_ctx.yearOptions
                    : __VLS_ctx.levelOptions))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                        key: (o),
                        value: (o),
                    });
                    (o);
                    // @ts-ignore
                    [form, yearOptions, levelOptions,];
                }
            }
            else if (field === 'proficiency') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
                    value: (__VLS_ctx.form[field]),
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                    value: "",
                });
                for (const [o] of __VLS_vFor((__VLS_ctx.proficiencyOptions))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                        key: (o),
                        value: (o),
                    });
                    (o);
                    // @ts-ignore
                    [form, proficiencyOptions,];
                }
            }
            else if (field === 'category' && __VLS_ctx.activeTab === 'skills') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
                    value: (__VLS_ctx.form[field]),
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                    value: "",
                });
                for (const [o] of __VLS_vFor((__VLS_ctx.skillCatOptions))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                        key: (o),
                        value: (o),
                    });
                    (o);
                    // @ts-ignore
                    [activeTab, form, skillCatOptions,];
                }
            }
            else if (field === 'years' || field === 'grades') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "checkbox-group" },
                });
                /** @type {__VLS_StyleScopedClasses['checkbox-group']} */ ;
                for (const [opt] of __VLS_vFor((field === 'years'
                    ? __VLS_ctx.yearOptions
                    : __VLS_ctx.gradeOptions))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
                        ...{ onClick: (...[$event]) => {
                                if (!(__VLS_ctx.activeTab !== 'sat-act'))
                                    throw 0;
                                if (!(__VLS_ctx.showForm))
                                    throw 0;
                                if (!!(field === 'testName' &&
                                    __VLS_ctx.activeTab === 'ap-scores' &&
                                    __VLS_ctx.form[field] === '__OTHER__'))
                                    throw 0;
                                if (!!(field === 'score' && __VLS_ctx.activeTab === 'ap-scores'))
                                    throw 0;
                                if (!!(__VLS_ctx.textareaFields.includes(field)))
                                    throw 0;
                                if (!!(field === 'type' && __VLS_ctx.activeTab === 'volunteer'))
                                    throw 0;
                                if (!!(field === 'type' && __VLS_ctx.activeTab === 'portfolio'))
                                    throw 0;
                                if (!!(field === 'courseType'))
                                    throw 0;
                                if (!!(field === 'situation'))
                                    throw 0;
                                if (!!(field === 'league'))
                                    throw 0;
                                if (!!(field === 'year' || field === 'level'))
                                    throw 0;
                                if (!!(field === 'proficiency'))
                                    throw 0;
                                if (!!(field === 'category' && __VLS_ctx.activeTab === 'skills'))
                                    throw 0;
                                if (!(field === 'years' || field === 'grades'))
                                    throw 0;
                                return __VLS_ctx.toggleCheckbox(field, opt);
                                // @ts-ignore
                                [yearOptions, gradeOptions, toggleCheckbox,];
                            } },
                        key: (opt),
                        ...{ class: "chip" },
                        ...{ class: ({
                                selected: (__VLS_ctx.form[field] || []).includes(opt),
                            }) },
                    });
                    /** @type {__VLS_StyleScopedClasses['chip']} */ ;
                    /** @type {__VLS_StyleScopedClasses['selected']} */ ;
                    (opt);
                    // @ts-ignore
                    [form,];
                }
            }
            else if ([
                'unweightedGPA',
                'weightedGPA',
                'credits',
                'hoursWeek',
                'weeksYear',
                'hours',
            ].includes(field)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                    type: "number",
                    min: "0",
                    step: (field.includes('GPA') ? '0.01' : '1'),
                });
                (__VLS_ctx.form[field]);
            }
            if (__VLS_ctx.activeTab === 'gpa' && field === 'unweightedGPA') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
                    value: (__VLS_ctx.form.unweightedScale),
                    ...{ style: {} },
                });
                for (const [s] of __VLS_vFor((__VLS_ctx.gpaScaleOptions))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                        key: (s.value),
                        value: (s.value),
                    });
                    (s.label);
                    // @ts-ignore
                    [activeTab, form, form, gpaScaleOptions,];
                }
            }
            if (__VLS_ctx.activeTab === 'gpa' && field === 'weightedGPA') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
                    value: (__VLS_ctx.form.weightedScale),
                    ...{ style: {} },
                });
                for (const [s] of __VLS_vFor((__VLS_ctx.gpaScaleOptions))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                        key: (s.value),
                        value: (s.value),
                    });
                    (s.label);
                    // @ts-ignore
                    [activeTab, form, gpaScaleOptions,];
                }
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                    value: (__VLS_ctx.form[field]),
                    type: "text",
                });
            }
            // @ts-ignore
            [form,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-actions" },
        });
        /** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab !== 'sat-act'))
                        throw 0;
                    if (!(__VLS_ctx.showForm))
                        throw 0;
                    return __VLS_ctx.editingId ? __VLS_ctx.updateItem() : __VLS_ctx.saveItem();
                    // @ts-ignore
                    [editingId, updateItem, saveItem,];
                } },
            ...{ class: "btn-save" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-save']} */ ;
        (__VLS_ctx.editingId ? "Update" : "Save");
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab !== 'sat-act'))
                        throw 0;
                    if (!(__VLS_ctx.showForm))
                        throw 0;
                    return __VLS_ctx.showForm = false;
                    // @ts-ignore
                    [showForm, editingId,];
                } },
            ...{ class: "btn-cancel" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-cancel']} */ ;
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
