import React from "react";
import Modal from "../../../../../components/Modal";
import { TbFileInvoice } from "react-icons/tb";
import Button from "../../../../../components/Button";

const UploadModal = ({ onclose }) => {
  return (
    <>
      <Modal
        widthClassName="lg:w-[720px] md:w-[620px] w-96"
        onclose={onclose}
        title="Upload Assets"
        child={
          <>
            <form className="flex items-center justify-center py-2">
              <label
                for="dropzone-file"
                class="flex flex-col items-center justify-center  w-[650px] border-2 border-gray-300  rounded-lg cursor-pointer "
              >
                <div className="flex flex-col justify-center items-center py-2 text-darkest-blue">
                  <p className="">
                    <TbFileInvoice size={40} className="stroke-1" />
                  </p>
                  <p className=" py-2">Upload Assets</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" />
              </label>
            </form>
            <div className="flex justify-end items-center gap-2 py-8 mx-6 text-sm font-extralight">
              <p
                type="button"
                onClick={onclose}
                className="cursor-pointer  border  border-darkest-blue  text-darkest-blue px-6 py-2   rounded"
              >
                Cancel
              </p>
              <p
                type="submit"
                className="cursor-pointer px-6 py-2 bg-darkest-blue text-white  rounded"
              >
                Save
              </p>
            </div>
          </>
        }
      />
    </>
  );
};

export default UploadModal;
