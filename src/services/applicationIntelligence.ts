import type { College } from "../stores/collegeStore";
import type {
  ApplicationTask,
  CollegeApplication,
  Recommendation,
} from "../stores/applicationStore";
import type { Essay } from "../stores/essayStore";

const stopWords = new Set([
  "about", "after", "again", "also", "and", "are", "because", "been",
  "before", "being", "but", "can", "college", "could", "describe", "did",
  "does", "essay", "for", "from", "have", "how", "into", "its", "most",
  "our", "prompt", "should", "that", "the", "their", "them", "then",
  "there", "these", "they", "this", "those", "through", "what", "when",
  "where", "which", "while", "who", "why", "will", "with", "would", "you",
  "your",
]);

const themeTerms: Record<string, string[]> = {
  "Academic curiosity": ["learn", "research", "class", "academic", "subject", "major", "curious", "question", "study"],
  "Community": ["community", "belong", "neighbor", "family", "team", "together", "culture", "group"],
  "Creativity": ["create", "creative", "design", "art", "music", "write", "build", "imagine", "invent"],
  "Growth": ["grow", "growth", "change", "learned", "realized", "became", "perspective", "improve"],
  "Identity": ["identity", "culture", "background", "heritage", "language", "family", "values", "tradition"],
  "Leadership": ["lead", "leader", "captain", "organized", "mentor", "initiative", "founded", "guided"],
  "Resilience": ["challenge", "failure", "difficult", "overcome", "resilience", "struggle", "risk", "recover"],
  "Service": ["service", "volunteer", "help", "support", "impact", "advocate", "care", "contribute"],
  "Future goals": ["future", "goal", "career", "hope", "plan", "aspire", "become", "pursue"],
};

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.replace(/^[-']+|[-']+$/g, ""))
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function textContent(essay: Essay): string {
  return essay.content?.startsWith("FILE:") ? "" : essay.content || "";
}

export function detectEssayThemes(text: string): string[] {
  const textWords = new Set(words(text));
  return Object.entries(themeTerms)
    .map(([theme, terms]) => ({
      theme,
      hits: terms.filter((term) => textWords.has(term)).length,
    }))
    .filter((item) => item.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 5)
    .map((item) => item.theme);
}

function jaccard(left: string[], right: string[]): number {
  const a = new Set(left);
  const b = new Set(right);
  if (!a.size || !b.size) return 0;
  const overlap = [...a].filter((word) => b.has(word)).length;
  return overlap / new Set([...a, ...b]).size;
}

export interface ReuseMatch {
  source: Essay;
  score: number;
  sharedThemes: string[];
  sharedTerms: string[];
  reason: string;
  cautions: string[];
  adaptationSteps: string[];
}

