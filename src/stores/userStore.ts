import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  loginUser,
  signupUser,
  logoutUser,
  onAuthChange,
} from "../services/firebaseService";
import { prepareUserIdentity } from "../services/identityMigration";

export const useUserStore = defineStore("user", () => {
  const currentUser = ref<{ id: string; username: string } | null>(null);
  const isLoading = ref(true);
  let resolveAuthReady: (() => void) | null = null;
  const authReady = new Promise<void>((resolve) => {
    resolveAuthReady = resolve;
  });

  async function adoptUser(firebaseUser: Parameters<typeof prepareUserIdentity>[0]) {
    await prepareUserIdentity(firebaseUser);
    const username = firebaseUser.email?.split("@")[0] || "User";
    currentUser.value = { id: firebaseUser.uid, username };
  }

  // Listen for Firebase auth changes
  onAuthChange(async (firebaseUser) => {
    try {
      if (firebaseUser) {
        await adoptUser(firebaseUser);
      } else {
        currentUser.value = null;
        localStorage.removeItem("applywise-session");
      }
    } catch (error) {
      console.error("Account data could not be initialized:", error);
      currentUser.value = null;
    } finally {
      isLoading.value = false;
      resolveAuthReady?.();
      resolveAuthReady = null;
    }
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
      const credential = await signupUser(username.trim(), password);
      await adoptUser(credential.user);
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
      const credential = await loginUser(username.trim(), password);
      await adoptUser(credential.user);
      return null;
    } catch (e: any) {
      if (e.code === "auth/invalid-credential")
        return "Invalid username or password";
      return e.message || "Login failed";
    }
  }

  async function logout() {
    localStorage.removeItem("applywise-demo-user");
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
