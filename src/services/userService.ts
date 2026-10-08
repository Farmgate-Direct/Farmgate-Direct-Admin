import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";

const usersCollection = collection(db, "users");

const assertUid = (uid: string) => {
  if (typeof uid !== "string" || uid.length === 0 || uid.length > 128) {
    throw new Error("Invalid user id.");
  }
};

const norm = (value: any) => (value || "").toString().trim().toLowerCase();

export const getPendingUsers = async () => {
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs
    .map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }))
    .filter((user: any) => norm(user.status) === "pending");
};

export const approveUser = async (uid: string) => {
  assertUid(uid);
  await updateDoc(doc(db, "users", uid), {
    status: "approved",
    approvedAt: serverTimestamp(),
  });
};

export const rejectUser = async (uid: string) => {
  assertUid(uid);
  await deleteDoc(doc(db, "users", uid));
};
