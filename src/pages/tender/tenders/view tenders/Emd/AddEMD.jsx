import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { InputField } from "../../../../../components/InputField";
import { useParams } from "react-router-dom";
import { API } from "../../../../../constant";

const schema = yup.object().shape({
  payment_date: yup.date().required("Date is required"),
  company_name: yup.string().required("Company name is required"),
  proposed_amount: yup
    .number()
    .typeError("Proposed value must be a number")
    .required("Proposed value is required")
    .min(0, "Proposed value cannot be negative"),
  emd_value: yup
    .number()
    .typeError("EMD value must be a number")
    .required("EMD value is required")
    .min(0, "EMD value cannot be negative"),
  payment_bank: yup.string().required("Bank name is required"),
  payment_method: yup.string().nullable(),
  dd_no: yup
    .string()
    .required("DD_NO value is required"),
  level: yup.string().required("Level is required"),
  status: yup
    .string()
    .oneOf(["SUBMITTED", "PENDING", "REJECTED"])
    .required("Permitted Status is required"),
  notes: yup.string().nullable(),
});

const AddEMD = ({ onclose, onSuccess }) => {
  const { tender_id } = useParams();
  const [emdData, setEmdData] = useState([]);
  const fetchEMD = async () => {
    try {
      const res = await axios.get(`${API}/tender/gettenderemd/${tender_id}`);
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
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        company_name: data.company_name,
        proposed_amount: Number(data.proposed_amount),
        emd_amount: Number(data.emd_value),
        payment_date: data.payment_date,
        payment_bank: data.payment_bank,
        payment_method: data.payment_method,
        dd_no: data.dd_no,
        level: data.level,
        status: data.status,
        notes: data.notes,
        created_by_user: "ADMIN",
      };

      await axios.post(`${API}/emd/addproposal/${tender_id}`, payload);
      if (onSuccess) onSuccess();
      onclose();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to add EMD proposal");
    }
  };

  return (
    <div className="font-roboto-flex fixed inset-0 grid justify-center items-center backdrop-blur-xs backdrop-grayscale-50  drop-shadow-lg z-20">
      <div className="mx-2 shadow-lg py-2 dark:bg-layout-dark bg-white  rounded-md w-[420px]">
        <div className="grid">
          <button
            onClick={onclose}
            className=" place-self-end   cursor-pointer dark:bg-layout-dark bg-white  rounded-full lg:-mx-4 md:-mx-4 -mx-2 lg:-my-6 md:-my-5  -my-3 lg:shadow-md md:shadow-md shadow-none lg:py-2.5 md:py-2.5 py-0 lg:px-2.5 md:px-2.5 px-0 "
          >
            <IoClose className="size-[24px]" />
          </button>
          <h1 className="text-center font-medium text-xl py-2">Add Emd</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid  px-6 py-6">
              <div className="space-y-4">
                <InputField
                  label="Date"
                  name="payment_date"
                  type="date"
                  register={register}
                  errors={errors}
                />

                <InputField
                  label="Company Name"
                  name="company_name"
                  register={register}
                  errors={errors}
                  placeholder="Enter company name"
                />

                <InputField
                  label="Bid Value"
                  name="proposed_amount"
                  type="number"
                  register={register}
                  errors={errors}
                  placeholder="Enter proposed value"
                />

                <InputField
                  label="EMD Value"
                  name="emd_value"
                  type="number"
                  register={register}
                  errors={errors}
                  placeholder="Enter EMD value"
                />

                <InputField
                  label="Bank Name"
                  name="payment_bank"
                  register={register}
                  errors={errors}
                  placeholder="Enter bank name"
                />

                <InputField
                  label="Payment Method"
                  name="payment_method"
                  register={register}
                  errors={errors}
                  placeholder="Enter payment method"
                />
                <InputField
                  label="DD No"
                  name="dd_no"
                  // type="number"
                  register={register}
                  errors={errors}
                  placeholder="Enter DD number"
                />
                <InputField
                  label="Level"
                  name="level"
                  register={register}
                  errors={errors}
                  placeholder="Enter level"
                />

                <InputField
                  label="Status"
                  name="status"
                  type="select"
                  register={register}
                  errors={errors}
                  options={[
                    { value: "SUBMITTED", label: "Submitted" },
                    { value: "PENDING", label: "Pending" },
                    { value: "REJECTED", label: "Rejected" },
                  ]}
                />

                <InputField
                  label="Notes"
                  name="notes"
                  register={register}
                  errors={errors}
                  placeholder="Enter notes"
                />
              </div>
            </div>
            <div className="mx-5 text-xs flex lg:justify-end md:justify-center justify-center gap-2 mb-4">
              <button
                type="button"
                onClick={onclose}
                className="cursor-pointer  border dark:border-white border-darkest-blue dark:text-white text-darkest-blue px-6 py-2   rounded"
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

export default AddEMD;
