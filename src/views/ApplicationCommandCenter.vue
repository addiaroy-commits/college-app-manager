<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCollegeStore } from "../stores/collegeStore";
import { useEssayStore } from "../stores/essayStore";
import { useDocumentStore } from "../stores/documentStore";
import { useScholarshipStore } from "../stores/scholarshipStore";
import { useResearchStore } from "../stores/researchStore";
import {
  useApplicationStore,
  type ApplicationChecklistItem,
  type ApplicationStatus,
  type ApplicationTask,
  type ChecklistStatus,
  type CollegeApplication,
  type LinkedResourceType,
  type Recommendation,
  type RecommendationStatus,
  type TaskPriority,
  type TaskStatus,
  type TaskType,
} from "../stores/applicationStore";
import { showToast } from "../composables/useToast";

type TabName = "Applications" | "Tasks" | "Recommendations" | "Calendar";

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  kind:
    | "college"
    | "checklist"
    | "task"
    | "recommendation"
    | "scholarship"
    | "visit";
}

const router = useRouter();
const route = useRoute();
const collegeStore = useCollegeStore();
const essayStore = useEssayStore();
const documentStore = useDocumentStore();
const scholarshipStore = useScholarshipStore();
const researchStore = useResearchStore();
const store = useApplicationStore();
store.ensureApplications(collegeStore.colleges);

const tabs: { name: TabName; label: string }[] = [
  { name: "Applications", label: "Applications" },
  { name: "Tasks", label: "Tasks" },
  { name: "Recommendations", label: "Recommendations" },
  { name: "Calendar", label: "Calendar" },
];
const requestedTab = String(route.query.tab || "").toLowerCase();
const activeTab = ref<TabName>(
  requestedTab === "calendar"
    ? "Calendar"
    : requestedTab === "tasks"
      ? "Tasks"
      : requestedTab === "recommendations"
        ? "Recommendations"
        : "Applications",
);
const expandedCollegeId = ref<string | null>(null);
const checklistDrafts = ref<Record<string, string>>({});

const applicationStatuses: ApplicationStatus[] = [
  "Not Started",
  "In Progress",
  "Ready to Submit",
  "Submitted",
  "Accepted",
  "Waitlisted",
  "Rejected",
  "Withdrawn",
];
const checklistStatuses: ChecklistStatus[] = [
  "Not Started",
  "In Progress",
  "Done",
  "Not Needed",
];
const taskTypes: TaskType[] = [
  "Application",
  "Essay",
  "Document",
  "Financial Aid",
  "Interview",
  "Other",
];
const taskPriorities: TaskPriority[] = ["Low", "Medium", "High"];
const recommendationStatuses: RecommendationStatus[] = [
  "Considering",
  "Asked",
  "Confirmed",
  "Submitted",
  "Declined",
];

function isAutomaticChecklistItem(item: ApplicationChecklistItem): boolean {
  return (
    item.label === "Supplemental essays" ||
    item.label === "Recommendation letters"
  );
}

function resolvedChecklistStatus(
  application: CollegeApplication,
  item: ApplicationChecklistItem,
): ChecklistStatus {
  if (item.status === "Not Needed") return "Not Needed";
  if (item.label === "Supplemental essays") {
    const essays = essayStore.essays.filter(
      (essay) => essay.collegeId === application.collegeId,
    );
    if (essays.length === 0) return "Not Started";
    if (essays.every((essay) => essay.status === "Done")) return "Done";
    return essays.some((essay) => essay.status !== "Not Started")
      ? "In Progress"
      : "Not Started";
  }
  if (item.label === "Recommendation letters") {
    const recommendations = store.recommendations.filter((recommendation) =>
      recommendation.collegeIds.includes(application.collegeId),
    );
    if (recommendations.length === 0) return "Not Started";
    if (
      recommendations.every(
        (recommendation) => recommendation.status === "Submitted",
      )
    ) {
      return "Done";
    }
    return recommendations.some((recommendation) =>
      ["Asked", "Confirmed", "Submitted"].includes(recommendation.status),
    )
      ? "In Progress"
      : "Not Started";
  }
  return item.status;
}

function automaticChecklistDetail(
  application: CollegeApplication,
  item: ApplicationChecklistItem,
): string {
  if (item.label === "Supplemental essays") {
    const essays = essayStore.essays.filter(
      (essay) => essay.collegeId === application.collegeId,
    );
    const done = essays.filter((essay) => essay.status === "Done").length;
    return essays.length
      ? `${done} of ${essays.length} essays done`
      : "No college essays added yet";
  }
  const recommendations = store.recommendations.filter((recommendation) =>
    recommendation.collegeIds.includes(application.collegeId),
  );
  const submitted = recommendations.filter(
    (recommendation) => recommendation.status === "Submitted",
  ).length;
  return recommendations.length
    ? `${submitted} of ${recommendations.length} letters submitted`
    : "No recommenders assigned yet";
}

function toggleAutomaticChecklistItem(
  application: CollegeApplication,
  item: ApplicationChecklistItem,
) {
  store.updateChecklistItem(application.collegeId, item.id, {
    status: item.status === "Not Needed" ? "Not Started" : "Not Needed",
  });
}

function openAutomaticChecklistSource(item: ApplicationChecklistItem) {
  if (item.label === "Supplemental essays") {
    void router.push("/essays");
  } else {
    activeTab.value = "Recommendations";
  }
}

const applicationRows = computed(() =>
  collegeStore.colleges.map((college) => {
    const application = store.applications.find(
      (item) => item.collegeId === college.id,
    );
    const relevantItems =
      application?.checklist
        .map((item) => ({
          item,
          status: resolvedChecklistStatus(application, item),
        }))
        .filter((entry) => entry.status !== "Not Needed") ?? [];
    const completeItems = relevantItems.filter(
      (entry) => entry.status === "Done",
    ).length;
    const progress = relevantItems.length
      ? Math.round((completeItems / relevantItems.length) * 100)
      : 100;
    return { college, application, progress, completeItems, relevantItems };
  }),
);
const openTasks = computed(
  () => store.tasks.filter((task) => task.status !== "Done").length,
);

function parseDate(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysUntil(value: string): number {
  const date = parseDate(value);
  if (!date) return Number.POSITIVE_INFINITY;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86400000);
}

