import React from "react";
import { GoPackage } from "react-icons/go";
import { FaUsers } from "react-icons/fa";
import { BsBarChartFill } from "react-icons/bs";
import { FiDownload } from "react-icons/fi";
const ReportAnalytics = () => {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold mb-8">REPORTS & ANALYTICS</h1>

      {/* TOP STATS */}
      <div className="grid grid-cols-4 gap-5">
        {[
          {
            title: "Total Revenue",
            value: "500k",
            icon: <BsBarChartFill size={40} color="black" />,
          },
          {
            title: "Total Orders",
            value: "25k",
            icon: <GoPackage size={40} color="black" />,
          },
          {
            title: "Total Customers",
            value: "500k",
            icon: <FaUsers size={40} color="black" />,
          },
          { title: "Downloads", value: "11k",
            icon: <FiDownload size={40} color="black" />  },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm p-5 flex flex-col justify-between h-30"
          >
            {/* Icon + Value centered */}
            <div className="flex justify-center items-center gap-2">
              <div className="text-2xl text-gray-600">{item.icon}</div>
              <h2 className="text-xl font-bold">{item.value}</h2>
            </div>

            {/* Title at bottom-left */}
            <div>
              <p className="text-xs text-gray-400">{item.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CHART SECTION */}
      <div className="grid grid-cols-3 gap-5">
        {/* MONTHLY REVENUE */}
        <div className="col-span-2 bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold mb-4">Monthly Revenue</h2>

          <div className="flex items-end justify-between h-32">
            {[
              { amount: "₱68k", height: "h-12" },
              { amount: "₱85k", height: "h-16" },
              { amount: "₱112k", height: "h-20" },
              { amount: "₱138k", height: "h-24" },
              { amount: "₱94k", height: "h-16" },
              { amount: "₱118k", height: "h-20" },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-[11px] mb-1 font-medium">
                  {bar.amount}
                </span>
                <div
                  className={`w-8 ${bar.height} ${
                    i === 5 ? "bg-yellow-400" : "bg-green-700"
                  } rounded-md`}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* SALES BY CATEGORY */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col">
          <h2 className="font-semibold mb-4">Sales by Category</h2>

          <div className="flex flex-1 items-center justify-center gap-8">
            {/* DONUT */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-green-700"></div>
              <div className="absolute w-14 h-14 bg-white rounded-full"></div>
            </div>

            {/* LEGEND */}
            <div className="text-xs space-y-2">
              <p className="flex items-center">
                <span className="w-2.5 h-2.5 bg-green-700 rounded-full mr-2"></span>
                Vegetables 58.8%
              </p>

              <p className="flex items-center">
                <span className="w-2.5 h-2.5 bg-orange-400 rounded-full mr-2"></span>
                Fruits 23.5%
              </p>

              <p className="flex items-center">
                <span className="w-2.5 h-2.5 bg-gray-300 rounded-full mr-2"></span>
                Egg & Poultry 11.8%
              </p>

              <p className="flex items-center">
                <span className="w-2.5 h-2.5 bg-green-400 rounded-full mr-2"></span>
                Herbs 5.9%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-semibold mb-4">Top Performing Farmers</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 uppercase text-xs tracking-wider">
              <th className="pb-3">Rank</th>
              <th>Farmer</th>
              <th>Farm</th>
              <th>Total Sales</th>
              <th>Orders</th>
              <th>Rating</th>
              <th>Top Products</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {[
              {
                rank: 1,
                name: "Mario Santos",
                farm: "Green Valley Farm",
                sales: "₱41,600",
                orders: "561+",
                rating: "4.9",
                product: "Vegetables",
              },
              {
                rank: 2,
                name: "John Aguilar",
                farm: "Aguilar Farm",
                sales: "₱28,400",
                orders: "253+",
                rating: "4.8",
                product: "Vegetables",
              },
              {
                rank: 3,
                name: "Anthony Flores",
                farm: "Hagonoy Poultry Farm",
                sales: "₱19,200",
                orders: "213+",
                rating: "4.6",
                product: "Egg & Poultry",
              },
            ].map((farmer, i) => (
              <tr key={i} className="hover:bg-gray-50 transition">
                <td className="py-3">{farmer.rank}</td>
                <td>{farmer.name}</td>
                <td>{farmer.farm}</td>
                <td className="font-semibold">{farmer.sales}</td>
                <td>{farmer.orders}</td>
                <td>⭐ {farmer.rating}</td>
                <td>{farmer.product}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportAnalytics;
