import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../stores/userStore";
import Dashboard from "../views/Dashboard.vue";
import CollegeList from "../views/CollegeList.vue";
import EssayTracker from "../views/EssayTracker.vue";
import DocumentVault from "../views/DocumentVault.vue";
import StatsPage from "../views/StatsPage.vue";
import GoalsPage from "../views/GoalsPage.vue";
import LoginPage from "../views/LoginPage.vue";
import SignupPage from "../views/SignupPage.vue";
import BragSheet from "../views/BragSheet.vue";
import CostTracker from "../views/CostTracker.vue";
import OnboardingPage from "../views/OnboardingPage.vue";
import MajorsPage from "../views/MajorsPage.vue";
import ScholarshipsPage from "../views/ScholarshipsPage.vue";
import { getUserKey } from "../stores/userKey";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginPage,
      meta: { guest: true },
    },
    {
      path: "/majors",
      name: "majors",
      component: MajorsPage,
    },

    {
      path: "/onboarding",
      name: "onboarding",
      component: OnboardingPage,
    },

    {
      path: "/brag",
      name: "brag",
      component: BragSheet,
    },
    {
      path: "/costs",
      name: "costs",
      component: CostTracker,
    },

    {
      path: "/signup",
      name: "signup",
      component: SignupPage,
      meta: { guest: true },
    },
    { path: "/", name: "dashboard", component: Dashboard },
    { path: "/colleges", name: "colleges", component: CollegeList },
    {
      path: "/applications",
      name: "applications",
      component: () => import("../views/ApplicationCommandCenter.vue"),
    },
    {
      path: "/research",
      name: "research",
      component: () => import("../views/CollegeResearchHub.vue"),
    },
    {
      path: "/essays/college/:collegeId",
      name: "college-essays",
      component: () => import("../views/CollegeEssaysPage.vue"),
    },
    {
      path: "/essays/college/:collegeId/essay/:essayId",
      name: "essay-detail",
      component: () => import("../views/EssayDetailPage.vue"),
    },
    { path: "/essays", name: "essays", component: EssayTracker },
    { path: "/documents", name: "documents", component: DocumentVault },
    { path: "/stats", name: "stats", component: StatsPage },
    { path: "/goals", name: "goals", component: GoalsPage },
    { path: "/scholarships", name: "scholarships", component: ScholarshipsPage },
    {
      path: "/essays/college/common-app/essay/:essayId",
      name: "essay-detail-ca",
      component: () => import("../views/EssayDetailPage.vue"),
    },
  ],
});

// Guard: redirect to login if not logged in
router.beforeEach(async (to) => {
  const userStore = useUserStore();
  await userStore.waitForAuthReady();
  if (to.meta.guest) return true;
  if (!userStore.isLoggedIn) return "/login";

  // Show onboarding first time
  if (
    to.name !== "onboarding" &&
    !localStorage.getItem(getUserKey("onboarded"))
  ) {
    return "/onboarding";
  }

  return true;
});

export default router;
