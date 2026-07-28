import React, { useEffect, useMemo, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import {
  FiX,
  FiUser,
  FiMapPin,
  FiCalendar,
  FiPackage,
  FiHash,
} from "react-icons/fi";
import { getAllOrders } from "../services/orderService"; // 👈 palitan kung iba ang path niyo

const ITEMS_PER_PAGE = 5;

const SkeletonLine = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const OrderPayments = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const filteredOrders = useMemo(() => {
    return activeFilter === "All"
      ? orders
      : orders.filter(
          (order) =>
            order.status?.toLowerCase() === activeFilter.toLowerCase()
        );
  }, [orders, activeFilter]);

  // Reset to page 1 whenever filter changes, so hindi nakatambay
  // sa page na wala nang laman.
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
  );

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // "delivered" ang actual value sa Firestore, hindi "completed" -
  // kaya dating "Completed" filter/badge ay laging walang match.
  const statusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
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
      <h1 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8">
        ORDER & PAYMENTS
      </h1>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
        {["All", "Delivered", "Processing", "Pending", "Cancelled"].map(
          (filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm transition ${
                activeFilter === filter
                  ? "bg-green-700 text-white"
                  : "bg-white shadow-sm text-green-700"
              }`}
            >
              {filter}
            </button>
          )
        )}
      </div>

      {/* ORDER & PAYMENTS */}
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
        <h2 className="font-semibold text-gray-800 mb-4 sm:mb-6">
          Transaction Records
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-sm">
            <thead>
              <tr className="text-left text-gray-400 uppercase text-xs tracking-wider">
                <th className="pb-3 pr-4">Order ID</th>
                <th className="pr-4">Buyer</th>
                <th className="pr-4">Farmer</th>
                <th className="pr-4">Product</th>
                <th className="pr-4">Amount</th>
                <th className="pr-4">Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody className="text-gray-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="py-4 pr-4">
                        <SkeletonLine className="h-4 w-full max-w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-gray-50 transition cursor-pointer"
                  >
                    <td className="py-4 pr-4">#{order.id.slice(0, 6)}</td>

                    <td className="pr-4 font-medium">{order.buyerName}</td>

                    <td className="pr-4">{order.farmName}</td>

                    <td className="pr-4">
                      {getProduceSummary(order.products)}
                    </td>

                    <td className="pr-4 font-semibold whitespace-nowrap">
                      ₱{(order.total ?? 0).toLocaleString()}
                    </td>

                    <td className="pr-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="text-gray-400 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && filteredOrders.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              <IoIosArrowBack size={16} />
            </button>

            <span className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium bg-green-700 text-white">
              {currentPage}
            </span>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              <IoIosArrowForward size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ================= ORDER DETAILS MODAL ================= */}
      {selectedOrder && (
        <div
          onClick={() => setSelectedOrder(null)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden animate-[fadeIn_0.15s_ease-out]"
          >
            {/* HEADER */}
            <div className="bg-green-700 text-white px-6 py-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-green-100 text-xs uppercase tracking-wide mb-1">
                  <FiHash size={12} />
                  Order Details
                </div>
                <h2 className="text-xl font-bold">
                  #{selectedOrder.id.slice(0, 6)}
                </h2>
                <div className="flex items-center gap-1.5 text-green-100 text-xs mt-2">
                  <FiCalendar size={13} />
                  {formatDate(selectedOrder.createdAt)}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition"
                  aria-label="Close"
                >
                  <FiX size={22} />
                </button>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* BUYER / FARMER */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-xs uppercase mb-2">
                    <FiUser size={13} />
                    Buyer
                  </div>
                  <p className="font-semibold text-gray-800 truncate">
                    {selectedOrder.buyerName || "N/A"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-xs uppercase mb-2">
                    <FiMapPin size={13} />
                    Farm
                  </div>
                  <p className="font-semibold text-gray-800 truncate">
                    {selectedOrder.farmName || "N/A"}
                  </p>
                </div>
              </div>

              {/* PRODUCTS */}
              <div>
                <div className="flex items-center gap-2 text-gray-400 text-xs uppercase mb-3">
                  <FiPackage size={13} />
                  Products (
                  {selectedOrder.products?.length ?? 0})
                </div>

                {selectedOrder.products?.length > 0 ? (
                  <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden">
                    {selectedOrder.products.map((product, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 shrink-0 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 truncate">
                              {product.name || "Unnamed product"}
                            </p>
                            {product.quantity && (
                              <p className="text-xs text-gray-400">
                                Qty: {product.quantity}
                                {product.unit ? ` ${product.unit}` : ""}
                              </p>
                            )}
                          </div>
                        </div>

                        {product.price != null && (
                          <p className="font-semibold text-gray-700 shrink-0">
                            ₱{Number(product.price).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 bg-gray-50 rounded-xl px-4 py-6 text-center">
                    No products listed
                  </p>
                )}
              </div>

              {/* TOTAL */}
              <div className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-4">
                <span className="font-semibold text-green-900">
                  Total Amount
                </span>
                <span className="text-xl font-bold text-green-700">
                  ₱{(selectedOrder.total ?? 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-lg text-sm font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderPayments;