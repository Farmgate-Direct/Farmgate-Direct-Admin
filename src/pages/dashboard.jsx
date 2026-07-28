import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers } from "react-icons/fa";
import { BsBarChartFill } from "react-icons/bs";
import { FaUser } from "react-icons/fa6";
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

const Dashboard = () => {
  const navigate = useNavigate();

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

  useEffect(() => {
    const loadDashboard = async () => {
      try {
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
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
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

  return (
    <>
      <h1 className="text-2xl font-semibold mb-8">HOME</h1>

      <div className="flex gap-6">
        {/* LEFT SIDE */}
        <div className="flex-1 flex flex-col gap-6">
          {/* STATS */}
          <div className="flex gap-6 h-50">
            <div className="bg-white rounded-2xl shadow-sm p-6 flex-1 flex flex-col justify-center items-center">
              <div className="flex items-center space-x-4">
                <img src={farmerImg} alt="Farmer" width={40} />
                <div className="text-3xl font-bold">
                  {loading ? "..." : stats.farmers}
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-2">Registered Farmers</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 flex-1 flex flex-col justify-center items-center">
              <div className="flex items-center space-x-4">
                <FaUser size={40} />
                <div className="text-3xl font-bold">
                  {loading ? "..." : stats.buyers}
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-2">Registered Buyers</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 flex-1 flex flex-col justify-center items-center">
              <div className="flex items-center space-x-4">
                <FaUsers size={40} />
                <div className="text-3xl font-bold">
                  {loading ? "..." : stats.total}
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-2">Total Users</p>
            </div>

            {/* MONTHLY REVENUE - now live */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex-1 flex flex-col justify-center items-center">
              <div className="flex items-center space-x-4">
                <BsBarChartFill size={40} />
                <div className="text-3xl font-bold">
                  {loading ? "..." : `₱${monthlyRevenue.toLocaleString()}`}
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-2">Monthly Revenue</p>
            </div>
          </div>

          {/* RECENT TRANSACTIONS - now live */}
          <div className="bg-white flex-1 rounded-2xl shadow-md p-6">
            <h2 className="font-semibold text-gray-800 mb-6">
              Recent Transactions
            </h2>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 uppercase text-xs tracking-wider">
                  <th className="pb-3">Buyer</th>
                  <th>Farm</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody className="text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="py-4 font-medium">{order.buyerName}</td>
                      <td>{order.farmName}</td>
                      <td className="font-semibold">
                        ₱{(order.total ?? 0).toLocaleString()}
                      </td>
                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle(
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
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      No transactions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-80 flex flex-col gap-6">
          {/* PENDING APPROVALS */}
          <div className="bg-white h-64 rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Pending Approvals</h2>

              <span
                onClick={() => {
                  if (pendingUsers.length > 0) {
                    navigate("/approvals");
                  }
                }}
                className={`text-sm ${
                  pendingUsers.length > 0
                    ? "text-blue-600 cursor-pointer hover:underline"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                See All
              </span>
            </div>

            {loading ? (
              <div className="flex h-full items-center justify-center text-gray-400">
                Loading...
              </div>
            ) : pendingUsers.length > 0 ? (
              <div className="space-y-4">
                {pendingUsers.slice(0, 4).map((user) => (
                  <div
                    key={user.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs mr-3">
                        {user.fullName?.charAt(0) ?? "?"}
                      </div>
                      <span>{user.fullName}</span>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      New
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No pending approvals
              </div>
            )}
          </div>

          {/* RECENT ACTIVITY */}
          <div className="bg-white flex-1 rounded-2xl shadow-md p-6">
            <h2 className="font-semibold mb-6">Recent Activity</h2>

            {loading ? (
              <div className="flex h-full items-center justify-center text-gray-400">
                Loading...
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
              <div className="flex h-full items-center justify-center text-gray-400">
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
