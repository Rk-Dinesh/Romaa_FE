import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoEyeOff, IoEye } from "react-icons/io5";

// Assets & Components
import LOGO from "../../assets/images/romaa logo.png";
import LOGO_D from "../../assets/images/romaadark.png";
import ThemeToggle from "../../components/ThemeToggle";

// Context
import { useAuth } from "../../context/AuthContext";
import { API } from "../../constant";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Access global login function

  // Local State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Login Handler ---
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Basic Validation
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // API Call to Backend
      const res = await axios.post(
        `${API}/employee/login`,
        { email, password },
        { withCredentials: true } // Critical for HTTP-Only Cookies
      );

      if (res.data.status) {
        // Success: Pass User object to Context
        // (Token is handled automatically by browser cookies)
        login(res.data.data.user);
  
        
      }
    } catch (err) {
      console.error("Login Error:", err);
      // Handle generic or specific API errors
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative font-layout-font flex flex-col justify-center items-center gap-6 dark:bg-overall_bg-dark bg-[#E3ECFF] h-screen transition-colors duration-300">

      <div className="absolute top-6 right-8 p-1 rounded-full">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg dark:bg-layout-dark dark:text-white bg-white p-8 rounded-xl shadow-lg transition-colors duration-300">

        <div className="flex justify-between items-center py-4">
          <div>
            <img
              src={LOGO}
              alt="logo"
              className="w-36 ml-8 -mt-1 dark:hidden"
            />
            <img
              src={LOGO_D}
              alt="logo"
              className="hidden w-36 ml-8 -mt-1 dark:block"
            />
          </div>
          <p className="text-3xl font-bold text-center my-4">Login</p>
        </div>

        <form className="mx-4 mt-4" onSubmit={handleLogin}>

          <label className="grid mb-4 font-medium text-sm">
            Email / Phone Number
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 dark:border-border-dark-grey border-input-bordergrey outline-none rounded-md py-2 px-3 my-1 bg-transparent focus:border-darkest-blue transition-colors"
              placeholder="Enter email or phone number"
              required
            />
          </label>

          <label className="grid relative font-medium text-sm">
            Password
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 dark:border-border-dark-grey border-input-bordergrey outline-none rounded-md py-2 px-3 pr-10 my-1 bg-transparent focus:border-darkest-blue transition-colors"
              placeholder="Enter password"
              required
            />
            <span
              className="absolute right-3 top-9 cursor-pointer dark:text-gray-400 text-gray-600 hover:text-darkest-blue"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
            </span>
          </label>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mt-4 text-sm text-center">
              {error}
            </div>
          )}

          <p
            onClick={() => navigate("/forgotpassword")}
            className="text-right text-sm cursor-pointer hover:underline mt-4 text-gray-500 dark:text-gray-400"
          >
            Forgot Password?
          </p>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 my-5 rounded-md text-lg font-semibold text-white transition duration-200 ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-darkest-blue hover:bg-blue-900 cursor-pointer shadow-md hover:shadow-lg"
              }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm py-4 text-gray-600 dark:text-gray-300">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-darkest-blue dark:text-blue-400 hover:underline font-semibold cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;