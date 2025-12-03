import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { IoClose } from "react-icons/io5";

// Validation Schema
const schema = Yup.object().shape({
  assetName: Yup.string().required("Asset Name is required"),
  assetType: Yup.string().required("Asset Type is required"),
  serialNumber: Yup.string().required("Serial Number is required"),
  modelNumber: Yup.string().required("Model Number is required"),
  manufacturer: Yup.string().required("Manufacturer is required"),
  capacity: Yup.string().required("Capacity is required"),
  fuelType: Yup.string().required("Fuel Type is required"),
  purchaseCost: Yup.number()
    .typeError("Purchase Cost must be a number")
    .required("Purchase Cost is required"),
  purchaseDate: Yup.string().required("Purchase Date is required"),
});

const Machinery = ({ onSubmit, onclose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <div className="font-roboto-flex fixed inset-0 flex justify-center items-center backdrop-blur-xs backdrop-grayscale-50 drop-shadow-lg z-20">
      <div className="dark:bg-layout-dark bg-white rounded-lg drop-shadow-md w-[700px]">
        <p
          className="grid place-self-end cursor-pointer -mx-4 -my-4 dark:bg-layout-dark bg-white shadow-sm py-2.5 px-2.5 rounded-full"
          onClick={onclose}
        >
          <IoClose className="size-[20px]" />
        </p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6"
        >
          {/* Asset Name */}
          <div>
            <label className="font-medium text-sm">Asset Name *</label>
            <input
              {...register("assetName")}
              placeholder="Enter asset name"
              className="w-full border border-input-bordergrey rounded px-3 py-2 mt-1"
            />
            <p className="text-red-500 text-xs">{errors.assetName?.message}</p>
          </div>

          {/* Asset Type */}
          <div>
            <label className="font-medium text-sm">Asset Type *</label>
            <input
              {...register("assetType")}
              placeholder="Enter asset type (e.g., JCB, Excavator)"
              className="w-full border border-input-bordergrey rounded px-3 py-2 mt-1"
            />
            <p className="text-red-500 text-xs">{errors.assetType?.message}</p>
          </div>

          {/* Serial Number */}
          <div>
            <label className="font-medium text-sm">Serial Number *</label>
            <input
              {...register("serialNumber")}
              placeholder="Enter serial number"
              className="w-full border border-input-bordergrey rounded px-3 py-2 mt-1"
            />
            <p className="text-red-500 text-xs">{errors.serialNumber?.message}</p>
          </div>

          {/* Model Number */}
          <div>
            <label className="font-medium text-sm">Model Number *</label>
            <input
              {...register("modelNumber")}
              placeholder="Enter model number"
              className="w-full border border-input-bordergrey rounded px-3 py-2 mt-1"
            />
            <p className="text-red-500 text-xs">{errors.modelNumber?.message}</p>
          </div>

          {/* Manufacturer */}
          <div>
            <label className="font-medium text-sm">Manufacturer *</label>
            <input
              {...register("manufacturer")}
              placeholder="Enter manufacturer"
              className="w-full border border-input-bordergrey rounded px-3 py-2 mt-1"
            />
            <p className="text-red-500 text-xs">{errors.manufacturer?.message}</p>
          </div>

          {/* Capacity */}
          <div>
            <label className="font-medium text-sm">Capacity *</label>
            <input
              {...register("capacity")}
              placeholder="Enter capacity (e.g., 1.2 Cum Bucket)"
              className="w-full border border-input-bordergrey rounded px-3 py-2 mt-1"
            />
            <p className="text-red-500 text-xs">{errors.capacity?.message}</p>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="font-medium text-sm">Fuel Type *</label>
            <select
              {...register("fuelType")}
              className="w-full border border-input-bordergrey bg-layout-dark rounded px-3 py-2 mt-1"
            >
              <option value="">Select fuel type</option>
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
              <option value="Electric">Electric</option>
            </select>
            <p className="text-red-500 text-xs">{errors.fuelType?.message}</p>
          </div>

          {/* Purchase Cost */}
          <div>
            <label className="font-medium text-sm">Purchase Cost *</label>
            <input
              type="number"
              {...register("purchaseCost")}
              placeholder="Enter purchase cost"
              className="w-full border border-input-bordergrey rounded px-3 py-2 mt-1"
            />
            <p className="text-red-500 text-xs">{errors.purchaseCost?.message}</p>
          </div>

          {/* Purchase Date */}
          <div>
            <label className="font-medium text-sm">Purchase Date *</label>
            <input
              type="date"
              {...register("purchaseDate")}
              placeholder="Select purchase date"
              className="w-full border border-input-bordergrey rounded px-3 py-2 mt-1"
            />
            <p className="text-red-500 text-xs">{errors.purchaseDate?.message}</p>
          </div>

          {/* Submit */}
          <div className="col-span-2 pt-3 place-self-end">
            <button
              type="submit"
              className="bg-darkest-blue text-white px-6 py-2 rounded-lg "
            >
              Save 
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Machinery;
