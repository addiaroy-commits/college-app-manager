function dateFromToday(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
function demoPrefix(userId: string): string {
  return `demo-${userId}-`;
}

export function isDemoMode(): boolean {
  const userId = localStorage.getItem("applywise-session");
  return Boolean(userId && localStorage.getItem("applywise-demo-user") === userId);
}

export function enableDemoMode(): void {
  const userId = localStorage.getItem("applywise-session");
  if (!userId) throw new Error("Sign in before starting Demo Mode.");
  const key = (name: string) => `${demoPrefix(userId)}${name}`;

  const colleges = [
    { id: "demo-northwestern", name: "Northwestern University", category: "Reach", deadline: dateFromToday(9), applicationType: "ED", applicationFee: 75, notes: "Strong journalism and interdisciplinary programs." },
    { id: "demo-bu", name: "Boston University", category: "Target", deadline: dateFromToday(24), applicationType: "EA", applicationFee: 80, notes: "Visit completed; liked the urban campus." },
    { id: "demo-uiuc", name: "University of Illinois Urbana-Champaign", category: "Target", deadline: dateFromToday(38), applicationType: "EA", applicationFee: 50, notes: "Excellent computer science options." },
    { id: "demo-lmu", name: "Loyola Marymount University", category: "Safety", deadline: dateFromToday(61), applicationType: "RD", applicationFee: 60, notes: "Strong community and good merit aid potential." },
  ];

  const essays = [
    { id: "demo-essay-1", title: "Why Northwestern?", collegeId: "demo-northwestern", collegeName: "Northwestern University", prompt: "What aspects of Northwestern appeal most to you?", targetWordCount: 300, currentWordCount: 214, status: "Drafting", content: "I am drawn to communities where storytelling and technology strengthen one another...", essayType: "college" },
    { id: "demo-essay-2", title: "Community Contribution", collegeId: "demo-bu", collegeName: "Boston University", prompt: "How will you contribute to the BU community?", targetWordCount: 250, currentWordCount: 250, status: "Done", content: "My strongest communities have grown from small acts of translation...", essayType: "college" },
    { id: "demo-essay-3", title: "Common App Personal Statement", collegeId: "common-app", collegeName: "Common App", prompt: "Reflect on an experience that sparked personal growth.", targetWordCount: 650, currentWordCount: 487, status: "Drafting", content: "The first time I rebuilt the radio, it produced only static...", essayType: "common-app" },
    { id: "demo-essay-4", title: "Academic Interest", collegeId: "demo-uiuc", collegeName: "University of Illinois Urbana-Champaign", prompt: "Describe your interest in your selected major.", targetWordCount: 300, currentWordCount: 0, status: "Not Started", content: "", essayType: "college" },
  ];

  const checklist = (done: number) => [
    "Application form", "Supplemental essays", "Application fee or waiver", "Transcript and school report", "Standardized test scores", "Recommendation letters", "FAFSA and CSS Profile", "Portfolio or additional materials",
  ].map((label, index) => ({ id: crypto.randomUUID(), label, status: index < done ? "Done" : index === done ? "In Progress" : "Not Started", dueDate: "" }));

  const commandCenter = {
    version: 1,
    applications: [
      { collegeId: "demo-northwestern", status: "In Progress", submissionDate: "", portalUrl: "", portalUsername: "", decisionDate: "", decisionNotes: "", checklist: checklist(4) },
      { collegeId: "demo-bu", status: "Ready to Submit", submissionDate: "", portalUrl: "", portalUsername: "", decisionDate: "", decisionNotes: "", checklist: checklist(7) },
      { collegeId: "demo-uiuc", status: "In Progress", submissionDate: "", portalUrl: "", portalUsername: "", decisionDate: "", decisionNotes: "", checklist: checklist(3) },
      { collegeId: "demo-lmu", status: "Not Started", submissionDate: "", portalUrl: "", portalUsername: "", decisionDate: "", decisionNotes: "", checklist: checklist(0) },
    ],
    tasks: [
      { id: "demo-task-1", title: "Revise Northwestern supplement", collegeId: "demo-northwestern", type: "Essay", dueDate: dateFromToday(3), priority: "High", status: "In Progress", reminderDays: 3, notes: "Strengthen the final example.", createdAt: new Date().toISOString() },
      { id: "demo-task-2", title: "Ask counselor to send transcript", collegeId: "demo-uiuc", type: "Document", dueDate: dateFromToday(6), priority: "High", status: "To Do", reminderDays: 5, notes: "", createdAt: new Date().toISOString() },
      { id: "demo-task-3", title: "Review BU application PDF", collegeId: "demo-bu", type: "Application", dueDate: dateFromToday(1), priority: "Medium", status: "To Do", reminderDays: 2, notes: "Check activities and honors.", createdAt: new Date().toISOString() },
      { id: "demo-task-4", title: "Draft Common App conclusion", collegeId: "common-app", type: "Essay", dueDate: dateFromToday(8), priority: "Medium", status: "To Do", reminderDays: 3, notes: "", createdAt: new Date().toISOString() },
    ],
    recommendations: [
      { id: "demo-rec-1", name: "Ms. Chen", role: "English Teacher", email: "", status: "Submitted", collegeIds: ["demo-northwestern", "demo-bu"], requestedDate: dateFromToday(-25), dueDate: dateFromToday(9), submittedDate: dateFromToday(-2), thankYouSent: true, notes: "" },
      { id: "demo-rec-2", name: "Mr. Alvarez", role: "Counselor", email: "", status: "Confirmed", collegeIds: ["demo-uiuc", "demo-lmu"], requestedDate: dateFromToday(-12), dueDate: dateFromToday(18), submittedDate: "", thankYouSent: false, notes: "Follow up next week." },
    ],
  };

  const costs = colleges.slice(0, 3).map((college, index) => {
    const tuition = [67200, 63700, 17800][index];
    const room = [21800, 19600, 14300][index];
    const aid = [28000, 22000, 7000][index];
    const total = tuition + room;
    return { id: `demo-cost-${index}`, collegeId: college.id, collegeName: college.name, stickerTuition: tuition, stickerRoom: room, stickerFees: 0, stickerTotal: total, grantsScholarships: aid, netCost: total - aid, familyContribution: 32000, gap: total - aid - 32000, federalLoans: 5500, privateLoans: 0, loanRate: 4.5, notes: "Demo estimate" };
  });

  const research = {
    version: 1,
    profiles: colleges.map((college, index) => ({ collegeId: college.id, status: index < 2 ? "Complete" : "Researching", intendedProgram: index === 0 ? "Journalism + Computer Science" : "Computer Science", location: ["Evanston, IL", "Boston, MA", "Champaign, IL", "Los Angeles, CA"][index], setting: index === 2 ? "College Town" : "Urban", distanceFromHome: [720, 305, 640, 2450][index], acceptanceRate: [7, 11, 45, 41][index], undergraduateSize: [8900, 18000, 36000, 7200][index], graduationRate: [95, 89, 85, 80][index], ratings: { academics: [5, 4, 5, 4][index], affordability: [3, 3, 4, 4][index], campus: [5, 4, 4, 5][index], location: [4, 5, 3, 4][index], career: [5, 4, 5, 4][index] }, pros: "Strong academics; supportive student community", cons: "Cost and distance require consideration", questions: "Ask about first-year research access", notes: "", lastUpdated: new Date().toISOString() })),
    visits: [{ id: "demo-visit-1", collegeId: "demo-bu", type: "Campus Visit", date: dateFromToday(-20), contact: "Admissions tour", rating: 4, notes: "Energetic campus and strong programs.", followUp: "Send thank-you note", thankYouSent: true, createdAt: new Date().toISOString() }],
    weights: { academics: 30, affordability: 25, campus: 20, location: 15, career: 10 },
    comparisonIds: ["demo-northwestern", "demo-bu", "demo-uiuc"],
  };

  const data: Record<string, unknown> = {
    colleges,
    essays,
    documents: [],
    brag: [
      { id: "demo-brag-1", category: "clubs", data: { clubName: "Coding for Community", role: "Founder", years: [10, 11, 12], description: "Led 18 students building websites for local nonprofits." } },
      { id: "demo-brag-2", category: "awards", data: { awardName: "Regional Science Fair Finalist", year: "11", description: "Designed a low-cost water quality sensor." } },
    ],
    costs,
    goals: [
      { id: "demo-goal-1", title: "Submit 4 applications", type: "colleges", target: 4, unit: "applications", description: "Complete priority applications before November." },
      { id: "demo-goal-2", title: "Finish 4 essays", type: "essays", target: 4, unit: "essays", description: "Reach final-draft status." },
      { id: "demo-goal-3", title: "Keep annual net cost under $45k", type: "tuition", target: 45000, unit: "USD", description: "Compare aid offers before deciding." },
    ],
    "sat-act": { attempts: [{ id: "demo-sat-1", type: "SAT", date: dateFromToday(-80), totalScore: 1450, sections: { math: 750, reading: 700 }, notes: "", superscoreEligible: true }], targetSat: 1500, targetAct: 0, notes: "Retake planned for October." },
    "top-picks": [{ id: "demo-major-1", majorId: "computer-science", majorName: "Computer Science", type: "major", rank: 1, specificName: "Human-Computer Interaction", whyInterested: "I enjoy building tools that make complex systems approachable.", careerGoals: "Product engineering or civic technology", extraNotes: "" }],
    "custom-majors": [],
    "command-center": commandCenter,
    "college-research": research,
    "essay-targets": { college: 3, commonApp: 1, scholarship: 2, award: 1, competition: 1, fellowship: 1, other: 1 },
    "brag-custom-tabs": [],
    onboarded: true,
  };

  for (const [name, value] of Object.entries(data)) {
    localStorage.setItem(key(name), JSON.stringify(value));
  }
  localStorage.setItem("applywise-demo-user", userId);
}

export function exitDemoMode(): void {
  const userId = localStorage.getItem("applywise-session");
  if (!userId) return;
  const prefix = demoPrefix(userId);
  const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
    .filter((key): key is string => Boolean(key?.startsWith(prefix)));
  keys.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem("applywise-demo-user");
}