function dueLabel(value: string): string {
  const days = daysUntil(value);
  if (!Number.isFinite(days)) return "No due date";
  if (days < 0) return `${Math.abs(days)} day${days === -1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function formatDate(value: string): string {
  const date = parseDate(value);
  return date
    ? date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : "No date";
}

function collegeName(collegeId: string): string {
  return (
    collegeStore.colleges.find((college) => college.id === collegeId)?.name ??
    "General"
  );
}


function saveApplication(application: CollegeApplication) {
  store.updateApplication(application.collegeId, application);
}

function handleApplicationStatusChange(
  application: CollegeApplication,
  progress: number,
) {
  saveApplication(application);
  if (
    ["Submitted", "Accepted", "Waitlisted", "Rejected"].includes(
      application.status,
    ) &&
    progress < 100
  ) {
    showToast(`Application saved with ${100 - progress}% still incomplete`);
  }
}

function markReady(application: CollegeApplication) {
  store.updateApplication(application.collegeId, {
    status: "Ready to Submit",
  });
  showToast("Application marked ready to submit");
}

function addChecklistItem(application: CollegeApplication) {
  const label = checklistDrafts.value[application.collegeId] ?? "";
  if (!label.trim()) return;
  store.addChecklistItem(application.collegeId, label, "");
  checklistDrafts.value[application.collegeId] = "";
  showToast("Checklist item added");
}

function statusClass(status: string): string {
  return status.toLowerCase().replaceAll(" ", "-");
}

function safeLink(value: string): string {
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

const showTaskForm = ref(false);
const editingTaskId = ref<string | null>(null);
const taskFilter = ref<"Open" | "All" | "Done">("Open");
const taskForm = ref<{
  title: string;
  collegeId: string;
  type: TaskType;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  reminderDays: number;
  notes: string;
  linkedResourceType: LinkedResourceType | "";
  linkedResourceId: string;
}>({
  title: "",
  collegeId: "",
  type: "Application",
  dueDate: "",
  priority: "Medium",
  status: "To Do",
  reminderDays: 7,
  notes: "",
  linkedResourceType: "",
  linkedResourceId: "",
});

const linkedResourceTypes: LinkedResourceType[] = [
  "Essay",
  "Checklist",
  "Recommendation",
  "Document",
];

const linkedResourceOptions = computed(() => {
  if (taskForm.value.linkedResourceType === "Essay") {
    return essayStore.essays.map((essay) => ({
      id: essay.id,
      label: `${essay.collegeName || "General"}: ${essay.title}`,
    }));
  }
  if (taskForm.value.linkedResourceType === "Checklist") {
    return store.applications.flatMap((application) =>
      application.checklist.map((item) => ({
        id: item.id,
        label: `${collegeName(application.collegeId)}: ${item.label}`,
      })),
    );
  }
  if (taskForm.value.linkedResourceType === "Recommendation") {
    return store.recommendations.map((recommendation) => ({
      id: recommendation.id,
      label: `${recommendation.name}: recommendation letter`,
    }));
  }
  if (taskForm.value.linkedResourceType === "Document") {
    return documentStore.documents.map((document) => ({
      id: document.id,
      label: document.fileName,
    }));
  }
  return [];
});

const filteredTasks = computed(() => {
  const tasks = [...store.tasks].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
  if (taskFilter.value === "Open") {
    return tasks.filter((task) => task.status !== "Done");
  }
  if (taskFilter.value === "Done") {
    return tasks.filter((task) => task.status === "Done");
  }
  return tasks;
});

function openNewTask(defaultDate = "") {
  editingTaskId.value = null;
  taskForm.value = {
    title: "",
    collegeId: "",
    type: "Application",
    dueDate: defaultDate,
    priority: "Medium",
    status: "To Do",
    reminderDays: 7,
    notes: "",
    linkedResourceType: "",
    linkedResourceId: "",
  };
  showTaskForm.value = true;
}

function editTask(task: ApplicationTask) {
  editingTaskId.value = task.id;
  taskForm.value = {
    title: task.title,
    collegeId: task.collegeId,
    type: task.type,
    dueDate: task.dueDate,
    priority: task.priority,
    status: task.status,
    reminderDays: task.reminderDays,
    notes: task.notes,
    linkedResourceType: task.linkedResourceType ?? "",
    linkedResourceId: task.linkedResourceId ?? "",
  };
  showTaskForm.value = true;
}

function saveTask() {
  if (!taskForm.value.title.trim()) {
    showToast("Add a task title first");
    return;
  }
  if (
    taskForm.value.linkedResourceType &&
    !taskForm.value.linkedResourceId
  ) {
    showToast("Choose the work item you want to link");
    return;
  }
  const task: Omit<ApplicationTask, "id" | "createdAt"> = {
    title: taskForm.value.title.trim(),
    collegeId: taskForm.value.collegeId,
    type: taskForm.value.type,
    dueDate: taskForm.value.dueDate,
    priority: taskForm.value.priority,
    status: taskForm.value.status,
    reminderDays: taskForm.value.reminderDays,
    notes: taskForm.value.notes,
    linkedResourceType: taskForm.value.linkedResourceType || undefined,
    linkedResourceId: taskForm.value.linkedResourceId || undefined,
  };
  if (editingTaskId.value) {
    store.updateTask(editingTaskId.value, task);
    showToast("Task updated");
  } else {
    store.addTask(task);
    showToast("Task added");
  }
  showTaskForm.value = false;
}

function removeTask(task: ApplicationTask) {
  store.deleteTask(task.id);
  showToast("Task deleted", () => {
    store.addTask({
      title: task.title,
      collegeId: task.collegeId,
      type: task.type,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      reminderDays: task.reminderDays,
      notes: task.notes,
      linkedResourceType: task.linkedResourceType,
      linkedResourceId: task.linkedResourceId,
    });
  });
}

function linkedResourceLabel(task: ApplicationTask): string {
  if (!task.linkedResourceType || !task.linkedResourceId) return "";
  if (task.linkedResourceType === "Essay") {
    return (
      essayStore.essays.find((essay) => essay.id === task.linkedResourceId)
        ?.title ?? "Essay"
    );
  }
  if (task.linkedResourceType === "Checklist") {
    for (const application of store.applications) {
      const item = application.checklist.find(
        (entry) => entry.id === task.linkedResourceId,
      );
      if (item) return item.label;
    }
    return "Checklist item";
  }
  if (task.linkedResourceType === "Recommendation") {
    const recommendation = store.recommendations.find(
      (item) => item.id === task.linkedResourceId,
    );
    return recommendation ? `${recommendation.name}'s letter` : "Recommendation";
  }
  return (
    documentStore.documents.find(
      (document) => document.id === task.linkedResourceId,
    )?.fileName ?? "Document"
  );
}

function linkedResourceIsComplete(task: ApplicationTask): boolean {
  if (!task.linkedResourceType || !task.linkedResourceId) return false;
  if (task.linkedResourceType === "Essay") {
    return essayStore.essays.some(
      (essay) =>
        essay.id === task.linkedResourceId && essay.status === "Done",
    );
  }
  if (task.linkedResourceType === "Checklist") {
    for (const application of store.applications) {
      const item = application.checklist.find(
        (entry) => entry.id === task.linkedResourceId,
      );
      if (
        item &&
        ["Done", "Not Needed"].includes(
          resolvedChecklistStatus(application, item),
        )
      ) {
        return true;
      }
    }
    return false;
  }
  if (task.linkedResourceType === "Recommendation") {
    return store.recommendations.some(
      (recommendation) =>
        recommendation.id === task.linkedResourceId &&
        recommendation.status === "Submitted",
    );
  }
  return documentStore.documents.some(
    (document) => document.id === task.linkedResourceId,
  );
}

