// Counts and totals shown on the admin dashboard.
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";

const usersRef = collection(db, "users");
const ordersRef = collection(db, "orders");

const DELIVERED_STATUSES = ["delivered", "claimed"];
const COMMISSION_RATE = 0.03;

const norm = (value: any) => (value || "").toString().trim().toLowerCase();

// Reads a number that may be stored as a string, returning null when it is not
// a usable value.
const numOrNull = (value: any): number | null => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

// The order amount without the delivery fee, since commission is charged on
// the subtotal only.
const getOrderSubtotal = (data: any): number => {
  const saved =
    numOrNull(data?.subTotal) ?? numOrNull(data?.subtotal) ?? null;
  if (saved !== null && saved >= 0) return saved;
  const items = Array.isArray(data?.products) ? data.products : [];
  if (items.length > 0) {
    const sum = items.reduce(
      (s: number, item: any) =>
        s + Number(item?.price || 0) * Number(item?.quantity || 0),
      0,
    );
    if (Number.isFinite(sum) && sum >= 0) return Math.round(sum * 100) / 100;
  }
  // The last resort is the total minus the delivery fee, never the total alone.
  const total = Number(data?.total) || 0;
  const fee = Number(data?.deliveryFee) || 0;
  return Math.max(0, Math.round((total - fee) * 100) / 100);
};

// The commission is 3% of the subtotal only, so the delivery fee never counts.
// Older orders without a stored commissionAmount are calculated from the
// subtotal instead.
const getOrderCommission = (data: any): number => {
  const saved = numOrNull(data?.commissionAmount);
  if (saved !== null && saved >= 0) return saved;
  return Math.round(getOrderSubtotal(data) * COMMISSION_RATE * 100) / 100;
};

// Returns the users still waiting for approval, newest first.
export const getPendingUsers = async () => {
  try {
    const snapshot = await getDocs(usersRef);
    const users = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((user: any) => norm(user.status) === "pending");
    users.sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    return users;
  } catch (error) {
    console.error("Pending Users Error:", error);
    return [];
  }
};

// Returns the newest signups.
export const getRecentActivity = async () => {
  try {
    const snapshot = await getDocs(
      query(usersRef, orderBy("createdAt", "desc"), limit(7))
    );
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Recent Activity Error:", error);
    return [];
  }
};

// Counts the approved farmers and buyers.
export const getApprovedUserCounts = async () => {
  try {
    const snapshot = await getDocs(usersRef);
    let farmers = 0;
    let buyers = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (norm(data.status) !== "approved") return;
      const role = norm(data.role);
      if (role === "farmer") farmers += 1;
      else if (role === "buyer") buyers += 1;
    });
    return { farmers, buyers };
  } catch (error) {
    console.error("Approved User Counts Error:", error);
    return { farmers: 0, buyers: 0 };
  }
};

// Returns the order totals, the platform earnings from finished orders, and how
// many orders sit in each status.
export const getOrdersSummary = async () => {
  try {
    const snapshot = await getDocs(ordersRef);
    const statusCounts: Record<string, number> = {
      pending: 0,
      accepted: 0,
      processing: 0,
      to_receive: 0,
      delivered: 0,
      claimed: 0,
      cancelled: 0,
    };
    let earnings = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      const status = norm(data.status);
      if (status in statusCounts) statusCounts[status] += 1;
      if (DELIVERED_STATUSES.includes(status)) {
        earnings += getOrderCommission(data);
      }
    });
    return {
      totalOrders: snapshot.size,
      earnings: Math.round(earnings * 100) / 100,
      statusCounts,
    };
  } catch (error) {
    console.error("Orders Summary Error:", error);
    return {
      totalOrders: 0,
      earnings: 0,
      statusCounts: {
        pending: 0,
        accepted: 0,
        processing: 0,
        to_receive: 0,
        delivered: 0,
        claimed: 0,
        cancelled: 0,
      },
    };
  }
};

export { getRecentOrders } from "./orderService";
