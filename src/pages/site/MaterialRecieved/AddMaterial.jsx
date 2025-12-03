import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Modal from "../../../components/Modal";
import { InputField } from "../../../components/InputField";
import { toast } from "react-toastify";
import { API } from "../../../constant";

const schema = yup.object().shape({
  requestId: yup.string().required("Request ID is required"),
  item_description: yup.string().required("Material is required"),
  ordered_date: yup.date().required("Ordered Date is required"),
  received_quantity: yup
    .number()
    .typeError("Received Qty must be a number")
    .required("Received Qty is required")
    .min(0, "Cannot be negative"),
});

const AddMaterial = ({ onclose,onSuccess }) => {
  const tenderId = localStorage.getItem("tenderId");
  const [materials, setMaterials] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const received_quantity = watch("received_quantity") || 0;

  

  // Fetch materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get(`${API}/material/getall/${tenderId}`);
        setMaterials(res.data.data || []);
      } catch (err) {
        console.error("Error fetching materials:", err);
      }
    };

    const fetchRequestId = async () => {
    try {
  const res = await axios.get(
    `${API}/purchaseorderrequest/api/getbyId/${tenderId}`
  );

  // Filter requests with status "Request Raised"
  const pendingRequests = (res.data?.data || []).filter(
    (r) => r.status === "Request Raised"
  );

  setRequests(pendingRequests);
} catch {
  toast.error("No Purchase Requests Found");
}
  }
    fetchMaterials();
    fetchRequestId();
  }, [tenderId]);

  const handleRequestSelect = (e) => {
    const requestId = e.target.value;
    setValue("requestId", requestId);
  }

  // Material selection
  const handleMaterialSelect = (e) => {
    const materialName = e.target.value;
    const mat = materials.find((m) => m.item_description === materialName);
    setSelectedMaterial(mat);

    if (mat) {
      setValue("unit", mat.unit);
      setValue("quantity", mat.quantity);
      setValue("total_amount", mat.total_amount);
      setValue("received_quantity", "");
      clearErrors("received_quantity");
    } else {
      setSelectedMaterial(null);
      reset();
    }
  };

  // Validate and auto-update pending
  useEffect(() => {
    if (!selectedMaterial) return;

    const totalQty = Number(selectedMaterial.quantity || 0);
    const typedQty = Number(received_quantity || 0);
    const alreadyReceived = Number(selectedMaterial.received_quantity || 0);
    const newPending = Math.max(totalQty - (alreadyReceived + typedQty), 0);

    // Live validation: prevent exceeding total quantity
    if (typedQty + alreadyReceived > totalQty) {
      setError("received_quantity", {
        type: "manual",
        message: `Cannot exceed PO Qty (${totalQty})`,
      });
    } else {
      clearErrors("received_quantity");
    }

    // Update pending qty only if it changed
    const currentPending = watch("pending_quantity");
    if (currentPending !== newPending) {
      setValue("pending_quantity", newPending);
    }
  }, [received_quantity, selectedMaterial]);

  // Submit handler
  const onSubmit = async (data) => {
    try {
      const payload = {
        tender_id: tenderId,
        item_description: data.item_description,
        requestId: data.requestId,
        unit: data.unit,
        quantity: data.quantity,
        received_quantity: data.received_quantity,
        pending_quantity: data.pending_quantity,
        ordered_date: data.ordered_date,
        total_amount: data.total_amount,
      };

      await axios.post(`${API}/material/addreceived`, payload);
      if(onSuccess) onSuccess();
      toast.success("Material received successfully!");
      reset();
      onclose();
    } catch (err) {
      console.error("Error saving material:", err);
      toast.error(err.response?.data?.error || "Failed to save material");
    }
  };

  // Compute pending dynamically for display
  const totalQty = selectedMaterial?.quantity || 0;
  const alreadyReceived = selectedMaterial?.received_quantity || 0;
  const pending = Math.max(
    totalQty - (alreadyReceived + Number(received_quantity || 0)),
    0
  );

  return (
    <Modal
      title="Add Material Received"
      onclose={onclose}
      widthClassName="lg:w-[500px] md:w-[500px] w-[96]"
      child={
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-6">
            <div className="lg:space-y-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-white">
                  Request ID
                </label>
                <select
                  {...register("requestId")}
                  onChange={handleRequestSelect}
                  className="w-full border border-gray-300 rounded p-2 mt-1 bg-layout-dark"
                >
                  <option value="">Select Request</option>
                {requests.map((r, i) => (
                  <option key={i} value={r.requestId}>
                    {r.requestId}
                  </option>
                ))}
                </select>
                {errors.requestId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.requestId.message}
                  </p>
                )}
              </div>
              {/* Material Dropdown */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-white">
                  Material
                </label>
                <select
                  {...register("item_description")}
                  onChange={handleMaterialSelect}
                  className="w-full border border-gray-300 rounded p-2 mt-1 bg-layout-dark"
                >
                  <option value="">Select Material</option>
                  {materials.map((mat, index) => (
                    <option
                      key={mat._id || `${mat.item_description}-${index}`}
                      value={mat.item_description}
                    >
                      {mat.item_description}
                    </option>
                  ))}
                </select>
                {errors.item_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.item_description.message}
                  </p>
                )}
              </div>

              {/* Autofilled fields */}
              <InputField
                label="Unit"
                type="text"
                name="unit"
                register={register}
                errors={errors}
                readOnly
              />
              <InputField
                label="BOQ Qty"
                type="number"
                name="quantity"
                register={register}
                errors={errors}
                readOnly
              />
              {/* <InputField
                label="Amount"
                type="number"
                name="total_amount"
                register={register}
                errors={errors}
                readOnly
              /> */}

              {/* Editable fields */}
              <InputField
                label="Received Qty"
                type="number"
                name="received_quantity"
                register={register}
                errors={errors}
                placeholder="Enter Received Qty"
              />
              <InputField
                label="Pending"
                type="number"
                name="pending_quantity"
                register={register}
                errors={errors}
                value={pending}
                readOnly
              />
              <InputField
                label="Received Date"
                type="date"
                name="ordered_date"
                register={register}
                errors={errors}
              />
            </div>
          </div>

          <div className="mx-5 text-xs flex lg:justify-end md:justify-center justify-center gap-2 mb-4">
            <button
              type="button"
              onClick={onclose}
              className="cursor-pointer border dark:border-white dark:text-white border-darkest-blue text-darkest-blue px-6 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer px-6 bg-darkest-blue text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      }
    />
  );
};

export default AddMaterial;
