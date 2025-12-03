import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import Modal from "../../../../../components/Modal";
import { InputField } from "../../../../../components/InputField";

const schema = yup.object().shape({
  description: yup.string().required("Item description is required"),
  unit: yup.string().required("Unit is required"),
  quantity: yup
    .number()
    .typeError("Quantity must be a number")
    .required("Quantity is required")
    .positive("Quantity must be greater than 0"),
  baserate: yup
    .number()
    .typeError("Base rate must be a number")
    .required("Base rate is required")
    .min(0, "Base rate cannot be negative"),
  quotedrate: yup
    .number()
    .typeError("Quoted rate must be a number")
    .required("Quoted rate is required")
    .min(0, "Quoted rate cannot be negative"),
  worate: yup
    .number()
    .typeError("WO rate must be a number")
    .required("WO rate is required")
    .min(0, "WO rate cannot be negative"),
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .required("Amount is required")
    .min(0, "Amount cannot be negative"),
});

const AddZeroCost = ({ onclose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    onclose();
    console.log(data);
  };

  return (
    <>
      <Modal
        title="Add Zero Cost"
          widthClassName="lg:w-[550px] md:w-[450px] w-96"
        onclose={onclose}
        child={
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid  px-6 py-6">
              <div className="space-y-4">
                <InputField
                  label="Item Description"
                  name="description"
                  register={register}
                  errors={errors}
                  type="textarea"
                  placeholder="Enter item description"
                  colInp="col-span-8"
                  colLab="col-span-8"
                />
                <InputField
                  label="Unit"
                  name="unit"
                  register={register}
                  errors={errors}
                  placeholder="Enter unit"
                />
                <InputField
                  label="Quantity"
                  name="quantity"
                  register={register}
                  errors={errors}
                  placeholder="Enter quantity"
                />
                <InputField
                  label="Base rate"
                  name="baserate"
                  register={register}
                  errors={errors}
                  placeholder="Enter base rate"
                />
                <InputField
                  label="Quoted Rate"
                  name="quotedrate"
                  type="number"
                  register={register}
                  errors={errors}
                  placeholder="Enter quoted rate"
                />
                <InputField
                  label="WO Rate"
                  name="worate"
                  type="text"
                  register={register}
                  errors={errors}
                  placeholder="Enter wo rate"
                />
                <InputField
                  label="Amount"
                  name="amount"
                  type="text"
                  register={register}
                  errors={errors}
                  placeholder="Enter amount"
                />
              </div>
            </div>
            <div className="mx-5 text-xs flex lg:justify-end md:justify-center justify-center gap-2 mb-4">
              <button
                type="button"
                onClick={onclose}
                className="cursor-pointer  border  dark:border-white dark:text-white border-darkest-blue  text-darkest-blue px-6 py-2   rounded"
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
        }
      />
    </>
  );
};

export default AddZeroCost;
