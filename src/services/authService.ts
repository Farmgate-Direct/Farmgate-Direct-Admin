import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../FirebaseConfig";
import { updateLastLogin } from "./adminService";
import { logAdminActivity } from "./adminActivityService";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60 * 1000;

let failedAttempts = 0;
let lockedUntil = 0;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email: string) => {
  const cleaned = (email || "").trim().toLowerCase();
  if (cleaned.length === 0 || cleaned.length > 254 || !EMAIL_RE.test(cleaned)) {
    throw new Error("Invalid email or password.");
  }
  return cleaned;
};

const normalizePassword = (password: string) => {
  if (typeof password !== "string" || password.length === 0 || password.length > 128) {
    throw new Error("Invalid email or password.");
  }
  return password;
};

const checkLockout = () => {
  if (Date.now() < lockedUntil) {
    const waitSec = Math.ceil((lockedUntil - Date.now()) / 1000);
    throw new Error(`Too many attempts. Try again in ${waitSec}s.`);
  }
};

const recordFailure = () => {
  failedAttempts += 1;
  if (failedAttempts >= MAX_ATTEMPTS) {
    lockedUntil = Date.now() + LOCKOUT_MS;
    failedAttempts = 0;
  }
};

export const loginAdmin = async (email: string, password: string) => {
  checkLockout();
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = normalizePassword(password);
  let userCredential;
  try {
    userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
  } catch {
    recordFailure();
    throw new Error("Invalid email or password.");
  }
  const uid = userCredential.user.uid;
  const adminRef = doc(db, "admins", uid);
  const adminSnap = await getDoc(adminRef);
  if (!adminSnap.exists()) {
    await signOut(auth);
    recordFailure();
    throw new Error("Unauthorized");
  }
  const admin = adminSnap.data();
  if (admin.status !== "Active") {
    await signOut(auth);
    recordFailure();
    throw new Error("Your administrator account has been deactivated.");
  }
  await updateLastLogin(uid);
  logAdminActivity("login", "Logged in to the admin panel");
  return {
    user: userCredential.user,
    admin,
  };
};

export const logoutAdmin = async () => {
  logAdminActivity("logout", "Logged out of the admin panel");
  await signOut(auth);
};
