import React from "react";
import LOGO from "../../../assets/images/romaa logo.png";
import Icon from "../../../assets/images/logo icon.png";
import Title from "../../../components/Title";

const ViewPurchaseOrder = () => {
  return (
    <>
    <Title title="Purchase Management" sub_title="View PO" page_title="View Purchase Order"/>
    <div className="w-2/5  mx-auto bg-white px-10 py-16  font-roboto-flex">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Purchase Order</h1>
          <p className="text-sm font-semibold">ID: #6859798</p>
        </div>
        <img src={LOGO} alt="ROMAA Logo" className="w-32 h-auto" />
      </div>

      <div className="flex text-sm justify-between mb-6">
        <div>
          <p className="font-semibold">Project Name</p>
          <p className="opacity-85 font-extralight">Project</p>
        </div>
        <div>
          <p className="font-semibold">Due Date</p>
          <p className="opacity-85 font-extralight">01.05.2025</p>
        </div>
        <div>
          <p className="font-semibold">Location</p>
          <p className="opacity-85 font-extralight">Chennai</p>
        </div>
      </div>

      <div className="flex text-sm justify-between mb-6">
        <div>
          <p className="font-semibold">Vendor</p>
          <p className="opacity-85 font-extralight">Name</p>
        </div>
        <div>
          <p className="font-semibold">Vendor Category</p>
          <p className="opacity-85 font-extralight">Category</p>
        </div>
      </div>

      <table
        className="w-full text-sm text-center border border-collapse mb-10 relative "
        style={{
          backgroundImage: `url(${Icon})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "contain",
        }}
      >
        <thead>
          <tr>
            <th className="border-gray-400 border p-2 font-medium">S.no</th>
            <th className="border-gray-400 border font-medium">Material</th>
            <th className="border-gray-400 border font-medium">Qty</th>
            <th className="border-gray-400 border font-medium">Unit</th>
            <th className="border-gray-400 border font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-gray-400 border-x p-2  font-extralight">1</td>
            <td className="border-gray-400 border-x font-extralight">
              Raw Material
            </td>
            <td className="border-gray-400 border-x font-extralight">4</td>
            <td className="border-gray-400 border-x  font-extralight">M3</td>
            <td className="border-gray-400 border-x font-extralight">₹ 4537</td>
          </tr>
          <tr>
            <td
              colSpan={4}
              className="border border-gray-400 p-2 text-right font-bold"
            >
              Total
            </td>
            <td className="border border-gray-400 p-2 font-bold">₹ 4537</td>
          </tr>
        </tbody>
      </table>

      {/* Terms */}
      <div className="mb-6 text-sm">
        <p className="font-semibold">Terms and conditions</p>
        <p className="text-xs font-light text-gray-600 mt-1">
          Lorem ipsum dolor sit amet consectetur. Lorem non condimentum pharetra
          ultrices sit ullamcorper. Aliquet egestas id lectus sodales mus
          interdum. Consectetur nulla faucibus volutpat et habitant pharetra
          faucibus amet. Iaculis viverra pulvinar sed sed posuere elementum
          molestie faucibus.
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-between  text-sm">
        <div>
          <p className="font-semibold">Note:</p>
          <p>
            Requested By: <span className="text-gray-700 text-xs">Name</span>
          </p>
          <p>
            Account No: <span className="text-gray-700 text-xs">XXXXXXX</span>
          </p>
        </div>
        <div className="text-right">
          <p className="italic text-lg mb-2">Signature</p>
          <hr />
          <p className="text-xs font-light text-center mt-2 italic">
            Signature
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default ViewPurchaseOrder;
