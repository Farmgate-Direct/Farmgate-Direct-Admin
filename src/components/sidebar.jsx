import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/images/farmgate-logo.png";
import LogoutModal from "../pages/logout";

const Sidebar = () => {
  const [showLogout, setShowLogout] = useState(false);

  return (
    <>
      <div
        className="
    fixed left-0 top-0 
    w-64 h-screen 
    bg-[#14532D] 
    text-white 
    flex flex-col
    "
      >
        {/* LOGO */}
        <div
          className="
      p-6 
      flex flex-col 
      items-center 
      gap-3 
      text-xl 
      font-semibold
      "
        >
          <img src={logo} alt="FarmGate Logo" className="h-10 w-auto" />

          <span>FarmGate Direct</span>
        </div>

        {/* MENU */}
        <div
          className="
      flex flex-col 
      p-4 
      space-y-2 
      text-sm 
      font-medium
      "
        >
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg hover:bg-green-700 transition
          ${isActive ? "bg-green-700" : "bg-green-900"}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/approvals"
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg hover:bg-green-700 transition
          ${isActive ? "bg-green-700" : "bg-green-900"}`
            }
          >
            Request Approval
          </NavLink>

          <NavLink
            to="/users"
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg hover:bg-green-700 transition
          ${isActive ? "bg-green-700" : "bg-green-900"}`
            }
          >
            Users
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg hover:bg-green-700 transition
          ${isActive ? "bg-green-700" : "bg-green-900"}`
            }
          >
            Reports & Analytics
          </NavLink>

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg hover:bg-green-700 transition
          ${isActive ? "bg-green-700" : "bg-green-900"}`
            }
          >
            Orders & Payments
          </NavLink>

        <NavLink
  to="/profile"
  className={({ isActive }) =>
    `px-4 py-3 rounded-lg hover:bg-green-700 transition
    ${isActive ? "bg-green-700" : "bg-green-900"}`
  }
>
  Profile & Settings
</NavLink>

<button
  onClick={() => setShowLogout(true)}
  className="
  px-4 py-3
  rounded-lg
  bg-green-900
  hover:bg-green-700
  transition
  text-left
  cursor-pointer
  "
>
  Logout
</button>
        </div>
      </div>

      {showLogout && <LogoutModal closeModal={() => setShowLogout(false)} />}
    </>
  );
};

export default Sidebar;
