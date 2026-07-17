import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sileo } from "sileo";

import { logoutAdmin } from "../services/authService";

const LogoutModal = ({ closeModal }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutAdmin();

      closeModal();

      sileo.success({
        title: "Logout successful!",
        description: "You have been logged out.",
           fill: "#15803d",
        styles: {
          title: "text-white!",
          description: "text-white!",
          badge: "bg-white! text-[#15803d]!",
        },
      });

      navigate("/login", { replace: true });

    } catch (error) {
      sileo.error({
        title: "Logout failed",
        description: error.message,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-105 rounded-[30px] shadow-2xl p-8 text-center">

        <h2 className="text-2xl font-bold text-green-700">
          Logout Account?
        </h2>

        <p className="text-gray-500 mt-3">
          Are you sure you want to logout from your admin account?
        </p>

        <div className="flex justify-center gap-4 mt-8">

          <button
            onClick={closeModal}
            disabled={loading}
            className="px-7 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="px-7 py-3 rounded-xl bg-green-700 text-white font-semibold hover:bg-green-800 cursor-pointer disabled:bg-green-500"
          >
            {loading ? "Logging out..." : "Logout"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default LogoutModal;