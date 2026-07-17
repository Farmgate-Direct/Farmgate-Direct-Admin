import React, { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import { BsBarChartFill } from "react-icons/bs";
import farmerImg from "../assets/images/farmer.png";

import {
  collection,
  query,
  where,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalFarmers, setTotalFarmers] = useState(0);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      // Total registered users
      const usersSnap = await getCountFromServer(collection(db, "users"));
      setTotalUsers(usersSnap.data().count);

      // Total registered farmers
      const farmerQuery = query(
        collection(db, "users"),
        where("role", "==", "farmer")
      );

      const farmerSnap = await getCountFromServer(farmerQuery);
      setTotalFarmers(farmerSnap.data().count);
    } catch (error) {
      console.error("Error fetching dashboard counts:", error);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold mb-8">HOME</h1>

      <div className="flex gap-6">
        {/* LEFT MAIN CONTENT */}
        <div className="flex-1 flex flex-col gap-6">
          {/* STATS */}
          <div className="flex gap-6 h-50">
            {/* FARMERS */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex-1 flex flex-col justify-center items-center">
              <div className="flex items-center space-x-4">
                <img
                  src={farmerImg}
                  alt="Farmer"
                  width={40}
                  height={40}
                />
                <div className="text-3xl font-bold">
                  {totalFarmers}
                </div>
              </div>

              <p className="text-gray-500 text-sm mt-2">
                Registered Farmers
              </p>
            </div>

            {/* USERS */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex-1 flex flex-col justify-center items-center">
              <div className="flex items-center space-x-4">
                <FaUsers size={40} color="black" />

                <div className="text-3xl font-bold">
                  {totalUsers}
                </div>
              </div>

              <p className="text-gray-500 text-sm mt-2">
                Registered Users
              </p>
            </div>

            {/* REVENUE */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex-1 flex flex-col justify-center items-center">
              <div className="flex items-center space-x-4">
                <BsBarChartFill size={40} color="black" />
                <div className="text-3xl font-bold">10k</div>
              </div>

              <p className="text-gray-500 text-sm mt-2">
                Monthly Revenue
              </p>
            </div>
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="bg-white h-80 rounded-2xl shadow-md p-6">
            <h2 className="font-semibold text-gray-800 mb-6">
              Recent Transactions
            </h2>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 uppercase text-xs tracking-wider">
                  <th className="pb-3">Buyer</th>
                  <th>Farmer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody className="text-gray-700">
                {[
                  {
                    buyer: "Soya",
                    amount: "₱50",
                    status: "Completed",
                    color: "bg-green-100 text-green-700",
                  },
                  {
                    buyer: "Chi",
                    amount: "₱80",
                    status: "Pending",
                    color: "bg-yellow-100 text-yellow-700",
                  },
                  {
                    buyer: "Jape",
                    amount: "₱75",
                    status: "Processing",
                    color: "bg-blue-100 text-blue-700",
                  },
                  {
                    buyer: "Galoy",
                    amount: "₱90",
                    status: "Cancelled",
                    color: "bg-red-100 text-red-700",
                  },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="py-4 font-medium">{item.buyer}</td>
                    <td>Mario Santos</td>
                    <td className="font-semibold">{item.amount}</td>
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${item.color}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="text-gray-400">Feb 20</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-80 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Pending Approvals</h2>
              <span className="text-sm text-gray-400 cursor-pointer">
                See All
              </span>
            </div>

            {["Galoy", "Chi", "Jape", "Soya"].map((name, i) => (
              <div key={i} className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs mr-3">
                    {name.charAt(0)}
                  </div>

                  <span>{name}</span>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  New
                </span>
              </div>
            ))}
          </div>

          <div className="bg-white h-60 rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold mb-4">Recent Activity</h2>

            <ul className="text-sm text-gray-600">
              <li className="mb-3">
                • Santos Farm Verification Request
                <br />
                <span className="text-xs text-gray-400">
                  2 hours ago
                </span>
              </li>

              <li className="mb-3">
                • Santos Farm approved & verified
                <br />
                <span className="text-xs text-gray-400">
                  2 hours ago
                </span>
              </li>

              <li>
                • 156 new buyers registered this week
                <br />
                <span className="text-xs text-gray-400">
                  Today
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;