import React, { useEffect, useState, useCallback } from "react";
import { FaUsers } from "react-icons/fa";
import { BsBarChartFill } from "react-icons/bs";
import { FaUser } from "react-icons/fa6";
import { FiAlertCircle } from "react-icons/fi";
import farmerImg from "../assets/images/farmer.png";
import {
  getDashboardStats,
  getPendingUsers,
  getRecentActivity,
  getRecentOrders,
  getMonthlyRevenue,
} from "../services/dashboardService"; // 👈 palitan kung iba ang path niyo

const statusStyles = {
  completed: "bg-green-100 text-green-700",
  delivered: "bg-green-100 text-green-700",
  processing: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
};

const getStatusStyle = (status) =>
  statusStyles[status?.toLowerCase()] || "bg-gray-100 text-gray-700";

const todayLabel = () =>
  new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

// ==========================
// SKELETON HELPERS
// ==========================
const SkeletonLine = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center gap-2 sm:gap-3">
    <SkeletonLine className="h-9 w-9 sm:h-11 sm:w-11 rounded-full" />
    <SkeletonLine className="h-5 sm:h-6 w-14 sm:w-16" />
    <SkeletonLine className="h-3 w-20 sm:w-24" />
  </div>
);

// Skeleton for table rows (md+ view)
const RowSkeleton = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-4 pr-4">
        <SkeletonLine className="h-4 w-full max-w-24" />
      </td>
    ))}
  </tr>
);

