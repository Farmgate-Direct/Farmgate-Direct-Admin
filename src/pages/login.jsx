import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sileo } from "sileo";

import logo from "../assets/images/farmgate-logo.png";
import { loginAdmin } from "../services/authService";
import { auth } from "../FirebaseConfig";
import { updateLastLogin } from "../services/adminService";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await loginAdmin(email, password);

      sileo.success({
        title: "Login successful!",
        description: "Welcome to FarmGate Direct Admin.",
        fill: "#15803d",
        styles: {
          title: "text-white!",
          description: "text-white!",
          badge: "bg-white! text-[#15803d]!",
        },
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error(error);

      let message = "Invalid email or password.";

      if (error.message === "Unauthorized") {
        message = "Administrator account not found.";
      } else if (
        error.message === "Your administrator account has been deactivated."
      ) {
        message = "Your administrator account has been deactivated.";
      }

      sileo.error({
        title: "Login failed!",
        description: message,
        fill: "#DC2626",
        styles: {
          title: "text-white!",
          description: "text-white!",
          badge: "bg-white! text-[#DC2626]!",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <div className="w-full max-w-5xl bg-white rounded-[40px] overflow-hidden shadow-2xl grid md:grid-cols-2">
        {/* LEFT */}
        <div className="bg-green-700 flex flex-col items-center justify-center p-12 text-white">
          <img src={logo} alt="FarmGate Logo" className="w-28 h-28 mb-6" />

          <h1 className="text-4xl font-bold tracking-wide">FARMGATE DIRECT</h1>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col justify-center p-12">
          <h2 className="text-4xl font-bold text-green-700">Hello!</h2>

          <p className="text-gray-500 mt-2 mb-10">
            Login using your administrator account.
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-[18px] font-semibold text-green-700 mb-3">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-green-700 rounded-lg px-4 py-4 text-base bg-white text-gray-700 placeholder-gray-400 outline-none focus:border-orange-500 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[18px] font-semibold text-green-700 mb-3">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-green-700 rounded-lg px-4 py-4 text-base bg-white text-gray-700 placeholder-gray-400 outline-none focus:border-orange-500 transition"
              />
            </div>

            <div className="flex justify-center pt-3">
              <button
                type="submit"
                disabled={loading}
                className={`w-44 py-3 rounded-xl text-lg font-bold transition ${
                  loading
                    ? "bg-green-500 text-white cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800 text-white cursor-pointer"
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center text-sm text-gray-500">
            © 2026 FarmGate Direct Admin
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
