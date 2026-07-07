export function getUserKey(base: string): string {
  const session = localStorage.getItem("applywise-session");
  return session ? `user-${session}-${base}` : `applywise-${base}`;
}