// Skeleton for mobile transaction cards
const TransactionCardSkeleton = () => (
  <div className="border border-gray-100 rounded-xl p-4 space-y-2">
    <div className="flex justify-between items-center">
      <SkeletonLine className="h-4 w-24" />
      <SkeletonLine className="h-4 w-16" />
    </div>
    <SkeletonLine className="h-3 w-32" />
    <div className="flex justify-between items-center">
      <SkeletonLine className="h-5 w-16 rounded-full" />
      <SkeletonLine className="h-3 w-20" />
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    farmers: 0,
    buyers: 0,
    pending: 0,
  });

  const [pendingUsers, setPendingUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, pendingData, activityData, ordersData, revenue] =
        await Promise.all([
          getDashboardStats(),
          getPendingUsers(),
          getRecentActivity(),
          getRecentOrders(5),
          getMonthlyRevenue(),
        ]);

      setStats(statsData);
      setPendingUsers(pendingData);
      setRecentActivity(activityData);
      setRecentOrders(ordersData);
      setMonthlyRevenue(revenue);
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

  const formatDate = (createdAt) => {
    if (!createdAt) return "N/A";
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const statCards = [
    {
      key: "farmers",
      icon: (
        <img
          src={farmerImg}
          alt="Farmer"
          className="w-5 h-5 sm:w-6 sm:h-6 lg:w-[26px] lg:h-[26px]"
        />
      ),
      iconBg: "bg-green-100",
      value: stats.farmers,
      label: "Registered Farmers",
    },
    {
      key: "buyers",
      icon: (
        <FaUser className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5 lg:w-[22px] lg:h-[22px]" />
      ),
      iconBg: "bg-blue-100",
      value: stats.buyers,
      label: "Registered Buyers",
    },
    {
      key: "total",
      icon: (
        <FaUsers className="text-purple-600 w-4 h-4 sm:w-5 sm:h-5 lg:w-[22px] lg:h-[22px]" />
      ),
      iconBg: "bg-purple-100",
      value: stats.total,
      label: "Total Users",
    },
    {
      key: "revenue",
      icon: (
        <BsBarChartFill className="text-yellow-600 w-4 h-4 sm:w-5 sm:h-5 lg:w-[22px] lg:h-[22px]" />
      ),
      iconBg: "bg-yellow-100",
      value: `₱${monthlyRevenue.toLocaleString()}`,
      label: "Monthly Revenue",
    },
  ];

  return (
    // min-h-dvh: mas tumpak sa mobile browsers (URL bar resize) kaysa min-h-screen
    // pt-20 = space para sa fixed hamburger sa mobile/tablet (AdminLayout provides sidebar/hamburger)
    // lg:pt-8 lg:ml-64: sa desktop kung saan naka-fixed at visible ang sidebar (w-64),
    //   kailangan ng ml-64 para di ma-cover ang content. PALITAN kung iba ang actual width ng sidebar mo.
    <div className="min-h-dvh bg-gray-50 w-full max-w-full overflow-x-hidden pt-20 pb-6 px-3 xs:px-4 sm:px-6 md:px-6 lg:pt-8 lg:pl-8 lg:pr-6 lg:ml-64 2xl:pr-10">
      {/* HEADER */}
      <div className="mb-5 sm:mb-6 lg:mb-8">
        <h1 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-semibold text-gray-800">
          Dashboard Overview
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">{todayLabel()}</p>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FiAlertCircle className="shrink-0" />
            <span className="break-words">{error}</span>
          </div>
          {/* min-h-11 (~44px) para touch-friendly ang tap target */}
          <button
            onClick={loadDashboard}
            className="shrink-0 font-medium underline hover:no-underline self-end sm:self-auto min-h-11 sm:min-h-0 flex items-center px-2 -mx-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* MAIN GRID: stacked sa mobile/tablet, side-by-side sa desktop */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 lg:gap-6 w-full">
        {/* LEFT SIDE */}
        <div className="flex-1 flex flex-col gap-4 sm:gap-5 lg:gap-6 min-w-0 w-full">
          {/* STATS
              320-480px: 2 columns (mas readable kaysa 1 stacked column)
              md (768px+): 4 columns
              Ginamit ang min-w-0 sa bawat card para di mag-overflow ang mahabang numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 w-full">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))
              : statCards.map((card) => (
                  <div
                    key={card.key}
                    className="bg-white rounded-2xl shadow-sm p-3 sm:p-5 lg:p-6 flex flex-col justify-center items-center hover:shadow-md transition-shadow min-w-0 w-full"
                  >
                    <div
                      className={`w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3 shrink-0 ${card.iconBg}`}
                    >
                      {card.icon}
                    </div>
                    <div className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 text-center break-words w-full leading-tight">
                      {card.value}
                    </div>
                    <p className="text-gray-500 text-[10px] sm:text-xs lg:text-sm mt-1 text-center leading-snug">
                      {card.label}
                    </p>
                  </div>
                ))}
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="bg-white flex-1 rounded-2xl shadow-md p-4 sm:p-6 min-w-0 w-full">
            <h2 className="font-semibold text-gray-800 mb-4 sm:mb-6">
              Recent Transactions
            </h2>

            {/* MOBILE / TABLET-PORTRAIT VIEW (< md): stacked cards, ZERO horizontal scroll */}
            <div className="md:hidden space-y-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TransactionCardSkeleton key={i} />
                ))
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-100 rounded-xl p-3 sm:p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="font-medium text-gray-800 text-sm truncate">
                        {order.buyerName}
                      </span>
                      <span className="font-semibold text-sm whitespace-nowrap shrink-0">
                        ₱{(order.total ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2 truncate">
                      {order.farmName}
                    </p>
                    <div className="flex justify-between items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      <span className="text-[11px] text-gray-400 whitespace-nowrap">
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

            {/* DESKTOP / TABLET-LANDSCAPE VIEW (md+): full table, no min-w needed since columns fit naturally */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 uppercase text-xs tracking-wider">
                    <th className="pb-3 pr-4">Buyer</th>
                    <th className="pr-4">Farm</th>
                    <th className="pr-4">Amount</th>
                    <th className="pr-4">Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody className="text-gray-700">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <RowSkeleton key={i} />
                    ))
                  ) : recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="py-4 pr-4 font-medium">
                          {order.buyerName}
                        </td>
                        <td className="pr-4">{order.farmName}</td>
                        <td className="pr-4 font-semibold whitespace-nowrap">
                          ₱{(order.total ?? 0).toLocaleString()}
                        </td>
                        <td className="pr-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle(
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
                      <td
                        colSpan={5}
                        className="py-8 text-center text-gray-400"
                      >
                        No transactions yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE
            Full width sa mobile/tablet, fixed sidebar width lang sa desktop (lg+) */}
        <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-4 sm:gap-5 lg:gap-6 shrink-0">
          {/* PENDING APPROVALS */}
          <div className="bg-white min-h-48 sm:min-h-56 lg:h-64 rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Pending Approvals</h2>

              {!loading && (
                <span className="flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                  {pendingUsers.length}
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <SkeletonLine className="w-8 h-8 rounded-full" />
                      <SkeletonLine className="h-3 w-24" />
                    </div>
                    <SkeletonLine className="h-5 w-12 rounded-full" />
                  </div>
                ))}
              </div>
            ) : pendingUsers.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {pendingUsers.slice(0, 4).map((user) => (
                  <div
                    key={user.id}
                    className="flex justify-between items-center gap-2"
                  >
                    <div className="flex items-center min-w-0">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs mr-3">
                        {user.fullName?.charAt(0) ?? "?"}
                      </div>
                      <span className="truncate text-sm">
                        {user.fullName}
                      </span>
                    </div>

                    <span className="shrink-0 px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      New
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                📭 No pending approvals
              </div>
            )}
          </div>

          {/* RECENT ACTIVITY */}
          <div className="bg-white flex-1 rounded-2xl shadow-md p-4 sm:p-6">
            <h2 className="font-semibold mb-4 sm:mb-6">Recent Activity</h2>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <SkeletonLine className="h-3 w-3/4" />
                    <SkeletonLine className="h-2.5 w-1/3" />
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <ul className="text-sm text-gray-600 space-y-3 sm:space-y-4">
                {recentActivity.slice(0, 4).map((user) => (
                  <li key={user.id} className="break-words">
                    • {user.fullName} registered as{" "}
                    <span className="font-medium capitalize">
                      {user.role}
                    </span>
                    <br />
                    <span className="text-xs text-gray-400">
                      Submitted on {formatDate(user.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                📭 No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
