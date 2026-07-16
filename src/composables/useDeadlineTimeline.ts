import { computed } from "vue";
import { useApplicationStore } from "../stores/applicationStore";
import { useCollegeStore } from "../stores/collegeStore";
import { useEssayStore } from "../stores/essayStore";
import { useResearchStore } from "../stores/researchStore";
import { useScholarshipStore } from "../stores/scholarshipStore";

export type TimelineEventKind =
  | "college"
  | "essay"
  | "financial-aid"
  | "test"
  | "checklist"
  | "task"
  | "recommendation"
  | "loci"
  | "scholarship"
  | "interview"
  | "visit";

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  detail: string;
  kind: TimelineEventKind;
  route: string;
  reminderDays?: number;
  inherited?: boolean;
}

function isTrackedScholarship(
  scholarship: ReturnType<typeof useScholarshipStore>["scholarships"][number],
): boolean {
  if (!scholarship.isSample) return true;
  return (
    scholarship.status !== "Not Started" ||
    scholarship.docLinks.length > 0 ||
    scholarship.essayLinks.length > 0 ||
    scholarship.notes.trim().length > 0 ||
    scholarship.checklist.some(
      (item) => item.status !== "Needed" && item.status !== "Not Needed",
    )
  );
}

function checklistKind(label: string): TimelineEventKind {
  const normalized = label.toLowerCase();
  if (normalized.includes("fafsa") || normalized.includes("css profile") || normalized.includes("financial")) {
    return "financial-aid";
  }
  if (normalized.includes("test") || normalized.includes("sat") || normalized.includes("act")) {
    return "test";
  }
  return "checklist";
}

export function useDeadlineTimeline() {
  const colleges = useCollegeStore();
  const applications = useApplicationStore();
  const essays = useEssayStore();
  const scholarships = useScholarshipStore();
  const research = useResearchStore();

  applications.ensureApplications(colleges.colleges);

  const events = computed<TimelineEvent[]>(() => {
    const items: TimelineEvent[] = [];
    const collegeById = new Map(colleges.colleges.map((college) => [college.id, college]));
    const applicationByCollege = new Map(
      applications.applications.map((application) => [application.collegeId, application]),
    );
    const add = (event: TimelineEvent) => {
      if (event.date) items.push(event);
    };

    for (const college of colleges.colleges) {
      const application = applicationByCollege.get(college.id);
      if (!["Submitted", "Accepted", "Waitlisted", "Deferred", "Rejected", "Withdrawn"].includes(application?.status || "")) {
        add({
          id: `college-${college.id}`,
          date: college.deadline,
          title: `${college.name} application`,
          detail: `${college.applicationType || college.category} deadline`,
          kind: "college",
          route: "/applications?tab=Applications",
        });
      }
    }

    for (const application of applications.applications) {
      const college = collegeById.get(application.collegeId);
      for (const item of application.checklist) {
        if (["Done", "Not Needed"].includes(item.status)) continue;
        if (["Supplemental essays", "Recommendation letters"].includes(item.label)) continue;
        const date = item.dueDate || college?.deadline || "";
        add({
          id: `checklist-${application.collegeId}-${item.id}`,
          date,
          title: `${college?.name || "College"}: ${item.label}`,
          detail: item.dueDate ? "Custom requirement date" : "Synced with application deadline",
          kind: checklistKind(item.label),
          route: "/applications?tab=Applications",
          inherited: !item.dueDate,
        });
      }
    }

    for (const essay of essays.essays) {
      if (essay.status === "Done") continue;
      const linkedTask = applications.tasks.find(
        (task) => task.linkedResourceType === "Essay" && task.linkedResourceId === essay.id && task.status !== "Done",
      );
      const college = collegeById.get(essay.collegeId);
      const date = linkedTask?.dueDate || college?.deadline || "";
      add({
        id: `essay-${essay.id}`,
        date,
        title: essay.title,
        detail: linkedTask?.dueDate
          ? `Essay task${college ? ` · ${college.name}` : ""}`
          : `Synced with ${college?.name || essay.collegeName || "application"} deadline`,
        kind: "essay",
        route: `/essays/college/${essay.collegeId}/essay/${essay.id}`,
        reminderDays: linkedTask?.reminderDays,
        inherited: !linkedTask?.dueDate,
      });
    }

    for (const task of applications.tasks) {
      if (task.status === "Done" || task.linkedResourceType === "Essay") continue;
      const college = collegeById.get(task.collegeId);
      add({
        id: `task-${task.id}`,
        date: task.dueDate || college?.deadline || "",
        title: task.title,
        detail: college?.name || task.type,
        kind: task.type === "Financial Aid" ? "financial-aid" : task.type === "Interview" ? "interview" : "task",
        route: "/applications?tab=Tasks",
        reminderDays: task.reminderDays,
        inherited: !task.dueDate,
      });
    }

    for (const recommendation of applications.recommendations) {
      if (["Submitted", "Declined"].includes(recommendation.status)) continue;
      const associatedDeadlines = recommendation.collegeIds
        .map((id) => collegeById.get(id)?.deadline || "")
        .filter(Boolean)
        .sort();
      add({
        id: `recommendation-${recommendation.id}`,
        date: recommendation.dueDate || associatedDeadlines[0] || "",
        title: `${recommendation.name}'s recommendation`,
        detail: recommendation.dueDate ? recommendation.role || "Recommendation letter" : "Synced with earliest college deadline",
        kind: "recommendation",
        route: "/applications?tab=Recommendations",
        inherited: !recommendation.dueDate,
      });
    }

    for (const letter of applications.lociLetters) {
      if (letter.status === "Sent") continue;
      const college = collegeById.get(letter.collegeId);
      add({
        id: `loci-${letter.id}`,
        date: letter.dueDate,
        title: `${college?.name || "College"} continued-interest letter`,
        detail: letter.status === "Ready" ? "LOCI ready to send" : "LOCI draft",
        kind: "loci",
        route: "/applications?tab=loci",
      });
    }

    for (const scholarship of scholarships.scholarships) {
      if (!isTrackedScholarship(scholarship) || ["Won", "Rejected"].includes(scholarship.status)) continue;
      add({
        id: `scholarship-${scholarship.id}`,
        date: scholarship.deadline,
        title: scholarship.name,
        detail: `$${scholarship.awardAmount.toLocaleString()} scholarship deadline`,
        kind: "scholarship",
        route: "/scholarships",
      });
    }

    for (const visit of research.visits) {
      const college = collegeById.get(visit.collegeId);
      add({
        id: `visit-${visit.id}`,
        date: visit.date,
        title: `${college?.name || "College"}: ${visit.type}`,
        detail: visit.contact || (visit.type === "Interview" ? "Interview" : "College event"),
        kind: visit.type === "Interview" ? "interview" : "visit",
        route: "/research",
      });
    }

    return items.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  });

  const eventsByDate = computed(() => {
    const grouped: Record<string, TimelineEvent[]> = {};
    for (const event of events.value) {
      (grouped[event.date] ||= []).push(event);
    }
    return grouped;
  });

  return { events, eventsByDate };
}
