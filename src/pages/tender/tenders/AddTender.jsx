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

  const clientIdOptions = clients.map((c) => ({
    value: c.client_id,
    label: c.client_id,
  }));

  const clientNameOptions = clients.map((c, i) => ({
    value: c.client_name,
    label: c.client_name,
    key: `${c.client_id}-${i}`,
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
    try {
      setLoading(true);
      await axios.post(`${API}/tender/addtender`, data);
      if (onSuccess) onSuccess();
      onclose();
      toast.success("Tender created successfully ✅");
    } catch (err) {
      toast.error("Failed to create tender");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* ✅ HEIGHT FIXED MODAL WRAPPER */
    <div className="font-roboto-flex fixed inset-0 z-20 flex items-center justify-center bg-black/30">
      {/* ✅ MODAL CARD */}
      <div
        className="mx-2 w-full max-w-4xl bg-white dark:bg-overall_bg-dark rounded-md shadow-lg
                      max-h-[100vh] overflow-hidden"
      >
        <p
          onClick={onclose}
          className="place-self-end cursor-pointer dark:bg-overall_bg-dark bg-white rounded-full "
 disabled={loading}
>
          <IoClose className="size-[24px]" />
        </p>

        <h1 className="text-center font-medium text-2xl ">Add Tender</h1>

        {/* ✅ FLEX FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col h-full mx-6"
        >
          {/* ✅ SCROLLABLE CONTENT */}
          <div
            className="grid lg:grid-cols-2 grid-cols-1 gap-6 px-2 py-2
                          overflow-y-auto max-h-[90vh] "
          >
            {/* LEFT */}
            <div className="space-y-4">
              <InputField
                label="Tender Name"
                name="tender_name"
                placeholder="Enter tender name"
                register={register}
                errors={errors}
              />

              <InputField
                label="Tender Published Date"
                name="tender_start_date"
                type="date"
                placeholder="Select published date"
                register={register}
                errors={errors}
              />

                <InputField
                  label="Tender Type"
                  type="select"
                  name="tender_type"
                  register={register}
                  placeholder="Select tender type"
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
                placeholder="Select client ID"
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
                placeholder="Select client name"
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
                placeholder="Enter contact person name"
                register={register}
                errors={errors}
              />

              <InputField
                label="Phone Number"
                name="tender_contact_phone"
                type="number"
                placeholder="Enter 10 digit phone number"
                register={register}
                errors={errors}
              />

              <InputField
                label="Contact Email"
                name="tender_contact_email"
                type="email"
                placeholder="Enter email address"
                register={register}
                errors={errors}
              />

              <InputField
                label="City"
                name="tender_location.city"
                placeholder="Enter city"
                register={register}
                errors={errors}
              />
            </div>

            {/* RIGHT */}
            <div className="space-y-2">
              <InputField
                label="State"
                name="tender_location.state"
                placeholder="Enter state"
                register={register}
                errors={errors}
              />

              <InputField
                label="Country"
                name="tender_location.country"
                placeholder="Enter country"
                register={register}
                errors={errors}
              />

              <InputField
                label="Pincode"
                name="tender_location.pincode"
                placeholder="Enter 6 digit pincode"
                register={register}
                errors={errors}
              />

              <InputField
                label="Project Duration"
                name="tender_duration"
                placeholder="Eg: 12 Months"
                register={register}
                errors={errors}
              />

              <InputField
                label="Consider Completion"
                name="consider_completion_duration"
                placeholder="Eg: 10 Months"
                register={register}
                errors={errors}
              />

              <InputField
                label="Tender Value"
                name="tender_value"
                type="number"
                placeholder="Enter tender value"
                register={register}
                errors={errors}
              />

              <InputField
                label="Bid Submission Date"
                name="tender_end_date"
                type="date"
                placeholder="Select due date"
                register={register}
                errors={errors}
              />

              <InputField
                label="EMD Value"
                name="emd.emd_amount"
                type="number"
                placeholder="Enter EMD amount"
                register={register}
                errors={errors}
              />

              <InputField
                label="EMD Expiry Date"
                name="emd.emd_validity"
                type="date"
                placeholder="Select EMD expiry date"
                register={register}
                errors={errors}
              />
              <InputField
              label="Description"
              type="textarea"
              name="tender_description"
              placeholder="Enter tender description (max 500 characters)"
              register={register}
              errors={errors}
            />
            </div>
            
          </div>

          {/* ✅ FIXED BUTTON BAR */}
          <div
            className="sticky bottom-0 bg-white dark:bg-overall_bg-dark px-6 py-3
                          flex justify-end gap-2 "
          >
            <button
              type="button"
              onClick={onclose}
               disabled={loading}
              className="border px-6 py-2 rounded"
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
  );
};

export default AddTender;
