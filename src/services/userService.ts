// Approving, rejecting, and listing users waiting for approval.
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../FirebaseConfig";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");

const usersCollection = collection(db, "users");

// Rejects a real id before it reaches the backend, so a bad value cannot end up
// in a request path.
const assertUid = (uid: string) => {
  if (typeof uid !== "string" || uid.length === 0 || uid.length > 128) {
    throw new Error("Invalid user id.");
  }
};

const norm = (value: any) => (value || "").toString().trim().toLowerCase();

// Returns the users still waiting for approval.
export const getPendingUsers = async () => {
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs
    .map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }))
    .filter((user: any) => norm(user.status) === "pending");
};

// Approves a pending registration.
export const approveUser = async (uid: string) => {
  assertUid(uid);

  // The backend handles the auth account too. Without a backend URL only the
  // Firestore document is updated.
  if (BACKEND_URL) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in.");
    const token = await user.getIdToken();
    const res = await fetch(
      `${BACKEND_URL}/admin/users/${encodeURIComponent(uid)}/approve`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      throw new Error(data.error || `Could not approve this request (${res.status}).`);
    }
    return;
  }

  await updateDoc(doc(db, "users", uid), {
    status: "approved",
    approvedAt: serverTimestamp(),
  });
};

// Rejects a pending registration and removes the account.
export const rejectUser = async (uid: string) => {
  assertUid(uid);

  // The backend removes the auth account too. Without a backend URL only the
  // Firestore document is deleted.
  if (BACKEND_URL) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in.");
    const token = await user.getIdToken();
    const res = await fetch(
      `${BACKEND_URL}/admin/users/${encodeURIComponent(uid)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      throw new Error(data.error || `Could not reject this request (${res.status}).`);
    }
    return;
  }

  await deleteDoc(doc(db, "users", uid));
};
