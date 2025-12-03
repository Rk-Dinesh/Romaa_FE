import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "../../../components/Modal";
import { InputField } from "../../../components/InputField";


const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  reportingTo: yup.string().required("Reporting To is required"),
  siteLocation: yup.string().required("Site Location is required"),
  type: yup
    .string()
    .oneOf(["Skilled", "Unskilled"], "Invalid Type")
    .required("Type is required"),
  date: yup.date().required("Date is required"),
  timeIn: yup.string().required("Time In is required"),
  timeOut: yup.string().required("Time Out is required"),
});

const AddDailyLabourSite = ({ onclose }) => {
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
      title={"Add Daily Labour"}
      onclose={onclose}
      widthClassName={"lg:w-[500px] md:w-[500px] w-[96]"}
      child={
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-6">
            <div className="lg:space-y-4 space-y-3">
              <InputField
                label="Name"
                type="text"
                name="name"
                register={register}
                errors={errors}
                placeholder="Enter name"
              />
              <InputField
                label="Reporting To"
                type="text"
                name="reportingTo"
                register={register}
                errors={errors}
                placeholder="Enter reporting person"
              />
              <InputField
                label="Site Location"
                type="text"
                name="siteLocation"
                register={register}
                errors={errors}
                placeholder="Enter site location"
              />
              <InputField
                label="Type"
                type="select"
                name="type"
                register={register}
                errors={errors}
                options={[
                  { value: "Skilled", label: "Skilled" },
                  { value: "Unskilled", label: "Unskilled" },
                ]}
                placeholder="Select type"
              />
              <InputField
                label="Date"
                type="date"
                name="date"
                register={register}
                errors={errors}
                placeholder="Select date"
              />
              <InputField
                label="Time In"
                type="time"
                name="timeIn"
                register={register}
                errors={errors}
                placeholder="Enter time in"
              />
              <InputField
                label="Time Out"
                type="time"
                name="timeOut"
                register={register}
                errors={errors}
                placeholder="Enter time out"
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

export default AddDailyLabourSite;
