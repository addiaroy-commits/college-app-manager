import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  loginUser,
  signupUser,
  logoutUser,
  onAuthChange,
} from "../services/firebaseService";

export const useUserStore = defineStore("user", () => {
  const currentUser = ref<{ id: string; username: string } | null>(null);
  const isLoading = ref(true);
  let resolveAuthReady: (() => void) | null = null;
  const authReady = new Promise<void>((resolve) => {
    resolveAuthReady = resolve;
  });

  // Listen for Firebase auth changes
  onAuthChange((firebaseUser) => {
    if (firebaseUser) {
      const uid = firebaseUser.email?.split("@")[0] || firebaseUser.uid;
      currentUser.value = { id: uid, username: uid };
      localStorage.setItem("applywise-session", uid);
    } else {
      currentUser.value = null;
      localStorage.removeItem("applywise-session");
    }
    isLoading.value = false;
    resolveAuthReady?.();
    resolveAuthReady = null;
  });

  const isLoggedIn = computed(
    () => currentUser.value !== null && !isLoading.value,
  );
  const username = computed(() => currentUser.value?.username ?? "");

  async function signup(
    username: string,
    password: string,
  ): Promise<string | null> {
    if (!username.trim() || !password.trim()) return "Please fill all fields";
    if (password.length < 4) return "Password must be at least 4 characters";
    try {
      await signupUser(username.trim(), password);
      return null;
    } catch (e: any) {
      if (e.code === "auth/email-already-in-use")
        return "Username already taken";
      return e.message || "Signup failed";
    }
  }

  async function login(
    username: string,
    password: string,
  ): Promise<string | null> {
    try {
      await loginUser(username.trim(), password);
      return null;
    } catch (e: any) {
      if (e.code === "auth/invalid-credential")
        return "Invalid username or password";
      return e.message || "Login failed";
    }
  }

  async function logout() {
    await logoutUser();
    currentUser.value = null;
    localStorage.removeItem("applywise-session");
  }

  function waitForAuthReady() {
    return authReady;
  }

  return {
    currentUser,
    isLoggedIn,
    username,
    isLoading,
    signup,
    login,
    logout,
    waitForAuthReady,
  };
});
