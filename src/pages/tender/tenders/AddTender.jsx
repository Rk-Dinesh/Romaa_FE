import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { IoClose } from "react-icons/io5";
import { InputField } from "../../../components/InputField";
import axios from "axios";
import { API } from "../../../constant";
import Select from "react-select";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  tender_name: yup.string().required("Tender Name is required"),
  tender_start_date: yup.date().required("Published Date is required"),
  tender_type: yup
    .string()
    .oneOf(
      ["item rate contarct", "percentage", "lumpsum"],
      "Invalid Tender Type"
    )
    .required("Tender Type is required"),
  client_id: yup.string().required("Client ID is required"),
  client_name: yup.string().required("Client Name is required"),
  tender_contact_person: yup.string().required("Contact Person is required"),
  tender_contact_phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone Number must be exactly 10 digits")
    .required("Phone Number is required"),
  tender_contact_email: yup
    .string()
    .email("Invalid email")
    .required("Contact Email is required"),
  tender_location: yup.object({
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    country: yup.string().required("Country is required"),
    pincode: yup
      .string()
      .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
      .required("Pincode is required"),
  }),

  tender_duration: yup.string().required("Project Duration is required"),
  consider_completion_duration: yup.string().required("Consider Completion Duration is required"),
  tender_value: yup
    .number()
    .typeError("Proposal Cost must be a number")
    .positive("Proposal Cost must be a positive number")
    .required("Proposal Cost is required"),
  tender_end_date: yup.date().required("Due Date is required"),

  // ✅ Nested schema for emd
  emd: yup.object({
    emd_amount: yup
      .number()
      .typeError("EMD must be a number")
      .required("EMD is required"),
    emd_validity: yup.date().required("EMD Expiry Date is required"),
  }),

  tender_description: yup
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .required("Description is required"),
});

