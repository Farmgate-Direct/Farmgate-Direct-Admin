import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../FirebaseConfig";

const usersCollection = collection(db, "users");

const assertUid = (uid: string) => {
  if (typeof uid !== "string" || uid.length === 0 || uid.length > 128) {
    throw new Error("Invalid user id.");
  }
};

export const getRegisteredUsers = async () => {
  const snapshot = await getDocs(usersCollection);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

export const banUser = async (userId: string) => {
  assertUid(userId);
  await updateDoc(doc(db, "users", userId), { status: "banned" });
};

export const unbanUser = async (userId: string) => {
  assertUid(userId);
  await updateDoc(doc(db, "users", userId), { status: "approved" });
};
