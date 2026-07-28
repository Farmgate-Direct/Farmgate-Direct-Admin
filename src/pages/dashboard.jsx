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
} from "../services/dashboardService";

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

const SkeletonLine = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col items-center justify-center gap-3">
    <SkeletonLine className="h-11 w-11 rounded-full" />
    <SkeletonLine className="h-6 w-16" />
    <SkeletonLine className="h-3 w-24" />
  </div>
);

const RowSkeleton = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-4 pr-4">
        <SkeletonLine className="h-4 w-full max-w-24" />
      </td>
    ))}
  </tr>
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
      icon: <img src={farmerImg} alt="Farmer" width={26} />,
      iconBg: "bg-green-100",
      value: stats.farmers,
      label: "Registered Farmers",
    },
    {
      key: "buyers",
      icon: <FaUser size={22} className="text-blue-600" />,
      iconBg: "bg-blue-100",
      value: stats.buyers,
      label: "Registered Buyers",
    },
    {
      key: "total",
      icon: <FaUsers size={22} className="text-purple-600" />,
      iconBg: "bg-purple-100",
      value: stats.total,
      label: "Total Users",
    },
    {
      key: "revenue",
      icon: <BsBarChartFill size={22} className="text-yellow-600" />,
      iconBg: "bg-yellow-100",
      value: `₱${monthlyRevenue.toLocaleString()}`,
      label: "Monthly Revenue",
    },
  ];

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold">
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
            className="shrink-0 font-medium underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT SIDE */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* STATS */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))
              : statCards.map((card) => (
                  <div
                    key={card.key}
                    className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col justify-center items-center hover:shadow-md transition-shadow"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${card.iconBg}`}
                    >
                      {card.icon}
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-800">
                      {card.value}
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1 text-center">
                      {card.label}
                    </p>
                  </div>
                ))}
          </div>
          
          <div className="bg-white flex-1 rounded-2xl shadow-md p-4 sm:p-6">
            <h2 className="font-semibold text-gray-800 mb-4 sm:mb-6">
              Recent Transactions
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full min-w-140 text-sm">
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

        <div className="w-full lg:w-80 flex flex-col gap-6">
          {/* PENDING APPROVALS */}
          <div className="bg-white min-h-56 lg:h-64 rounded-2xl shadow-sm p-6">
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
              <div className="space-y-4">
                {pendingUsers.slice(0, 4).map((user) => (
                  <div
                    key={user.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center min-w-0">
                      <div className="w-8 h-8 shrink-0 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs mr-3">
                        {user.fullName?.charAt(0) ?? "?"}
                      </div>
                      <span className="truncate">{user.fullName}</span>
                    </div>

                    <span className="shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      New
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                No pending approvals
              </div>
            )}
          </div>

          <div className="bg-white flex-1 rounded-2xl shadow-md p-6">
            <h2 className="font-semibold mb-6">Recent Activity</h2>

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
              <ul className="text-sm text-gray-600 space-y-4">
                {recentActivity.slice(0, 4).map((user) => (
                  <li key={user.id}>
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
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
