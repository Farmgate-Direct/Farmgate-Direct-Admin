import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";

export const getRegisteredUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

export const updateUser = async (uid: string, data: any) => {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteUser = async (uid: string) => {
  await deleteDoc(doc(db, "users", uid));
};