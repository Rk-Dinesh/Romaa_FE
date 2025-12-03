import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Title from "../../../components/Title";
import { IoSave } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { InputField } from "../../../components/InputField";

const Editschema = yup.object().shape({
  userId: yup.string().required("User ID is required"),
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email ID is required"),
  phoneNumber: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone Number must be 10 digits")
    .required("Phone Number is required"),
  role: yup.string().required("Role is required"),
});

const Changeschema = yup.object().shape({
  newPassword: yup
    .string()
    .required("New password is required")
    .min(9, "Password must be at least 9 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  confirmPassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("newPassword")], "Passwords must match"),
});





const EditUser = () => {
  const location = useLocation();
  const userData = location.state?.employee;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(Editschema),
  });

  useEffect(() => {
    if (userData) {
      reset({
        userId: userData.userId || "",
        name: userData.name || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        role: userData.role || "",
      });
    }
  }, [userData, reset]);

  const onSubmit = (data) => {
    console.log("Form Data:", data);
  };

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
  } = useForm({
    resolver: yupResolver(Changeschema),
  });

  const onSubmitPassword = (data) => {
    console.log("Password Data:", data);
  };
  return (
    <div className="h-screen ">
      <Title title="Settings" sub_title="User" page_title="Edit User" />
      <div className="grid grid-cols-12  gap-2 my-4">
        <div className="sm:col-span-6 col-span-12 w-full py-9 rounded-lg dark:bg-layout-dark bg-white">
          <p className="w-full text-2xl font-semibold flex justify-center items-center">
            {" "}
            Edit user
          </p>
          <div className="">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-c gap-4 px-6 py-6">
                <div className="space-y-4">
                  <InputField
                    label="User ID"
                    name="userId"
                    register={register}
                    errors={errors}
                    placeholder="Type Here"
                  />
                  <InputField
                    label="Name"
                    name="name"
                    register={register}
                    errors={errors}
                    placeholder="Type Here"
                  />
                  <InputField
                    label="Email ID"
                    name="email"
                    register={register}
                    errors={errors}
                    placeholder="Type Here"
                    type="email"
                  />
                  <InputField
                    label="Phone Number"
                    name="phoneNumber"
                    register={register}
                    errors={errors}
                    placeholder="Type Here"
                  />
                  <InputField
                    label="Role"
                    name="role"
                    type="select"
                    placeholder="select role"
                    register={register}
                    errors={errors}
                    options={[{label:"Admin", value:"admin"},{label:"User", value:"User" },]}
                  />
                </div>
              </div>
              <div className="mx-5 text-xs flex lg:justify-end md:justify-center justify-center gap-2 mb-4">
                <button
                  type="submit"
                  className="flex gap-2 text-base items-center p-3 cursor-pointer px-6 bg-darkest-blue text-white rounded"
                >
                  <IoSave size={23} />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="sm:col-span-6 col-span-12 w-full py-9 rounded-lg dark:bg-layout-dark bg-white">
          <p className="w-full text-2xl font-semibold flex justify-center items-center">
            Change Password
          </p>
          <div className="px-6 py-6">
            <form
              onSubmit={handleSubmitPassword(onSubmitPassword)}
              className="space-y-4"
            >
              <InputField
                label="New password"
                name="newPassword"
                register={registerPassword}
                errors={errorsPassword}
                type="password"
                placeholder="enter new password"
              />
              <InputField
                label="Confirm Password"
                name="confirmPassword"
                register={registerPassword}
                errors={errorsPassword}
                type="password"
                 placeholder="enter confirm password"
              />
              <p className="text-xs dark:text-gray-400 text-gray-700">
                "Make sure your password has: one capital letter, one small
                letter, one number, one special symbol, and is at least 9
                characters long."
              </p>
              <p className="text-xs mt-1">
                <strong>Example:</strong> Design@2024
              </p>
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-darkest-blue text-white rounded"
                >
                  <IoSave size={20} /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
