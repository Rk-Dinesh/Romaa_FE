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
  item_name: yup.string().required("Item code is required"),
  description: yup.string().required("Item description is required"),
  specification: yup.string().required("Specification is required"),
  unit: yup.string().required("Unit is required"),
  quantity: yup
    .number()
    .typeError("Quantity must be a number")
    .positive("Must be greater than 0")
    .required("Quantity is required"),
  final_unit_rate: yup
    .number()
    .typeError("Final unit rate must be a number")
    .min(0)
    .required("Final unit rate is required"),
  zero_cost_unit_rate: yup
    .number()
    .typeError("Zero cost unit rate must be a number")
    .min(0)
    .required("Zero cost unit rate is required"),
  category: yup.string().required("Category is required"),
  remarks: yup.string(),
  work_section: yup.string().required("Work section is required"),

  // These are required only when creating a new BOQ
  prepared_by: yup.string().when("$isNewBoq", {
    is: true,
    then: (schema) => schema.required("Prepared by is required"),
    otherwise: (schema) => schema.notRequired()
  }),
  prepared_date: yup.date().nullable(),
  approved_by: yup.string(),
  approved_date: yup.date().nullable(),
  status: yup.string().when("$isNewBoq", {
    is: true,
    then: (schema) => schema.required("Status is required"),
    otherwise: (schema) => schema.notRequired()
  }),
});

const AddBoq = ({ onclose,  onSuccess }) => {
  const { tender_id } = useParams();
  
  const [isNewBoq, setIsNewBoq] = useState(false);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema, { context: { isNewBoq } }),
  });


  useEffect(() => {
    const checkBoq = async () => {
      try {
        const res = await axios.get(`${API}/boq/by-tender/${tender_id}`);
        if (!res.data.data || Object.keys(res.data.data).length === 0) {
          setIsNewBoq(true); 
        } else {
          setIsNewBoq(false); 
        }
      } catch (error) {
        console.error(error);
        setIsNewBoq(true); 
      } finally {
        setLoading(false);
      }
    };
    checkBoq();
  }, [tender_id]);

const onSubmit = async (data) => {
  try {
    let payload; 

    if (isNewBoq) {
      payload = {
        tender_id,
        items: [
          {
            item_name: data.item_name,
            description: data.description,
            specification: data.specification,
            unit: data.unit,
            quantity: data.quantity,
            final_unit_rate: data.final_unit_rate,
            zero_cost_unit_rate: data.zero_cost_unit_rate,
            category: data.category,
            remarks: data.remarks,
            work_section: data.work_section
          }
        ],
        prepared_by: data.prepared_by,
        prepared_date: data.prepared_date,
        approved_by: data.approved_by,
        approved_date: data.approved_date,
        status: data.status
      };
    } else {
      payload = {
        tender_id,
        items: [
          {
            item_name: data.item_name,
            description: data.description,
            specification: data.specification,
            unit: data.unit,
            quantity: data.quantity,
            final_unit_rate: data.final_unit_rate,
            zero_cost_unit_rate: data.zero_cost_unit_rate,
            category: data.category,
            remarks: data.remarks,
            work_section: data.work_section
          }
        ]
      };
    }

    await axios.post(`${API}/boq/addboq`, payload);
    if (onSuccess) onSuccess();
    onclose();

  } catch (error) {
    console.error(error);
    alert("Failed to add BOQ item");
  }
};



  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  return (
    <Modal
      title="Add BOQ Item"
      widthClassName="lg:w-[800px] md:w-[700px] w-96"
      onclose={onclose}
      child={
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-5 px-6 py-6">

            {/* Always required fields for adding an item */}
            <InputField label="Item Code" name="item_name" register={register} errors={errors} placeholder="Enter item code" />
            <InputField label="Specification" name="specification" register={register} errors={errors} placeholder="Enter specification" />
            <InputField label="Unit" name="unit" register={register} errors={errors} placeholder="Enter unit" />
            <InputField label="Quantity" name="quantity" register={register} errors={errors} placeholder="Enter quantity" />
            <InputField label="Final Unit Rate" name="final_unit_rate" register={register} errors={errors} placeholder="Enter final unit rate" />
            <InputField label="Zero Cost Unit Rate" name="zero_cost_unit_rate" register={register} errors={errors} placeholder="Enter zero cost unit rate" />
            <InputField label="Category" name="category" register={register} errors={errors} placeholder="Enter category" />
            <InputField label="Remarks" name="remarks" register={register} errors={errors} placeholder="Enter remarks" />
            <InputField label="Work Section" name="work_section" register={register} errors={errors} placeholder="Enter work section" />
            <InputField label="Description" name="description" type="textarea" register={register} errors={errors} placeholder="Enter description" colInp="col-span-8" colLab="col-span-8" />
            {isNewBoq && (
              <>
                <InputField label="Prepared By" name="prepared_by" register={register} errors={errors} placeholder="Enter prepared by" />
                <InputField label="Prepared Date" name="prepared_date" type="date" register={register} errors={errors} />
                <InputField label="Approved By" name="approved_by" register={register} errors={errors} placeholder="Enter approved by" />
                <InputField label="Approved Date" name="approved_date" type="date" register={register} errors={errors} />
                <InputField label="Status" name="status" type="select" register={register} errors={errors}
                  options={[
                    { value: "Draft", label: "Draft" },
                    { value: "Verified", label: "Verified" },
                    { value: "Finalized", label: "Finalized" }
                  ]}
                />
              </>
            )}
          </div>

          <div className="mx-5 text-xs flex justify-end gap-2 mb-4">
            <button type="button" onClick={onclose} className="border px-6 py-2 rounded">Cancel</button>
            <button type="submit" className="px-6 bg-darkest-blue text-white rounded">Save</button>
          </div>
        </form>
      }
    />
  );
};

export default AddBoq;
