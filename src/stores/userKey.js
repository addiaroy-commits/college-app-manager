export function getUserKey(base) {
    const session = localStorage.getItem("applywise-session");
    return session ? `user-${session}-${base}` : `applywise-${base}`;
}
