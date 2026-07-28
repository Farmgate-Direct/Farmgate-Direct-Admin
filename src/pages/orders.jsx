import React, { useEffect, useState } from "react";
import { getAllOrders } from "../services/orderService"; // 👈 palitan kung iba ang path niyo

const OrderPayments = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const formatDate = (createdAt) => {
    if (!createdAt) return "N/A";
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Isama lahat ng pangalan ng produce sa order sa isang string,
  // hal. "Eggplant (Talong), Tomato" - dahil array yung order.products
  const getProduceSummary = (products) => {
    if (!products || products.length === 0) return "N/A";

    const names = products.map((p) => p.name).filter(Boolean);

    if (names.length <= 2) return names.join(", ");

    return `${names[0]}, ${names[1]} +${names.length - 2} more`;
  };

  const filteredOrders =
    activeFilter === "All"
      ? orders
      : orders.filter(
          (order) =>
            order.status?.toLowerCase() === activeFilter.toLowerCase()
        );

  const statusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      {/* TITLE */}
      <h1 className="text-2xl font-semibold mb-8">ORDER & PAYMENTS</h1>

      {/* FILTERS */}
      <div className="flex gap-3 mb-8">
        {["All", "Completed", "Processing", "Pending", "Cancelled"].map(
          (filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-1.5 rounded-full text-sm transition ${
                activeFilter === filter
                  ? "bg-green-700 text-white"
                  : "bg-white shadow-sm text-green-700"
              }`}
            >
              {filter}
            </button>
          ),
        )}
      </div>

      {/* ORDER & PAYMENTS */}
      <div className="bg-white h-120 rounded-2xl shadow-md p-6">
        <h2 className="font-semibold text-gray-800 mb-6">
          Transaction Records
        </h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 uppercase text-xs tracking-wider">
              <th className="pb-3">Order ID</th>
              <th>Buyer</th>
              <th>Farmer</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="py-4">#{order.id.slice(0, 6)}</td>

                  <td className="font-medium">{order.buyerName}</td>

                  <td>{order.farmName}</td>

                  <td>{getProduceSummary(order.products)}</td>

                  <td className="font-semibold">
                    ₱{(order.total ?? 0).toLocaleString()}
                  </td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="text-gray-400">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-400">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default OrderPayments;