function openLinkedResource(task: ApplicationTask) {
  if (task.linkedResourceType === "Essay") {
    void router.push("/essays");
  } else if (task.linkedResourceType === "Checklist") {
    const application = store.applications.find((item) =>
      item.checklist.some((entry) => entry.id === task.linkedResourceId),
    );
    activeTab.value = "Applications";
    expandedCollegeId.value = application?.collegeId ?? null;
  } else if (task.linkedResourceType === "Recommendation") {
    activeTab.value = "Recommendations";
  } else if (task.linkedResourceType === "Document") {
    void router.push("/documents");
  }
}

watchEffect(() => {
  for (const task of store.tasks) {
    if (task.status !== "Done" && linkedResourceIsComplete(task)) {
      store.updateTask(task.id, { status: "Done" });
    }
  }
});

const showRecommendationForm = ref(false);
const editingRecommendationId = ref<string | null>(null);
const recommendationForm = ref<Omit<Recommendation, "id">>({
  name: "",
  role: "",
  email: "",
  status: "Considering",
  collegeIds: [],
  requestedDate: "",
  dueDate: "",
  submittedDate: "",
  thankYouSent: false,
  notes: "",
});

function openNewRecommendation() {
  editingRecommendationId.value = null;
  recommendationForm.value = {
    name: "",
    role: "",
    email: "",
    status: "Considering",
    collegeIds: [],
    requestedDate: "",
    dueDate: "",
    submittedDate: "",
    thankYouSent: false,
    notes: "",
  };
  showRecommendationForm.value = true;
}

function editRecommendation(recommendation: Recommendation) {
  editingRecommendationId.value = recommendation.id;
  recommendationForm.value = {
    name: recommendation.name,
    role: recommendation.role,
    email: recommendation.email,
    status: recommendation.status,
    collegeIds: [...recommendation.collegeIds],
    requestedDate: recommendation.requestedDate,
    dueDate: recommendation.dueDate,
    submittedDate: recommendation.submittedDate,
    thankYouSent: recommendation.thankYouSent,
    notes: recommendation.notes,
  };
  showRecommendationForm.value = true;
}

function saveRecommendation() {
  if (!recommendationForm.value.name.trim()) {
    showToast("Add the recommender's name first");
    return;
  }
  const recommendation = {
    ...recommendationForm.value,
    name: recommendationForm.value.name.trim(),
    role: recommendationForm.value.role.trim(),
    email: recommendationForm.value.email.trim(),
    notes: recommendationForm.value.notes.trim(),
  };
  if (editingRecommendationId.value) {
    store.updateRecommendation(editingRecommendationId.value, recommendation);
    showToast("Recommendation updated");
  } else {
    store.addRecommendation(recommendation);
    showToast("Recommender added");
  }
  showRecommendationForm.value = false;
}

function removeRecommendation(recommendation: Recommendation) {
  store.deleteRecommendation(recommendation.id);
  showToast("Recommender deleted", () => {
    const { id: _id, ...restored } = recommendation;
    store.addRecommendation(restored);
  });
}

const calendarMonth = ref(new Date().getMonth());
const calendarYear = ref(new Date().getFullYear());
const selectedCalendarDate = ref("");
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function isTrackedScholarship(
  scholarship: (typeof scholarshipStore.scholarships)[number],
): boolean {
  if (!scholarship.isSample) return true;
  return (
    scholarship.docLinks.length > 0 ||
    scholarship.essayLinks.length > 0 ||
    scholarship.notes.trim().length > 0 ||
    scholarship.checklist.some(
      (item) => item.status !== "Needed" && item.status !== "Not Needed",
    )
  );
}

const eventsByDate = computed(() => {
  const map: Record<string, CalendarEvent[]> = {};
  const add = (event: CalendarEvent) => {
    if (!event.date) return;
    if (!map[event.date]) map[event.date] = [];
    map[event.date].push(event);
  };
  for (const college of collegeStore.colleges) {
    add({
      id: `college-${college.id}`,
      date: college.deadline,
      title: `${college.name} deadline`,
      kind: "college",
    });
  }
  for (const application of store.applications) {
    for (const item of application.checklist) {
      if (
        item.dueDate &&
        !["Done", "Not Needed"].includes(
          resolvedChecklistStatus(application, item),
        )
      ) {
        add({
          id: `checklist-${item.id}`,
          date: item.dueDate,
          title: `${collegeName(application.collegeId)}: ${item.label}`,
          kind: "checklist",
        });
      }
    }
  }
  for (const task of store.tasks) {
    if (task.status !== "Done") {
      add({
        id: `task-${task.id}`,
        date: task.dueDate,
        title: task.title,
        kind: "task",
      });
    }
  }
  for (const recommendation of store.recommendations) {
    if (!["Submitted", "Declined"].includes(recommendation.status)) {
      add({
        id: `recommendation-${recommendation.id}`,
        date: recommendation.dueDate,
        title: `${recommendation.name}'s letter`,
        kind: "recommendation",
      });
    }
  }
  for (const scholarship of scholarshipStore.scholarships) {
    if (isTrackedScholarship(scholarship)) {
      add({
        id: `scholarship-${scholarship.id}`,
        date: scholarship.deadline,
        title: `${scholarship.name} deadline`,
        kind: "scholarship",
      });
    }
  }
  for (const visit of researchStore.visits) {
    add({
      id: `visit-${visit.id}`,
      date: visit.date,
      title: `${collegeName(visit.collegeId)}: ${visit.type}`,
      kind: "visit",
    });
  }
  return map;
});

