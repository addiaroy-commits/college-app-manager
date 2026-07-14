<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCollegeStore } from "../stores/collegeStore";
import { useCostStore } from "../stores/costStore";
import {
  calculateFitScore,
  defaultFitWeights,
  useResearchStore,
  type CollegeResearchProfile,
  type CollegeVisit,
  type FitRatings,
  type FitWeights,
  type VisitType,
} from "../stores/researchStore";
import { showToast } from "../composables/useToast";

type TabName = "Compare" | "Fit & Rank" | "Research Notes" | "Visits";

const router = useRouter();
const route = useRoute();
const collegeStore = useCollegeStore();
const costStore = useCostStore();
const store = useResearchStore();
store.ensureProfiles(collegeStore.colleges);

const requestedTab = String(route.query.tab || "").toLowerCase();
const activeTab = ref<TabName>(
  requestedTab === "fit"
    ? "Fit & Rank"
    : requestedTab === "notes"
      ? "Research Notes"
      : requestedTab === "visits"
        ? "Visits"
        : "Compare",
);
const tabs: TabName[] = ["Compare", "Fit & Rank", "Research Notes", "Visits"];

const selectedProfileId = ref(
  String(route.query.college || "") ||
    store.comparisonIds[0] ||
    collegeStore.colleges[0]?.id ||
    "",
);

const comparisonColleges = computed(() =>
  store.comparisonIds
    .map((id) => collegeStore.colleges.find((college) => college.id === id))
    .filter((college) => college !== undefined),
);

const rankedColleges = computed(() =>
  collegeStore.colleges
    .map((college) => {
      const profile = profileFor(college.id);
      return {
        college,
        profile,
        score: profile ? calculateFitScore(profile, store.weights) : 0,
      };
    })
    .sort((a, b) => b.score - a.score || a.college.name.localeCompare(b.college.name)),
);

const selectedProfile = computed(() => profileFor(selectedProfileId.value));
const weightTotal = computed(() =>
  Object.values(store.weights).reduce((total, value) => total + value, 0),
);

const ratingCategories: {
  key: keyof FitRatings;
  label: string;
  description: string;
}[] = [
  { key: "academics", label: "Academics", description: "Program strength and learning fit" },
  { key: "affordability", label: "Affordability", description: "Realistic cost for your family" },
  { key: "campus", label: "Campus Life", description: "Community, activities, and culture" },
  { key: "location", label: "Location", description: "Distance, setting, and surrounding area" },
  { key: "career", label: "Career Support", description: "Internships, outcomes, and alumni network" },
];

function profileFor(collegeId: string): CollegeResearchProfile | undefined {
  return store.profiles.find((profile) => profile.collegeId === collegeId);
}

function collegeName(collegeId: string): string {
  return (
    collegeStore.colleges.find((college) => college.id === collegeId)?.name ??
    "Unknown college"
  );
}

function costFor(collegeId: string) {
  return costStore.getCostByCollege(collegeId);
}

function netCostFor(collegeId: string): number {
  const cost = costFor(collegeId);
  if (!cost) return 0;
  if (cost.netCost > 0) return cost.netCost;
  return Math.max(cost.stickerTotal - cost.grantsScholarships, 0);
}

function formatCurrency(value: number): string {
  return value > 0 ? `$${Math.round(value).toLocaleString()}` : "Not added";
}

function formatPercent(value: number): string {
  return value > 0 ? `${value}%` : "Not added";
}

function scoreClass(score: number): string {
  if (score >= 80) return "excellent";
  if (score >= 65) return "strong";
  if (score >= 45) return "mixed";
  return "unrated";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Excellent fit";
  if (score >= 65) return "Strong fit";
  if (score >= 45) return "Possible fit";
  if (score > 0) return "Needs review";
  return "Not scored";
}

function toggleComparison(collegeId: string) {
  if (!store.toggleComparison(collegeId)) {
    showToast("Compare up to four colleges at a time");
  }
}

function saveProfile(profile: CollegeResearchProfile) {
  store.updateProfile(profile.collegeId, profile);
  showToast("Research saved");
}

