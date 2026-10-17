// Listing registered users and banning or unbanning them.
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../FirebaseConfig";

const usersCollection = collection(db, "users");

// Rejects a bad id before it can reach Firestore.
const assertUid = (uid: string) => {
  if (typeof uid !== "string" || uid.length === 0 || uid.length > 128) {
    throw new Error("Invalid user id.");
  }
};

// Returns every registered user.
export const getRegisteredUsers = async () => {
  const snapshot = await getDocs(usersCollection);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

// Blocks a user from signing in by marking the account as banned.
export const banUser = async (userId: string) => {
  assertUid(userId);
  await updateDoc(doc(db, "users", userId), { status: "banned" });
};

// Restores a banned account by setting its status back to approved.
export const unbanUser = async (userId: string) => {
  assertUid(userId);
  await updateDoc(doc(db, "users", userId), { status: "approved" });
};
