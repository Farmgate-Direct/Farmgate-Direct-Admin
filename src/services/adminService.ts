// Reading and updating the profile of the signed-in admin.
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../FirebaseConfig";

const MAX_NAME_LENGTH = 100;

// Rejects a bad id before it can reach Firestore.
const assertUid = (uid: string) => {
  if (typeof uid !== "string" || uid.length === 0 || uid.length > 128) {
    throw new Error("Invalid admin id.");
  }
};

const assertName = (name: string) => {
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new Error("Full name cannot be empty.");
  }
  if (name.trim().length > MAX_NAME_LENGTH) {
    throw new Error("Full name is too long.");
  }
};

// Returns the document of the signed-in admin.
export const getCurrentAdmin = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user");
  }
  const adminRef = doc(db, "admins", user.uid);
  const snapshot = await getDoc(adminRef);
  if (!snapshot.exists()) {
    throw new Error("Admin not found");
  }
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

// Records when the admin last signed in.
export const updateLastLogin = async (uid: string) => {
  assertUid(uid);
  await updateDoc(doc(db, "admins", uid), {
    lastLogin: serverTimestamp(),
  });
};

// Renames the admin account.
export const updateAdminProfile = async (uid: string, name: string) => {
  assertUid(uid);
  assertName(name);
  await updateDoc(doc(db, "admins", uid), { name: name.trim() });
};
