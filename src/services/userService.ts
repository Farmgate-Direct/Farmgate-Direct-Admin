import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";

export const getPendingUsers = async () => {
  const q = query(collection(db, "users"), where("status", "==", "pending"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

export const approveUser = async (uid: string) => {
  await updateDoc(doc(db, "users", uid), {
    status: "approved",
    approvedAt: serverTimestamp(),
  });
};

export const rejectUser = async (uid: string) => {
  // For now, rejection just deletes the pending record.
  // Pwede mo palitan to sa updateDoc({status: "rejected", rejectedAt: serverTimestamp()})
  // instead of deleting, kung gusto mong ma-track pa rin yung rejected users.
  await deleteDoc(doc(db, "users", uid));
};

export const deleteUser = async (uid: string) => {
  await deleteDoc(doc(db, "users", uid));
};