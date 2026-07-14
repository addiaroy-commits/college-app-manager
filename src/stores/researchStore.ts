import { defineStore } from "pinia";
import { ref } from "vue";
import type { College } from "./collegeStore";
import { getUserKey } from "./userKey";

export type ResearchStatus = "Not Started" | "Researching" | "Complete";
export type CampusSetting =
  | ""
  | "Urban"
  | "Suburban"
  | "College Town"
  | "Rural";
export type VisitType =
  | "Campus Visit"
  | "Virtual Tour"
  | "Interview"
  | "Information Session"
  | "College Fair";

export interface FitRatings {
  academics: number;
  affordability: number;
  campus: number;
  location: number;
  career: number;
}

export interface FitWeights {
  academics: number;
  affordability: number;
  campus: number;
  location: number;
  career: number;
}

export interface CollegeResearchProfile {
  collegeId: string;
  status: ResearchStatus;
  intendedProgram: string;
  location: string;
  setting: CampusSetting;
  distanceFromHome: number;
  acceptanceRate: number;
  undergraduateSize: number;
  graduationRate: number;
  ratings: FitRatings;
  pros: string;
  cons: string;
  questions: string;
  notes: string;
  lastUpdated: string;
}

export interface CollegeVisit {
  id: string;
  collegeId: string;
  type: VisitType;
  date: string;
  contact: string;
  rating: number;
  notes: string;
  followUp: string;
  thankYouSent: boolean;
  createdAt: string;
}

interface ResearchData {
  version: number;
  profiles: CollegeResearchProfile[];
  visits: CollegeVisit[];
  weights: FitWeights;
  comparisonIds: string[];
}

export const defaultFitWeights: FitWeights = {
  academics: 30,
  affordability: 25,
  campus: 20,
  location: 15,
  career: 10,
};

function makeProfile(collegeId: string): CollegeResearchProfile {
  return {
    collegeId,
    status: "Not Started",
    intendedProgram: "",
    location: "",
    setting: "",
    distanceFromHome: 0,
    acceptanceRate: 0,
    undergraduateSize: 0,
    graduationRate: 0,
    ratings: {
      academics: 0,
      affordability: 0,
      campus: 0,
      location: 0,
      career: 0,
    },
    pros: "",
    cons: "",
    questions: "",
    notes: "",
    lastUpdated: "",
  };
}

export function calculateFitScore(
  profile: CollegeResearchProfile,
  weights: FitWeights,
): number {
  const weightTotal = Object.values(weights).reduce(
    (total, weight) => total + weight,
    0,
  );
  if (weightTotal === 0) return 0;
  const weightedTotal =
    profile.ratings.academics * weights.academics +
    profile.ratings.affordability * weights.affordability +
    profile.ratings.campus * weights.campus +
    profile.ratings.location * weights.location +
    profile.ratings.career * weights.career;
  return Math.round((weightedTotal / (5 * weightTotal)) * 100);
}

export const useResearchStore = defineStore("college-research", () => {
  const profiles = ref<CollegeResearchProfile[]>([]);
  const visits = ref<CollegeVisit[]>([]);
  const weights = ref<FitWeights>({ ...defaultFitWeights });
  const comparisonIds = ref<string[]>([]);

  (function load() {
    try {
      const saved = localStorage.getItem(getUserKey("college-research"));
      if (!saved) return;
      const parsed = JSON.parse(saved) as Partial<ResearchData>;
      profiles.value = Array.isArray(parsed.profiles) ? parsed.profiles : [];
      visits.value = Array.isArray(parsed.visits) ? parsed.visits : [];
      weights.value = parsed.weights
        ? { ...defaultFitWeights, ...parsed.weights }
        : { ...defaultFitWeights };
      comparisonIds.value = Array.isArray(parsed.comparisonIds)
        ? parsed.comparisonIds.slice(0, 4)
        : [];
    } catch {
      profiles.value = [];
      visits.value = [];
      weights.value = { ...defaultFitWeights };
      comparisonIds.value = [];
    }
  })();

  function save() {
    const data: ResearchData = {
      version: 1,
      profiles: profiles.value,
      visits: visits.value,
      weights: weights.value,
      comparisonIds: comparisonIds.value,
    };
    localStorage.setItem(getUserKey("college-research"), JSON.stringify(data));
  }

  function ensureProfiles(colleges: College[]) {
    let changed = false;
    for (const college of colleges) {
      if (profiles.value.some((profile) => profile.collegeId === college.id)) {
        continue;
      }
      profiles.value.push(makeProfile(college.id));
      changed = true;
    }
    const validComparisonIds = comparisonIds.value.filter((id) =>
      colleges.some((college) => college.id === id),
    );
    if (validComparisonIds.length !== comparisonIds.value.length) {
      comparisonIds.value = validComparisonIds;
      changed = true;
    }
    if (changed) save();
  }

  function updateProfile(
    collegeId: string,
    updates: Partial<CollegeResearchProfile>,
  ) {
    const profile = profiles.value.find((item) => item.collegeId === collegeId);
    if (!profile) return;
    Object.assign(profile, updates, { lastUpdated: new Date().toISOString() });
    save();
  }

  function updateRating(
    collegeId: string,
    category: keyof FitRatings,
    value: number,
  ) {
    const profile = profiles.value.find((item) => item.collegeId === collegeId);
    if (!profile) return;
    profile.ratings[category] = Math.max(0, Math.min(5, value));
    profile.lastUpdated = new Date().toISOString();
    if (profile.status === "Not Started") profile.status = "Researching";
    save();
  }

  function updateWeights(updated: FitWeights) {
    weights.value = { ...updated };
    save();
  }

  function toggleComparison(collegeId: string): boolean {
    if (comparisonIds.value.includes(collegeId)) {
      comparisonIds.value = comparisonIds.value.filter(
        (id) => id !== collegeId,
      );
      save();
      return true;
    }
    if (comparisonIds.value.length >= 4) return false;
    comparisonIds.value.push(collegeId);
    save();
    return true;
  }

  function addVisit(visit: Omit<CollegeVisit, "id" | "createdAt">) {
    visits.value.push({
      ...visit,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    });
    save();
  }

  function updateVisit(id: string, updates: Partial<CollegeVisit>) {
    const visit = visits.value.find((item) => item.id === id);
    if (!visit) return;
    Object.assign(visit, updates);
    save();
  }

  function deleteVisit(id: string) {
    visits.value = visits.value.filter((visit) => visit.id !== id);
    save();
  }

  return {
    profiles,
    visits,
    weights,
    comparisonIds,
    ensureProfiles,
    updateProfile,
    updateRating,
    updateWeights,
    toggleComparison,
    addVisit,
    updateVisit,
    deleteVisit,
  };
});