const calendarDays = computed(() => {
  const firstDay = new Date(calendarYear.value, calendarMonth.value, 1).getDay();
  const totalDays = new Date(
    calendarYear.value,
    calendarMonth.value + 1,
    0,
  ).getDate();
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const days: {
    day: number;
    date: string;
    isToday: boolean;
    events: CalendarEvent[];
  }[] = [];
  for (let index = 0; index < firstDay; index++) {
    days.push({ day: 0, date: "", isToday: false, events: [] });
  }
  for (let day = 1; day <= totalDays; day++) {
    const date = `${calendarYear.value}-${String(calendarMonth.value + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    days.push({
      day,
      date,
      isToday: date === todayKey,
      events: eventsByDate.value[date] ?? [],
    });
  }
  return days;
});

const selectedDayEvents = computed(
  () => eventsByDate.value[selectedCalendarDate.value] ?? [],
);

function previousMonth() {
  if (calendarMonth.value === 0) {
    calendarMonth.value = 11;
    calendarYear.value--;
  } else {
    calendarMonth.value--;
  }
  selectedCalendarDate.value = "";
}

function nextMonth() {
  if (calendarMonth.value === 11) {
    calendarMonth.value = 0;
    calendarYear.value++;
  } else {
    calendarMonth.value++;
  }
  selectedCalendarDate.value = "";
}
</script>

<template>
  <div class="command-center">
    <div class="page-header">
      <div>
        <h2>Application Command Center</h2>
        <p>Plan the work, track every requirement, and know what needs attention next.</p>
      </div>
      <button
        v-if="activeTab === 'Tasks'"
        class="primary-button"
        @click="openNewTask()"
      >
        + Add Task
      </button>
      <button
        v-else-if="activeTab === 'Recommendations'"
        class="primary-button"
        @click="openNewRecommendation"
      >
        + Add Recommender
      </button>
    </div>

    <div class="tabs" role="tablist" aria-label="Application command center sections">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        class="tab-button"
        :class="{ active: activeTab === tab.name }"
        role="tab"
        :aria-selected="activeTab === tab.name"
        @click="activeTab = tab.name"
      >
        {{ tab.label }}
        <span v-if="tab.name === 'Tasks' && openTasks" class="tab-count">{{ openTasks }}</span>
      </button>
    </div>

    <template v-if="activeTab === 'Applications'">
      <div v-if="applicationRows.length === 0" class="empty-state section-panel">
        <strong>Add your first college to begin</strong>
        <span>Each college automatically receives a complete application checklist.</span>
        <router-link to="/colleges" class="primary-link">Open College List</router-link>
      </div>
      <div v-else class="application-list">
        <section
          v-for="row in applicationRows"
          :key="row.college.id"
          class="application-card"
        >
          <div class="application-summary">
            <button
              class="expand-button"
              :aria-label="expandedCollegeId === row.college.id ? 'Collapse college details' : 'Expand college details'"
              @click="expandedCollegeId = expandedCollegeId === row.college.id ? null : row.college.id"
            >
              {{ expandedCollegeId === row.college.id ? '−' : '+' }}
            </button>
            <div class="application-title">
              <strong>{{ row.college.name }}</strong>
              <span>
                {{ row.college.category }} · {{ row.college.applicationType || 'Type not set' }} ·
                {{ row.college.deadline ? `Due ${formatDate(row.college.deadline)}` : 'Deadline not set' }}
              </span>
            </div>
            <div v-if="row.application" class="application-progress">
              <span>{{ row.completeItems }}/{{ row.relevantItems.length }} complete</span>
              <div class="progress-track"><span :style="{ width: `${row.progress}%` }"></span></div>
            </div>
            <select
              v-if="row.application"
              v-model="row.application.status"
              class="status-select"
              :class="statusClass(row.application.status)"
              aria-label="Application status"
              @change="handleApplicationStatusChange(row.application, row.progress)"
            >
              <option v-for="status in applicationStatuses" :key="status" :value="status">
                {{ status }}
              </option>
            </select>
          </div>

          <div
            v-if="row.application && row.progress === 100 && ['Not Started', 'In Progress'].includes(row.application.status)"
            class="application-guidance success"
          >
            <span>All required items are complete.</span>
            <button @click="markReady(row.application)">Mark ready to submit</button>
          </div>
          <div
            v-else-if="row.application && row.progress < 100 && ['Submitted', 'Accepted', 'Waitlisted', 'Rejected'].includes(row.application.status)"
            class="application-guidance warning"
          >
            This application is marked {{ row.application.status }}, but {{ 100 - row.progress }}% of its required checklist is still open.
          </div>

          <div
            v-if="row.application && expandedCollegeId === row.college.id"
            class="application-details"
          >
            <div class="detail-grid">
              <label>
                Submission date
                <input
                  v-model="row.application.submissionDate"
                  type="date"
                  @change="saveApplication(row.application)"
                />
              </label>
              <label>
                Decision date
                <input
                  v-model="row.application.decisionDate"
                  type="date"
                  @change="saveApplication(row.application)"
                />
              </label>
              <label>
                Applicant portal URL
                <span class="input-with-action">
                  <input
                    v-model="row.application.portalUrl"
                    type="url"
                    placeholder="admissions.college.edu"
                    @change="saveApplication(row.application)"
                  />
                  <a
                    v-if="row.application.portalUrl"
                    :href="safeLink(row.application.portalUrl)"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open applicant portal"
                  >↗</a>
                </span>
              </label>
              <label>
                Portal username
                <input
                  v-model="row.application.portalUsername"
                  type="text"
                  autocomplete="off"
                  @change="saveApplication(row.application)"
                />
              </label>
            </div>
            <label class="full-field">
              Decision notes
              <textarea
                v-model="row.application.decisionNotes"
                rows="2"
                placeholder="Interview details, portal updates, or decision notes"
                @change="saveApplication(row.application)"
              ></textarea>
            </label>

            <div class="checklist-heading">
              <div>
                <h4>Application Checklist</h4>
                <span>Mark an item Not Needed when it does not apply to this college.</span>
              </div>
            </div>
            <div class="checklist-list">
              <div
                v-for="item in row.application.checklist"
                :key="item.id"
                class="checklist-row"
              >
                <div v-if="isAutomaticChecklistItem(item)" class="automatic-status">
                  <span class="status-badge" :class="statusClass(resolvedChecklistStatus(row.application, item))">
                    {{ resolvedChecklistStatus(row.application, item) }}
                  </span>
                  <button @click="toggleAutomaticChecklistItem(row.application, item)">
                    {{ item.status === 'Not Needed' ? 'Track automatically' : 'Not needed' }}
                  </button>
                </div>
                <select
                  v-else
                  v-model="item.status"
                  :aria-label="`${item.label} status`"
                  @change="store.updateChecklistItem(row.college.id, item.id, { status: item.status })"
                >
                  <option v-for="status in checklistStatuses" :key="status" :value="status">
                    {{ status }}
                  </option>
                </select>
                <span
                  class="checklist-label"
                  :class="{
                    completed: resolvedChecklistStatus(row.application, item) === 'Done',
                    muted: resolvedChecklistStatus(row.application, item) === 'Not Needed',
                  }"
                >
                  {{ item.label }}
                  <small v-if="isAutomaticChecklistItem(item)">
                    {{ automaticChecklistDetail(row.application, item) }}
                  </small>
                </span>
                <label class="deadline-override">
                  <input
                    v-model="item.dueDate"
                    type="date"
                    :aria-label="`${item.label} custom due date`"
                    @change="store.updateChecklistItem(row.college.id, item.id, { dueDate: item.dueDate })"
                  />
                  <small v-if="!item.dueDate">
                    Uses app deadline{{ row.college.deadline ? `: ${formatDate(row.college.deadline)}` : '' }}
                  </small>
                  <small v-else>Custom deadline</small>
                </label>
                <button
                  v-if="item.isCustom"
                  class="icon-button danger"
                  title="Delete checklist item"
                  @click="store.deleteChecklistItem(row.college.id, item.id)"
                >
                  ×
                </button>
                <button
                  v-else-if="isAutomaticChecklistItem(item)"
                  class="source-button"
                  @click="openAutomaticChecklistSource(item)"
                >
                  Open
                </button>
                <span v-else class="icon-spacer"></span>
              </div>
            </div>
            <form class="inline-add" @submit.prevent="addChecklistItem(row.application)">
              <input
                v-model="checklistDrafts[row.college.id]"
                type="text"
                placeholder="Add a custom requirement"
              />
              <button type="submit">Add item</button>
            </form>
          </div>
        </section>
      </div>
    </template>

    <template v-else-if="activeTab === 'Tasks'">
      <section v-if="showTaskForm" class="section-panel form-panel">
        <div class="section-heading">
          <h3>{{ editingTaskId ? 'Edit Task' : 'New Task' }}</h3>
          <button class="icon-button" title="Close task form" @click="showTaskForm = false">×</button>
        </div>
        <div class="form-grid">
          <label class="wide-field">
            Task title
            <input v-model="taskForm.title" type="text" placeholder="Request official transcript" />
          </label>
          <label>
            College
            <select v-model="taskForm.collegeId">
              <option value="">General task</option>
              <option v-for="college in collegeStore.colleges" :key="college.id" :value="college.id">
                {{ college.name }}
              </option>
            </select>
          </label>
          <label>
            Type
            <select v-model="taskForm.type">
              <option v-for="type in taskTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </label>
          <label>
            Due date
            <input v-model="taskForm.dueDate" type="date" />
          </label>
          <label>
            Priority
            <select v-model="taskForm.priority">
              <option v-for="priority in taskPriorities" :key="priority" :value="priority">
                {{ priority }}
              </option>
            </select>
          </label>
          <label>
            Status
            <select v-model="taskForm.status">
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </label>
          <label>
            Remind me
            <select v-model.number="taskForm.reminderDays">
              <option :value="0">On the due date</option>
              <option :value="1">1 day before</option>
              <option :value="3">3 days before</option>
              <option :value="7">1 week before</option>
              <option :value="14">2 weeks before</option>
              <option :value="30">1 month before</option>
            </select>
          </label>
          <label>
            Link to existing work
            <select
              v-model="taskForm.linkedResourceType"
              @change="taskForm.linkedResourceId = ''"
            >
              <option value="">No linked item</option>
              <option v-for="resourceType in linkedResourceTypes" :key="resourceType" :value="resourceType">
                {{ resourceType }}
              </option>
            </select>
          </label>
          <label v-if="taskForm.linkedResourceType">
            Choose {{ taskForm.linkedResourceType.toLowerCase() }}
            <select v-model="taskForm.linkedResourceId">
              <option value="">Choose an item</option>
              <option v-for="option in linkedResourceOptions" :key="option.id" :value="option.id">
                {{ option.label }}
              </option>
            </select>
          </label>
          <label class="wide-field">
            Notes
            <textarea v-model="taskForm.notes" rows="2" placeholder="Links, instructions, or context"></textarea>
          </label>
        </div>
        <div class="form-actions">
          <button class="primary-button" @click="saveTask">
            {{ editingTaskId ? 'Update Task' : 'Add Task' }}
          </button>
          <button class="secondary-button" @click="showTaskForm = false">Cancel</button>
        </div>
      </section>

      <div class="filter-bar">
        <div class="segmented-control">
          <button
            v-for="filter in (['Open', 'All', 'Done'] as const)"
            :key="filter"
            :class="{ active: taskFilter === filter }"
            @click="taskFilter = filter"
          >
            {{ filter }}
          </button>
        </div>
        <span>{{ filteredTasks.length }} task{{ filteredTasks.length === 1 ? '' : 's' }}</span>
      </div>

      <section class="section-panel task-panel">
        <div v-if="filteredTasks.length === 0" class="empty-state">
          <strong>{{ taskFilter === 'Done' ? 'No completed tasks yet' : 'Your task list is clear' }}</strong>
          <span>Create a task and CogApp will place it on your calendar and reminder list.</span>
          <button class="primary-button" @click="openNewTask()">Add Task</button>
        </div>
        <div v-else class="task-list">
          <div v-for="task in filteredTasks" :key="task.id" class="task-row">
            <button
              class="task-check"
              :class="{ done: task.status === 'Done' }"
              :aria-label="task.status === 'Done' ? 'Mark task open' : 'Mark task done'"
              @click="store.updateTask(task.id, { status: task.status === 'Done' ? 'To Do' : 'Done' })"
            >
              {{ task.status === 'Done' ? '✓' : '' }}
            </button>
            <span class="priority-dot" :class="task.priority.toLowerCase()"></span>
            <div class="task-copy">
              <strong :class="{ completed: task.status === 'Done' }">{{ task.title }}</strong>
              <span>
                {{ collegeName(task.collegeId) }} · {{ task.type }} · {{ task.priority }} priority
              </span>
              <button
                v-if="task.linkedResourceType && task.linkedResourceId"
                class="linked-resource"
                @click.stop="openLinkedResource(task)"
              >
                Linked {{ task.linkedResourceType.toLowerCase() }}: {{ linkedResourceLabel(task) }}
              </button>
            </div>
            <span
              v-if="task.dueDate"
              class="due-badge"
              :class="{ overdue: daysUntil(task.dueDate) < 0 && task.status !== 'Done' }"
            >
              {{ task.status === 'Done' ? formatDate(task.dueDate) : dueLabel(task.dueDate) }}
            </span>
            <span v-else class="due-badge neutral">No date</span>
            <button class="icon-button" title="Edit task" @click="editTask(task)">✎</button>
            <button class="icon-button danger" title="Delete task" @click="removeTask(task)">×</button>
          </div>
        </div>
      </section>
    </template>

    <template v-else-if="activeTab === 'Recommendations'">
      <section v-if="showRecommendationForm" class="section-panel form-panel">
        <div class="section-heading">
          <h3>{{ editingRecommendationId ? 'Edit Recommender' : 'New Recommender' }}</h3>
          <button class="icon-button" title="Close recommender form" @click="showRecommendationForm = false">×</button>
        </div>
        <div class="form-grid">
          <label>
            Name
            <input v-model="recommendationForm.name" type="text" placeholder="Ms. Rivera" />
          </label>
          <label>
            Role or subject
            <input v-model="recommendationForm.role" type="text" placeholder="AP Biology teacher" />
          </label>
          <label>
            Email
            <input v-model="recommendationForm.email" type="email" placeholder="teacher@school.edu" />
          </label>
          <label>
            Status
            <select v-model="recommendationForm.status">
              <option v-for="status in recommendationStatuses" :key="status" :value="status">
                {{ status }}
              </option>
            </select>
          </label>
          <label>
            Date asked
            <input v-model="recommendationForm.requestedDate" type="date" />
          </label>
          <label>
            Due date
            <input v-model="recommendationForm.dueDate" type="date" />
          </label>
          <label>
            Submitted date
            <input v-model="recommendationForm.submittedDate" type="date" />
          </label>
          <label class="checkbox-field">
            <input v-model="recommendationForm.thankYouSent" type="checkbox" />
            Thank-you note sent
          </label>
          <fieldset class="wide-field college-picker">
            <legend>Colleges receiving this letter</legend>
            <label v-for="college in collegeStore.colleges" :key="college.id">
              <input v-model="recommendationForm.collegeIds" type="checkbox" :value="college.id" />
              {{ college.name }}
            </label>
            <span v-if="collegeStore.colleges.length === 0">Add colleges to your list first.</span>
          </fieldset>
          <label class="wide-field">
            Notes
            <textarea
              v-model="recommendationForm.notes"
              rows="2"
              placeholder="What you shared, follow-up plans, or submission instructions"
            ></textarea>
          </label>
        </div>
        <div class="form-actions">
          <button class="primary-button" @click="saveRecommendation">
            {{ editingRecommendationId ? 'Update Recommender' : 'Add Recommender' }}
          </button>
          <button class="secondary-button" @click="showRecommendationForm = false">Cancel</button>
        </div>
      </section>

      <div v-if="store.recommendations.length === 0" class="empty-state section-panel">
        <strong>No recommenders added yet</strong>
        <span>Track who you plan to ask, where each letter is going, and when to follow up.</span>
        <button class="primary-button" @click="openNewRecommendation">Add Recommender</button>
      </div>
      <div v-else class="recommendation-grid">
        <section
          v-for="recommendation in store.recommendations"
          :key="recommendation.id"
          class="recommendation-card"
        >
          <div class="recommendation-top">
            <div class="avatar">{{ recommendation.name.charAt(0).toUpperCase() }}</div>
            <div>
              <h3>{{ recommendation.name }}</h3>
              <p>{{ recommendation.role || 'Role not added' }}</p>
            </div>
            <span class="status-badge" :class="statusClass(recommendation.status)">
              {{ recommendation.status }}
            </span>
          </div>
          <div class="recommendation-details">
            <div>
              <span>Due</span>
              <strong>{{ formatDate(recommendation.dueDate) }}</strong>
            </div>
            <div>
              <span>Colleges</span>
              <strong>{{ recommendation.collegeIds.length }}</strong>
            </div>
            <div>
              <span>Thank-you</span>
              <strong>{{ recommendation.thankYouSent ? 'Sent' : 'Pending' }}</strong>
            </div>
          </div>
          <div v-if="recommendation.collegeIds.length" class="college-tags">
            <span v-for="collegeId in recommendation.collegeIds" :key="collegeId">
              {{ collegeName(collegeId) }}
            </span>
          </div>
          <p v-if="recommendation.notes" class="recommendation-notes">{{ recommendation.notes }}</p>
          <div class="card-actions">
            <a v-if="recommendation.email" :href="`mailto:${recommendation.email}`" class="secondary-button">Email</a>
            <button class="secondary-button" @click="editRecommendation(recommendation)">Edit</button>
            <button class="icon-button danger" title="Delete recommender" @click="removeRecommendation(recommendation)">×</button>
          </div>
        </section>
      </div>
    </template>

    <template v-else>
      <section class="section-panel calendar-panel">
        <div class="calendar-header">
          <button class="icon-button" title="Previous month" @click="previousMonth">‹</button>
          <h3>{{ monthNames[calendarMonth] }} {{ calendarYear }}</h3>
          <button class="icon-button" title="Next month" @click="nextMonth">›</button>
        </div>
        <div class="calendar-grid">
          <div v-for="dayName in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="dayName" class="weekday">
            {{ dayName }}
          </div>
          <button
            v-for="(day, index) in calendarDays"
            :key="`${day.date}-${index}`"
            class="calendar-day"
            :class="{
              empty: !day.day,
              today: day.isToday,
              selected: day.date && day.date === selectedCalendarDate,
            }"
            :disabled="!day.day"
            @click="selectedCalendarDate = day.date"
          >
            <span v-if="day.day" class="day-number">{{ day.day }}</span>
            <span
              v-for="event in day.events.slice(0, 3)"
              :key="event.id"
              class="calendar-event"
              :class="event.kind"
            >
              {{ event.title }}
            </span>
            <small v-if="day.events.length > 3">+{{ day.events.length - 3 }} more</small>
          </button>
        </div>
      </section>

      <section v-if="selectedCalendarDate" class="section-panel day-agenda">
        <div class="section-heading">
          <div>
            <h3>{{ new Date(`${selectedCalendarDate}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) }}</h3>
            <p>{{ selectedDayEvents.length }} scheduled item{{ selectedDayEvents.length === 1 ? '' : 's' }}</p>
          </div>
          <button class="primary-button" @click="activeTab = 'Tasks'; openNewTask(selectedCalendarDate)">
            + Add Task
          </button>
        </div>
        <div v-if="selectedDayEvents.length === 0" class="empty-state compact">
          <strong>No deadlines on this date</strong>
          <span>Add a task to reserve the day.</span>
        </div>
        <div v-for="event in selectedDayEvents" :key="event.id" class="agenda-row">
          <span class="event-dot" :class="event.kind"></span>
          <strong>{{ event.title }}</strong>
          <span>{{ event.kind }}</span>
        </div>
      </section>

      <div class="calendar-legend">
        <span><i class="event-dot college"></i> College deadlines</span>
        <span><i class="event-dot checklist"></i> Checklist overrides</span>
        <span><i class="event-dot task"></i> Tasks</span>
        <span><i class="event-dot recommendation"></i> Recommendations</span>
        <span><i class="event-dot scholarship"></i> Scholarships</span>
        <span><i class="event-dot visit"></i> Visits & interviews</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.command-center {
  width: min(1180px, 100%);
  margin: 0 auto;
  color: var(--text-primary);
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.page-header h2 {
  margin-bottom: 5px;
}

.page-header p,
.section-heading p {
  font-size: 14px;
}

.tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  margin-bottom: 20px;
  overflow-x: auto;
  background: var(--border-light);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.tab-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-width: max-content;
  padding: 9px 15px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.tab-button.active {
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: var(--shadow);
}

.tab-count {
  min-width: 19px;
  padding: 1px 5px;
  border-radius: 9px;
  background: var(--primary);
  color: white;
  font-size: 11px;
}

.primary-button,
.secondary-button,
.primary-link,
.text-button,
.inline-add button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
}

