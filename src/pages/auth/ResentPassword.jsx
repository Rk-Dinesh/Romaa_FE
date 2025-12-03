import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../../assets/images/resetpassword.png"
import LOGO from "../../assets/images/romaa logo.png";
import { IoEyeOff, IoEye } from "react-icons/io5";
import ThemeToggle from "../../components/ThemeToggle";
import LOGO_D from "../../assets/images/romaadark.png";


const ResetPassword = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
<div className="relative font-layout-font h-screen flex justify-center items-center overflow-hidden">
  {/* Background Image */}
  <img
    src={bg}
    alt="bg"
    className="absolute inset-0 w-full h-full object-cover z-0 dark:hidden"
  />
  <div className="absolute inset-0 w-full h-full object-cover z-0  bg-overall_bg-dark dark:block hidden"></div>

  <div className="absolute right-8 top-10 z-20">
    <ThemeToggle />
  </div>

  {/* Login Box */}
  <div className="w-full max-w-lg dark:bg-layout-dark bg-white  dark:text-white z-10 p-8 rounded-xl shadow-lg">
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
    <form className="mx-4 mt-4 space-y-4">
      <label className="grid relative">
        Password
        <input
          type={showPassword ? "text" : "password"}
          className="border-2 dark:border-border-dark-grey border-input-bordergrey outline-none rounded-md py-2 px-2 pr-10"
          placeholder="Enter password"
        />
        <span
          className="absolute right-3 top-9 cursor-pointer dark:text-gray-300 text-black"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <IoEyeOff /> : <IoEye />}
        </span>
      </label>

      <label className="grid relative">
        Confirm Password
        <input
          type={showPassword ? "text" : "password"}
          className="border-2 dark:border-border-dark-grey border-input-bordergrey outline-none rounded-md py-2 px-2 pr-10"
          placeholder="Enter password"
        />
        <span
          className="absolute right-3 top-9 cursor-pointer dark:text-gray-300 text-black"
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
        onClick={() => navigate("/")}
        className="cursor-pointer text-white bg-darkest-blue text-center w-full py-2 my-3 rounded-md text-lg font-semibold transition duration-200"
      >
        Reset Passoword
      </p>
    </form>
  </div>
</div>

    </>
  );
};

export default ResetPassword;
