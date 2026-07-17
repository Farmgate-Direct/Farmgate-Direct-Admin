import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";

import { initializeApp, getApps } from "firebase/app";

import { auth, db, app } from "../FirebaseConfig";

// ==========================
// SECONDARY AUTH
// ==========================

const secondaryApp =
  getApps().find((item) => item.name === "Secondary") ||
  initializeApp(app.options, "Secondary");

const secondaryAuth = getAuth(secondaryApp);

// ==========================
// CURRENT ADMIN
// ==========================

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

// ==========================
// GET ALL ADMINS
// ==========================

export const getAllAdmins = async () => {
  const snapshot = await getDocs(collection(db, "admins"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,

    ...doc.data(),
  }));
};

// ==========================
// CREATE ADMIN
// ==========================

export const createAdmin = async (data: any) => {
  const userCredential = await createUserWithEmailAndPassword(
    secondaryAuth,

    data.email,

    data.password,
  );

  const uid = userCredential.user.uid;

  await setDoc(
    doc(db, "admins", uid),

    {
      name: data.name,

      email: data.email,

      role: data.role,

      status: "Active",

      lastLogin: null,

      createdAt: serverTimestamp(),
    },
  );
};

// ==========================
// UPDATE LAST LOGIN
// ==========================

export const updateLastLogin = async (uid: string) => {
  await updateDoc(
    doc(db, "admins", uid),

    {
      lastLogin: serverTimestamp(),
    },
  );
};

// ==========================
// UPDATE PROFILE
// ==========================

export const updateAdminProfile = async (
  uid: string,

  data: any,
) => {
  await updateDoc(
    doc(db, "admins", uid),

    data,
  );
};

// ==========================
// TOGGLE ADMIN STATUS (Activate / Deactivate)
// ==========================

export const toggleAdminStatus = async (uid: string, currentStatus: string) => {
  const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

  await updateDoc(
    doc(db, "admins", uid),

    {
      status: newStatus,
    },
  );

  return newStatus;
};