const AddTender = ({ onclose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/client/getallclients`)
      .then((res) => setClients(res.data.data))
      .catch((err) => console.error("Error fetching clients", err));
  }, []);

 const clientIdOptions = clients.map(c => ({
  value: c.client_id,
  label: c.client_id
}));

const clientNameOptions = clients.map((c, i) => ({
  value: c.client_name,
  label: c.client_name,
  key: `${c.client_id}-${i}` // ensures uniqueness
}));

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      client_id: "",
      client_name: "",
      tender_name: "",
      tender_start_date: "",
      tender_type: "",
      tender_duration: "",
      consider_completion_duration: "",
      tender_value: "",
      tender_end_date: "",
      emd: { emd_amount: "", emd_validity: "" },
      tender_description: "",
      tender_location: { city: "", state: "", country: "", pincode: "" },
      tender_contact_person: "",
      tender_contact_phone: "",
      tender_contact_email: "",
    },
  });

  const client_id = watch("client_id");
  const client_name = watch("client_name");

  useEffect(() => {
    if (client_id) {
      const found = clients.find((c) => c.client_id === client_id);
      if (found)
        setValue("client_name", found.client_name, { shouldValidate: true });
    }
  }, [client_id]);

  useEffect(() => {
    if (client_name) {
      const found = clients.find((c) => c.client_name === client_name);
      if (found)
        setValue("client_id", found.client_id, { shouldValidate: true });
    }
  }, [client_name]);

  const onSubmit = async (data) => {
    console.log("submitted", data);

    try {
      setLoading(true);
      await axios.post(`${API}/tender/addtender`, data);
      if (onSuccess) onSuccess();
      onclose();
      toast.success("Tender created successfully ✅");
    } catch (err) {
      console.error("Error creating tender:", err);
      alert(err.response?.data?.message || "Failed to create tender");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-roboto-flex fixed inset-0 grid justify-center items-center backdrop-blur-xs backdrop-grayscale-50 drop-shadow-lg z-20">
      <div className="mx-2 shadow-lg py-2 dark:bg-overall_bg-dark bg-white rounded-md">
        <div className="grid">
          <button
            onClick={onclose}
            className="place-self-end cursor-pointer dark:bg-overall_bg-dark bg-white rounded-full lg:-mx-4 md:-mx-4 -mx-2 lg:-my-6 md:-my-5 -my-3"
            disabled={loading}
          >
            <IoClose className="size-[24px]" />
          </button>

          <h1 className="text-center font-medium text-2xl py-2">Add Tender</h1>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid lg:grid-cols-2 grid-cols-1 lg:gap-8 gap-4 px-6 lg:py-6 py-2">
              {/* Left column */}
              <div className="lg:space-y-6 space-y-2">
                <InputField
                  label="Tender Name"
                  name="tender_name"
                  register={register}
                  errors={errors}
                  placeholder="Enter tender name"
                />
                <InputField
                  label="Tender Published Date"
                  name="tender_start_date"
                  type="date"
                  register={register}
                  errors={errors}
                />

                <InputField
                  label="Tender Type"
                  type="select"
                  name="tender_type"
                  register={register}
                  errors={errors}
                  options={[
                    {
                      value: "item rate contarct",
                      label: "Item Rate contract",
                    },
                    { value: "percentage", label: "Percentage" },
                    { value: "lumpsum", label: "Lumpsum" },
                  ]}
                />
                <InputField
                  label="Client ID"
                  type="select"
                  name="client_id"
                  register={register}
                  errors={errors}
                   options={clientIdOptions}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setValue("client_id", selectedId);
                    const found = clients.find(
                      (c) => c.client_id === selectedId
                    );
                    if (found)
                      setValue("client_name", found.client_name, {
                        shouldValidate: true,
                      });
                  }}
                />

                <InputField
                  label="Client Name"
                  type="select"
                  name="client_name"
                  register={register}
                  errors={errors}
                   options={clientNameOptions}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    setValue("client_name", selectedName);
                    const found = clients.find(
                      (c) => c.client_name === selectedName
                    );
                    if (found)
                      setValue("client_id", found.client_id, {
                        shouldValidate: true,
                      });
                  }}
                />

                <InputField
                  label="Contact Person"
                  name="tender_contact_person"
                  register={register}
                  errors={errors}
                  placeholder="Enter contact person"
                />
                <InputField
                  label="Phone Number"
                  name="tender_contact_phone"
                  register={register}
                  errors={errors}
                  placeholder="Enter phone number"
                  type="number"
                />
                <InputField
                  label="Contact Email"
                  name="tender_contact_email"
                  type="email"
                  register={register}
                  errors={errors}
                  placeholder="Enter contact email"
                />

                <InputField
                  label="City"
                  name="tender_location.city"
                  register={register}
                  errors={errors}
                  placeholder="Enter city"
                />
              </div>

              {/* Right column */}
              <div className="lg:space-y-4 space-y-2">
                {/* Full location fields */}
                <InputField
                  label="State"
                  name="tender_location.state"
                  register={register}
                  errors={errors}
                  placeholder="Enter state"
                />
                <InputField
                  label="Country"
                  name="tender_location.country"
                  register={register}
                  errors={errors}
                  placeholder="Enter country"
                />
                <InputField
                  label="Pincode"
                  name="tender_location.pincode"
                  register={register}
                  errors={errors}
                  placeholder="Enter pincode"
                />

                <InputField
                  label="Project Duration"
                  name="tender_duration"
                  register={register}
                  errors={errors}
                  placeholder="Enter duration"
                />
                 <InputField
                  label="Consider Completion "
                  name="consider_completion_duration"
                  register={register}
                  errors={errors}
                  placeholder="Enter duration"
                />
                <InputField
                  label="Tender Value"
                  name="tender_value"
                  register={register}
                  errors={errors}
                  placeholder="Enter cost"
                   type="number"
                />
                <InputField
                  label="Bid Submission Date"
                  name="tender_end_date"
                  type="date"
                  register={register}
                  errors={errors}
                />
                <InputField
                  label="EMD Value"
                  name="emd.emd_amount"
                  register={register}
                  errors={errors}
                  placeholder="Enter EMD Value"
                   type="number"
                />
                <InputField
                  label="EMD Expiry Date"
                  name="emd.emd_validity"
                  type="date"
                  register={register}
                  errors={errors}
                />
                <InputField
                  label="Description"
                  type="textarea"
                  name="tender_description"
                  register={register}
                  errors={errors}
                  placeholder="Enter description"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="mx-5 text-xs flex lg:justify-end md:justify-center justify-center gap-2 mb-4">
              <button
                type="button"
                onClick={onclose}
                disabled={loading}
                className="cursor-pointer border border-darkest-blue dark:border-white px-6 py-2 rounded"
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
        </div>
      </div>
    </div>
  );
};

export default AddTender;
