// The activity log that records what each admin did.
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../FirebaseConfig";

// The kinds of actions that can appear in the log.
export type AdminActivityAction =
  | "login"
  | "logout"
  | "approve_registration"
  | "decline_registration"
  | "ban_user"
  | "unban_user"
  | "create_admin"
  | "update_profile_name"
  | "update_password"
  | "export_report"
  | "update_payout_account"
  | "admin_withdraw";

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_COUNT = 50;

const activitiesRef = collection(db, "adminActivities");

// Looks up who performed the action, falling back to the signed-in account when
// the admin document cannot be read.
const resolveActor = async () => {
  const user = auth.currentUser;
  if (!user) return { id: "unknown", name: "Administrator", email: "" };
  try {
    const snap = await getDoc(doc(db, "admins", user.uid));
    if (snap.exists()) {
      const data = snap.data() as any;
      return {
        id: user.uid,
        name: data.name || user.email || "Administrator",
        email: data.email || user.email || "",
      };
    }
  } catch {
    return { id: user.uid, name: "Administrator", email: "" };
  }
  return { id: user.uid, name: user.email || "Administrator", email: user.email || "" };
};

// Writes one entry to the activity log. Every field is trimmed to a maximum
// length, and a failed write is only logged so it never breaks the action the
// admin was performing.
export const logAdminActivity = async (
  action: AdminActivityAction,
  description: string,
  extra: { targetId?: string; targetName?: string } = {},
) => {
  try {
    const actor = await resolveActor();
    const safeDescription =
      typeof description === "string"
        ? description.slice(0, MAX_DESCRIPTION_LENGTH)
        : "";
    const targetId =
      typeof extra.targetId === "string" ? extra.targetId.slice(0, 128) : null;
    const targetName =
      typeof extra.targetName === "string" ? extra.targetName.slice(0, 100) : null;
    await addDoc(activitiesRef, {
      action,
      description: safeDescription,
      adminId: actor.id,
      adminName: actor.name,
      adminEmail: actor.email,
      targetId,
      targetName,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.log("Log admin activity failed:", error);
  }
};

// Returns the most recent activity entries, newest first.
export const getRecentAdminActivities = async (count = 15) => {
  const safeCount = Math.min(Math.max(Math.floor(count) || 15, 1), MAX_COUNT);
  try {
    const snapshot = await getDocs(
      query(activitiesRef, orderBy("createdAt", "desc"), limit(safeCount)),
    );
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error("Get admin activities error:", error);
    return [];
  }
};
