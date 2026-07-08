// ---------------------------------------------------------------------------
// scholarshipMatcher.ts
// Real matching logic: scores scholarships against the student's profile
// (GPA, majors, colleges, activities) and surfaces badges + scam warnings.
// ---------------------------------------------------------------------------
import { getUserKey } from "../stores/userKey";
import { useCollegeStore } from "../stores/collegeStore";
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const SUSPICIOUS_DOMAINS = [
    ".tk",
    ".ml",
    ".ga",
    ".cf",
    ".gq",
    "free-scholarship",
    "win-cash",
    "click-here",
    "claim-now",
    "you-won",
];
/** Safely parse JSON from localStorage, returning a default on failure. */
function readJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    }
    catch {
        return fallback;
    }
}
/** Days between an ISO date string and today. Positive = future. */
function daysUntil(dateStr) {
    if (!dateStr)
        return Infinity;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + "T00:00:00");
    return (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
}
// ---------------------------------------------------------------------------
// calculateMatchScore
// ---------------------------------------------------------------------------
/**
 * Compute a 0–100 match score for a scholarship against the student's profile.
 *
 * Scoring breakdown:
 *   GPA match ........................ +20  (minGpa > 0 AND user GPA >= minGpa)
 *   Major match ...................... +15  (majorEligibility ∩ top-picks)
 *   College match .................... +10  (schoolEligibility ∩ collegeStore)
 *   Activity alignment ............... +10  (brag categories match scholarship type)
 *   Low-effort / high-reward ......... +10  (effortLevel === "Low" && amount > 1000)
 *   Deadline urgency ................. +5   (deadline within 30 days)
 *   Profile baseline ................. +10  (user has any brag items)
 *   --------------------------------------
 *   TOTAL (capped) .................. 100
 */
export function calculateMatchScore(scholarship) {
    let score = 0;
    // --- 1. GPA match (+20) ---
    // Read brag items from localStorage; look for category "gpa" → data.unweightedGPA
    const bragItems = readJson(getUserKey("brag-items"), []);
    const hasProfile = bragItems.length > 0;
    if (scholarship.minGpa > 0) {
        const gpaEntries = bragItems.filter((item) => item.category === "gpa");
        for (const entry of gpaEntries) {
            const userGpa = entry.data?.unweightedGPA;
            if (typeof userGpa === "number" && userGpa >= scholarship.minGpa) {
                score += 20;
                break;
            }
        }
    }
    // --- 2. Major match (+15) ---
    if (scholarship.majorEligibility && scholarship.majorEligibility.trim()) {
        const topPicks = readJson(getUserKey("top-picks"), []);
        const userMajors = topPicks.map((p) => (p.majorName ?? "").toLowerCase());
        const scholarshipMajor = scholarship.majorEligibility.trim().toLowerCase();
        const hasMatch = userMajors.some((um) => um.includes(scholarshipMajor) || scholarshipMajor.includes(um));
        if (hasMatch)
            score += 15;
    }
    // --- 3. College match (+10) ---
    if (scholarship.schoolEligibility && scholarship.schoolEligibility.trim()) {
        const collegeStore = useCollegeStore();
        const scholarshipSchool = scholarship.schoolEligibility
            .trim()
            .toLowerCase();
        const match = collegeStore.colleges.some((c) => c.name.toLowerCase().includes(scholarshipSchool) ||
            scholarshipSchool.includes(c.name.toLowerCase()));
        if (match)
            score += 10;
    }
    // --- 4. Activity alignment (+10) ---
    const activityCategories = ["clubs", "sports", "volunteer", "awards"];
    const userActivities = bragItems.filter((item) => activityCategories.includes(item.category));
    if (userActivities.length > 0) {
        // Map scholarship type → expected user brag category
        const typeMap = {
            Athletic: "sports",
            "Community Service": "volunteer",
            Arts: "clubs",
            STEM: "clubs",
            Merit: "awards",
            "Essay Contest": "clubs",
        };
        const mappedCategory = typeMap[scholarship.type];
        if (mappedCategory) {
            const hasMatchingActivity = userActivities.some((item) => item.category === mappedCategory);
            if (hasMatchingActivity)
                score += 10;
        }
        else {
            // Unrecognized type → still award partial credit if user has any activities
            score += 5;
        }
    }
    // --- 5. Low-effort / high-reward (+10) ---
    if (scholarship.effortLevel === "Low" && scholarship.awardAmount > 1000) {
        score += 10;
    }
    // --- 6. Deadline urgency (+5) ---
    if (scholarship.deadline) {
        const remaining = daysUntil(scholarship.deadline);
        if (remaining >= 0 && remaining <= 30) {
            score += 5;
        }
    }
    // --- 7. Profile baseline (+10) ---
    if (hasProfile) {
        score += 10;
    }
    return Math.min(score, 100);
}
// ---------------------------------------------------------------------------
// getMatchBadges
// ---------------------------------------------------------------------------
/** Return an array of human-readable badge strings describing the match. */
export function getMatchBadges(scholarship) {
    const badges = [];
    const score = calculateMatchScore(scholarship);
    // Score-based badges
    if (score >= 70) {
        badges.push("Strong Match");
    }
    else if (score >= 40) {
        badges.push("Possible Match");
    }
    else {
        badges.push("Low Match");
    }
    // Deadline Soon (within 7 days)
    if (scholarship.deadline) {
        const remaining = daysUntil(scholarship.deadline);
        if (remaining >= 0 && remaining <= 7) {
            badges.push("Deadline Soon");
        }
    }
    // Worth Applying
    if (score >= 50 && scholarship.awardAmount > 500) {
        badges.push("Worth Applying");
    }
    // Low Effort / High Reward
    if (scholarship.effortLevel === "Low" && scholarship.awardAmount > 2000) {
        badges.push("Low Effort / High Reward");
    }
    return badges;
}
// ---------------------------------------------------------------------------
// getScamWarnings
// ---------------------------------------------------------------------------
/** Return scam / heuristic warnings for the given scholarship. */
export function getScamWarnings(scholarship) {
    const warnings = [];
    // 1. Suspicious application link
    if (scholarship.applicationLink) {
        const link = scholarship.applicationLink.toLowerCase();
        for (const pattern of SUSPICIOUS_DOMAINS) {
            if (link.includes(pattern)) {
                warnings.push(`Suspicious link detected (contains "${pattern}") — verify before applying`);
                break;
            }
        }
    }
    // 2. Missing provider
    if (!scholarship.provider || !scholarship.provider.trim()) {
        warnings.push("No provider listed — verify the source of this scholarship");
    }
    // 3. Empty deadline AND zero award
    if (!scholarship.deadline && scholarship.awardAmount === 0) {
        warnings.push("Missing deadline and award amount — this may not be a real opportunity");
    }
    // 4. "Guaranteed" or "win" in name
    const nameLower = scholarship.name.toLowerCase();
    if (nameLower.includes("guaranteed") || nameLower.includes("win")) {
        warnings.push('Scholarship name contains "guaranteed" or "win" — be cautious of scams');
    }
    return warnings;
}
