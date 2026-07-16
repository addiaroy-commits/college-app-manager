import { defineStore } from "pinia";
import { ref } from "vue";
import type { College } from "./collegeStore";
import { getUserKey } from "./userKey";

export type ApplicationStatus =
  | "Not Started"
  | "In Progress"
  | "Ready to Submit"
  | "Submitted"
  | "Accepted"
  | "Waitlisted"
  | "Deferred"
  | "Rejected"
  | "Withdrawn";

export type ChecklistStatus =
  | "Not Started"
  | "In Progress"
  | "Done"
  | "Not Needed";

export type TaskStatus = "To Do" | "In Progress" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";
export type TaskType =
  | "Application"
  | "Essay"
  | "Document"
  | "Financial Aid"
  | "Interview"
  | "Other";
export type LinkedResourceType =
  | "Essay"
  | "Checklist"
  | "Recommendation"
  | "Document";

export type RecommendationStatus =
  | "Considering"
  | "Asked"
  | "Confirmed"
  | "Submitted"
  | "Declined";

export interface ApplicationChecklistItem {
  id: string;
  label: string;
  status: ChecklistStatus;
  dueDate: string;
  isCustom?: boolean;
}

export interface CollegeApplication {
  collegeId: string;
  status: ApplicationStatus;
  submissionDate: string;
  portalUrl: string;
  portalUsername: string;
  decisionDate: string;
  decisionNotes: string;
  checklist: ApplicationChecklistItem[];
}

export interface ApplicationTask {
  id: string;
  title: string;
  collegeId: string;
  type: TaskType;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  reminderDays: number;
  notes: string;
  createdAt: string;
  linkedResourceType?: LinkedResourceType;
  linkedResourceId?: string;
}

export interface Recommendation {
  id: string;
  name: string;
  role: string;
  email: string;
  status: RecommendationStatus;
  collegeIds: string[];
  requestedDate: string;
  dueDate: string;
  submittedDate: string;
  thankYouSent: boolean;
  notes: string;
}

export type LociStatus = "Draft" | "Ready" | "Sent";

export interface LetterOfContinuedInterest {
  id: string;
  collegeId: string;
  status: LociStatus;
  dueDate: string;
  sentDate: string;
  recipientName: string;
  recipientTitle: string;
  subject: string;
  opening: string;
  continuedInterest: string;
  updates: string;
  collegeFit: string;
  closing: string;
  createdAt: string;
  updatedAt: string;
}

interface CommandCenterData {
  version: number;
  applications: CollegeApplication[];
  tasks: ApplicationTask[];
  recommendations: Recommendation[];
  lociLetters: LetterOfContinuedInterest[];
}

const defaultChecklistLabels = [
  "Application form",
  "Supplemental essays",
  "Application fee or waiver",
  "Transcript and school report",
  "Standardized test scores",
  "Recommendation letters",
  "FAFSA and CSS Profile",
  "Portfolio or additional materials",
];

function makeId(): string {
  return crypto.randomUUID();
}

function makeChecklist(): ApplicationChecklistItem[] {
  return defaultChecklistLabels.map((label) => ({
    id: makeId(),
    label,
    status: "Not Started",
    dueDate: "",
  }));
}

function emptyData(): CommandCenterData {
  return {
    version: 2,
    applications: [],
    tasks: [],
    recommendations: [],
    lociLetters: [],
  };
}

