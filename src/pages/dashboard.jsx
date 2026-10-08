import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { BsBarChartFill } from "react-icons/bs";
import { FaUser } from "react-icons/fa6";
import { FiAlertCircle } from "react-icons/fi";
import { GrUserWorker } from "react-icons/gr";
import {
  getApprovedUserCounts,
  getPendingUsers,
  getRecentActivity,
  getRecentOrders,
  getOrdersSummary,
} from "../services/dashboardService";

const statusStyles = {
  completed: "bg-green-100 text-green-700",
  delivered: "bg-green-100 text-green-700",
  accepted: "bg-teal-100 text-teal-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-blue-100 text-blue-700",
  preparing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  to_receive: "bg-purple-100 text-purple-700",
  "to receive": "bg-purple-100 text-purple-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
};

const getStatusStyle = (status) =>
  statusStyles[status?.toLowerCase()] || "bg-gray-100 text-gray-700";

const getStatusLabel = (status) => {
  switch (status?.toLowerCase().replace(/[\s_-]+/g, "_")) {
    case "pending":
      return "Pending";
    case "accepted":
      return "Accepted";
    case "processing":
      return "Processing";
    case "to_receive":
      return "To Receive";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status
        ? String(status)
            .replace(/[_-]+/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
        : "N/A";
  }
};

const ORDER_STATUSES = [
  "Pending",
  "Accepted",
  "Processing",
  "To Receive",
  "Delivered",
  "Cancelled",
];

const todayLabel = () =>
  new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const SkeletonLine = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center gap-3">
    <SkeletonLine className="h-11 w-11 rounded-full" />
    <SkeletonLine className="h-6 w-16" />
    <SkeletonLine className="h-3 w-24" />
  </div>
);

const RowSkeleton = ({ cols = 6 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-4 pr-4">
        <SkeletonLine className="h-4 w-full max-w-24" />
      </td>
    ))}
  </tr>
);

const TransactionCardSkeleton = () => (
  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
    <div className="flex justify-between items-center">
      <SkeletonLine className="h-4 w-24" />
      <SkeletonLine className="h-5 w-16 rounded-full" />
    </div>
    <SkeletonLine className="h-3 w-40" />
    <SkeletonLine className="h-3 w-32" />
    <div className="flex justify-between items-center">
      <SkeletonLine className="h-4 w-20" />
      <SkeletonLine className="h-3 w-16" />
    </div>
  </div>
);

