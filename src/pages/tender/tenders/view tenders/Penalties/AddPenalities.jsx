import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Modal from "../../../../../components/Modal";
import { InputField } from "../../../../../components/InputField";
import { API } from "../../../../../constant";
import { useParams } from "react-router-dom";

const schema = yup.object().shape({
  penalty_type: yup.string().required("Penalty type is required"),
  penalty_amount: yup
    .number()
    .typeError("Penalty amount must be a number")
    .required("Penalty amount is required")
    .positive("Penalty amount must be positive"),
  penalty_date: yup.date().required("Penalty date is required"),
  description: yup.string().required("Description is required"),
  status: yup
    .string()
    .oneOf(["pending", "paid", "waived"], "Status is required")
    .required("Status is required"),
});

const AddPenalty = ({ onclose, onSuccess }) => {
  const { tender_id } = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        tender_id,
        listOfPenalties: [
          {
            penalty_type: data.penalty_type,
            penalty_amount: data.penalty_amount,
            penalty_date: data.penalty_date,
            description: data.description,
            status: data.status,
          },
        ],
      };

      await axios.post(`${API}/penalty/add`, payload);
      if (onSuccess) onSuccess();
      reset();
      onclose();
    } catch (error) {
      console.error(error);
      alert("Failed to add penalty");
    }
  };

  return (
    <Modal
      title="Add Penalty"
      widthClassName="lg:w-[600px] md:w-[500px] w-96"
      onclose={onclose}
      child={
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-5 px-6 py-6">
            <InputField
              label="Penalty Type"
              name="penalty_type"
              type="select"
              register={register}
              errors={errors}
              options={[
                { value: "late delivery", label: "Late Delivery" },
                { value: "non-compliance", label: "Non Compliance" },
                { value: "damage", label: "Damage" },
                { value: "other", label: "Other" },
              ]}
            />
            <InputField
              label="Penalty Amount"
              name="penalty_amount"
              type="number"
              register={register}
              errors={errors}
              placeholder="Enter penalty amount"
            />
            <InputField
              label="Penalty Date"
              name="penalty_date"
              type="date"
              register={register}
              errors={errors}
            />
            <InputField
              label="Description"
              name="description"
              type="text"
              register={register}
              errors={errors}
              placeholder="Enter description"
            />
            <InputField
              label="Status"
              name="status"
              type="select"
              register={register}
              errors={errors}
              options={[
                { value: "pending", label: "Pending" },
                { value: "paid", label: "Paid" },
                { value: "waived", label: "Waived" },
              ]}
            />
          </div>
          <div className="mx-5 text-xs flex justify-end gap-2 mb-4">
            <button type="button" onClick={onclose} className="border px-6 py-2 rounded">
              Cancel
            </button>
            <button type="submit" className="px-6 bg-darkest-blue text-white rounded">
              Save
            </button>
          </div>
        </form>
      }
    />
  );
};

export default AddPenalty;