export function buildReuseMatches(target: Essay, essays: Essay[]): ReuseMatch[] {
  const targetPromptWords = unique(words(`${target.title} ${target.prompt}`));
  const targetThemes = detectEssayThemes(`${target.title} ${target.prompt} ${textContent(target)}`);

  return essays
    .filter((source) => source.id !== target.id && textContent(source).trim().length >= 40)
    .map((source) => {
      const sourcePromptWords = unique(words(`${source.title} ${source.prompt}`));
      const sourceThemes = detectEssayThemes(`${source.title} ${source.prompt} ${textContent(source)}`);
      const sharedThemes = targetThemes.filter((theme) => sourceThemes.includes(theme));
      const sharedTerms = targetPromptWords.filter((word) => sourcePromptWords.includes(word)).slice(0, 6);
      const promptSimilarity = jaccard(targetPromptWords, sourcePromptWords);
      const themeSimilarity = targetThemes.length
        ? sharedThemes.length / Math.max(targetThemes.length, sourceThemes.length, 1)
        : 0;
      const completeness = Math.min(1, textContent(source).split(/\s+/).length / 250);
      const score = clamp(12 + promptSimilarity * 48 + themeSimilarity * 30 + completeness * 10);
      const cautions: string[] = [];
      if (source.collegeId === target.collegeId) cautions.push("Avoid repeating the same story twice for one college.");
      if (source.targetWordCount > target.targetWordCount + 100) cautions.push(`The new limit is ${target.targetWordCount} words, so this needs a tighter angle.`);
      if (/why\s/i.test(target.prompt) || /why\s/i.test(target.title)) cautions.push("Replace school-specific details; they should never be recycled.");
      if (!sharedThemes.length) cautions.push("The prompts differ, so reuse only a small story or detail rather than the full structure.");

      return {
        source,
        score,
        sharedThemes,
        sharedTerms,
        reason: sharedThemes.length
          ? `Both pieces can draw on ${sharedThemes.slice(0, 2).join(" and ").toLowerCase()}.`
          : sharedTerms.length
            ? `The prompts share language around ${sharedTerms.slice(0, 3).join(", ")}.`
            : "A specific scene or example may still be reusable with a different argument.",
        cautions,
        adaptationSteps: [
          `Answer the new prompt in one sentence before borrowing any material.`,
          `Keep only the scene or insight that supports ${target.title || "the target essay"}.`,
          `Rewrite the opening and conclusion so the new response has its own purpose.`,
        ],
      };
    })
    .sort((a, b) => b.score - a.score);
}

export interface CoachCategory {
  id: string;
  label: string;
  score: number;
  note: string;
}

export interface CoachAction {
  id: string;
  priority: "High" | "Medium" | "Polish";
  title: string;
  detail: string;
}

export interface CoachReport {
  score: number;
  summary: string;
  categories: CoachCategory[];
  strengths: string[];
  actions: CoachAction[];
  repeatedWords: { word: string; count: number }[];
  themes: string[];
}