.primary-button,
.primary-link {
  padding: 10px 15px;
  border: 1px solid var(--primary);
  background: var(--primary);
  color: white;
}

.primary-button:hover,
.primary-link:hover {
  background: var(--primary-hover);
}

.secondary-button {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
}

.text-button {
  padding: 5px;
  border: 0;
  background: transparent;
  color: var(--primary);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.metric-card {
  min-width: 0;
  padding: 17px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.metric-card:hover {
  border-color: var(--accent-border);
}

.metric-card strong {
  display: block;
  margin: 4px 0;
  font-size: 29px;
}

.metric-card > span:last-child,
.metric-label {
  display: block;
  color: var(--text-secondary);
  font-size: 12px;
}

.metric-label {
  font-size: 13px;
  font-weight: 700;
}

.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
}

.section-panel,
.application-card,
.recommendation-card {
  margin-bottom: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
}

.section-panel {
  padding: 20px;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 15px;
}

.section-heading h3,
.section-heading h4 {
  margin: 0 0 4px;
  font-size: 16px;
}

.attention-row {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 10px;
  padding: 11px 0;
  border: 0;
  border-bottom: 1px solid var(--border-light);
  background: transparent;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.attention-row:last-child {
  border-bottom: 0;
}

.attention-copy,
.upcoming-copy {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
}

.attention-copy strong,
.upcoming-copy strong {
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attention-copy small,
.upcoming-copy span {
  margin-top: 2px;
  color: var(--text-secondary);
  font-size: 11px;
}

.priority-dot {
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
}

.priority-dot.high {
  background: #dc2626;
}

.priority-dot.medium {
  background: #d97706;
}

.priority-dot.low {
  background: #2563eb;
}

.due-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.due-badge {
  padding: 4px 7px;
  background: var(--primary-light);
  color: var(--primary);
}

.due-badge.overdue {
  background: #fee2e2;
  color: #b91c1c;
}

.due-badge.neutral {
  background: var(--border-light);
  color: var(--text-secondary);
}

.upcoming-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-light);
}

.upcoming-item:last-child {
  border-bottom: 0;
}

.date-tile {
  display: flex;
  flex: 0 0 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-radius: 6px;
  background: var(--primary-light);
  color: var(--primary);
}

.date-tile strong {
  font-size: 15px;
  line-height: 1;
}

.date-tile span {
  margin-top: 3px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  padding: 24px;
  flex-direction: column;
  color: var(--text-secondary);
  text-align: center;
}

.empty-state strong {
  margin-bottom: 6px;
  color: var(--text-primary);
}

.empty-state span {
  max-width: 480px;
  margin-bottom: 14px;
  font-size: 13px;
}

.empty-state.compact {
  min-height: 125px;
  padding: 15px;
}

.progress-table {
  overflow-x: auto;
}

.progress-row {
  display: grid;
  grid-template-columns: minmax(180px, 1.4fr) 130px minmax(150px, 1fr) 90px;
  align-items: center;
  gap: 16px;
  min-width: 690px;
  padding: 11px 0;
  border-bottom: 1px solid var(--border-light);
}

.progress-row:last-child {
  border-bottom: 0;
}

.college-cell {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.college-cell strong {
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.college-cell span,
.deadline-cell {
  margin-top: 2px;
  color: var(--text-secondary);
  font-size: 11px;
}

.status-badge {
  padding: 4px 7px;
  background: var(--border-light);
  color: var(--text-secondary);
}

.status-badge.in-progress,
.status-badge.asked {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.ready-to-submit,
.status-badge.confirmed {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-badge.submitted,
.status-badge.accepted {
  background: #d1fae5;
  color: #047857;
}

.status-badge.waitlisted,
.status-badge.considering {
  background: #ede9fe;
  color: #6d28d9;
}

.status-badge.rejected,
.status-badge.declined,
.status-badge.withdrawn {
  background: #fee2e2;
  color: #b91c1c;
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-cell small {
  width: 32px;
  color: var(--text-secondary);
  font-size: 10px;
}

.progress-track {
  width: 100%;
  height: 6px;
  overflow: hidden;
  border-radius: 3px;
  background: var(--border-light);
}

.progress-track span {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: var(--primary);
  transition: width 0.2s;
}

.application-card {
  overflow: hidden;
}

.application-summary {
  display: grid;
  grid-template-columns: 32px minmax(180px, 1.3fr) minmax(140px, 0.8fr) 150px;
  align-items: center;
  gap: 14px;
  padding: 15px 17px;
}

.expand-button,
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
}

.expand-button {
  width: 30px;
  height: 30px;
  font-size: 19px;
}

.icon-button {
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  font-size: 17px;
}

.icon-button.danger {
  color: #b91c1c;
}

.application-title {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.application-title strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.application-title span,
.application-progress span {
  margin-top: 3px;
  color: var(--text-secondary);
  font-size: 11px;
}

.application-progress .progress-track {
  margin-top: 7px;
}

.status-select {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-input);
  color: var(--text-primary);
  font: inherit;
  font-size: 12px;
}

.application-guidance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 17px;
  border-top: 1px solid var(--border-color);
  font-size: 12px;
}

.application-guidance.success {
  background: #ecfdf5;
  color: #047857;
}

.application-guidance.warning {
  background: #fff7ed;
  color: #c2410c;
}

.application-guidance button {
  padding: 6px 9px;
  border: 1px solid currentColor;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.application-details {
  padding: 18px;
  border-top: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--bg-page) 55%, var(--bg-card));
}

.detail-grid,
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

label,
fieldset {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
}

input,
select,
textarea {
  width: 100%;
  margin-top: 6px;
  padding: 9px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  outline: none;
  background: var(--bg-input);
  color: var(--text-primary);
  font: inherit;
  font-size: 13px;
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--accent-border);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 12%, transparent);
}

textarea {
  resize: vertical;
}

.input-with-action {
  display: flex;
  align-items: center;
  gap: 6px;
}

.input-with-action input {
  flex: 1;
}

.input-with-action a {
  margin-top: 6px;
  padding: 8px;
  color: var(--primary);
  text-decoration: none;
}

.full-field {
  display: block;
  margin-top: 14px;
}

.checklist-heading {
  margin: 20px 0 10px;
}

.checklist-heading h4 {
  margin: 0 0 3px;
  font-size: 14px;
}

.checklist-heading span {
  color: var(--text-secondary);
  font-size: 11px;
}

.checklist-row {
  display: grid;
  grid-template-columns: 140px minmax(180px, 1fr) 165px 54px;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-light);
}

