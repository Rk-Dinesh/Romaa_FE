import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose } from "react-icons/io5";

const schema = yup.object().shape({
  Refno: yup.string().required("Reference number is required"),
  unit: yup.string().required("Unit is required"),
  quantity: yup
    .number()
    .typeError("Quantity must be a number")
    .required("Quantity is required"),
  baseRate: yup
    .number()
    .typeError("Base rate must be a number")
    .required("Base rate is required"),
  quotedRate: yup
    .number()
    .typeError("Quoted rate must be a number")
    .required("Quoted rate is required"),
  woRate: yup
    .number()
    .typeError("WO rate must be a number")
    .required("WO rate is required"),
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .required("Amount is required"),

  specification: yup.string().required("Specification is required"),
});

const InputField = ({
  label,
  name,
  register,
  errors,
  placeholder,
  type = "text",
  options = [],
}) => (
  <div className="grid grid-cols-8 items-center gap-4">
    <label className="col-span-3 text-sm font-medium">{label}</label>

    {type === "select" ? (
      <select
        defaultValue=""
        {...register(name)}
        className={`col-span-5  rounded-lg outline-none py-2 px-2 text-xs font-light 
        ${errors[name] ? "border-red-500" : ""}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : type === "textarea" ? (
      <textarea
        placeholder={placeholder}
        {...register(name)}
        className={`col-span-5  rounded-lg outline-none py-2 px-2 placeholder:text-xs placeholder:font-light
        ${errors[name] ? "border-red-500" : ""}`}
        rows={4}
      />
    ) : type === "file" ? (
      <input
        type="file"
        placeholder={placeholder}
        {...register(name)}
        className={`col-span-5  rounded-lg outline-none py-2 px-2 placeholder:text-xs placeholder:font-light
        ${errors[name] ? "border-red-500" : ""}`}
      />
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={`col-span-5  rounded-lg outline-none py-2 px-2 placeholder:text-xs placeholder:font-light
        ${errors[name] ? "border-red-500" : ""}`}
      />
    )}

    {errors[name] && (
      <p className="text-red-500 text-xs col-span-8 text-end">
        {errors[name].message}
      </p>
    )}
  </div>
);

const EditBOQSite = ({ onclose }) => {
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
    <div className="font-roboto-flex fixed inset-0 grid justify-center items-center backdrop-blur-xs backdrop-grayscale-50  drop-shadow-lg z-20 ">
      <div className=" shadow-lg py-2  dark:bg-layout-dark bg-white  rounded-md lg:w-[500px] md:w-[500px] w-96">
        <div className="grid ">
          <button
            onClick={onclose}
            className=" place-self-end   cursor-pointer dark:bg-layout-dark bg-white  rounded-full lg:-mx-4 md:-mx-4 -mx-2 lg:-my-6 md:-my-5  -my-3 lg:shadow-md md:shadow-md shadow-none lg:py-2.5 md:py-2.5 py-1 lg:px-2.5 md:px-2.5 px-1 "
          >
            <IoClose className="size-[24px]" />
          </button>
          <h1 className="text-center font-medium text-2xl py-2">
           BOQ (Bill of Quality)
          </h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-6">
              <div className="  space-y-3">
                <InputField
                    label="Reference No."
                    name="Refno"
                    register={register}
                    errors={errors}
                    placeholder="Enter Reference No."
                    type="text"
                    />
                    <InputField
                    label="Unit"
                    name="unit"
                    register={register}
                    errors={errors}
                    placeholder="Enter Unit"
                    type="text"
                    />
                <InputField
                  label="Quantity"
                  name="quantity"
                  register={register}
                  errors={errors}
                  placeholder="Enter Quantity"
                  type="number"
                />
                <InputField
                  label="Base Rate"
                  name="baseRate"
                  register={register}
                  errors={errors}
                  placeholder="Enter Base Rate"
                  type="number"
                />
                <InputField
                  label="Quoted Rate"
                  name="quotedRate"
                  register={register}
                  errors={errors}
                  placeholder="Enter Quoted Rate"
                  type="number"
                />
                <InputField
                  label="WO Rate"
                  name="woRate"
                  register={register}
                  errors={errors}
                  placeholder="Enter WO Rate"
                  type="number"
                />
                <InputField
                  label="Amount"
                  name="amount"
                  register={register}
                  errors={errors}
                  placeholder="Enter Amount"
                  type="number"
                />
                <InputField
                  label="Specification"
                  name="specification"
                  register={register}
                  errors={errors}
                  placeholder="Enter Specification"
                  type="input"
                />  

              </div>
            </div>
            <div className="mx-5 text-xs flex lg:justify-end md:justify-center justify-center gap-2 mb-4">
              <button
                type="button"
                onClick={onclose}
                className="cursor-pointer  border dark:border-white dark:text-white  border-darkest-blue  text-darkest-blue px-6 py-2   rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cursor-pointer px-6 bg-darkest-blue text-white  rounded"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBOQSite;