export function buildEssayCoach(essay: Essay): CoachReport {
  const text = textContent(essay).trim();
  if (!text) {
    return {
      score: 0,
      summary: essay.content?.startsWith("FILE:")
        ? "This draft is attached as a document. Paste the text into Write mode for detailed coaching."
        : "Start the draft to unlock detailed coaching.",
      categories: [],
      strengths: [],
      actions: [{ id: "start", priority: "High", title: "Write a working opening", detail: "Begin with a concrete moment, question, or decision that gives the essay somewhere to go." }],
      repeatedWords: [],
      themes: [],
    };
  }

  const allWords = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/(?<=[.!?])\s+/).filter((sentence) => sentence.trim());
  const paragraphs = text.split(/\n\s*\n/).filter((paragraph) => paragraph.trim());
  const avgSentence = allWords.length / Math.max(sentences.length, 1);
  const promptWords = unique(words(essay.prompt));
  const contentWords = new Set(words(text));
  const promptHits = promptWords.filter((word) => contentWords.has(word)).length;
  const promptFit = promptWords.length ? Math.min(100, 38 + (promptHits / promptWords.length) * 110) : 72;
  const properDetails = (text.match(/\b(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g) || []).length;
  const numbers = (text.match(/\b\d+(?:\.\d+)?\b/g) || []).length;
  const sensoryHits = (text.match(/\b(?:heard|saw|felt|smelled|tasted|bright|quiet|loud|cold|warm|rough|smooth)\b/gi) || []).length;
  const specificity = clamp(38 + properDetails * 7 + numbers * 6 + sensoryHits * 5);
  const clarity = clamp(92 - Math.max(0, avgSentence - 22) * 3.5 - Math.max(0, 9 - avgSentence) * 2);
  const firstPerson = (text.match(/\b(?:I|I'm|I've|my|me|mine)\b/gi) || []).length;
  const reflectionHits = (text.match(/\b(?:realized|learned|understood|changed|noticed|wondered|believe|value|meaning)\b/gi) || []).length;
  const voice = clamp(42 + Math.min(30, firstPerson * 2) + Math.min(28, reflectionHits * 6));
  const structure = clamp(36 + Math.min(34, paragraphs.length * 11) + (sentences.length >= 5 ? 15 : 0) + (text.length > 350 ? 12 : 0));
  const wordRatio = essay.targetWordCount ? allWords.length / essay.targetWordCount : 1;
  const wordControl = clamp(wordRatio > 1 ? 100 - (wordRatio - 1) * 180 : wordRatio >= .75 ? 92 : 35 + wordRatio * 65);
  const categories: CoachCategory[] = [
    { id: "prompt", label: "Prompt fit", score: clamp(promptFit), note: promptFit >= 75 ? "The draft stays connected to the question." : "The central answer needs to be stated more clearly." },
    { id: "specificity", label: "Specificity", score: specificity, note: specificity >= 72 ? "Concrete details make the story easier to remember." : "Add names, choices, settings, numbers, or sensory details." },
    { id: "voice", label: "Voice & reflection", score: voice, note: voice >= 72 ? "The reader can hear a personal point of view." : "Explain more of what you thought, chose, or learned." },
    { id: "clarity", label: "Clarity", score: clarity, note: clarity >= 75 ? "Sentence length and flow are controlled." : "Shorten dense sentences and remove extra setup." },
    { id: "structure", label: "Structure", score: structure, note: structure >= 72 ? "The draft has enough shape to guide a reader." : "Give the opening, turning point, and ending distinct jobs." },
    { id: "length", label: "Word control", score: wordControl, note: wordRatio > 1 ? `${allWords.length - essay.targetWordCount} words over the limit.` : `${Math.max(0, essay.targetWordCount - allWords.length)} words remain.` },
  ];
  const score = clamp(categories.reduce((sum, category) => sum + category.score, 0) / categories.length);
  const strengths = categories.filter((category) => category.score >= 74).sort((a, b) => b.score - a.score).slice(0, 3).map((category) => category.note);
  const actions: CoachAction[] = [];
  const weakest = [...categories].sort((a, b) => a.score - b.score).slice(0, 3);
  for (const [index, category] of weakest.entries()) {
    const details: Record<string, string> = {
      prompt: `Write one sentence that directly answers: "${essay.prompt || essay.title}" Then make every paragraph support it.`,
      specificity: "Replace one broad claim with a scene: where you were, what you did, and what changed because of it.",
      voice: "After the main event, add two sentences explaining your internal reaction and why it matters now.",
      clarity: `Your average sentence is ${Math.round(avgSentence)} words. Break the densest sentence into a clear action and reflection.`,
      structure: "Label the job of each paragraph: setup, action, turning point, reflection, or forward look. Cut paragraphs without a distinct job.",
      length: wordRatio > 1 ? "Cut repeated setup and keep the details that reveal character or answer the prompt." : "Use the remaining space for reflection or one concrete example, not a second unrelated story.",
    };
    actions.push({ id: category.id, priority: index === 0 ? "High" : "Medium", title: `Strengthen ${category.label.toLowerCase()}`, detail: details[category.id] });
  }

  const counts = new Map<string, number>();
  words(text).forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));
  const repeatedWords = [...counts.entries()]
    .filter(([word, count]) => count >= 4 && word.length > 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word, count]) => ({ word, count }));

  return {
    score,
    summary: score >= 80 ? "Strong draft. Focus on precise polishing rather than a full rewrite." : score >= 62 ? "The core is working. A focused revision can make the response more memorable and direct." : "The draft has usable material, but its answer and story shape need another pass.",
    categories,
    strengths,
    actions,
    repeatedWords,
    themes: detectEssayThemes(`${essay.prompt} ${text}`),
  };
}

function daysUntil(date: string): number | null {
  if (!date) return null;
  const target = new Date(`${date}T23:59:59`);
  if (Number.isNaN(target.getTime())) return null;
  return Math.ceil((target.getTime() - Date.now()) / 86400000);
}

export interface AdvisorAction {
  id: string;
  priority: "Urgent" | "High" | "Plan";
  title: string;
  detail: string;
  route: string;
}

