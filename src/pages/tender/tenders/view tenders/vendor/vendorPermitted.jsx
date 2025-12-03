import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Modal from "../../../../../components/Modal";
import { InputField } from "../../../../../components/InputField";
import { API } from "../../../../../constant";
import { useParams } from "react-router-dom";

// ✅ Validation Schema
const schema = yup.object().shape({
  type: yup.string().required("Vendor Type is required"),
  vendor_id: yup.string().required("Vendor ID is required"),
  company_name: yup.string().required("Vendor Name is required"),
  agreement_start: yup.date().required("Agreement Start Date is required"),
  agreement_end: yup.date().nullable(),
  permitted_by: yup.string().required("Permitted By is required"),
  permitted_status: yup
    .string()
    .oneOf(["APPROVED", "PENDING", "REJECTED"])
    .required("Permitted Status is required"),
  remarks: yup.string().nullable(),
});

const AddPermittedVendor = ({ onclose, onSuccess }) => {
  const { tender_id } = useParams();
  const [vendors, setVendors] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const vendorType = watch("type");
  const vendorId = watch("vendor_id");
  const vendorName = watch("company_name");

  useEffect(() => {
    if (vendorType) {
      axios
        .get(`${API}/vendor/getallvendorsselect?type=${vendorType}`)
        .then((res) => {
          setVendors(res.data.data || []);
          console.log("Fetched vendors", res.data.data);

          setValue("vendor_id", "");
          setValue("company_name", "");
        })
        .catch((err) => {
          console.error("Failed to fetch vendors", err);
          setVendors([]);
        });
    } else {
      setVendors([]);
      setValue("vendor_id", "");
      setValue("company_name", "");
    }
  }, [vendorType, setValue]);

  useEffect(() => {
    if (vendorId) {
      const found = vendors.find((v) => v.vendor_id === vendorId);
      if (found && found.company_name !== vendorName) {
        setValue("company_name", found.company_name);
      }
    }
  }, [vendorId, setValue]);

  useEffect(() => {
    if (vendorName) {
      const found = vendors.find((v) => v.company_name === vendorName);
      if (found && found.vendor_id !== vendorId) {
        setValue("vendor_id", found.vendor_id);
      }
    }
  }, [vendorName, setValue]);

const onSubmit = async (data) => {
  try {
   
    const vendors = [
      {
        vendor_id: data.vendor_id,
        type: data.type,
        vendor_name: data.company_name,
        agreement_start: new Date(data.agreement_start),
        agreement_end: new Date(data.agreement_end),
        permitted_by: data.permitted_by,
        permitted_status: data.permitted_status,
        remarks: data.remarks,
      },
    ];

    const payload = {
      tender_id: tender_id, 
      vendors: vendors, 
    };

    console.log("Payload", payload);

    await axios.post(`${API}/permittedvendor/add`, payload);
    if (onSuccess) onSuccess();
    reset();
    onclose();
  } catch (error) {
    console.error(error);
    alert("Failed to add permitted vendor");
  }
};


  return (
    <Modal
      title="Add Permitted Vendor"
      widthClassName="lg:w-[600px] md:w-[500px] w-96"
      onclose={onclose}
      child={
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-5 px-6 py-6">
            <InputField
              label="Vendor Type"
              name="type"
              type="select"
              register={register}
              errors={errors}
              placeholder="Select Vendor type"
              options={[
                { label: "Cement Supplier", value: "Cement Supplier" },
                { label: "Steel Supplier", value: "Steel Supplier" },
                { label: "Sand Supplier", value: "Sand Supplier" },
                { label: "Aggregate Supplier", value: "Aggregate Supplier" },
                { label: "Bricks Supplier", value: "Bricks Supplier" },
                {
                  label: "Electrical Contractor",
                  value: "Electrical Contractor",
                },
                {
                  label: "Plumbing Contractor",
                  value: "Plumbing Contractor",
                },
                { label: "Paint Supplier", value: "Paint Supplier" },
                { label: "Tiles Supplier", value: "Tiles Supplier" },
                { label: "Wood Supplier", value: "Wood Supplier" },
              ]}
            />
            <InputField
              label="Vendor ID"
              type="select"
              name="vendor_id"
              register={register}
              errors={errors}
              options={vendors.map((v) => ({
                label: v.vendor_id,
                value: v.vendor_id,
              }))}
              onChange={(e) => {
                const selectedId = e.target.value;
                setValue("vendor_id", selectedId);
                const found = vendors.find((v) => v.vendor_id === selectedId);
                if (found)
                  setValue("company_name", found.company_name, {
                    shouldValidate: true,
                  });
              }}
            />

            <InputField
              label="Vendor Name"
              type="select"
              name="company_name"
              register={register}
              errors={errors}
              options={vendors.map((v) => ({
                label: v.company_name,
                value: v.company_name,
              }))}
              onChange={(e) => {
                const selectedName = e.target.value;
                setValue("company_name", selectedName);
                const found = vendors.find(
                  (v) => v.company_name === selectedName
                );
                if (found)
                  setValue("vendor_id", found.vendor_id, {
                    shouldValidate: true,
                  });
              }}
            />

            <InputField
              label="Remarks"
              name="remarks"
              register={register}
              errors={errors}
              placeholder="Optional remarks"
            />
            <InputField
              label="Agreement Start Date"
              name="agreement_start"
              type="date"
              register={register}
              errors={errors}
            />
            <InputField
              label="Agreement End Date"
              name="agreement_end"
              type="date"
              register={register}
              errors={errors}
            />
            <InputField
              label="Permitted By"
              name="permitted_by"
              register={register}
              errors={errors}
              placeholder="Enter person who permitted"
            />
            <InputField
              label="Permitted Status"
              name="permitted_status"
              type="select"
              register={register}
              errors={errors}
              options={[
                { value: "APPROVED", label: "Approved" },
                { value: "PENDING", label: "Pending" },
                { value: "REJECTED", label: "Rejected" },
              ]}
            />
          </div>

          <div className="mx-5 text-xs flex justify-end gap-2 mb-4">
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
      }
    />
  );
};

export default AddPermittedVendor;
