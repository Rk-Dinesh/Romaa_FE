import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { InputField } from "../../../../../components/InputField";
import axios from "axios";
import { API } from "../../../../../constant";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// ✅ Yup validation schema
const schema = yup.object().shape({
  workOrder_id: yup.string().required("Work Order ID is required"),
  workOrder_issued_date: yup.date().required("Issued Date is required"),
});

const ApproveTender = ({ onclose}) => {
  const { tender_id } = useParams();
  const [tenderData, setTenderData] = useState({});

  const fetchTender = async () => {
    try {
      const res = await axios.get(`${API}/tender/gettenderforApprove/${tender_id}`);
      if (res.data.status && res.data.data) {
        setTenderData(res.data.data || {});
      } else {
        setTenderData({});
      }
    } catch (error) {
      toast.error("Failed to load tender data");
    }
  };

  useEffect(() => {
    fetchTender();
  }, [tender_id]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      workOrder_id: "",
      workOrder_issued_date: "",
    },
  });

  
  const onSubmit = async (formData) => {
    try {
     console.log(formData);
     
      const res = await axios.put(
        `${API}/tender/update-workorder/${tender_id}`,
        formData
      );

      if (res.data.success) {
        toast.success("Tender approved successfully");
        onclose()
        // if (onApprove) onApprove(formData);
      } else {
        toast.error("Failed to approve tender");
      }
    } catch (error) {
      toast.error("Error approving tender");
    }
  };

  return (
    <div className="font-roboto-flex fixed inset-0 flex justify-center items-center backdrop-blur-xs backdrop-grayscale-50 drop-shadow-lg z-20">
      <div className="dark:bg-layout-dark bg-white rounded-lg drop-shadow-md w-[420px]">
     
        <p
          className="grid place-self-end cursor-pointer -mx-4 -my-4 dark:bg-layout-dark bg-white shadow-sm py-2.5 px-2.5 rounded-full"
          onClick={onclose}
        >
          <IoClose className="size-[20px]" />
        </p>

     
        <form
          className="grid grid-cols-12 justify-center items-center text-sm gap-4 px-8 py-8"
          onSubmit={handleSubmit(onSubmit)}
        >
          <p className="pb-6 text-center font-semibold text-lg col-span-12">
            Approve Tender
          </p>

          {[
            { label: "Tender ID", value: tenderData.tender_id },
            { 
              label: "Tender Published Date", 
              value: tenderData.tender_start_date
                ? new Date(tenderData.tender_start_date).toLocaleDateString("en-GB")
                : ""
            },
            { label: "Tender Process Type", value: tenderData.tender_process_type || "" },
            { label: "Tender Type", value: tenderData.tender_type || "" },
            { label: "Project Location", value: tenderData.tender_location?.city || "" },
            { label: "Project Type", value: tenderData.tender_name || "" },
            { label: "Contact Person", value: tenderData.tender_contact_person || "" },
            { label: "Contact Person Location", value: tenderData.tender_location?.city || "" },
            { label: "Contact Number", value: tenderData.tender_contact_phone || "" },
            { label: "Email ID", value: tenderData.tender_contact_email || "" },
            { 
              label: "Address",
              value: [
                tenderData.tender_location?.city,
                tenderData.tender_location?.state,
                tenderData.tender_location?.pincode,
                tenderData.tender_location?.country
              ].filter(Boolean).join(", ")
            },
          ].map((item, index) => (
            <React.Fragment key={index}>
              <label className="font-semibold col-span-6">{item.label}</label>
              <p className="text-sm font-light col-span-6 truncate">{item.value}</p>
            </React.Fragment>
          ))}

         
          <div className="col-span-12">
            <InputField
              label="Work Order ID"
              name="workOrder_id"
              register={register}
              errors={errors}
              placeholder="Enter Work Order ID"
            />
          </div>

          <div className="col-span-12">
            <InputField
              label="Issued Date"
              name="workOrder_issued_date"
              register={register}
              errors={errors}
              placeholder="Enter Issued Date"
              type="date"
            />
          </div>

         
          <div className="col-span-12 flex justify-end items-center gap-2 py-4">
            <p
              className="cursor-pointer border dark:border-white border-black px-6 py-1.5 rounded-sm"
              onClick={onclose}
            >
              Cancel
            </p>
            <button
              type="submit"
              className="cursor-pointer bg-darkest-blue text-white px-6 py-1.5 rounded-sm"
            >
              Approve
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApproveTender;
