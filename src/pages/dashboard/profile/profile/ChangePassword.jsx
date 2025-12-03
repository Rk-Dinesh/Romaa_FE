import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "../../../../components/Modal";
import { FaAsterisk } from "react-icons/fa";

const schema = yup.object().shape({
  npass: yup.string().required("new Password is required"),
  cpass: yup.string().required("confirm password is required"),
});

const InputField = ({
  label,
  name,
  register,
  errors,
  placeholder,
  type = "text",
}) => (
  <div className=" flex flex-col  gap-2 ">
    <label className="col-span-3 text-sm font-medium relative ">{label} <span className="absolute text-red-400"><FaAsterisk size={7}/></span></label>
    <input
      type={type}
      placeholder={placeholder}
      {...register(name)}
      className={` border border-input-bordergrey rounded-lg outline-none py-2 w-full px-3 placeholder:text-start placeholder:text-xs placeholder:font-light placeholder-black ${
        errors[name] ? "border-red-500" : ""
      }`}
    />
    {errors[name] && (
      <p className="text-red-500 text-xs col-span-8 text-end">
        {errors[name].message}
      </p>
    )}
  </div>
);

const ChangePassword = ({ onclose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log("Form Data:", data);
    onclose();
  };

  return (
    <>
      <Modal
        title="Change Password"
        onclose={onclose}
        child={
          <>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className=" gap-4 px-6 py-6">
                <div className=" grid grid-cols-2 pb-3 space-y-4">
                 
                  <div className="col-span-2 ">
                    <InputField
                      label="New Password"
                      name="npass"
                      register={register}
                      errors={errors}
                      placeholder="Enter new password"
                    />
                     </div>
                     <div className="col-span-2">
                    <InputField
                      label="Confirm Password"
                      name="cpass"
                      register={register}
                      errors={errors}
                      placeholder="Enter confirmed Password"
                    />
                 </div>
                </div>
                 <div className="space-y-1 py-2 w-96">
                  <p className="font-medium text-xs">Important note</p>
                  <p className="text-xs">Password must contain at least one capital letter, one small letter, one number, one special character and it should be minimum 9 characters</p>
                  <p className="text-xs font-medium">Example: Pass@2020</p>
                 </div> 
              </div>
              <div className="mx-5 text-xs flex md:justify-center justify-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={onclose}
                  className="cursor-pointer border border-darkest-blue text-darkest-blue px-6 w-28 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-6 w-28 bg-darkest-blue text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </>
        }
      />
    </>
  );
};

export default ChangePassword;
