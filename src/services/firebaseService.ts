import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  writeBatch,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6Dh69qe5SAFx9Y8ftfhAfyM0501dEVWk",
  authDomain: "cog-app-2702j.firebaseapp.com",
  projectId: "cog-app-2702j",
  storageBucket: "cog-app-2702j.firebasestorage.app",
  messagingSenderId: "69272640830",
  appId: "1:69272640830:web:2f7e28bdbb8a15d637606f",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export interface UserDataRecord {
  value: any;
  updatedAt: number;
}

// ── Auth ──
export function loginUser(email: string, password: string) {
  // Firebase requires email format, so we convert username to email-like
  return signInWithEmailAndPassword(auth, `${email}@cogapp.user`, password);
}

export function signupUser(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, `${email}@cogapp.user`, password);
}

export function logoutUser() {
  return signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth.currentUser;
}

export function getUserId(): string | null {
  const user = auth.currentUser;
  if (!user) return null;
  // Use the part before @ as the user key
  return user.email?.split("@")[0] || user.uid;
}

// ── Firestore ──
export async function saveUserData(
  userId: string,
  key: string,
  data: any,
  updatedAt = Date.now(),
): Promise<void> {
  await setDoc(doc(db, "users", userId, "data", key), {
    value: JSON.stringify(data),
    updatedAt,
  });
}

export async function loadUserDataRecord(
  userId: string,
  key: string,
): Promise<UserDataRecord | null> {
  const snap = await getDoc(doc(db, "users", userId, "data", key));
  if (!snap.exists()) return null;
  try {
    const raw = snap.data();
    return {
      value: JSON.parse(raw.value),
      updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : 0,
    };
  } catch {
    return null;
  }
}

export async function loadUserData(
  userId: string,
  key: string,
): Promise<any | null> {
  const record = await loadUserDataRecord(userId, key);
  return record?.value ?? null;
}

export async function deleteUserData(
  userId: string,
  key: string,
): Promise<void> {
  await setDoc(doc(db, "users", userId, "data", key), {
    value: "null",
    updatedAt: Date.now(),
    deleted: true,
  });
}

export async function saveAllUserData(
  userId: string,
  data: Record<string, any>,
): Promise<void> {
  const batch = writeBatch(db);
  for (const [key, value] of Object.entries(data)) {
    batch.set(doc(db, "users", userId, "data", key), {
      value: JSON.stringify(value),
      updatedAt: Date.now(),
    });
  }
  await batch.commit();
}

export { db, auth };