function setRating(
  profile: CollegeResearchProfile,
  category: keyof FitRatings,
  value: number,
) {
  store.updateRating(profile.collegeId, category, value);
}

function updateWeight(category: keyof FitWeights, value: number) {
  store.updateWeights({
    ...store.weights,
    [category]: Math.max(0, Math.min(100, value)),
  });
}

function resetWeights() {
  store.updateWeights({ ...defaultFitWeights });
  showToast("Fit priorities reset");
}

function openNotes(collegeId: string) {
  selectedProfileId.value = collegeId;
  activeTab.value = "Research Notes";
}

function goToCosts() {
  void router.push("/costs");
}

const showVisitForm = ref(false);
const editingVisitId = ref<string | null>(null);
const visitTypes: VisitType[] = [
  "Campus Visit",
  "Virtual Tour",
  "Interview",
  "Information Session",
  "College Fair",
];
const visitForm = ref<Omit<CollegeVisit, "id" | "createdAt">>({
  collegeId: "",
  type: "Campus Visit",
  date: "",
  contact: "",
  rating: 0,
  notes: "",
  followUp: "",
  thankYouSent: false,
});

const sortedVisits = computed(() =>
  [...store.visits].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  }),
);

function openNewVisit(collegeId = "") {
  editingVisitId.value = null;
  visitForm.value = {
    collegeId: collegeId || collegeStore.colleges[0]?.id || "",
    type: "Campus Visit",
    date: "",
    contact: "",
    rating: 0,
    notes: "",
    followUp: "",
    thankYouSent: false,
  };
  showVisitForm.value = true;
}

function editVisit(visit: CollegeVisit) {
  editingVisitId.value = visit.id;
  visitForm.value = {
    collegeId: visit.collegeId,
    type: visit.type,
    date: visit.date,
    contact: visit.contact,
    rating: visit.rating,
    notes: visit.notes,
    followUp: visit.followUp,
    thankYouSent: visit.thankYouSent,
  };
  showVisitForm.value = true;
}

function saveVisit() {
  if (!visitForm.value.collegeId) {
    showToast("Choose a college first");
    return;
  }
  if (editingVisitId.value) {
    store.updateVisit(editingVisitId.value, visitForm.value);
    showToast("Visit updated");
  } else {
    store.addVisit(visitForm.value);
    showToast("Visit added");
  }
  showVisitForm.value = false;
}

function removeVisit(visit: CollegeVisit) {
  store.deleteVisit(visit.id);
  showToast("Visit deleted", () => {
    const restored = {
      collegeId: visit.collegeId,
      type: visit.type,
      date: visit.date,
      contact: visit.contact,
      rating: visit.rating,
      notes: visit.notes,
      followUp: visit.followUp,
      thankYouSent: visit.thankYouSent,
    };
    store.addVisit(restored);
  });
}
</script>

