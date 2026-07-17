import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";

const ordersRef = collection(db, "orders");

// ==========================
// GET ALL ORDERS
// ==========================

// Walang where/orderBy dito kaya safe, walang index needed.
// Client-side sort na lang, same pattern sa dashboardService.
export const getAllOrders = async () => {
  try {
    const snapshot = await getDocs(ordersRef);

    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    orders.sort((a: any, b: any) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    return orders;
  } catch (error) {
    console.error("Get All Orders Error:", error);
    return [];
  }
};

// ==========================
// RECENT ORDERS (for dashboard)
// ==========================

// Walang "where" dito kaya ok lang mag-orderBy nang direkta, hindi kailangan ng index.
export const getRecentOrders = async (count = 5) => {
  try {
    const snapshot = await getDocs(
      query(ordersRef, orderBy("createdAt", "desc"), limit(count))
    );

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Recent Orders Error:", error);
    return [];
  }
};

// ==========================
// MONTHLY REVENUE
// ==========================

// Range filter + orderBy sa parehong field (createdAt) = single-field index lang,
// hindi kailangan ng composite index.
export const getMonthlyRevenue = async () => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const snapshot = await getDocs(
      query(
        ordersRef,
        where("createdAt", ">=", Timestamp.fromDate(startOfMonth)),
        orderBy("createdAt", "desc")
      )
    );

    return snapshot.docs.reduce((sum, doc) => {
      const order = doc.data();
      return sum + (order.total ?? 0);
    }, 0);
  } catch (error) {
    console.error("Monthly Revenue Error:", error);
    return 0;
  }
};