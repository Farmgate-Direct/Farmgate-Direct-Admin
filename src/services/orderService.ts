import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  documentId,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";

const ordersRef = collection(db, "orders");
const usersRef = collection(db, "users");

const attachFarmerNames = async (orders: any[]) => {
  const farmerIds = [
    ...new Set(orders.map((o) => o.farmerId).filter(Boolean)),
  ];
  if (farmerIds.length === 0) return orders;
  const farmerNameMap: Record<string, string> = {};
  const chunkSize = 10;
  for (let i = 0; i < farmerIds.length; i += chunkSize) {
    const chunk = farmerIds.slice(i, i + chunkSize);
    const snapshot = await getDocs(
      query(usersRef, where(documentId(), "in", chunk))
    );
    snapshot.docs.forEach((doc) => {
      const data: any = doc.data();
      farmerNameMap[doc.id] = data.fullName || data.farmName || "N/A";
    });
  }
  return orders.map((order: any) => ({
    ...order,
    farmerName: order.farmerId
      ? farmerNameMap[order.farmerId] || "N/A"
      : "N/A",
  }));
};

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
    return await attachFarmerNames(orders);
  } catch (error) {
    console.error("Get All Orders Error:", error);
    return [];
  }
};

export const getRecentOrders = async (count = 5) => {
  try {
    const safeCount = Math.min(Math.max(Math.floor(count) || 5, 1), 50);
    const snapshot = await getDocs(
      query(ordersRef, orderBy("createdAt", "desc"), limit(safeCount))
    );
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return await attachFarmerNames(orders);
  } catch (error) {
    console.error("Recent Orders Error:", error);
    return [];
  }
};