export interface CollegeReadiness {
  college: College;
  score: number;
  openItems: number;
  essayDone: number;
  essayTotal: number;
  daysRemaining: number | null;
  risk: "On track" | "Needs attention" | "At risk";
}

export interface ApplicationAdvice {
  score: number;
  summary: string;
  categories: CoachCategory[];
  actions: AdvisorAction[];
  readiness: CollegeReadiness[];
  strategyNotes: string[];
}

export function buildApplicationAdvice(
  colleges: College[],
  applications: CollegeApplication[],
  essays: Essay[],
  tasks: ApplicationTask[],
  recommendations: Recommendation[],
): ApplicationAdvice {
  if (!colleges.length) {
    return {
      score: 0,
      summary: "Add colleges to receive portfolio-level application advice.",
      categories: [],
      actions: [{ id: "add-colleges", priority: "Plan", title: "Build your college list", detail: "Add a few schools, categories, and deadlines so the advisor can identify readiness and risk.", route: "/colleges" }],
      readiness: [],
      strategyNotes: [],
    };
  }

  const readiness = colleges.map((college) => {
    const application = applications.find((item) => item.collegeId === college.id);
    const collegeEssays = essays.filter((essay) => essay.collegeId === college.id);
    const essayDone = collegeEssays.filter((essay) => essay.status === "Done").length;
    const checklist = application?.checklist.filter((item) => item.status !== "Not Needed") || [];
    const checklistDone = checklist.filter((item) => item.status === "Done").length;
    const checklistScore = checklist.length ? checklistDone / checklist.length : 0;
    const essayScore = collegeEssays.length ? essayDone / collegeEssays.length : checklistScore;
    const submitted = application && ["Submitted", "Accepted", "Waitlisted", "Rejected"].includes(application.status);
    const score = submitted ? 100 : clamp(checklistScore * 72 + essayScore * 28);
    const remaining = daysUntil(college.deadline);
    const openItems = Math.max(0, checklist.length - checklistDone) + Math.max(0, collegeEssays.length - essayDone);
    const risk: CollegeReadiness["risk"] = remaining !== null && remaining < 0 && !submitted
      ? "At risk"
      : remaining !== null && remaining <= 14 && score < 80
        ? "At risk"
        : score < 55 || (remaining !== null && remaining <= 30 && score < 70)
          ? "Needs attention"
          : "On track";
    return { college, score, openItems, essayDone, essayTotal: collegeEssays.length, daysRemaining: remaining, risk };
  }).sort((a, b) => {
    const aDays = a.daysRemaining ?? 9999;
    const bDays = b.daysRemaining ?? 9999;
    return aDays - bDays || a.score - b.score;
  });

  const actions: AdvisorAction[] = [];
  for (const item of readiness) {
    if (!item.college.deadline) {
      actions.push({ id: `deadline-${item.college.id}`, priority: "High", title: `Add ${item.college.name}'s deadline`, detail: "A missing deadline prevents reliable prioritization and reminders.", route: "/colleges" });
    } else if (item.daysRemaining !== null && item.daysRemaining < 0 && item.score < 100) {
      actions.push({ id: `overdue-${item.college.id}`, priority: "Urgent", title: `Review ${item.college.name} now`, detail: `The saved deadline passed with ${item.openItems} tracked items still open.`, route: "/applications" });
    } else if (item.daysRemaining !== null && item.daysRemaining <= 14 && item.score < 80) {
      actions.push({ id: `risk-${item.college.id}`, priority: "Urgent", title: `Focus on ${item.college.name}`, detail: `${item.daysRemaining} days remain and readiness is ${item.score}%.`, route: "/applications" });
    }
    if (item.essayTotal && item.essayDone < item.essayTotal) {
      actions.push({ id: `essay-${item.college.id}`, priority: item.daysRemaining !== null && item.daysRemaining <= 21 ? "High" : "Plan", title: `Finish ${item.college.name} essays`, detail: `${item.essayDone} of ${item.essayTotal} essays are marked done.`, route: `/essays/college/${item.college.id}` });
    }
  }

  const activeTasks = tasks.filter((task) => task.status !== "Done");
  const overdueTasks = activeTasks.filter((task) => {
    const days = daysUntil(task.dueDate);
    return days !== null && days < 0;
  });
  if (overdueTasks.length) actions.push({ id: "overdue-tasks", priority: "Urgent", title: `Resolve ${overdueTasks.length} overdue task${overdueTasks.length === 1 ? "" : "s"}`, detail: "Reschedule anything that is still valid and close tasks that are no longer needed.", route: "/applications?tab=Tasks" });
  const outstandingRecs = recommendations.filter((item) => !["Submitted", "Declined"].includes(item.status));
  if (outstandingRecs.length) actions.push({ id: "recommendations", priority: "High", title: `Follow up on ${outstandingRecs.length} recommendation${outstandingRecs.length === 1 ? "" : "s"}`, detail: "Confirm due dates and give each recommender enough lead time.", route: "/applications?tab=Recommendations" });

  const doneEssays = essays.filter((essay) => essay.status === "Done").length;
  const applicationScore = readiness.reduce((sum, item) => sum + item.score, 0) / Math.max(readiness.length, 1);
  const essayScore = essays.length ? (doneEssays / essays.length) * 100 : 45;
  const datedColleges = colleges.filter((college) => college.deadline).length;
  const deadlineScore = (datedColleges / colleges.length) * 100;
  const submittedRecs = recommendations.filter((item) => item.status === "Submitted").length;
  const recScore = recommendations.length ? (submittedRecs / recommendations.length) * 100 : 55;
  const categories: CoachCategory[] = [
    { id: "applications", label: "Application readiness", score: clamp(applicationScore), note: `${readiness.filter((item) => item.score >= 80).length} of ${readiness.length} applications are at least 80% ready.` },
    { id: "essays", label: "Essay completion", score: clamp(essayScore), note: essays.length ? `${doneEssays} of ${essays.length} essays are marked done.` : "No essays are tracked yet." },
    { id: "deadlines", label: "Deadline coverage", score: clamp(deadlineScore), note: `${datedColleges} of ${colleges.length} colleges have a deadline.` },
    { id: "recommendations", label: "Recommendation readiness", score: clamp(recScore), note: recommendations.length ? `${submittedRecs} of ${recommendations.length} recommendations are submitted.` : "No recommenders are tracked yet." },
  ];
  const score = clamp(categories.reduce((sum, category) => sum + category.score, 0) / categories.length);
  const counts = { Reach: 0, Target: 0, Safety: 0 };
  colleges.forEach((college) => counts[college.category]++);
  const strategyNotes: string[] = [];
  if (!counts.Safety) strategyNotes.push("Add at least one financial and academic safety you would genuinely attend.");
  if (!counts.Target) strategyNotes.push("The list has no Target schools; consider adding options where admission is reasonably balanced.");
  if (counts.Reach > counts.Target + counts.Safety) strategyNotes.push("The list is reach-heavy. Balance it before investing more time in supplements.");
  if (colleges.length > 12) strategyNotes.push("A large list can dilute essay quality. Confirm that every school earns the time its application requires.");
  if (!strategyNotes.length) strategyNotes.push("Your Reach, Target, and Safety mix has a workable foundation. Review affordability before final submission decisions.");

  const priorityOrder = { Urgent: 0, High: 1, Plan: 2 };
  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  return {
    score,
    summary: score >= 80 ? "The portfolio is in strong shape. Protect quality with a final accuracy and voice review." : score >= 60 ? "The plan is moving, but a few focused actions will reduce deadline and completion risk." : "Several foundational items need attention. Work from the priority list instead of trying to advance every application at once.",
    categories,
    actions: actions.slice(0, 10),
    readiness,
    strategyNotes,
  };
}
