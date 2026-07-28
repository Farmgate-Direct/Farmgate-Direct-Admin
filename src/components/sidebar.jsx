import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaUserCheck,
  FaUsers,
  FaShoppingCart,
  FaUserCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { BiSolidReport } from "react-icons/bi";
import logo from "../assets/images/farmgate-logo.png";
import LogoutModal from "../pages/logout";

const Sidebar = () => {
  const [showLogout, setShowLogout] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
  };
}, [isOpen]);

  const menuClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition duration-200
    ${
      isActive
        ? "bg-green-700 text-white"
        : "bg-green-900 hover:bg-green-700 text-white"
    }`;

  const closeDrawer = () => setIsOpen(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="
          lg:hidden
          fixed top-4 left-4 z-30
          bg-[#14532D] text-white
          p-3 rounded-lg shadow-lg
          hover:bg-green-700 transition
        "
        aria-label="Open menu"
      >
        <FaBars size={18} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={closeDrawer}
          className="
            fixed inset-0
            bg-black/50
            z-30
            lg:hidden
            touch-none
          "
        />
      )}

      <div
        className={`
          fixed left-0 top-0
          h-dvh w-56 sm:w-60 lg:w-64
          bg-[#14532D] text-white
          flex flex-col
          overflow-hidden
          touch-none
          shadow-xl
          z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="relative p-4 border-b border-green-700 shrink-0">
          <div className="flex flex-col items-center gap-2">
            <img
              src={logo}
              alt="FarmGate Logo"
              className="h-10 lg:h-12 w-auto"
            />

            <h1 className="text-base lg:text-lg font-bold tracking-wide text-center">
              FarmGate Direct
            </h1>
          </div>

          <button
            onClick={closeDrawer}
            className="
              lg:hidden
              absolute top-4 right-4
              text-white/80 hover:text-white
            "
            aria-label="Close menu"
          >
            <FaTimes size={18} />
          </button>
        </div>

        <div className="flex-1 p-3 flex flex-col gap-2">
          <NavLink
            to="/dashboard"
            className={menuClass}
            onClick={closeDrawer}
          >
            <TbLayoutDashboardFilled size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/approvals"
            className={menuClass}
            onClick={closeDrawer}
          >
            <FaUserCheck size={18} />
            <span>Approvals</span>
          </NavLink>

          <NavLink
            to="/users"
            className={menuClass}
            onClick={closeDrawer}
          >
            <FaUsers size={18} />
            <span>Users</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={menuClass}
            onClick={closeDrawer}
          >
            <BiSolidReport size={20} />
            <span>Reports</span>
          </NavLink>

          <NavLink
            to="/orders"
            className={menuClass}
            onClick={closeDrawer}
          >
            <FaShoppingCart size={18} />
            <span>Orders</span>
          </NavLink>

          <div className="border-t border-green-700 my-2"></div>

          <NavLink
            to="/profile"
            className={menuClass}
            onClick={closeDrawer}
          >
            <FaUserCog size={18} />
            <span>Profile</span>
          </NavLink>
        </div>

        <div className="p-3 border-t border-green-700 shrink-0">
          <button
            onClick={() => setShowLogout(true)}
            className="
              w-full
              flex items-center gap-3
              px-3 py-2.5
              rounded-lg
              bg-red-600
              hover:bg-red-700
              transition
              font-medium
            "
          >
            <FaSignOutAlt size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {showLogout && (
        <LogoutModal
          closeModal={() => setShowLogout(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
