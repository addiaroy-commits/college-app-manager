import { defineStore } from "pinia";
import { ref, computed } from "vue";

interface User {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

export const useUserStore = defineStore("user", () => {
  const users = ref<User[]>([]);
  const currentUser = ref<User | null>(null);

  // Load users
  const savedUsers = localStorage.getItem("applywise-users");
  if (savedUsers) {
    users.value = JSON.parse(savedUsers);
  }

  // Load logged in user
  const savedSession = localStorage.getItem("applywise-session");
  if (savedSession) {
    currentUser.value = users.value.find((u) => u.id === savedSession) ?? null;
  }

  function saveUsers() {
    localStorage.setItem("applywise-users", JSON.stringify(users.value));
  }

  const isLoggedIn = computed(() => currentUser.value !== null);
  const username = computed(() => currentUser.value?.username ?? "");

  function signup(username: string, password: string): string | null {
    if (!username.trim() || !password.trim()) return "Please fill all fields";
    if (password.length < 4) return "Password must be at least 4 characters";

    const exists = users.value.find(
      (u) => u.username.toLowerCase() === username.toLowerCase(),
    );
    if (exists) return "Username already taken";

    const user: User = {
      id: crypto.randomUUID(),
      username: username.trim(),
      password: password,
      createdAt: new Date().toISOString(),
    };
    users.value.push(user);
    saveUsers();
    return null;
  }

  function login(username: string, password: string): string | null {
    const user = users.value.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password,
    );
    if (!user) return "Invalid username or password";

    currentUser.value = user;
    localStorage.setItem("applywise-session", user.id);

    // Migrate old shared data ONCE — only on the very first login ever
    if (!localStorage.getItem("applywise-migrated")) {
      const oldKeys = [
        "colleges",
        "essays",
        "documents",
        "goals",
        "essay-targets",
      ];
      oldKeys.forEach((k) => {
        const oldData = localStorage.getItem(`applywise-${k}`);
        if (oldData) {
          localStorage.setItem(`user-${user.id}-${k}`, oldData);
          localStorage.removeItem(`applywise-${k}`);
        }
      });
      localStorage.setItem("applywise-migrated", "true");
    }

    return null;
  }

  function logout() {
    currentUser.value = null;
    localStorage.removeItem("applywise-session");
    window.location.reload();
  }

  return {
    users,
    currentUser,
    isLoggedIn,
    username,
    signup,
    login,
    logout,
  };
});