.checklist-row select,
.checklist-row input {
  margin: 0;
  padding: 7px 8px;
  font-size: 11px;
}

.checklist-label {
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.checklist-label small,
.deadline-override small {
  margin-top: 3px;
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 400;
  text-decoration: none;
}

.automatic-status {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 4px;
}

.automatic-status button,
.source-button,
.linked-resource {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--primary);
  font: inherit;
  font-size: 10px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.deadline-override {
  display: flex;
  flex-direction: column;
}

.deadline-override input {
  width: 100%;
}

.source-button {
  padding: 6px;
  text-align: center;
}

.completed {
  color: var(--text-secondary);
  text-decoration: line-through;
}

.muted {
  color: var(--text-secondary);
}

.inline-add {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.inline-add input {
  flex: 1;
  margin: 0;
}

.inline-add button {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
}

.form-panel {
  border-color: var(--accent-border);
}

.form-grid .wide-field {
  grid-column: 1 / -1;
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 60px;
  padding-top: 20px;
  color: var(--text-primary);
}

.checkbox-field input,
.college-picker input {
  width: auto;
  margin: 0;
}

.form-actions,
.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  color: var(--text-secondary);
  font-size: 12px;
}

.segmented-control {
  display: inline-flex;
  padding: 3px;
  border: 1px solid var(--border-color);
  border-radius: 7px;
  background: var(--bg-card);
}

.segmented-control button {
  padding: 6px 12px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.segmented-control button.active {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 700;
}

.task-panel {
  padding-top: 7px;
  padding-bottom: 7px;
}

.task-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-light);
}

