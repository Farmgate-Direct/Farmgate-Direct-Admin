import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";

const usersRef = collection(db, "users");

export const getDashboardStats = async () => {
  try {
    const totalUsers = await getCountFromServer(usersRef);

    const totalFarmers = await getCountFromServer(
      query(usersRef, where("role", "==", "farmer"))
    );

    const totalBuyers = await getCountFromServer(
      query(usersRef, where("role", "==", "buyer"))
    );

    const totalPending = await getCountFromServer(
      query(usersRef, where("status", "==", "pending"))
    );

    return {
      total: totalUsers.data().count,
      farmers: totalFarmers.data().count,
      buyers: totalBuyers.data().count,
      pending: totalPending.data().count,
    };
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    throw error;
  }
};

// Note: tinanggal ang orderBy dito para hindi mag-require ng composite index.
// Nag-sort na lang sa JS after kunin yung data.
export const getPendingUsers = async () => {
  try {
    const snapshot = await getDocs(
      query(usersRef, where("status", "==", "pending"))
    );

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // pinaka-bago muna sa taas
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

// Walang "where" dito kaya ok lang mag-orderBy nang direkta, hindi kailangan ng index.
export const getRecentActivity = async () => {
  try {
    const snapshot = await getDocs(
      query(usersRef, orderBy("createdAt", "desc"), limit(5))
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

export { getRecentOrders, getMonthlyRevenue } from "./orderService";