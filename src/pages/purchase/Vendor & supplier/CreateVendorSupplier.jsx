import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "../../../components/Modal";
import { InputField } from "../../../components/InputField";
import { useState } from "react";
import axios from "axios";
import { API } from "../../../constant"; // your API base URL
import { toast } from "react-toastify";

const schema = yup.object().shape({
  type: yup.string().required("Vendor Type is required"),
  company_name: yup.string().required("Company name is required"),
  contact_person: yup.string().required("Contact Person is required"),
  contact_phone: yup.string().required("Contact phone is required"),
  contact_email: yup.string().email().required("Email is required"),
  address_street: yup.string().required("Street address is required"),
  address_city: yup.string().required("City is required"),
  address_state: yup.string().required("State is required"),
  address_country: yup.string().required("Country is required"),
  address_pincode: yup.string().required("Pincode is required"),
  gstin: yup.string().required("GSTIN is required"),
  pan_no: yup.string().required("PAN No is required"),
  account_name: yup.string().required("Bank Account Name is required"),
  account_number: yup.string().required("Bank Account Number is required"),
  bank_name: yup.string().required("Bank Name is required"),
  ifsc_code: yup.string().required("IFSC Code is required"),
  branch: yup.string().required("Branch Name is required"),
  status: yup.string().required("Status is required"),
});

const CreateVendorSupplier = ({ onclose ,onSuccess}) => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    const payload = {
      type: data.type,
      company_name: data.company_name,
      contact_person: data.contact_person,
      contact_phone: data.contact_phone,
      contact_email: data.contact_email,
      address: {
        street: data.address_street,
        city: data.address_city,
        state: data.address_state,
        country: data.address_country,
        pincode: data.address_pincode,
      },
      gstin: data.gstin,
      pan_no: data.pan_no,
      bank_details: {
        account_name: data.account_name,
        account_number: data.account_number,
        bank_name: data.bank_name,
        ifsc_code: data.ifsc_code,
        branch: data.branch,
      },
      status: data.status,
    };

    try {
      setLoading(true); // start loader
      const res = await axios.post(`${API}/vendor/addvendor`, payload);

      toast.success("Vendor created successfully");
      if (onSuccess) onSuccess();

      onclose();
    } catch (error) {
      console.error("Error creating vendor:", error);
      toast.error(error.response?.data?.message || "Failed to create vendor");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <Modal
      title="Create Vendor"
      widthClassName="lg:w-[800px] md:w-[700px] w-96"
      onclose={onclose}
      child={
        <>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4 px-6 py-6">
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
                label="Company Name"
                name="company_name"
                register={register}
                errors={errors}
                placeholder="Enter company name"
              />
              <InputField
                label="Contact Person"
                name="contact_person"
                register={register}
                errors={errors}
                placeholder="Enter contact person"
              />
              <InputField
                label="Contact Phone"
                name="contact_phone"
                register={register}
                errors={errors}
                placeholder="Enter phone"
              />
              <InputField
                label="Contact Email"
                type="email"
                name="contact_email"
                register={register}
                errors={errors}
                placeholder="Enter email"
              />

              <InputField
                label="Street Address"
                name="address_street"
                register={register}
                errors={errors}
                placeholder="Enter street"
              />
              <InputField
                label="City"
                name="address_city"
                register={register}
                errors={errors}
                placeholder="Enter city"
              />
              <InputField
                label="State"
                name="address_state"
                register={register}
                errors={errors}
                placeholder="Enter state"
              />
              <InputField
                label="Country"
                name="address_country"
                register={register}
                errors={errors}
                placeholder="Enter country"
              />
              <InputField
                label="Pincode"
                name="address_pincode"
                register={register}
                errors={errors}
                placeholder="Enter pincode"
              />

              <InputField
                label="GSTIN"
                name="gstin"
                register={register}
                errors={errors}
                placeholder="Enter GSTIN"
              />
              <InputField
                label="PAN No"
                name="pan_no"
                register={register}
                errors={errors}
                placeholder="Enter PAN No"
              />

              <InputField
                label="Bank Account Name"
                name="account_name"
                register={register}
                errors={errors}
                placeholder="Enter account name"
              />
              <InputField
                label="Bank Account Number"
                name="account_number"
                register={register}
                errors={errors}
                placeholder="Enter account number"
              />
              <InputField
                label="Bank Name"
                name="bank_name"
                register={register}
                errors={errors}
                placeholder="Enter bank name"
              />
              <InputField
                label="IFSC Code"
                name="ifsc_code"
                register={register}
                errors={errors}
                placeholder="Enter IFSC code"
              />
              <InputField
                label="Branch Name"
                name="branch"
                register={register}
                errors={errors}
                placeholder="Enter branch name"
              />

              <InputField
                label="Status"
                type="select"
                name="status"
                register={register}
                errors={errors}
                options={[
                  { label: "ACTIVE", value: "ACTIVE" },
                  { label: "INACTIVE", value: "INACTIVE" },
                  { label: "BLACKLISTED", value: "BLACKLISTED" },
                ]}
              />
            </div>
            <div className="mx-5 text-xs flex lg:justify-end md:justify-center justify-center gap-2 mb-4">
              <button
                type="button"
                onClick={onclose}
                disabled={loading} 
                className={`cursor-pointer border dark:border-white dark:text-white border-darkest-blue text-darkest-blue px-6 py-2 rounded ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading} 
                className={`cursor-pointer px-6 text-white rounded ${
                  loading ? "bg-gray-500 cursor-not-allowed" : "bg-darkest-blue"
                }`}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </>
      }
    />
  );
};

export default CreateVendorSupplier;
