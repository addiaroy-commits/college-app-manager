export const SYNC_KEYS = [
  "colleges",
  "essays",
  "documents",
  "brag",
  "costs",
  "scholarships",
  "scholarship-goals",
  "goals",
  "top-picks",
  "custom-majors",
  "sat-act",
  "essay-targets",
  "brag-custom-tabs",
  "removed-scholarships",
  "theme-dark",
  "theme-color",
  "command-center",
  "college-research",
  "onboarded",
  "preferences",
] as const;

export const BACKUP_KEYS = [...SYNC_KEYS] as const;
