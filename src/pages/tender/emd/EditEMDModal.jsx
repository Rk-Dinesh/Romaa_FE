import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { InputField } from "../../../components/InputField";
import { API } from "../../../constant";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  emd_deposit_amount_collected: yup
    .number()
    .typeError("Amount must be a number")
    .required("Amount is required")
    .min(0, "Amount cannot be negative"),
  emd_note: yup.string().required("Note is required"),
});

const EditEMDModal = ({item, onclose, onUpdated }) => {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {

    try {
      const res = await axios.post(
        `${API}/tender/updateemdamount/${item.tender_id}`,
        data
      );
      console.log(res);
      
      toast.success(" Updated successfully ✅");
      if (onUpdated) onUpdated();
      onclose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add client ❌");
    } finally {
      //setSaving(false);
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
          <h1 className="text-center font-medium text-xl py-2">
            Edit EMD Amount
          </h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid  px-6 py-6">
              <div className="space-y-4">
                <InputField
                  label="Amount Collected"
                  name="emd_deposit_amount_collected"
                  type="number"
                  register={register}
                  errors={errors}
                  placeholder="Enter amount"
                />
                <InputField
                  label="Notes"
                  name="emd_note"
                  type="textarea"
                  register={register}
                  errors={errors}
                  placeholder="Enter description"
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

export default EditEMDModal;
