import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sileo } from "sileo";
import { FiLogOut } from "react-icons/fi";
import { logoutAdmin } from "../services/authService";

const LogoutModal = ({ closeModal }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
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
    } catch {
      sileo.error({
        title: "Logout failed",
        description: "Could not log you out. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={closeModal}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.15s_ease-out]"
      >
        <div className="px-6 py-5 flex items-center gap-3 bg-green-700 text-white">
          <div className="w-9 h-9 shrink-0 rounded-full bg-white/15 flex items-center justify-center">
            <FiLogOut size={18} />
          </div>
          <h2 className="text-base font-bold tracking-tight truncate">Logout Account?</h2>
        </div>
        <div className="px-6 py-6">
          <p className="text-sm text-gray-700 leading-relaxed">
            Are you sure you want to logout from your admin account?
          </p>
        </div>
        <div className="px-6 py-5 border-t border-gray-100 flex gap-3">
          <button
            onClick={closeModal}
            disabled={loading}
            className="flex-1 min-h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex-1 min-h-11 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60"
          >
            {loading ? "Logging out..." : "Yes, Logout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
