import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "../../../../components/Modal";
import { FaAsterisk } from "react-icons/fa";

const schema = yup.object().shape({
  fname: yup.string().required("First Name is required"),
  lname: yup.string().required("Last Name is required"),
  emailId: yup.string().email("Invalid email format").required("Email is required"),
  mobileNumber: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
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

const EditProfile = ({ onclose, data }) => {
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
        title="Edit Profile"
        onclose={onclose}
        child={
          <>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className=" gap-4 px-6 py-6">
                <div className=" grid grid-cols-2 space-y-4">
                  <div className="flex gap-3 col-span-2">
                    <InputField
                      label="First Name"
                      name="fname"
                      register={register}
                      errors={errors}
                     placeholder={data.name}
                    />

                    <InputField
                      label="Last Name"
                      name="lname"
                      register={register}
                      errors={errors}
                      placeholder="Enter last name"
                    />
                  </div>
                  <div className="col-span-2">
                    <InputField
                      label="Email"
                      name="emailId"
                      register={register}
                      errors={errors}
                      placeholder={data.emailId}
                    />
                     </div>
                     <div className="col-span-2">
                    <InputField
                      label="Phone Number"
                      name="mobileNumber"
                      register={register}
                      errors={errors}
                      placeholder={data.mobileNumber}
                    />
                 </div>
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

export default EditProfile;