export const useApplicationStore = defineStore("application-command", () => {
  const applications = ref<CollegeApplication[]>([]);
  const tasks = ref<ApplicationTask[]>([]);
  const recommendations = ref<Recommendation[]>([]);
  const lociLetters = ref<LetterOfContinuedInterest[]>([]);

  (function load() {
    try {
      const saved = localStorage.getItem(getUserKey("command-center"));
      if (!saved) return;
      const parsed = JSON.parse(saved) as Partial<CommandCenterData>;
      applications.value = Array.isArray(parsed.applications)
        ? parsed.applications
        : [];
      tasks.value = Array.isArray(parsed.tasks) ? parsed.tasks : [];
      recommendations.value = Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [];
      lociLetters.value = Array.isArray(parsed.lociLetters)
        ? parsed.lociLetters
        : [];
    } catch {
      const fresh = emptyData();
      applications.value = fresh.applications;
      tasks.value = fresh.tasks;
      recommendations.value = fresh.recommendations;
      lociLetters.value = fresh.lociLetters;
    }
  })();

  function save() {
    const data: CommandCenterData = {
      version: 2,
      applications: applications.value,
      tasks: tasks.value,
      recommendations: recommendations.value,
      lociLetters: lociLetters.value,
    };
    localStorage.setItem(getUserKey("command-center"), JSON.stringify(data));
  }

  function ensureApplications(colleges: College[]) {
    let changed = false;
    for (const college of colleges) {
      const existing = applications.value.find(
        (application) => application.collegeId === college.id,
      );
      if (existing) {
        const dateCounts = existing.checklist.reduce<Record<string, number>>(
          (counts, item) => {
            if (!item.isCustom && item.dueDate) {
              counts[item.dueDate] = (counts[item.dueDate] ?? 0) + 1;
            }
            return counts;
          },
          {},
        );
        for (const item of existing.checklist) {
          if (
            !item.isCustom &&
            item.dueDate &&
            (item.dueDate === college.deadline ||
              (dateCounts[item.dueDate] ?? 0) > 1)
          ) {
            item.dueDate = "";
            changed = true;
          }
        }
        continue;
      }
      applications.value.push({
        collegeId: college.id,
        status: "Not Started",
        submissionDate: "",
        portalUrl: "",
        portalUsername: "",
        decisionDate: "",
        decisionNotes: "",
        checklist: makeChecklist(),
      });
      changed = true;
    }
    if (changed) save();
  }

  function updateApplication(
    collegeId: string,
    updates: Partial<CollegeApplication>,
  ) {
    const application = applications.value.find(
      (item) => item.collegeId === collegeId,
    );
    if (!application) return;
    Object.assign(application, updates);
    save();
  }

  function updateChecklistItem(
    collegeId: string,
    itemId: string,
    updates: Partial<ApplicationChecklistItem>,
  ) {
    const application = applications.value.find(
      (item) => item.collegeId === collegeId,
    );
    const item = application?.checklist.find((entry) => entry.id === itemId);
    if (!item) return;
    Object.assign(item, updates);
    save();
  }

  function addChecklistItem(collegeId: string, label: string, dueDate: string) {
    const application = applications.value.find(
      (item) => item.collegeId === collegeId,
    );
    if (!application || !label.trim()) return;
    application.checklist.push({
      id: makeId(),
      label: label.trim(),
      status: "Not Started",
      dueDate,
      isCustom: true,
    });
    save();
  }

  function deleteChecklistItem(collegeId: string, itemId: string) {
    const application = applications.value.find(
      (item) => item.collegeId === collegeId,
    );
    if (!application) return;
    application.checklist = application.checklist.filter(
      (item) => item.id !== itemId,
    );
    save();
  }

  function addTask(task: Omit<ApplicationTask, "id" | "createdAt">) {
    tasks.value.push({
      ...task,
      id: makeId(),
      createdAt: new Date().toISOString(),
    });
    save();
  }

  function updateTask(id: string, updates: Partial<ApplicationTask>) {
    const task = tasks.value.find((item) => item.id === id);
    if (!task) return;
    Object.assign(task, updates);
    save();
  }

  function deleteTask(id: string) {
    tasks.value = tasks.value.filter((task) => task.id !== id);
    save();
  }

  function addRecommendation(recommendation: Omit<Recommendation, "id">) {
    recommendations.value.push({ ...recommendation, id: makeId() });
    save();
  }

  function updateRecommendation(id: string, updates: Partial<Recommendation>) {
    const recommendation = recommendations.value.find(
      (item) => item.id === id,
    );
    if (!recommendation) return;
    Object.assign(recommendation, updates);
    save();
  }

  function deleteRecommendation(id: string) {
    recommendations.value = recommendations.value.filter(
      (recommendation) => recommendation.id !== id,
    );
    save();
  }

  function addLociLetter(
    letter: Omit<LetterOfContinuedInterest, "id" | "createdAt" | "updatedAt">,
  ): LetterOfContinuedInterest {
    const now = new Date().toISOString();
    const created = { ...letter, id: makeId(), createdAt: now, updatedAt: now };
    lociLetters.value.push(created);
    save();
    return created;
  }

  function updateLociLetter(
    id: string,
    updates: Partial<LetterOfContinuedInterest>,
  ) {
    const letter = lociLetters.value.find((item) => item.id === id);
    if (!letter) return;
    Object.assign(letter, updates, { updatedAt: new Date().toISOString() });
    save();
  }

  function deleteLociLetter(id: string) {
    lociLetters.value = lociLetters.value.filter((letter) => letter.id !== id);
    save();
  }

  return {
    applications,
    tasks,
    recommendations,
    lociLetters,
    ensureApplications,
    updateApplication,
    updateChecklistItem,
    addChecklistItem,
    deleteChecklistItem,
    addTask,
    updateTask,
    deleteTask,
    addRecommendation,
    updateRecommendation,
    deleteRecommendation,
    addLociLetter,
    updateLociLetter,
    deleteLociLetter,
  };
});