.task-row:last-child {
  border-bottom: 0;
}

.task-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--bg-card);
  color: white;
  cursor: pointer;
}

.task-check.done {
  border-color: var(--btn-success);
  background: var(--btn-success);
}

.task-copy {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.task-copy strong {
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-copy span {
  margin-top: 3px;
  color: var(--text-secondary);
  font-size: 11px;
}

.task-copy .linked-resource {
  width: fit-content;
  margin-top: 5px;
}

.college-picker {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

.college-picker legend {
  padding: 0 5px;
}

.college-picker label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--text-primary);
}

.recommendation-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.recommendation-card {
  padding: 17px;
}

.recommendation-top {
  display: flex;
  align-items: center;
  gap: 11px;
}

.recommendation-top > div:nth-child(2) {
  flex: 1;
  min-width: 0;
}

.recommendation-top h3 {
  overflow: hidden;
  margin: 0;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recommendation-top p {
  overflow: hidden;
  margin-top: 2px;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 800;
}

.recommendation-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 15px;
  padding: 12px 0;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
}

.recommendation-details div {
  display: flex;
  flex-direction: column;
}

.recommendation-details span {
  color: var(--text-secondary);
  font-size: 10px;
}

.recommendation-details strong {
  margin-top: 3px;
  font-size: 12px;
}

.college-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 12px;
}

