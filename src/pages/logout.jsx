import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sileo } from "sileo";

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

    } catch (error) {
      sileo.error({
        title: "Logout failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        fixed inset-0
        bg-black/40
        flex items-center justify-center
        z-50
        px-4
      "
    >

      <div
        className="
          bg-white
          w-full
          max-w-md
          rounded-3xl
          shadow-2xl
          p-5
          sm:p-8
          text-center
        "
      >

        <h2
          className="
            text-xl
            sm:text-2xl
            font-bold
            text-green-700
          "
        >
          Logout Account?
        </h2>

        <p
          className="
            text-gray-500
            mt-3
            text-sm
            sm:text-base
            leading-relaxed
          "
        >
          Are you sure you want to logout from your admin account?
        </p>


        <div
          className="
            flex
            flex-col-reverse
            sm:flex-row
            justify-center
            gap-3
            sm:gap-4
            mt-7
          "
        >

          <button
            onClick={closeModal}
            disabled={loading}
            className="
              w-full
              sm:w-auto
              px-7
              py-3
              rounded-xl
              border
              border-gray-300
              text-gray-600
              font-semibold
              hover:bg-gray-100
              cursor-pointer
              disabled:opacity-50
            "
          >
            Cancel
          </button>


          <button
            onClick={handleLogout}
            disabled={loading}
            className="
              w-full
              sm:w-auto
              px-7
              py-3
              rounded-xl
              bg-green-700
              text-white
              font-semibold
              hover:bg-green-800
              cursor-pointer
              disabled:bg-green-500
            "
          >
            {loading ? "Logging out..." : "Logout"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default LogoutModal;
