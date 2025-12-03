import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../../constant";

// Validation Schema
const workOrderSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  siteDetails: yup.object().shape({
    siteName: yup.string().required("Site name required"),
    location: yup.string().required("Location required"),
    siteIncharge: yup.string().required("Site incharge required"),
  }),
  requiredByDate: yup.string().required("Required by date is required"),
});

const defaultValues = {
  title: "",
  description: "",
  siteDetails: { siteName: "", location: "", siteIncharge: "" },
  requiredByDate: "",
};

const CreateRequest = ({ onclose, onSuccess }) => {
  const tenderId = localStorage.getItem("tenderId");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(workOrderSchema),
    defaultValues,
  });

  const [materials, setMaterials] = useState([]);
  const [materialInput, setMaterialInput] = useState({
    materialName: "",
    quantity: "",
    unit: "",
  });
  const [loading, setLoading] = useState(false);

  const handleMaterialAdd = () => {
    const { materialName, quantity, unit } = materialInput;
    if (!materialName || !quantity || !unit) {
      toast.warning("Please fill all material fields before adding.");
      return;
    }

    setMaterials((prev) => [...prev, { materialName, quantity, unit }]);
    setMaterialInput({ materialName: "", quantity: "", unit: "" });
  };

  const handleMaterialDelete = (index) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    if (materials.length === 0) {
      toast.warning("Please add at least one material.");
      return;
    }

    const finalData = {
      ...data,
      projectId: tenderId,
      materialsRequired: materials,
    };

    try {
      setLoading(true);
      const res = await axios.post(
        `${API}/workorderrequest/api/create`,
        finalData
      );

      toast.success("Work order created successfully!");
      reset();
      onSuccess();
      setMaterials([]);
      onclose();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Server error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-layout-dark w-full max-w-4xl rounded-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4">
          <p className="text-2xl mb-2 text-center font-semibold text-white">
            Create Work Order Request
          </p>
          <button
            onClick={onclose}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <IoClose size={28} />
          </button>
        </div>

        {/* Form */}
        <form className="p-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {/* Left: Request Details */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">
                Request Details
              </h2>
              <input
                {...register("title")}
                className="w-full border border-border-dark-grey rounded px-3 py-2 mb-4 text-white placeholder:text-white"
                placeholder="Title"
              />
              <p className="text-xs text-red-500">{errors.title?.message}</p>

              <textarea
                rows={4}
                {...register("description")}
                className="w-full border border-border-dark-grey placeholder:text-white rounded px-3 py-2 mb-4 text-white"
                placeholder="Description"
              />
              <p className="text-xs text-red-500">
                {errors.description?.message}
              </p>
            </section>

            {/* Right: Site Details */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">
                Site Details
              </h2>
              <input
                {...register("siteDetails.siteName")}
                className="w-full border border-border-dark-grey placeholder:text-white rounded px-3 py-2 mb-4 text-white"
                placeholder="Site Name"
              />
              <p className="text-xs text-red-500">
                {errors.siteDetails?.siteName?.message}
              </p>

              <input
                {...register("siteDetails.location")}
                className="w-full border border-border-dark-grey rounded px-3 py-2 mb-4 placeholder:text-white text-white"
                placeholder="Location"
              />
              <p className="text-xs text-red-500">
                {errors.siteDetails?.location?.message}
              </p>

              <input
                {...register("siteDetails.siteIncharge")}
                className="w-full border border-border-dark-grey rounded px-3 py-2 mb-4 text-white placeholder:text-white"
                placeholder="Site Incharge"
              />
              <p className="text-xs text-red-500">
                {errors.siteDetails?.siteIncharge?.message}
              </p>
            </section>

            {/* Date Field */}
            <section>
              <label className="font-medium text-white">Required By Date</label>
              <input
                type="date"
                {...register("requiredByDate")}
                className="w-full border border-border-dark-grey text-white rounded px-3 py-2 mt-3 placeholder:text-white"
              />
              <p className="text-xs text-red-500">
                {errors.requiredByDate?.message}
              </p>
            </section>

            {/* Materials Section */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-2">
                Work Details
              </h2>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <input
                  value={materialInput.materialName}
                  onChange={(e) =>
                    setMaterialInput({
                      ...materialInput,
                      materialName: e.target.value,
                    })
                  }
                  className="border border-border-dark-grey rounded px-3 py-2 text-white placeholder:text-white w-40"
                  placeholder="work description "
                />
                <input
                  value={materialInput.quantity}
                  onChange={(e) =>
                    setMaterialInput({
                      ...materialInput,
                      quantity: e.target.value,
                    })
                  }
                  type="number"
                  className="border border-border-dark-grey rounded px-3 py-2 text-white placeholder:text-white w-24"
                  placeholder="Qty"
                />
                <input
                  value={materialInput.unit}
                  onChange={(e) =>
                    setMaterialInput({
                      ...materialInput,
                      unit: e.target.value,
                    })
                  }
                  className="border border-border-dark-grey rounded px-3 py-2 text-white placeholder:text-white w-24"
                  placeholder="Unit"
                />
                <button
                  type="button"
                  onClick={handleMaterialAdd}
                  className="bg-darkest-blue text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>

              {materials.length > 0 && (
                <table className="w-full text-white text-sm border border-border-dark-grey">
                  <thead>
                    <tr className="bg-[#1f1f1f] text-left">
                      <th className="px-3 py-2 border border-border-dark-grey">
                        #
                      </th>
                      <th className="px-3 py-2 border border-border-dark-grey">
                        Material
                      </th>
                      <th className="px-3 py-2 border border-border-dark-grey">
                        Qty
                      </th>
                      <th className="px-3 py-2 border border-border-dark-grey">
                        Unit
                      </th>
                      <th className="px-3 py-2 border border-border-dark-grey">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((mat, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 border border-border-dark-grey">
                          {i + 1}
                        </td>
                        <td className="px-3 py-2 border border-border-dark-grey">
                          {mat.materialName}
                        </td>
                        <td className="px-3 py-2 border border-border-dark-grey">
                          {mat.quantity}
                        </td>
                        <td className="px-3 py-2 border border-border-dark-grey">
                          {mat.unit}
                        </td>
                        <td className="px-3 py-2 border border-border-dark-grey">
                          <button
                            type="button"
                            onClick={() => handleMaterialDelete(i)}
                            className="text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>

          {/* Submit / Cancel Buttons */}
          <div className="flex justify-end mt-8 space-x-3">
            <button
              type="button"
              onClick={onclose}
              className="px-6 py-3 rounded border border-gray-400 text-gray-300 hover:bg-gray-800"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#142e56] text-white font-semibold px-6 py-3 rounded hover:bg-blue-700"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequest;
