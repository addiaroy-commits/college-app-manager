// ---------------------------------------------------------------------------
// scholarshipService.ts
// Placeholder service for external scholarship discovery.
//
// Future integrations planned:
//   - Federal Student Aid (studentaid.gov) scholarship search
//   - CareerOneStop Scholarship Finder (careeronestop.org)
//   - College-specific financial aid / scholarship pages (per-college scraping)
//   - Local / community foundation scholarship sources
//   - CSV / JSON bulk import from guidance counselor spreadsheets
// ---------------------------------------------------------------------------
/**
 * Search external scholarship APIs for matching opportunities.
 * Currently a stub — returns an empty array until API integrations are wired up.
 *
 * @param query - Free-text search string (e.g. "engineering", "need-based")
 * @returns Promise resolving to an array of scholarship results (empty for now)
 */
export async function searchExternalScholarships(query) {
    // TODO: Integrate with Federal Student Aid, CareerOneStop, and other APIs
    void query; // suppress unused-param warning
    return [];
}
/**
 * Parse a simple CSV string into scholarship objects.
 * Expected columns (case-insensitive header row):
 *   name, provider, amount, deadline, type
 *
 * Any rows with missing "name" are silently skipped.
 *
 * @param data - Raw CSV text including a header row
 * @returns Array of parsed scholarship-like objects
 */
export function importScholarshipsFromCSV(data) {
    if (!data || !data.trim())
        return [];
    const lines = data.trim().split(/\r?\n/);
    if (lines.length < 2)
        return []; // need header + at least one data row
    // Normalize headers to lowercase for flexible matching
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = headers.indexOf("name");
    const providerIdx = headers.indexOf("provider");
    const amountIdx = headers.indexOf("amount");
    const deadlineIdx = headers.indexOf("deadline");
    const typeIdx = headers.indexOf("type");
    // "name" is the only strictly required column
    if (nameIdx === -1)
        return [];
    const results = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        const name = cols[nameIdx];
        if (!name)
            continue; // skip rows without a scholarship name
        results.push({
            name,
            provider: providerIdx >= 0 ? (cols[providerIdx] ?? "") : "",
            amount: amountIdx >= 0 ? parseFloat(cols[amountIdx]) || 0 : 0,
            deadline: deadlineIdx >= 0 ? (cols[deadlineIdx] ?? "") : "",
            type: typeIdx >= 0 ? (cols[typeIdx] ?? "") : "",
        });
    }
    return results;
}
// ---------------------------------------------------------------------------
// Suspicious-pattern detection helpers
// ---------------------------------------------------------------------------
/** Domains / TLDs commonly associated with phishing or scam scholarship sites */
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
/**
 * Basic URL validation with scam-detection heuristics.
 *
 * Checks performed:
 *   1. URL must start with "http://" or "https://"
 *   2. Flags obviously suspicious domains / URL patterns
 *
 * @param url - The application / info link to validate
 * @returns Object with `valid` boolean and optional `warning` string
 */
export async function verifyScholarshipLink(url) {
    if (!url || !url.trim()) {
        return { valid: false, warning: "No URL provided" };
    }
    const trimmed = url.trim().toLowerCase();
    // Must use http or https
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        return { valid: false, warning: "URL must start with http:// or https://" };
    }
    // Check for suspicious domains / patterns
    for (const pattern of SUSPICIOUS_DOMAINS) {
        if (trimmed.includes(pattern)) {
            return {
                valid: false,
                warning: `Suspicious URL pattern detected: "${pattern}" — this may be a scam site`,
            };
        }
    }
    return { valid: true };
}
