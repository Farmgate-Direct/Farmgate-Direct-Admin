import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../FirebaseConfig";
import { updateLastLogin } from "./adminService";

export const loginAdmin = async (
  email: string,
  password: string
) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  const uid = userCredential.user.uid;

  const adminRef = doc(db, "admins", uid);
  const adminSnap = await getDoc(adminRef);

  // Walang admin document
  if (!adminSnap.exists()) {
    await signOut(auth);
    throw new Error("Unauthorized");
  }

  const admin = adminSnap.data();

  // Inactive admin
  if (admin.status !== "Active") {
    await signOut(auth);
    throw new Error("Your administrator account has been deactivated.");
  }

  // Update last login
  await updateLastLogin(uid);

  return {
    user: userCredential.user,
    admin,
  };
};

export const logoutAdmin = async () => {
  await signOut(auth);
};