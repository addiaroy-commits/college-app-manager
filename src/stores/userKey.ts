export function getUserKey(base: string): string {
  const session = localStorage.getItem("applywise-session");
  if (!session) return `applywise-${base}`;
  const isDemo = localStorage.getItem("applywise-demo-user") === session;
  return `${isDemo ? "demo" : "user"}-${session}-${base}`;
}
