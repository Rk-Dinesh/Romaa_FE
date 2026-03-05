import React, { useState } from "react";
import Modal from "../../../components/Modal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { InputField } from "../../../components/InputField";

const schema = yup.object().shape({
  companyId: yup.string().required("Company Id is required"),
  vehicleDate: yup.string().required("Vehicle Date is required"),
  vehicleNo: yup.string().required("Vehicle No is required"),
  location: yup.string().required("Location is required"),
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .required("Amount is required"),
  itc: yup.string().required("ITC selection is required"),
  documentYear: yup.string().required("Document Year is required"),
  referenceNo: yup.string().required("Reference No is required"),
  itemGroup: yup.string().required("Item Group is required"),
  gstType: yup.string().required("GST Type is required"),
});

const AddEntry = ({ onclose }) => {
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
    <Modal
      title="Add Expenses"
      onclose={onclose}
      child={
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-c gap-4 px-6 py-6 ">
            <InputField
              label="Company Id"
              name="companyId"
              register={register}
              errors={errors}
              placeholder="Enter Company Id"
            />
            <InputField
              label="Vehicle Date"
              name="vehicleDate"
              register={register}
              errors={errors}
              type="date"
            />
            <InputField
              label="Vehicle No"
              name="vehicleNo"
              register={register}
              errors={errors}
              placeholder="Enter Vehicle No"
            />
            <InputField
              label="Location"
              name="location"
              type="select"
              placeholder="select location"
              register={register}
              errors={errors}
              options={[
                { label: "Chennai", value: "Chennai" },
                { label: "Mumbai", value: "Mumbai" },
                { label: "Delhi", value: "Delhi" },
              ]}
            />
            <InputField
              label="Amount"
              name="amount"
              register={register}
              errors={errors}
              type="number"
              placeholder="Enter Amount"
            />
            <InputField
              label="ITC"
              name="itc"
              placeholder="select itc"
              type="select"
              register={register}
              errors={errors}
              options={[
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" },
              ]}
            />
            <InputField
              label="Document Year"
              name="documentYear"
              register={register}
              errors={errors}
              placeholder="Enter Document Year"
              type="number"
            />
            <InputField
              label="Reference No"
              name="referenceNo"
              register={register}
              errors={errors}
              placeholder="Enter Reference No"
            />
            <InputField
              label="Item Group"
              name="itemGroup"
              register={register}
              errors={errors}
              placeholder="Enter Item Group"
            />
            <InputField
              label="GST Type"
              name="gstType"
              register={register}
              errors={errors}
              placeholder="Enter GST Type"
            />
          </div>
          <div className="mx-5 text-xs flex lg:justify-end md:justify-center justify-center gap-2 mb-4">
            <button
              type="button"
              onClick={onclose}
              className="cursor-pointer border dark:border-white dark:text-white border-darkest-blue text-darkest-blue px-6 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer px-6 bg-darkest-blue text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      }
    />
  );
};

export default AddEntry;