<template>
  <div class="research-hub">
    <div class="page-header">
      <div>
        <h2>College Research Hub</h2>
        <p>Compare your options, measure personal fit, and keep every visit insight together.</p>
      </div>
      <button
        v-if="activeTab === 'Visits'"
        class="primary-button"
        @click="openNewVisit()"
      >
        + Add Visit
      </button>
    </div>

    <div class="tabs" role="tablist" aria-label="College research sections">
      <button
        v-for="tab in tabs"
        :key="tab"
        role="tab"
        class="tab-button"
        :class="{ active: activeTab === tab }"
        :aria-selected="activeTab === tab"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <div v-if="collegeStore.colleges.length === 0" class="empty-state panel">
      <strong>Add colleges before starting research</strong>
      <span>The Research Hub uses your College List instead of creating a second list.</span>
      <router-link to="/colleges" class="primary-button">Open College List</router-link>
    </div>

    <template v-else-if="activeTab === 'Compare'">
      <section class="panel selector-panel">
        <div class="section-heading">
          <div>
            <h3>Choose 2–4 Colleges</h3>
            <p>{{ store.comparisonIds.length }} of 4 selected</p>
          </div>
          <button class="text-button" @click="activeTab = 'Research Notes'">Edit research</button>
        </div>
        <div class="college-selector">
          <label
            v-for="college in collegeStore.colleges"
            :key="college.id"
            :class="{ selected: store.comparisonIds.includes(college.id) }"
          >
            <input
              type="checkbox"
              :checked="store.comparisonIds.includes(college.id)"
              @change="toggleComparison(college.id)"
            />
            <span>{{ college.name }}</span>
          </label>
        </div>
      </section>

      <div v-if="comparisonColleges.length < 2" class="empty-state panel">
        <strong>Select at least two colleges</strong>
        <span>Your side-by-side comparison will appear here.</span>
      </div>
      <section v-else class="comparison-shell panel">
        <div
          class="comparison-grid"
          :style="{ '--college-count': comparisonColleges.length }"
        >
          <div class="comparison-label sticky-label">College</div>
          <div
            v-for="college in comparisonColleges"
            :key="`heading-${college.id}`"
            class="college-heading"
          >
            <strong>{{ college.name }}</strong>
            <span class="category-badge" :class="college.category.toLowerCase()">
              {{ college.category }}
            </span>
          </div>

          <div class="comparison-label">Fit Score</div>
          <div v-for="college in comparisonColleges" :key="`score-${college.id}`" class="comparison-value">
            <span
              v-if="profileFor(college.id)"
              class="fit-score"
              :class="scoreClass(calculateFitScore(profileFor(college.id)!, store.weights))"
            >
              {{ calculateFitScore(profileFor(college.id)!, store.weights) || '—' }}
            </span>
            <small>{{ profileFor(college.id) ? scoreLabel(calculateFitScore(profileFor(college.id)!, store.weights)) : 'Not scored' }}</small>
          </div>

          <div class="comparison-label">Intended Program</div>
          <div v-for="college in comparisonColleges" :key="`program-${college.id}`" class="comparison-value">
            {{ profileFor(college.id)?.intendedProgram || 'Not added' }}
          </div>

          <div class="comparison-label">Application Plan</div>
          <div v-for="college in comparisonColleges" :key="`plan-${college.id}`" class="comparison-value">
            {{ college.applicationType || 'Not set' }} · {{ college.deadline || 'No deadline' }}
          </div>

          <div class="comparison-label">Application Fee</div>
          <div v-for="college in comparisonColleges" :key="`fee-${college.id}`" class="comparison-value">
            ${{ (college.applicationFee || 0).toLocaleString() }}
          </div>

          <div class="comparison-label">Estimated Net Cost</div>
          <div v-for="college in comparisonColleges" :key="`cost-${college.id}`" class="comparison-value">
            {{ formatCurrency(netCostFor(college.id)) }}
            <button v-if="!costFor(college.id)" class="inline-link" @click="goToCosts">Add costs</button>
          </div>

          <div class="comparison-label">Location</div>
          <div v-for="college in comparisonColleges" :key="`location-${college.id}`" class="comparison-value">
            {{ profileFor(college.id)?.location || 'Not added' }}
          </div>

          <div class="comparison-label">Campus Setting</div>
          <div v-for="college in comparisonColleges" :key="`setting-${college.id}`" class="comparison-value">
            {{ profileFor(college.id)?.setting || 'Not added' }}
          </div>

          <div class="comparison-label">Distance From Home</div>
          <div v-for="college in comparisonColleges" :key="`distance-${college.id}`" class="comparison-value">
            {{ profileFor(college.id)?.distanceFromHome ? `${profileFor(college.id)?.distanceFromHome} miles` : 'Not added' }}
          </div>

          <div class="comparison-label">Acceptance Rate</div>
          <div v-for="college in comparisonColleges" :key="`acceptance-${college.id}`" class="comparison-value">
            {{ formatPercent(profileFor(college.id)?.acceptanceRate || 0) }}
          </div>

          <div class="comparison-label">Undergraduate Size</div>
          <div v-for="college in comparisonColleges" :key="`size-${college.id}`" class="comparison-value">
            {{ profileFor(college.id)?.undergraduateSize?.toLocaleString() || 'Not added' }}
          </div>

          <div class="comparison-label">Graduation Rate</div>
          <div v-for="college in comparisonColleges" :key="`graduation-${college.id}`" class="comparison-value">
            {{ formatPercent(profileFor(college.id)?.graduationRate || 0) }}
          </div>

          <div class="comparison-label">Academics</div>
          <div v-for="college in comparisonColleges" :key="`academics-${college.id}`" class="comparison-value rating-value">
            {{ profileFor(college.id)?.ratings.academics || '—' }}<small>/ 5</small>
          </div>

          <div class="comparison-label">Affordability</div>
          <div v-for="college in comparisonColleges" :key="`affordability-${college.id}`" class="comparison-value rating-value">
            {{ profileFor(college.id)?.ratings.affordability || '—' }}<small>/ 5</small>
          </div>

          <div class="comparison-label">Campus Life</div>
          <div v-for="college in comparisonColleges" :key="`campus-${college.id}`" class="comparison-value rating-value">
            {{ profileFor(college.id)?.ratings.campus || '—' }}<small>/ 5</small>
          </div>

          <div class="comparison-label">Pros</div>
          <div v-for="college in comparisonColleges" :key="`pros-${college.id}`" class="comparison-value notes-value">
            {{ profileFor(college.id)?.pros || 'Not added' }}
          </div>

          <div class="comparison-label">Concerns</div>
          <div v-for="college in comparisonColleges" :key="`cons-${college.id}`" class="comparison-value notes-value">
            {{ profileFor(college.id)?.cons || 'Not added' }}
          </div>
        </div>
      </section>
    </template>

    <template v-else-if="activeTab === 'Fit & Rank'">
      <section class="panel priorities-panel">
        <div class="section-heading">
          <div>
            <h3>Your Fit Priorities</h3>
            <p>Weights control how much each category affects the overall score.</p>
          </div>
          <div class="weight-total" :class="{ warning: weightTotal !== 100 }">
            {{ weightTotal }}% total
          </div>
        </div>
        <div class="weight-grid">
          <label v-for="category in ratingCategories" :key="category.key">
            <span>{{ category.label }}</span>
            <strong>{{ store.weights[category.key] }}%</strong>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              :value="store.weights[category.key]"
              @input="updateWeight(category.key, Number(($event.target as HTMLInputElement).value))"
            />
          </label>
        </div>
        <div class="priority-footer">
          <span v-if="weightTotal !== 100">Scores still work, but 100% is easiest to understand.</span>
          <span v-else>Your priorities total 100%.</span>
          <button class="text-button" @click="resetWeights">Reset defaults</button>
        </div>
      </section>

      <div class="ranking-list">
        <section
          v-for="(entry, index) in rankedColleges"
          :key="entry.college.id"
          class="ranking-card"
        >
          <div class="rank-number">{{ index + 1 }}</div>
          <div class="ranking-main">
            <div class="ranking-heading">
              <div>
                <h3>{{ entry.college.name }}</h3>
                <p>{{ entry.college.category }} · {{ entry.profile?.status || 'Not Started' }}</p>
              </div>
              <div class="score-summary" :class="scoreClass(entry.score)">
                <strong>{{ entry.score || '—' }}</strong>
                <span>{{ scoreLabel(entry.score) }}</span>
              </div>
            </div>
            <div v-if="entry.profile" class="rating-grid">
              <div v-for="category in ratingCategories" :key="category.key" class="rating-control">
                <div>
                  <strong>{{ category.label }}</strong>
                  <span>{{ category.description }}</span>
                </div>
                <div class="rating-buttons" :aria-label="`${category.label} rating for ${entry.college.name}`">
                  <button
                    v-for="rating in [1, 2, 3, 4, 5]"
                    :key="rating"
                    :class="{ active: entry.profile.ratings[category.key] === rating }"
                    :title="`${rating} out of 5`"
                    @click="setRating(entry.profile, category.key, rating)"
                  >
                    {{ rating }}
                  </button>
                </div>
              </div>
            </div>
            <div class="ranking-actions">
              <span>Net cost: {{ formatCurrency(netCostFor(entry.college.id)) }}</span>
              <button class="text-button" @click="openNotes(entry.college.id)">Open research notes</button>
            </div>
          </div>
        </section>
      </div>
    </template>

    <template v-else-if="activeTab === 'Research Notes'">
      <div class="notes-layout">
        <aside class="college-note-list panel">
          <button
            v-for="entry in rankedColleges"
            :key="entry.college.id"
            :class="{ active: selectedProfileId === entry.college.id }"
            @click="selectedProfileId = entry.college.id"
          >
            <span>
              <strong>{{ entry.college.name }}</strong>
              <small>{{ entry.profile?.status || 'Not Started' }}</small>
            </span>
            <b :class="scoreClass(entry.score)">{{ entry.score || '—' }}</b>
          </button>
        </aside>

        <section v-if="selectedProfile" class="profile-editor panel">
          <div class="section-heading">
            <div>
              <h3>{{ collegeName(selectedProfile.collegeId) }}</h3>
              <p>Application facts and costs are pulled from their existing trackers.</p>
            </div>
            <select v-model="selectedProfile.status" @change="saveProfile(selectedProfile)">
              <option>Not Started</option>
              <option>Researching</option>
              <option>Complete</option>
            </select>
          </div>

          <div class="source-summary">
            <div>
              <span>Application deadline</span>
              <strong>{{ collegeStore.colleges.find((college) => college.id === selectedProfile?.collegeId)?.deadline || 'Not set' }}</strong>
            </div>
            <div>
              <span>Estimated net cost</span>
              <strong>{{ formatCurrency(netCostFor(selectedProfile.collegeId)) }}</strong>
            </div>
            <button @click="goToCosts">Open Cost Tracker</button>
          </div>

          <div class="research-form">
            <label>
              Intended program or major
              <input v-model="selectedProfile.intendedProgram" type="text" placeholder="Computer Science, Economics..." @change="saveProfile(selectedProfile)" />
            </label>
            <label>
              Location
              <input v-model="selectedProfile.location" type="text" placeholder="Boston, Massachusetts" @change="saveProfile(selectedProfile)" />
            </label>
            <label>
              Campus setting
              <select v-model="selectedProfile.setting" @change="saveProfile(selectedProfile)">
                <option value="">Choose setting</option>
                <option>Urban</option>
                <option>Suburban</option>
                <option>College Town</option>
                <option>Rural</option>
              </select>
            </label>
            <label>
              Distance from home (miles)
              <input v-model.number="selectedProfile.distanceFromHome" type="number" min="0" @change="saveProfile(selectedProfile)" />
            </label>
            <label>
              Acceptance rate (%)
              <input v-model.number="selectedProfile.acceptanceRate" type="number" min="0" max="100" @change="saveProfile(selectedProfile)" />
            </label>
            <label>
              Undergraduate size
              <input v-model.number="selectedProfile.undergraduateSize" type="number" min="0" @change="saveProfile(selectedProfile)" />
            </label>
            <label>
              Graduation rate (%)
              <input v-model.number="selectedProfile.graduationRate" type="number" min="0" max="100" @change="saveProfile(selectedProfile)" />
            </label>
          </div>

          <div class="notes-grid">
            <label>
              Pros
              <textarea v-model="selectedProfile.pros" rows="5" placeholder="Programs, community, opportunities..." @change="saveProfile(selectedProfile)"></textarea>
            </label>
            <label>
              Concerns
              <textarea v-model="selectedProfile.cons" rows="5" placeholder="Cost, location, program limitations..." @change="saveProfile(selectedProfile)"></textarea>
            </label>
            <label>
              Questions to investigate
              <textarea v-model="selectedProfile.questions" rows="5" placeholder="Questions for admissions, students, or faculty..." @change="saveProfile(selectedProfile)"></textarea>
            </label>
            <label>
              General notes
              <textarea v-model="selectedProfile.notes" rows="5" placeholder="Important research and impressions..." @change="saveProfile(selectedProfile)"></textarea>
            </label>
          </div>
          <div class="profile-footer">
            <span v-if="selectedProfile.lastUpdated">Last saved {{ new Date(selectedProfile.lastUpdated).toLocaleString() }}</span>
            <button class="secondary-button" @click="openNewVisit(selectedProfile.collegeId); activeTab = 'Visits'">Add visit or interview</button>
          </div>
        </section>
      </div>
    </template>

    <template v-else>
      <section v-if="showVisitForm" class="panel visit-form-panel">
        <div class="section-heading">
          <h3>{{ editingVisitId ? 'Edit Visit' : 'New Visit or Interview' }}</h3>
          <button class="icon-button" title="Close form" @click="showVisitForm = false">×</button>
        </div>
        <div class="visit-form-grid">
          <label>
            College
            <select v-model="visitForm.collegeId">
              <option v-for="college in collegeStore.colleges" :key="college.id" :value="college.id">{{ college.name }}</option>
            </select>
          </label>
          <label>
            Experience type
            <select v-model="visitForm.type">
              <option v-for="type in visitTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </label>
          <label>
            Date
            <input v-model="visitForm.date" type="date" />
          </label>
          <label>
            Contact person
            <input v-model="visitForm.contact" type="text" placeholder="Admissions officer or interviewer" />
          </label>
          <label>
            Overall impression
            <select v-model.number="visitForm.rating">
              <option :value="0">Not rated</option>
              <option v-for="rating in [1, 2, 3, 4, 5]" :key="rating" :value="rating">{{ rating }} / 5</option>
            </select>
          </label>
          <label class="checkbox-field">
            <input v-model="visitForm.thankYouSent" type="checkbox" />
            Thank-you note sent
          </label>
          <label class="wide-field">
            Notes and impressions
            <textarea v-model="visitForm.notes" rows="3" placeholder="What stood out? How did the campus or conversation feel?"></textarea>
          </label>
          <label class="wide-field">
            Follow-up
            <textarea v-model="visitForm.followUp" rows="2" placeholder="Questions to answer or people to contact next"></textarea>
          </label>
        </div>
        <div class="form-actions">
          <button class="primary-button" @click="saveVisit">{{ editingVisitId ? 'Update' : 'Add' }} Experience</button>
          <button class="secondary-button" @click="showVisitForm = false">Cancel</button>
        </div>
      </section>

      <div v-if="sortedVisits.length === 0" class="empty-state panel">
        <strong>No visits or interviews recorded</strong>
        <span>Save campus impressions while they are still fresh.</span>
        <button class="primary-button" @click="openNewVisit()">Add Visit</button>
      </div>
      <div v-else class="visit-list">
        <section v-for="visit in sortedVisits" :key="visit.id" class="visit-card panel">
          <div class="visit-date">
            <strong>{{ visit.date ? new Date(`${visit.date}T00:00:00`).getDate() : '—' }}</strong>
            <span>{{ visit.date ? new Date(`${visit.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short' }) : 'No date' }}</span>
          </div>
          <div class="visit-main">
            <div class="visit-heading">
              <div>
                <h3>{{ collegeName(visit.collegeId) }}</h3>
                <p>{{ visit.type }}<span v-if="visit.contact"> · {{ visit.contact }}</span></p>
              </div>
              <span v-if="visit.rating" class="visit-rating">{{ visit.rating }} / 5</span>
            </div>
            <p v-if="visit.notes" class="visit-notes">{{ visit.notes }}</p>
            <div v-if="visit.followUp || visit.thankYouSent" class="visit-followup">
              <span v-if="visit.followUp"><strong>Follow-up:</strong> {{ visit.followUp }}</span>
              <span v-if="visit.thankYouSent" class="thank-you">Thank-you sent</span>
            </div>
          </div>
          <div class="visit-actions">
            <button class="icon-button" title="Edit" @click="editVisit(visit)">✎</button>
            <button class="icon-button danger" title="Delete" @click="removeVisit(visit)">×</button>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.research-hub {
  width: min(1220px, 100%);
  margin: 0 auto;
  color: var(--text-primary);
}

.page-header,
.section-heading,
.ranking-heading,
.visit-heading,
.profile-footer,
.priority-footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-header {
  margin-bottom: 22px;
}

.page-header h2,
.section-heading h3,
.ranking-heading h3,
.visit-heading h3 {
  margin: 0;
}

.page-header p,
.section-heading p,
.ranking-heading p,
.visit-heading p {
  margin-top: 4px;
  font-size: 13px;
}

.tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  margin-bottom: 18px;
  overflow-x: auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--border-light);
}

.tab-button {
  min-width: max-content;
  padding: 9px 15px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.tab-button.active {
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: var(--shadow);
}

.panel,
.ranking-card {
  margin-bottom: 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
}

.panel {
  padding: 19px;
}

.section-heading {
  margin-bottom: 14px;
}

.primary-button,
.secondary-button,
.text-button,
.inline-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
}

.primary-button {
  padding: 10px 14px;
  border: 1px solid var(--primary);
  background: var(--primary);
  color: white;
}

.secondary-button {
  padding: 8px 11px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
}

.text-button,
.inline-link {
  padding: 4px;
  border: 0;
  background: transparent;
  color: var(--primary);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  flex-direction: column;
  text-align: center;
}

.empty-state strong {
  margin-bottom: 6px;
}

.empty-state span {
  max-width: 480px;
  margin-bottom: 14px;
  color: var(--text-secondary);
  font-size: 13px;
}

.college-selector {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.college-selector label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 9px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
}

.college-selector label.selected {
  border-color: var(--accent-border);
  background: var(--primary-light);
}

.college-selector input {
  width: auto;
  margin: 0;
}

.college-selector span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comparison-shell {
  overflow-x: auto;
}

.comparison-grid {
  display: grid;
  grid-template-columns: 150px repeat(var(--college-count), minmax(190px, 1fr));
  min-width: calc(150px + var(--college-count) * 190px);
  border-top: 1px solid var(--border-color);
  border-left: 1px solid var(--border-color);
}

.comparison-label,
.comparison-value,
.college-heading {
  min-width: 0;
  padding: 11px;
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.comparison-label {
  background: var(--border-light);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 700;
}

.college-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  background: var(--border-light);
}

.college-heading strong {
  font-size: 13px;
}

.category-badge {
  padding: 3px 6px;
  border-radius: 5px;
  font-size: 9px;
  font-weight: 700;
}

.category-badge.reach {
  background: var(--badge-reach);
  color: var(--badge-reach-text);
}

.category-badge.target {
  background: var(--badge-target);
  color: var(--badge-target-text);
}

.category-badge.safety {
  background: var(--badge-safety);
  color: var(--badge-safety-text);
}

.comparison-value {
  color: var(--text-primary);
  font-size: 12px;
  line-height: 1.45;
}

.comparison-value small {
  display: block;
  margin-top: 3px;
  color: var(--text-secondary);
  font-size: 9px;
}

.fit-score,
.score-summary,
.college-note-list b {
  color: var(--text-secondary);
}

.fit-score {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--border-light);
  font-size: 14px;
  font-weight: 800;
}

.excellent {
  color: #047857 !important;
}

.strong {
  color: #1d4ed8 !important;
}

.mixed {
  color: #b45309 !important;
}

.unrated {
  color: var(--text-secondary) !important;
}

.rating-value {
  font-size: 17px;
  font-weight: 800;
}

.notes-value {
  color: var(--text-secondary);
  white-space: pre-line;
}

.weight-total {
  padding: 6px 9px;
  border-radius: 6px;
  background: #d1fae5;
  color: #047857;
  font-size: 11px;
  font-weight: 800;
}

.weight-total.warning {
  background: #fef3c7;
  color: #92400e;
}

.weight-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.weight-grid label {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 7px;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 700;
}

.weight-grid input {
  grid-column: 1 / -1;
  width: 100%;
  accent-color: var(--primary);
}

.priority-footer {
  align-items: center;
  margin-top: 12px;
  color: var(--text-secondary);
  font-size: 11px;
}

.ranking-card {
  display: flex;
  overflow: hidden;
}

.rank-number {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 54px;
  flex: 0 0 54px;
  padding-top: 20px;
  background: var(--border-light);
  color: var(--text-secondary);
  font-size: 19px;
  font-weight: 800;
}

.ranking-main {
  min-width: 0;
  padding: 17px;
  flex: 1;
}

.score-summary {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
}

.score-summary strong {
  font-size: 25px;
}

.score-summary span {
  font-size: 10px;
  font-weight: 700;
}

.rating-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 9px;
  margin-top: 14px;
}

.rating-control {
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

.rating-control > div:first-child {
  display: flex;
  min-height: 47px;
  flex-direction: column;
}

.rating-control strong {
  font-size: 11px;
}

.rating-control span {
  margin-top: 3px;
  color: var(--text-secondary);
  font-size: 9px;
  line-height: 1.3;
}

.rating-buttons {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
  margin-top: 8px;
}

.rating-buttons button {
  min-width: 0;
  padding: 5px 0;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 9px;
  cursor: pointer;
}

.rating-buttons button.active {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

.ranking-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  color: var(--text-secondary);
  font-size: 11px;
}

.notes-layout {
  display: grid;
  grid-template-columns: 245px minmax(0, 1fr);
  align-items: start;
  gap: 14px;
}

.college-note-list {
  padding: 7px;
}

.college-note-list button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
  padding: 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.college-note-list button.active {
  background: var(--primary-light);
}

.college-note-list button > span {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.college-note-list strong {
  overflow: hidden;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.college-note-list small {
  margin-top: 2px;
  color: var(--text-secondary);
  font-size: 9px;
}

.college-note-list b {
  font-size: 12px;
}

.profile-editor .section-heading select {
  width: 140px;
  margin: 0;
}

.source-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr) auto;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  padding: 12px;
  border-radius: 6px;
  background: var(--border-light);
}

.source-summary div {
  display: flex;
  flex-direction: column;
}

.source-summary span {
  color: var(--text-secondary);
  font-size: 9px;
}

.source-summary strong {
  margin-top: 3px;
  font-size: 12px;
}

.source-summary button {
  padding: 7px 9px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-card);
  color: var(--primary);
  font: inherit;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.research-form,
.notes-grid,
.visit-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.notes-grid {
  margin-top: 12px;
}

label {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 700;
}

input,
select,
textarea {
  width: 100%;
  margin-top: 5px;
  padding: 9px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  outline: none;
  background: var(--bg-input);
  color: var(--text-primary);
  font: inherit;
  font-size: 12px;
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

.profile-footer {
  align-items: center;
  margin-top: 14px;
  color: var(--text-secondary);
  font-size: 10px;
}

.visit-form-panel {
  border-color: var(--accent-border);
}

.wide-field {
  grid-column: 1 / -1;
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 20px;
  color: var(--text-primary);
}

.checkbox-field input {
  width: auto;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 16px;
  cursor: pointer;
}

.icon-button.danger {
  color: #b91c1c;
}

.visit-card {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.visit-date {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 52px;
  flex: 0 0 auto;
  flex-direction: column;
  border-radius: 6px;
  background: var(--primary-light);
  color: var(--primary);
}

.visit-date strong {
  font-size: 18px;
  line-height: 1;
}

.visit-date span {
  margin-top: 4px;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
}

.visit-main {
  min-width: 0;
  flex: 1;
}

.visit-rating {
  padding: 4px 7px;
  border-radius: 5px;
  background: var(--primary-light);
  color: var(--primary);
  font-size: 11px;
  font-weight: 800;
}

.visit-notes {
  margin-top: 11px;
  color: var(--text-primary);
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-line;
}

.visit-followup {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border-light);
  color: var(--text-secondary);
  font-size: 11px;
}

.thank-you {
  padding: 4px 7px;
  border-radius: 5px;
  background: #d1fae5;
  color: #047857;
  font-weight: 700;
  white-space: nowrap;
}

.visit-actions {
  display: flex;
  gap: 6px;
}

@media (max-width: 980px) {
  .weight-grid,
  .rating-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .college-selector {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .page-header,
  .section-heading,
  .profile-footer,
  .priority-footer,
  .ranking-heading,
  .visit-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .college-selector,
  .weight-grid,
  .rating-grid,
  .research-form,
  .notes-grid,
  .visit-form-grid,
  .notes-layout,
  .source-summary {
    grid-template-columns: 1fr;
  }

  .wide-field {
    grid-column: auto;
  }

  .ranking-card {
    flex-direction: column;
  }

  .rank-number {
    width: 100%;
    height: 36px;
    padding: 7px;
  }

  .visit-card {
    flex-wrap: wrap;
  }

  .visit-main {
    min-width: calc(100% - 66px);
  }
}
</style>
