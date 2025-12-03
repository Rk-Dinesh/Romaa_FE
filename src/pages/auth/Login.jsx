import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LOGO from "../../assets/images/romaa logo.png";
import { IoEyeOff, IoEye } from "react-icons/io5";
import ThemeToggle from "../../components/ThemeToggle";
import LOGO_D from "../../assets/images/romaadark.png";


const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div className="relative font-layout-font flex flex-col justify-center items-center gap-6  dark:bg-overall_bg-dark bg-[#E3ECFF]  h-screen ">
        <div className=" right-8 absolute top-6  p-1 rounded-full">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-lg  dark:bg-layout-dark dark:text-white bg-white  p-8 rounded-xl shadow-lg">
          <div className="flex justify-between items-center py-4">
            <div>
            <img src={LOGO} alt="logo" className="w-36 ml-8 -mt-1 dark:hidden " />
                    <img
                      src={LOGO_D}
                      alt="logo"
                      className="hidden w-36 ml-8 -mt-1 dark:block "
                    />
            
            </div>
            <p className="text-3xl font-bold text-center my-4">Login</p>
          </div>
          <form className="mx-4 mt-4">
            <label className="grid  mb-4">
              Email / Phone Number
              <input
                type="text"
                className=" border-2  dark:border-border-dark-grey border-input-bordergrey outline-none rounded-md py-2 px-2 my-1"
                placeholder="Enter email or phone number"
              />
            </label>

            <label className="grid  relative">
              Password
              <input
                type={showPassword ? "text" : "password"}
                className=" border-2 dark:border-border-dark-grey border-input-bordergrey outline-none rounded-md py-2 px-2  pr-10"
                placeholder="Enter password"
              />
              <span
                className="absolute right-3 top-9 cursor-pointer dark:text-gray-400 text-black"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOff /> : <IoEye />}
              </span>
            </label>

            <p
              onClick={() => navigate("/forgotpassword")}
              className="text-right text-sm cursor-pointer hover:underline mt-4 "
            >
              Forgot Password?
            </p>
            <p
              onClick={() => navigate("/dashboard")}
              className=" cursor-pointer text-white bg-darkest-blue text-center   w-full py-2 my-3 rounded-md text-lg font-semibold transition duration-200 "
            >
              Login
            </p>
          </form>
          <p className="text-center cursor-pointer text-sm py-4">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/")}
              className=" hover:underline font-semibold"
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
