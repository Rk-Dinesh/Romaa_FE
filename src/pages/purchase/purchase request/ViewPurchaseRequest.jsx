import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate} from "react-router-dom";
import Button from "../../../components/Button";
import Title from "../../../components/Title";
import { AiOutlineFileAdd } from "react-icons/ai";
import axios from "axios";
import RequestRegister from "./RequestRegister";
import { API } from "../../../constant";

const requestFields = [
  { label: "Request ID", key: "requestId" },
  { label: "Date", key: "requestDate" },
  { label: "Project", key: "projectName" },
  { label: "Date of Requirements", key: "requiredByDate" },
  { label: "Requested by", key: "requestedBy" },
];

const ViewPurchaseRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const requestId = location.state?.item.requestId;
  const projectId = location.state?.item.projectName;
  const [requestRegister, setRequestRegister] = useState(false);
  const [requestData, setRequestData] = useState(null);
  const [materials, setMaterials] = useState([]);

  // Fetch purchase request by requestId
  const fetchRequest = async () => {
    try {
      const res = await axios.get(
        `${API}/purchaseorderrequest/api/getdetailbyId/${projectId}/${requestId}`
      );
      const data = res.data?.data;

      if (data) {
        setRequestData({
          requestId: data.requestId,
          requestDate: new Date(data.requestDate).toLocaleDateString(),
          projectName: data.projectData?.projectName || data.projectId,
          requiredByDate: new Date(data.requiredByDate).toLocaleDateString(),
          requestedBy: data.siteDetails?.siteIncharge || "-", // fallback if not in API
        });
        setMaterials(
          data.materialsRequired.map((mat) => ({
            material: mat.materialName,
            units: mat.unit,
            quantity: mat.quantity,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching request:", err);
    }
  };

  useEffect(() => {
    if (requestId) fetchRequest();
  }, [requestId]);

  if (!requestData) return <p className="p-6">Loading...</p>;

  return (
    <>
      <div className="h-full">
        {/* Header */}
        <div className="flex justify-between items-center h-1/12">
          <Title
            title="Purchase Management"
            sub_title="Purchase Requests"
            page_title="Purchase Requests"
          />
          <Button
            button_name="Request Register"
            button_icon={<AiOutlineFileAdd size={24} />}
            onClick={() => setRequestRegister(true)}
          />
        </div>

        {/* Request Details */}
        <div className="h-full overflow-auto space-y-2 mt-2">
          <div className="dark:bg-layout-dark bg-white w-full gap-y-2 rounded-md px-6 py-6">
            <p className="text-xl text-center font-semibold pb-4">
              Purchase Request Details
            </p>
            <div className="flex flex-col col-span-2 sm:grid grid-cols-7 w-full space-y-2">
              {requestFields.map((field) => (
                <React.Fragment key={field.key}>
                  <p className="text-sm col-span-3 font-bold dark:text-gray-200 text-gray-800">
                    {field.label}
                  </p>
                  <p className="text-sm col-span-2 dark:text-gray-400 text-gray-600">
                    {requestData[field.key] || "-"}
                  </p>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Materials Table */}
          <div className="dark:bg-layout-dark bg-white w-full gap-y-2 rounded-md px-6 py-6">
            <table className="w-full text-center">
              <thead className="dark:bg-indigo-400 dark:text-black bg-[#E3ECFF] ">
                <tr>
                  <th className="p-2.5 rounded-l-md">S.no</th>
                  <th>Material</th>
                  <th>Units</th>
                  <th className="rounded-r-md">Quantity</th>
                </tr>
              </thead>
              <tbody className="text-sm opacity-60 ">
                {materials.map((item, index) => (
                  <tr key={index}>
                    <td className="p-1.5">{index + 1}</td>
                    <td>{item.material}</td>
                    <td>{item.units}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="my-4 flex justify-end">
        <Button
          button_name="Back"
          button_icon={<ChevronLeft />}
          onClick={() => navigate("..")}
        />
      </div>

      {/* Request Register Modal */}
      {requestRegister && (
        <RequestRegister onclose={() => setRequestRegister(false)} />
      )}
    </>
  );
};

export default ViewPurchaseRequest;
