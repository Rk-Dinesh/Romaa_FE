import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LOGO from "../../assets/images/romaa logo.png";
import ThemeToggle from "../../components/ThemeToggle";
import LOGO_D from "../../assets/images/romaadark.png";

const ForgotPassword = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="relative font-layout-font flex flex-col justify-center items-center gap-6 dark:bg-overall_bg-dark bg-[#E3ECFF] dark:text-white   h-screen ">
        <div className=" right-8 absolute top-6  p-1 rounded-full">
          <ThemeToggle />
        </div>
        <div className="dark:bg-layout-dark bg-white w-full max-w-lg p-8 rounded-xl shadow-lg">
          <div className="flex justify-between items-center py-4">
            <div>
             <img src={LOGO} alt="logo" className="w-36 ml-8 -mt-1 dark:hidden " />
                     <img
                       src={LOGO_D}
                       alt="logo"
                       className="hidden w-36 ml-8 -mt-1 dark:block "
                     />
             
            </div>
            <p className="text-xl font-bold text-center my-4">Forgot Password?</p>
          </div>
          <form className="mx-4 mt-4">
            <label className="grid  mb-8">
              Email / Phone Number
              <input
                type="text"
                className=" border-2 dark:border-border-dark-grey border-[#D0D6FF]   dark:placeholder:text-white outline-none rounded-md py-2 px-2 my-1"
                placeholder="Enter email or phone number"
              />
            </label>

            <p
                onClick={() => navigate("/resetpassword")}
              className=" cursor-pointer bg-darkest-blue text-white text-center   w-full py-2 my-3 rounded-md text-lg font-semibold transition duration-200 "
            >
              Send Email
            </p>
          </form>
          <p
            onClick={() => navigate("/")}
            className="text-center cursor-pointer text-sm py-4 hover:underline"
          >
            Back to Login
          </p>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
