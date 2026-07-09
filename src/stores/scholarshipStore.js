import { defineStore } from "pinia";
import { ref } from "vue";
import { getUserKey } from "./userKey";
const checklistDefaults = [
    { id: "chk-essay", label: "Essay", status: "Needed" },
    { id: "chk-transcript", label: "Transcript", status: "Needed" },
    { id: "chk-resume", label: "Resume", status: "Needed" },
    { id: "chk-rec-letter", label: "Recommendation Letter", status: "Needed" },
    { id: "chk-fafsa", label: "FAFSA Required", status: "Needed" },
    { id: "chk-css", label: "CSS Profile Required", status: "Needed" },
    { id: "chk-portfolio", label: "Portfolio", status: "Needed" },
    { id: "chk-interview", label: "Interview", status: "Needed" },
    { id: "chk-enrollment", label: "Proof of Enrollment", status: "Needed" },
    { id: "chk-financial", label: "Financial Documents", status: "Needed" },
];
function makeId() {
    return (Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 9));
}
export const useScholarshipStore = defineStore("scholarships", () => {
    const scholarships = ref([]);
    const goals = ref([]);
    (function load() {
        const saved = localStorage.getItem(getUserKey("scholarships"));
        if (saved)
            scholarships.value = JSON.parse(saved);
        const savedGoals = localStorage.getItem(getUserKey("scholarship-goals"));
        if (savedGoals)
            goals.value = JSON.parse(savedGoals);
    })();
    function save() {
        localStorage.setItem(getUserKey("scholarships"), JSON.stringify(scholarships.value));
        localStorage.setItem(getUserKey("scholarship-goals"), JSON.stringify(goals.value));
    }
    function addScholarship(scholarship) {
        scholarships.value.push(scholarship);
        save();
    }
    function updateScholarship(id, updated) {
        const idx = scholarships.value.findIndex((s) => s.id === id);
        if (idx !== -1) {
            scholarships.value[idx] = updated;
            save();
        }
    }
    function deleteScholarship(id) {
        scholarships.value = scholarships.value.filter((s) => s.id !== id);
        save();
    }
    function addGoal(goal) {
        goals.value.push(goal);
        save();
    }
    function updateGoal(id, updated) {
        const idx = goals.value.findIndex((g) => g.id === id);
        if (idx !== -1) {
            goals.value[idx] = updated;
            save();
        }
    }
    function deleteGoal(id) {
        goals.value = goals.value.filter((g) => g.id !== id);
        save();
    }
    function getChecklistDefaults() {
        return checklistDefaults.map((item) => ({ ...item }));
    }
    function seedScholarships() {
        if (scholarships.value.length > 0)
            return;
        const now = new Date();
        const y = now.getFullYear();
        const sampleScholarships = [
            {
                id: makeId(),
                name: "Coca-Cola Scholars Program",
                provider: "Coca-Cola Foundation",
                awardAmount: 20000,
                deadline: `${y}-10-31`,
                status: "Drafting",
                type: "Merit",
                renewable: false,
                minGpa: 3.0,
                satActRequired: "Not Required",
                citizenshipRequired: "U.S. Citizen or Permanent Resident",
                gradeLevel: "High School Senior",
                majorEligibility: "All",
                schoolEligibility: "Any accredited U.S. institution",
                applicationLink: "https://www.coca-colascholarsfoundation.org/",
                notes: "150 Coca-Cola Scholars selected annually. Leadership and service emphasis.",
                checklist: getChecklistDefaults().map((c) => {
                    if (c.label === "Essay" ||
                        c.label === "Transcript" ||
                        c.label === "Resume")
                        return { ...c, status: "In Progress" };
                    if (c.label === "CSS Profile Required" || c.label === "Portfolio")
                        return { ...c, status: "Not Needed" };
                    return c;
                }),
                docLinks: [],
                essayLinks: [],
                tags: ["prestigious", "leadership", "service"],
                effortLevel: "High",
                isScam: false,
                isSample: true,
                createdAt: new Date(now.getTime() - 30 * 86400000).toISOString(),
            },
            {
                id: makeId(),
                name: "Gates Scholarship",
                provider: "Bill & Melinda Gates Foundation",
                awardAmount: 0,
                deadline: `${y}-09-15`,
                status: "Researching",
                type: "Need-Based",
                renewable: true,
                minGpa: 3.3,
                satActRequired: "Optional",
                citizenshipRequired: "U.S. Citizen, National, or Permanent Resident",
                gradeLevel: "High School Senior",
                majorEligibility: "All",
                schoolEligibility: "Any accredited U.S. institution",
                applicationLink: "https://www.thegatesscholarship.org/",
                notes: "Full cost of attendance. 300 scholars selected. Pell-eligible required.",
                checklist: getChecklistDefaults().map((c) => {
                    if (c.label === "FAFSA Required" || c.label === "Financial Documents")
                        return { ...c, status: "Needed" };
                    if (c.label === "Portfolio" || c.label === "CSS Profile Required")
                        return { ...c, status: "Not Needed" };
                    return c;
                }),
                docLinks: [],
                essayLinks: [],
                tags: ["prestigious", "full-ride", "need-based"],
                effortLevel: "High",
                isScam: false,
                isSample: true,
                createdAt: new Date(now.getTime() - 28 * 86400000).toISOString(),
            },
            {
                id: makeId(),
                name: "Burger King Scholars",
                provider: "Burger King Foundation",
                awardAmount: 25000,
                deadline: `${y}-12-15`,
                status: "Not Started",
                type: "Merit",
                renewable: false,
                minGpa: 2.5,
                satActRequired: "Not Required",
                citizenshipRequired: "U.S. or Canada",
                gradeLevel: "High School Senior",
                majorEligibility: "All",
                schoolEligibility: "Any accredited U.S. institution",
                applicationLink: "https://bkmclamorefoundation.org/",
                notes: "GPA requirement is a 2.5. Employees and their families eligible too.",
                checklist: getChecklistDefaults().map((c) => {
                    if (c.label === "Portfolio" || c.label === "CSS Profile Required")
                        return { ...c, status: "Not Needed" };
                    return c;
                }),
                docLinks: [],
                essayLinks: [],
                tags: ["corporate", "accessible"],
                effortLevel: "Medium",
                isScam: false,
                isSample: true,
                createdAt: new Date(now.getTime() - 25 * 86400000).toISOString(),
            },
            {
                id: makeId(),
                name: "Dell Scholars Program",
                provider: "Michael & Susan Dell Foundation",
                awardAmount: 20000,
                deadline: `${y}-12-01`,
                status: "Not Started",
                type: "Need-Based",
                renewable: true,
                minGpa: 2.4,
                satActRequired: "Not Required",
                citizenshipRequired: "U.S. Citizen or Permanent Resident",
                gradeLevel: "High School Senior",
                majorEligibility: "All",
                schoolEligibility: "Any accredited U.S. institution",
                applicationLink: "https://www.dellscholars.org/",
                notes: "Pell Grant eligible required. Emphasis on overcoming adversity. $20,000 over 6 years plus laptop.",
                checklist: getChecklistDefaults().map((c) => {
                    if (c.label === "FAFSA Required" || c.label === "Financial Documents")
                        return { ...c, status: "Needed" };
                    if (c.label === "Portfolio" || c.label === "CSS Profile Required")
                        return { ...c, status: "Not Needed" };
                    return c;
                }),
                docLinks: [],
                essayLinks: [],
                tags: ["need-based", "support-services"],
                effortLevel: "Medium",
                isScam: false,
                isSample: true,
                createdAt: new Date(now.getTime() - 24 * 86400000).toISOString(),
            },
            {
                id: makeId(),
                name: "Elks Most Valuable Student",
                provider: "Elks National Foundation",
                awardAmount: 12500,
                deadline: `${y}-11-15`,
                status: "Not Started",
                type: "Merit",
                renewable: false,
                minGpa: 0,
                satActRequired: "Required",
                citizenshipRequired: "U.S. Citizen",
                gradeLevel: "High School Senior",
                majorEligibility: "All",
                schoolEligibility: "Any accredited U.S. institution",
                applicationLink: "https://www.elks.org/scholars/",
                notes: "500 four-year scholarships. Judged on scholarship, leadership, and financial need.",
                checklist: getChecklistDefaults().map((c) => {
                    if (c.label === "Portfolio" || c.label === "CSS Profile Required")
                        return { ...c, status: "Not Needed" };
                    return c;
                }),
                docLinks: [],
                essayLinks: [],
                tags: ["national", "merit"],
                effortLevel: "Medium",
                isScam: false,
                isSample: true,
                createdAt: new Date(now.getTime() - 22 * 86400000).toISOString(),
            },
            {
                id: makeId(),
                name: "Horatio Alger Scholarship",
                provider: "Horatio Alger Association",
                awardAmount: 25000,
                deadline: `${y}-03-15`,
                status: "Researching",
                type: "Need-Based",
                renewable: false,
                minGpa: 2.0,
                satActRequired: "Not Required",
                citizenshipRequired: "U.S. Citizen",
                gradeLevel: "High School Junior",
                majorEligibility: "All",
                schoolEligibility: "Any accredited U.S. institution",
                applicationLink: "https://www.horatioalger.org/scholarships/",
                notes: "Critical financial need required ($65,000 or less household income). Overcome adversity.",
                checklist: getChecklistDefaults().map((c) => {
                    if (c.label === "FAFSA Required" || c.label === "Financial Documents")
                        return { ...c, status: "Needed" };
                    if (c.label === "Portfolio" || c.label === "CSS Profile Required")
                        return { ...c, status: "Not Needed" };
                    return c;
                }),
                docLinks: [],
                essayLinks: [],
                tags: ["need-based", "adversity"],
                effortLevel: "Medium",
                isScam: false,
                isSample: true,
                createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
            },
            {
                id: makeId(),
                name: "Jackie Robinson Foundation Scholarship",
                provider: "Jackie Robinson Foundation",
                awardAmount: 30000,
                deadline: `${y}-01-15`,
                status: "Not Started",
                type: "Identity-Based",
                renewable: true,
                minGpa: 2.7,
                satActRequired: "Required",
                citizenshipRequired: "U.S. Citizen or Permanent Resident",
                gradeLevel: "High School Senior",
                majorEligibility: "All",
                schoolEligibility: "Any accredited U.S. institution",
                applicationLink: "https://www.jackierobinson.org/",
                notes: "Minority students. Leadership, community service, and financial need considered. Includes mentoring and career guidance.",
                checklist: getChecklistDefaults().map((c) => {
                    if (c.label === "Portfolio" || c.label === "CSS Profile Required")
                        return { ...c, status: "Not Needed" };
                    return c;
                }),
                docLinks: [],
                essayLinks: [],
                tags: ["minority", "leadership", "mentorship"],
                effortLevel: "High",
                isScam: false,
                isSample: true,
                createdAt: new Date(now.getTime() - 19 * 86400000).toISOString(),
            },
            {
                id: makeId(),
                name: "Ron Brown Scholar Program",
                provider: "Ron Brown Scholar Fund",
                awardAmount: 40000,
                deadline: `${y}-11-01`,
                status: "Researching",
                type: "Identity-Based",
                renewable: true,
                minGpa: 3.0,
                satActRequired: "Required",
                citizenshipRequired: "U.S. Citizen or Permanent Resident",
                gradeLevel: "High School Senior",
                majorEligibility: "All",
                schoolEligibility: "Any accredited U.S. institution",
                applicationLink: "https://www.ronbrown.org/",
                notes: "$40,000 over 4 years. African American students. Academic excellence and leadership.",
                checklist: getChecklistDefaults().map((c) => {
                    if (c.label === "Portfolio" || c.label === "CSS Profile Required")
                        return { ...c, status: "Not Needed" };
                    return c;
                }),
                docLinks: [],
                essayLinks: [],
                tags: ["minority", "african-american", "leadership"],
                effortLevel: "High",
                isScam: false,
                isSample: true,
                createdAt: new Date(now.getTime() - 18 * 86400000).toISOString(),
            },
            {
                id: makeId(),
                name: "Davidson Fellows Scholarship",
                provider: "Davidson Institute",
                awardAmount: 50000,
                deadline: `${y}-02-15`,
                status: "Not Started",
                type: "STEM",
                renewable: false,
                minGpa: 0,
                satActRequired: "Not Required",
                citizenshipRequired: "U.S. Citizen or Permanent Resident",
                gradeLevel: "All High School",
                majorEligibility: "STEM fields",
                schoolEligibility: "Any accredited U.S. institution",
                applicationLink: "https://www.davidsongifted.org/",
                notes: "Significant project in STEM or humanities required. Awards from $10,000 to $50,000.",
                checklist: getChecklistDefaults().map((c) => {
                    if (c.label === "Portfolio")
                        return { ...c, status: "Needed" };
                    if (c.label === "CSS Profile Required" ||
                        c.label === "FAFSA Required")
                        return { ...c, status: "Not Needed" };
                    return c;
                }),
                docLinks: [],
                essayLinks: [],
                tags: ["STEM", "project-based", "prestigious"],
                effortLevel: "High",
                isScam: false,
                isSample: true,
                createdAt: new Date(now.getTime() - 16 * 86400000).toISOString(),
            },
            {
                id: makeId(),
                name: "National Merit Scholarship",
                provider: "National Merit Scholarship Corporation",
                awardAmount: 2500,
                deadline: `${y - 1}-10-15`,
                status: "Submitted",
                type: "Merit",
                renewable: false,
                minGpa: 0,
                satActRequired: "Required (PSAT)",
                citizenshipRequired: "U.S. Citizen or Permanent Resident",
                gradeLevel: "High School Junior",
                majorEligibility: "All",
                schoolEligibility: "Any accredited U.S. institution",
                applicationLink: "https://www.nationalmerit.org/",
                notes: "Based on PSAT/NMSQT scores from junior year. Entry is automatic via PSAT.",
                checklist: getChecklistDefaults().map((c) => {
                    if (c.label === "Interview" ||
                        c.label === "Portfolio" ||
                        c.label === "CSS Profile Required")
                        return { ...c, status: "Not Needed" };
                    return c;
                }),
                docLinks: [],
                essayLinks: [],
                tags: ["PSAT", "automatic-entry"],
                effortLevel: "Low",
                isScam: false,
                isSample: true,
                createdAt: new Date(now.getTime() - 45 * 86400000).toISOString(),
            },
            {
                id: makeId(),
                name: "Rotary Club Local Scholarship",
                provider: "Springfield Rotary Club",
                awardAmount: 2000,
                deadline: `${y}-04-01`,
                status: "Researching",
                type: "Local",
                renewable: false,
                minGpa: 3.0,
                satActRequired: "Not Required",
                citizenshipRequired: "U.S. Citizen",
                gradeLevel: "High School Senior",
                majorEligibility: "All",
                schoolEligibility: "Any accredited U.S. institution",
                applicationLink: "https://www.rotary.org/",
                notes: "Local chapter scholarship. Check your local Rotary club for availability.",
                checklist: getChecklistDefaults().map((c) => {
                    if (c.label === "CSS Profile Required" || c.label === "Portfolio")
                        return { ...c, status: "Not Needed" };
                    return c;
                }),
                docLinks: [],
                essayLinks: [],
                tags: ["local", "community"],
                effortLevel: "Low",
                isScam: false,
                isSample: true,
                createdAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
            },
            {
                id: makeId(),
                name: "VFW Voice of Democracy",
                provider: "Veterans of Foreign Wars",
                awardAmount: 30000,
                deadline: `${y}-10-31`,
                status: "Drafting",
                type: "Essay Contest",
                renewable: false,
                minGpa: 0,
                satActRequired: "Not Required",
                citizenshipRequired: "U.S. Citizen or Permanent Resident",
                gradeLevel: "High School",
                majorEligibility: "All",
                schoolEligibility: "Any accredited U.S. institution",
                applicationLink: "https://www.vfw.org/",
                notes: "Audio essay contest. Record a 3-5 minute essay on a patriotic theme. National first prize $30,000.",
                checklist: getChecklistDefaults().map((c) => {
                    if (c.label === "Essay")
                        return { ...c, status: "In Progress" };
                    if (c.label === "CSS Profile Required" ||
                        c.label === "Portfolio" ||
                        c.label === "Transcript")
                        return { ...c, status: "Not Needed" };
                    return c;
                }),
                docLinks: [],
                essayLinks: [],
                tags: ["essay-contest", "audio", "patriotic"],
                effortLevel: "Medium",
                isScam: false,
                isSample: true,
                createdAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
            },
            {
                id: makeId(),
                name: "Atlas Shrugged Essay Contest",
                provider: "Ayn Rand Institute",
                awardAmount: 10000,
                deadline: `${y}-09-28`,
                status: "Not Started",
                type: "Essay Contest",
                renewable: false,
                minGpa: 0,
                satActRequired: "Not Required",
                citizenshipRequired: "Open to All",
                gradeLevel: "High School",
                majorEligibility: "All",
                schoolEligibility: "Any accredited U.S. institution",
                applicationLink: "https://www.aynrand.org/",
                notes: "Write an essay on one of several topics about Atlas Shrugged. $10,000 top prize. Multiple winners.",
                checklist: getChecklistDefaults().map((c) => {
                    if (c.label === "Essay")
                        return { ...c, status: "Needed" };
                    if (c.label === "Transcript" ||
                        c.label === "Recommendation Letter" ||
                        c.label === "CSS Profile Required")
                        return { ...c, status: "Not Needed" };
                    return c;
                }),
                docLinks: [],
                essayLinks: [],
                tags: ["essay-contest", "philosophy"],
                effortLevel: "Medium",
                isScam: false,
                isSample: true,
                createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
            },
            {
                id: makeId(),
                name: "Foot Locker Scholar Athletes",
                provider: "Foot Locker Foundation",
                awardAmount: 20000,
                deadline: `${y}-01-30`,
                status: "Not Started",
                type: "Athletic",
                renewable: false,
                minGpa: 2.5,
                satActRequired: "Not Required",
                citizenshipRequired: "U.S. Citizen or Permanent Resident",
                gradeLevel: "High School Senior",
                majorEligibility: "All",
                schoolEligibility: "Any accredited U.S. institution",
                applicationLink: "https://www.footlockerscholarathletes.com/",
                notes: "20 awards of $20,000. Sports participation plus leadership and community service.",
                checklist: getChecklistDefaults().map((c) => {
                    if (c.label === "Portfolio")
                        return { ...c, status: "Needed" };
                    if (c.label === "CSS Profile Required")
                        return { ...c, status: "Not Needed" };
                    return c;
                }),
                docLinks: [],
                essayLinks: [],
                tags: ["athletic", "leadership", "sports"],
                effortLevel: "Medium",
                isScam: false,
                isSample: true,
                createdAt: new Date(now.getTime() - 8 * 86400000).toISOString(),
            },
            {
                id: makeId(),
                name: "Scholastic Art & Writing Awards",
                provider: "Scholastic Inc.",
                awardAmount: 10000,
                deadline: `${y}-12-15`,
                status: "Not Started",
                type: "Arts",
                renewable: false,
                minGpa: 0,
                satActRequired: "Not Required",
                citizenshipRequired: "U.S. Citizen or Permanent Resident",
                gradeLevel: "Middle School & High School",
                majorEligibility: "Arts, Creative Writing",
                schoolEligibility: "Any accredited U.S. institution",
                applicationLink: "https://www.artandwriting.org/",
                notes: "Submit original art or writing. National medalists receive scholarship opportunities.",
                checklist: getChecklistDefaults().map((c) => {
                    if (c.label === "Portfolio")
                        return { ...c, status: "Needed" };
                    if (c.label === "Transcript" ||
                        c.label === "Recommendation Letter" ||
                        c.label === "CSS Profile Required")
                        return { ...c, status: "Not Needed" };
                    return c;
                }),
                docLinks: [],
                essayLinks: [],
                tags: ["arts", "creative", "portfolio"],
                effortLevel: "High",
                isScam: false,
                isSample: true,
                createdAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
            },
            {
                id: makeId(),
                name: "Taco Bell Live Más Scholarship",
                provider: "Taco Bell Foundation",
                awardAmount: 25000,
                deadline: `${y}-01-10`,
                status: "Not Started",
                type: "Other",
                renewable: false,
                minGpa: 0,
                satActRequired: "Not Required",
                citizenshipRequired: "U.S. Citizen or Permanent Resident",
                gradeLevel: "High School Senior & College Students",
                majorEligibility: "All",
                schoolEligibility: "Any accredited U.S. institution",
                applicationLink: "https://www.tacobellfoundation.org/",
                notes: "Video submission (2 minutes) about passion. No GPA or test score requirements.",
                checklist: getChecklistDefaults().map((c) => {
                    if (c.label === "Portfolio")
                        return { ...c, status: "Needed" };
                    if (c.label === "Transcript" ||
                        c.label === "Recommendation Letter" ||
                        c.label === "CSS Profile Required" ||
                        c.label === "Interview")
                        return { ...c, status: "Not Needed" };
                    return c;
                }),
                docLinks: [],
                essayLinks: [],
                tags: ["video", "creative", "no-gpa"],
                effortLevel: "Low",
                isScam: false,
                isSample: true,
                createdAt: new Date(now.getTime() - 6 * 86400000).toISOString(),
            },
            {
                id: makeId(),
                name: "ASHG DNA Day Essay Contest",
                provider: "American Society of Human Genetics",
                awardAmount: 1000,
                deadline: `${y}-03-05`,
                status: "Not Started",
                type: "STEM",
                renewable: false,
                minGpa: 0,
                satActRequired: "Not Required",
                citizenshipRequired: "U.S. Citizen or Permanent Resident",
                gradeLevel: "High School",
                majorEligibility: "Biology, Genetics, STEM",
                schoolEligibility: "Any accredited U.S. institution",
                applicationLink: "https://www.ashg.org/",
                notes: "750-word essay on genetics topic. $1,000 for first place. Teacher sponsorship required.",
                checklist: getChecklistDefaults().map((c) => {
                    if (c.label === "Essay")
                        return { ...c, status: "Needed" };
                    if (c.label === "Transcript" ||
                        c.label === "Recommendation Letter" ||
                        c.label === "CSS Profile Required" ||
                        c.label === "Portfolio")
                        return { ...c, status: "Not Needed" };
                    return c;
                }),
                docLinks: [],
                essayLinks: [],
                tags: ["STEM", "genetics", "essay-contest"],
                effortLevel: "Low",
                isScam: false,
                isSample: true,
                createdAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
            },
            {
                id: makeId(),
                name: "Prudential Spirit of Community Awards",
                provider: "Prudential Financial",
                awardAmount: 5000,
                deadline: `${y}-11-06`,
                status: "Researching",
                type: "Community Service",
                renewable: false,
                minGpa: 2.5,
                satActRequired: "Not Required",
                citizenshipRequired: "U.S. Citizen or Permanent Resident",
                gradeLevel: "Middle School & High School",
                majorEligibility: "All",
                schoolEligibility: "Any accredited U.S. institution",
                applicationLink: "https://www.spiritofcommunity.com/",
                notes: "Recognizes volunteer service. State honorees get $1,000, national honorees $5,000 plus D.C. trip.",
                checklist: getChecklistDefaults().map((c) => {
                    if (c.label === "Portfolio")
                        return { ...c, status: "Needed" };
                    if (c.label === "CSS Profile Required")
                        return { ...c, status: "Not Needed" };
                    return c;
                }),
                docLinks: [],
                essayLinks: [],
                tags: ["community-service", "volunteering"],
                effortLevel: "Medium",
                isScam: false,
                isSample: true,
                createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
            },
        ];
        scholarships.value = sampleScholarships;
        save();
    }
    return {
        scholarships,
        goals,
        checklistDefaults,
        save,
        addScholarship,
        updateScholarship,
        deleteScholarship,
        addGoal,
        updateGoal,
        deleteGoal,
        getChecklistDefaults,
        seedScholarships,
    };
});
