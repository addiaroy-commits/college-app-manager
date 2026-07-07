// ---------------------------------------------------------------------------
// collegeScorecardAidService.ts
// Placeholder for U.S. Department of Education College Scorecard API.
//
// The College Scorecard API provides institution-level data including:
//   - Average net price by income bracket
//   - Average grant / scholarship aid awarded
//   - Graduation rates, retention rates, and earnings outcomes
//
// API docs: https://collegescorecard.ed.gov/data/api-documentation/
//
// Usage requires a free API key from:
//   https://api.data.gov/signup/
//
// Example endpoint:
//   GET https://api.data.gov/ed/collegescorecard/v1/schools
//     ?api_key=YOUR_KEY
//     &school.name=Harvard University
//     &fields=school.name,latest.cost.avg_net_price.overall,
//            latest.aid.median_debt,latest.completion.completion_rate_4yr_150nt
// ---------------------------------------------------------------------------

export interface CollegeFinancialContext {
  avgNetPrice: number;
  avgAid: number;
  gradRate: number;
}

/**
 * Retrieve financial-aid context for a given college from the College Scorecard API.
 *
 * Currently a stub that returns `null`. Real implementation will:
 *   1. Look up the college by name via the Scorecard API
 *   2. Extract `latest.cost.avg_net_price.overall`
 *   3. Extract average aid data from `latest.aid` fields
 *   4. Extract graduation rate from `latest.completion` fields
 *
 * @param collegeName - The name of the college to look up
 * @returns A CollegeFinancialContext object, or null if not found / not yet implemented
 */
export async function getCollegeFinancialContext(
  collegeName: string,
): Promise<CollegeFinancialContext | null> {
  // TODO: Integrate with College Scorecard API
  //   1. Retrieve API key from environment / user settings
  //   2. Call `GET /schools?school.name=<collegeName>&fields=...`
  //   3. Parse response and return { avgNetPrice, avgAid, gradRate }
  //   4. Handle rate limiting (1k requests/hour on free tier)
  void collegeName; // suppress unused-param warning
  return null;
}
