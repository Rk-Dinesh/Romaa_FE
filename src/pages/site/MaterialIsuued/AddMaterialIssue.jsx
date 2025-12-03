import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Modal from "../../../components/Modal";
import { InputField } from "../../../components/InputField";
import { API } from "../../../constant";
import { toast } from "react-toastify";

// Yup validation schema
const schema = yup.object().shape({
  site_name: yup.string().required("Site Name is required"),
  item_description: yup.string().required("Material is required"),
  unit: yup.string().required("Unit is required"),
  received_quantity: yup.number().required(),
  issued_quantity: yup
    .number()
    .typeError("Invalid quantity")
    .required("Issued Quantity is required")
    .min(1, "Issued quantity must be at least 1"),
  work_location: yup.string().required("Work Location is required"),
  issued_by: yup.string().required("Requested By is required"),
});

const AddMaterialIssue = ({ onclose, onSuccess }) => {
  const tenderId = localStorage.getItem("tenderId");
  const [materials, setMaterials] = useState([]);
  const [receivedQty, setReceivedQty] = useState(0);
  const [issuedError, setIssuedError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Fetch materials with balance > 0 (only show usable materials)
  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`${API}/material/getall/${tenderId}`);
      const allMaterials = res.data.data || [];

      // Filter materials that still have balance left
      const filtered = allMaterials.filter((mat) => {
        const totalIssued = mat.issued
          ? mat.issued.reduce((sum, r) => sum + r.issued_quantity, 0)
          : 0;

        const balance = mat.received_quantity - totalIssued;

        return balance > 0; // only show items with balance
      });

      setMaterials(filtered);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  useEffect(() => {
    if (tenderId) fetchMaterials();
  }, [tenderId]);

  // When material changes
  const handleMaterialChange = (e) => {
    const selected = e.target.value;
    const found = materials.find((m) => m.item_description === selected);

    if (found) {
      // calculate total issued
      const totalIssued = found.issued
        ? found.issued.reduce((sum, r) => sum + r.issued_quantity, 0)
        : 0;

      const balance = found.received_quantity - totalIssued;

      setValue("unit", found.unit);
      setValue("received_quantity", balance); // <-- SHOW BALANCE instead of original

      setReceivedQty(balance);
    } else {
      setValue("unit", "");
      setValue("received_quantity", 0);
      setReceivedQty(0);
    }
  };

  // Validate issued qty does not exceed received qty
  const validateIssuedQty = (e) => {
    const value = Number(e.target.value);

    if (value > receivedQty) {
      setIssuedError("Issued quantity cannot exceed received quantity");
    } else {
      setIssuedError("");
    }
  };

  // Submit form
  const onSubmit = async (data) => {
    if (Number(data.issued_quantity) > receivedQty) {
      setIssuedError("Issued quantity cannot exceed received quantity");
      return;
    }

    const payload = {
      tender_id: tenderId,
      item_description: data.item_description,
      unit: data.unit,
      received_quantity: data.received_quantity,
      issued_quantity: data.issued_quantity,
      site_name: data.site_name.toLowerCase(),
      work_location: data.work_location,
      issued_by: data.issued_by,
    };

    try {
      await axios.post(`${API}/material/addissued`, payload);
      toast.success("Material issued successfully!");

      if (onSuccess) onSuccess();
      onclose();
    } catch (error) {
      console.error("Error issuing material:", error);
      toast.error("Failed to issue material");
    }
  };

  return (
    <Modal
      title={"Add Material Issue"}
      onclose={onclose}
      widthClassName={"lg:w-[500px] md:w-[500px] w-[96]"}
      child={
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-6">
            <div className="lg:space-y-4 space-y-3">
              {/* Site Name */}
              <InputField
                label="Site Name"
                type="text"
                name="site_name"
                register={register}
                errors={errors}
                placeholder="Enter Site Name"
              />

              {/* Material Dropdown */}
              <div>
                <label className="text-sm font-medium">Material</label>
                <select
                  {...register("item_description")}
                  onChange={handleMaterialChange}
                  className="w-full bg-layout-dark mt-1 p-2 border rounded text-sm"
                >
                  <option value="">Select Material</option>
                  {materials.map((mat, idx) => (
                    <option key={idx} value={mat.item_description}>
                      {mat.item_description}
                    </option>
                  ))}
                </select>

                {errors.item_description && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.item_description.message}
                  </p>
                )}
              </div>

              {/* Unit */}
              <InputField
                label="Unit"
                type="text"
                name="unit"
                register={register}
                errors={errors}
                readOnly
              />

              {/* Received Quantity */}
              <InputField
                label="Available Quantity"
                type="number"
                name="received_quantity"
                register={register}
                errors={errors}
                readOnly
              />

              {/* Issued Quantity */}
              <div>
                <label className="text-sm font-medium">Issued Quantity</label>
                <input
                  type="number"
                  {...register("issued_quantity")}
                  onChange={validateIssuedQty}
                  className="w-full bg-layout-dark mt-1 p-2 border rounded text-sm"
                  placeholder="Enter Issued Quantity"
                />
                {(issuedError || errors.issued_quantity) && (
                  <p className="text-xs text-red-500 mt-1">
                    {issuedError || errors.issued_quantity.message}
                  </p>
                )}
              </div>

              {/* Work Location */}
              <InputField
                label="Work Location"
                type="text"
                name="work_location"
                register={register}
                errors={errors}
                placeholder="Enter Work Location"
              />


              {/* Requested By */}
              <InputField
                label="Issued By"
                type="text"
                name="issued_by"
                register={register}
                errors={errors}
                placeholder="Enter Issued By"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mx-5 text-xs flex justify-end gap-2 mb-4">
            <button
              type="button"
              onClick={onclose}
              className="border dark:border-white dark:text-white border-darkest-blue text-darkest-blue px-6 py-2 rounded"
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

export default AddMaterialIssue;
