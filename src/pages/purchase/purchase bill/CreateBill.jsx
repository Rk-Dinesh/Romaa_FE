import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "../../../components/Modal";
import { InputField } from "../../../components/InputField";

const schema = yup.object().shape({
  materialname: yup.string().required("Material Name is required"),
  cost: yup.string().required("Cost is required"),
  hsncode: yup.string().required("HSN Code is required"),
  quantity: yup.string().required("Quantity is required"),
  gst: yup.string().required("GST% is required"),
  unit: yup.string().required("Unit is required"),
});

const CreateBill = ({ onclose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log(data);
    onclose();
  };

  return (
    <Modal
      title="Create Bill"
      widthClassName="lg:w-[450px] md:w-[420px] w-96"
      onclose={onclose}
      child={
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 px-6 py-6">
            <div className="space-y-4">
              <InputField
                label="Material Name"
                name="materialname"
                register={register}
                errors={errors}
                placeholder="Type Here"
              />
              <InputField
                label="Cost"
                name="cost"
                register={register}
                errors={errors}
                placeholder="Type Here"
              />
              <InputField
                label="HSN Code"
                name="hsncode"
                register={register}
                errors={errors}
                placeholder="Type Here"
              />
              <InputField
                label="Quantity"
                name="quantity"
                register={register}
                errors={errors}
                placeholder="Type Here"
              />
              <InputField
                label="GST%"
                name="gst"
                register={register}
                errors={errors}
                placeholder="Type Here"
              />
              <InputField
                label="Unit"
                name="unit"
                register={register}
                errors={errors}
                placeholder="Type Here"
              />
            </div>
          </div>
          <div className="mx-5 text-xs flex lg:justify-end md:justify-center justify-center gap-2 mb-4">
            <button
              type="button"
              onClick={onclose}
              className="cursor-pointer border dark:border-white dark:text-white  border-darkest-blue text-darkest-blue px-6 py-2 rounded"
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

export default CreateBill;
