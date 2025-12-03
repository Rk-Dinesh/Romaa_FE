import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { InputField } from "../../../components/InputField";
import Modal from "../../../components/Modal";

const schema = yup.object().shape({
  work: yup.string().required("Work is required"),
  woDate: yup.date().required("WO Date is required"),
  schedule: yup.string().required("Schedule is required"),
  date: yup.date().required("Date is required"),
  contractor: yup.string().required("Contractor is required"),
  unitPrice: yup
    .number()
    .typeError("Unit Price must be a number")
    .required("Unit Price is required"),
  units: yup
    .string()
    .oneOf(["Nos", "Sqm", "Cum", "Kg"], "Invalid Unit")
    .required("Units is required"),
  total: yup.string().required("Total is required"),
});

const AddWorkDoneSite = ({ onclose }) => {
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
    title={"Add Work Done"}
    onclose={onclose}
    widthClassName={'lg:w-[500px] md:w-[500px] w-[96]'}
    child={
       <form onSubmit={handleSubmit(onSubmit)}>
            <div className=" px-6 py-6">
              <div className="lg:space-y-4 space-y-3">
                <InputField
                  label="Work"
                  type="text"
                  name="work"
                  register={register}
                  errors={errors}
                  placeholder="Enter work"
                />
                <InputField
                  label="WO Date"
                  type="date"
                  name="woDate"
                  register={register}
                  errors={errors}
                  placeholder="Select WO Date"
                />
                <InputField
                  label="Schedule"
                  type="text"
                  name="schedule"
                  register={register}
                  errors={errors}
                  placeholder="Enter schedule"
                />
                <InputField
                  label="Date"
                  type="date"
                  name="date"
                  register={register}
                  errors={errors}
                  placeholder="Select Date"
                />
                <InputField
                  label="Contractor"
                  type="text"
                  name="contractor"
                  register={register}
                  errors={errors}
                  placeholder="Enter contractor"
                />
                <InputField
                  label="Unit Price"
                  type="number"
                  name="unitPrice"
                  register={register}
                  errors={errors}
                  placeholder="Enter unit price"
                />
                <InputField
                  label="Units"
                  type="select"
                  name="units"
                  register={register}
                  errors={errors}
                  options={[
                    { value: "Nos", label: "Nos" },
                    { value: "Sqm", label: "Sqm" },
                    { value: "Cum", label: "Cum" },
                    { value: "Kg", label: "Kg" },
                  ]}
                  placeholder="Select units"
                />
                <InputField
                  label="Total"
                  type="text"
                  name="total"
                  register={register}
                  errors={errors}
                  placeholder="Enter total"
                />
              </div>
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

export default AddWorkDoneSite;