.college-tags span {
  padding: 4px 7px;
  border-radius: 5px;
  background: var(--border-light);
  color: var(--text-secondary);
  font-size: 10px;
}

.recommendation-notes {
  margin-top: 11px;
  font-size: 12px;
  line-height: 1.5;
}

.card-actions {
  justify-content: flex-end;
}

.calendar-panel {
  overflow-x: auto;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-bottom: 15px;
}

.calendar-header h3 {
  min-width: 180px;
  margin: 0;
  text-align: center;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(105px, 1fr));
  min-width: 735px;
  border-top: 1px solid var(--border-color);
  border-left: 1px solid var(--border-color);
}

.weekday {
  padding: 8px;
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}

.calendar-day {
  display: flex;
  min-height: 105px;
  min-width: 0;
  padding: 7px;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
  border: 0;
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.calendar-day:hover,
.calendar-day.selected {
  background: var(--primary-light);
}

.calendar-day.empty {
  background: var(--border-light);
  cursor: default;
}

.day-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 11px;
  font-weight: 700;
}

.calendar-day.today .day-number {
  border-radius: 50%;
  background: var(--primary);
  color: white;
}

.calendar-event {
  display: block;
  overflow: hidden;
  padding: 4px 5px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calendar-event.college {
  background: #dbeafe;
  color: #1d4ed8;
}

.calendar-event.task {
  background: #fef3c7;
  color: #92400e;
}

.calendar-event.checklist {
  background: #ffedd5;
  color: #c2410c;
}

.calendar-event.recommendation {
  background: #d1fae5;
  color: #047857;
}

.calendar-event.scholarship {
  background: #ede9fe;
  color: #6d28d9;
}

.calendar-event.visit {
  background: #fce7f3;
  color: #be185d;
}

.calendar-day small {
  color: var(--text-secondary);
  font-size: 9px;
}

.agenda-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-light);
}

.agenda-row strong {
  flex: 1;
  font-size: 13px;
}

.agenda-row > span:last-child {
  color: var(--text-secondary);
  font-size: 11px;
  text-transform: capitalize;
}

.event-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 50%;
}

.event-dot.college {
  background: #2563eb;
}

.event-dot.task {
  background: #d97706;
}

.event-dot.checklist {
  background: #ea580c;
}

.event-dot.recommendation {
  background: #059669;
}

.event-dot.scholarship {
  background: #7c3aed;
}

.event-dot.visit {
  background: #db2777;
}

.calendar-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: var(--text-secondary);
  font-size: 11px;
}

.calendar-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

@media (max-width: 980px) {
  .recommendation-grid {
    grid-template-columns: 1fr;
  }

  .application-summary {
    grid-template-columns: 32px minmax(0, 1fr) 145px;
  }

  .application-progress {
    display: none;
  }
}

@media (max-width: 700px) {
  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .detail-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-grid .wide-field {
    grid-column: auto;
  }

  .application-summary {
    grid-template-columns: 32px minmax(0, 1fr);
  }

  .application-summary .status-select {
    grid-column: 2;
  }

  .checklist-row {
    grid-template-columns: minmax(0, 1fr) 54px;
  }

  .checklist-label {
    grid-column: 1;
    grid-row: 1;
  }

  .automatic-status,
  .checklist-row > select {
    grid-column: 1;
    grid-row: 2;
  }

  .deadline-override {
    grid-column: 1;
    grid-row: 3;
  }

  .checklist-row .icon-button,
  .checklist-row .icon-spacer,
  .checklist-row .source-button {
    grid-column: 2;
    grid-row: 1;
  }

  .task-row {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .task-copy {
    min-width: calc(100% - 58px);
  }

  .task-row .due-badge {
    margin-left: 38px;
  }

  .college-picker {
    grid-template-columns: 1fr;
  }

  .calendar-legend {
    align-items: flex-start;
    flex-direction: column;
    gap: 7px;
  }
}
</style>