const toMillis = (createdAt) => {
  if (!createdAt) return 0;
  if (createdAt.toDate) {
    try {
      return createdAt.toDate().getTime();
    } catch {
      return 0;
    }
  }
  const parsed = new Date(createdAt).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const Dashboard = () => {
  const [userCounts, setUserCounts] = useState({ farmers: 0, buyers: 0 });
  const [ordersSummary, setOrdersSummary] = useState({
    totalOrders: 0,
    earnings: 0,
    statusCounts: {
      pending: 0,
      accepted: 0,
      processing: 0,
      delivered: 0,
      cancelled: 0,
    },
  });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [countsData, summaryData, pendingData, usersData, ordersData] =
        await Promise.all([
          getApprovedUserCounts(),
          getOrdersSummary(),
          getPendingUsers(),
          getRecentActivity(),
          getRecentOrders(5),
        ]);
      setUserCounts(countsData);
      setOrdersSummary(summaryData);
      setPendingUsers(pendingData);
      setRecentUsers(usersData);
      setRecentOrders(ordersData);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Re-fetch when the tab regains focus so counts never look stale after
  // approving/banning users on another page.
  useEffect(() => {
    const handleFocus = () => {
      loadDashboard();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadDashboard]);

  const formatDate = (createdAt) => {
    try {
      if (!createdAt) return "N/A";
      const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
      if (Number.isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatPeso = (value) =>
    `₱${(value ?? 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getFarmerName = (order) =>
    order.farmerName || order.farmName || "N/A";

  const getProduceSummary = (products) => {
    if (!products || products.length === 0) return "N/A";
    const names = products.map((p) => p.name).filter(Boolean);
    if (names.length === 0) return "N/A";
    if (names.length <= 2) return names.join(", ");
    return `${names[0]}, ${names[1]} +${names.length - 2} more`;
  };

  const activityFeed = useMemo(() => {
    const registrations = recentUsers.map((user) => ({
      key: `user-${user.id}`,
      millis: toMillis(user.createdAt),
      title: `${user.fullName || "A user"} registered as ${user.role || "user"}`,
      sub: `Submitted on ${formatDate(user.createdAt)}`,
    }));
    const orderEvents = recentOrders.map((order) => {
      const status = (order.status || "").toLowerCase();
      const product = getProduceSummary(order.products);
      const title =
        status === "delivered"
          ? `Order delivered — ${product}`
          : `Order ${order.status || "updated"} — ${product}`;
      const sub = `${order.buyerName || "Buyer"} → ${getFarmerName(order)} · ${formatDate(order.createdAt)}`;
      return {
        key: `order-${order.id}`,
        millis: toMillis(order.createdAt),
        title,
        sub,
      };
    });
    return [...registrations, ...orderEvents]
      .sort((a, b) => b.millis - a.millis)
      .slice(0, 5);
  }, [recentUsers, recentOrders]);

  const displayOrders = useMemo(() => {
    return recentOrders.slice(0, 5);
  }, [recentOrders]);

  const statCards = [
    {
      key: "farmers",
      icon: <GrUserWorker size={22} className="text-green-700" />,
      iconBg: "bg-green-100",
      value: userCounts.farmers,
      label: "Registered Farmers",
    },
    {
      key: "buyers",
      icon: <FaUser size={20} className="text-blue-700" />,
      iconBg: "bg-blue-100",
      value: userCounts.buyers,
      label: "Registered Buyers",
    },
    {
      key: "orders",
      icon: <FaShoppingCart size={22} className="text-green-700" />,
      iconBg: "bg-green-100",
      value: ordersSummary.totalOrders,
      label: "Total Orders",
    },
    {
      key: "earnings",
      icon: <BsBarChartFill size={20} className="text-yellow-700" />,
      iconBg: "bg-yellow-100",
      value: formatPeso(ordersSummary.earnings),
      label: "FarmGate Earnings",
    },
  ];

  return (
    <>
      <div className="mb-5 sm:mb-6 lg:mb-8">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight text-gray-800">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-400 mt-1">{todayLabel()}</p>
      </div>
      {error && (
        <div className="mb-6 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadDashboard}
            className="shrink-0 font-semibold underline hover:no-underline min-h-11 flex items-center"
          >
            Retry
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : statCards.map((card) => (
              <div
                key={card.key}
                className="bg-white rounded-2xl shadow-md p-4 sm:p-5 lg:p-6 flex flex-col justify-center items-center hover:shadow-lg transition-shadow"
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3 ${card.iconBg}`}
                >
                  {card.icon}
                </div>
                <div className="text-xl sm:text-2xl font-bold tracking-tight text-gray-800">
                  {card.value}
                </div>
                <p className="text-gray-400 text-xs sm:text-sm mt-1 text-center">
                  {card.label}
                </p>
              </div>
            ))}
      </div>
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 mt-4 sm:mt-5">
        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4 sm:mb-6">
            Recent Activity
          </h2>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <SkeletonLine className="h-3 w-3/4" />
                  <SkeletonLine className="h-2.5 w-1/3" />
                </div>
              ))}
            </div>
          ) : activityFeed.length > 0 ? (
            <ul className="text-sm text-gray-700 space-y-4">
              {activityFeed.map((item) => (
                <li key={item.key} className="flex gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full bg-green-700" />
                  <div className="min-w-0">
                    <p className="truncate">{item.title}</p>
                    <span className="text-xs text-gray-400">{item.sub}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm">
              No recent activity
            </div>
          )}
        </div>
        <div className="w-full lg:w-96 shrink-0 bg-white rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-base font-semibold text-gray-800">
              Pending Approvals
            </h2>
            {!loading && (
              <span className="flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                {pendingUsers.length}
              </span>
            )}
          </div>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonLine className="w-8 h-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonLine className="h-3 w-24" />
                    <SkeletonLine className="h-2.5 w-32" />
                  </div>
                  <SkeletonLine className="h-5 w-12 rounded-full" />
                </div>
              ))}
            </div>
          ) : pendingUsers.length > 0 ? (
            <div className="space-y-4">
              {pendingUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-green-700 text-white flex items-center justify-center text-xs font-bold">
                    {user.fullName?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-400 truncate capitalize">
                      {user.role} · Joined {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                    New
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm">
              No pending approvals
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 mt-4 sm:mt-5">
        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4 sm:mb-6">
            Recent Transactions
          </h2>
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-180 text-sm">
              <thead>
                <tr className="text-left text-gray-400 uppercase text-xs tracking-wider">
                  <th className="pb-3 pr-4 font-medium">Buyer</th>
                  <th className="pb-3 pr-4 font-medium">Farm</th>
                  <th className="pb-3 pr-4 font-medium">Product</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <RowSkeleton key={i} />
                  ))
                ) : displayOrders.length > 0 ? (
                  displayOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="py-4 pr-4 font-medium text-gray-800">
                        {order.buyerName}
                      </td>
                      <td className="pr-4">{getFarmerName(order)}</td>
                      <td className="pr-4 max-w-40 truncate">
                        {getProduceSummary(order.products)}
                      </td>
                      <td className="pr-4 font-semibold text-gray-800 whitespace-nowrap">
                        ₱{(order.total ?? 0).toLocaleString()}
                      </td>
                      <td className="pr-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle(
                            order.status,
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="text-gray-400 whitespace-nowrap text-xs">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-sm text-gray-400"
                    >
                      No transactions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="sm:hidden space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TransactionCardSkeleton key={i} />
              ))
            ) : displayOrders.length > 0 ? (
              displayOrders.map((order) => (
                <div key={order.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <span className="font-semibold text-sm text-gray-800 truncate min-w-0">
                      {order.buyerName}
                    </span>
                    <span
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle(
                        order.status,
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1 truncate">
                    {getFarmerName(order)}
                  </p>
                  <p className="text-xs text-gray-500 mb-3 truncate">
                    {getProduceSummary(order.products)}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-gray-800">
                      ₱{(order.total ?? 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm">
                No transactions yet
              </div>
            )}
          </div>
        </div>
        <div className="w-full lg:w-80 shrink-0 bg-white rounded-2xl shadow-md p-4 sm:p-5 lg:p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4 sm:mb-6">
            Order Overview
          </h2>
          {loading ? (
            <div className="space-y-3">
              {ORDER_STATUSES.map((status) => (
                <div
                  key={status}
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                >
                  <SkeletonLine className="h-3 w-20" />
                  <SkeletonLine className="h-4 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {ORDER_STATUSES.map((status) => (
                <div
                  key={status}
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {status}
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {ordersSummary.statusCounts[
                      status.toLowerCase().replace(/\s+/g, "_")
                    ] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
