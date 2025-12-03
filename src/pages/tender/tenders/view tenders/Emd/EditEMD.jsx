import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { InputField } from "../../../../../components/InputField";
import { useParams } from "react-router-dom";
import { API } from "../../../../../constant";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  status: yup
    .string()
    .oneOf(["APPROVED"])
    .required("Permitted Status is required"),
  level: yup.string().required("Level is required"),
  security_deposit: yup.object({
    security_deposit_amount: yup
      .number()
      .typeError("Security Deposit must be a number")
      .required("SD is required"),
    security_deposit_validity: yup
      .date()
      .required("SD Expiry Date is required"),
  }),
});

const EditEMD = ({ onclose, item, onUpdated }) => {
  const { tender_id } = useParams();
  const [emdData, setEmdData] = useState([]);
  const fetchEMD = async () => {
    try {
      const res = await axios.get(`${API}/emd/getemd/${tender_id}`);
      if (res.data.status && res.data.data) {
        console.log(res.data.data);

        setEmdData(res.data.data || []);
      } else {
        setEmdData([]);
      }
    } catch {
      toast.error("Failed to load EMD data");
    }
  };

  useEffect(() => {
    fetchEMD();
  }, [tender_id]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      status: "",
      level: "",
       security_deposit: { security_deposit_amount: "", security_deposit_validity: "" },
    },
  });
  const onSubmit = async (data) => {
    console.log(data);

    try {
      // Check if user is trying to approve this proposal
      if (data.status === "APPROVED") {
        // Check whether any other proposal already has APPROVED status
        const alreadyApproved = emdData.proposals.some(
          (p) => p.status === "APPROVED"
        );

        console.log(alreadyApproved);

        if (alreadyApproved) {
          const confirmChange = window.confirm(
            "There is already an approved proposal. Approving this will change the old one to Pending. Continue?"
          );
          if (!confirmChange) {
            return; // stop execution if user cancels
          }
        }
      }

      // Now proceed with your update API call
      const res = await axios.put(
        `${API}/emd/updateproposal/${tender_id}/${item.proposal_id}`,
        data
      );

      if (onUpdated) onUpdated();
      onclose();
      toast.success("Approved");
    } catch (error) {
      console.error(error);
      toast.error("Error updating proposal");
    }
  };

  return (
    <div className="fixed inset-0 grid justify-center items-center backdrop-blur-xs backdrop-grayscale-50 drop-shadow-lg z-20 font-roboto-flex">
      <div className="mx-2 shadow-lg py-2 dark:bg-layout-dark bg-white rounded-md w-[420px]">
        <div className="grid">
          <button
            onClick={onclose}
            className="place-self-end cursor-pointer rounded-full"
          >
            <IoClose className="size-[24px]" />
          </button>
          <h1 className="text-center font-medium text-xl py-2">Edit EMD</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid px-6 py-6 space-y-4">
              <InputField
                label="Status"
                name="status"
                type="select"
                register={register}
                errors={errors}
                options={[{ value: "APPROVED", label: "Approved" }]}
              />
              <InputField
                label="Level"
                name="level"
                register={register}
                errors={errors}
                placeholder="Enter level"
              />
              <InputField
                label="Security Deposit Amount"
                name="security_deposit.security_deposit_amount"
                register={register}
                errors={errors}
                placeholder="Enter amount"
                type="number"
              />
              <InputField
                label=" Expiry Date"
                name="security_deposit.security_deposit_validity"
                type="date"
                register={register}
                errors={errors}
              />
            </div>
            <div className="mx-5 flex justify-end gap-2 mb-4">
              <button
                type="button"
                onClick={onclose}
                className="border px-6 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 bg-darkest-blue text-white rounded"
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

export default EditEMD;
