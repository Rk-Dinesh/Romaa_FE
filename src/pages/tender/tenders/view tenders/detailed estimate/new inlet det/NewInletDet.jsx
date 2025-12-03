import { toast } from "react-toastify";
import Table from "../../../../../../components/Table";
import UploadDetailedEstimate from "./UploadDetailedEstimate";
import axios from "axios";
import { API } from "../../../../../../constant";
import { use, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const BoqProjectsColumns = [
  { label: "Item Description", key: "description" },
  { label: "Number", key: "number" },
  { label: "Length", key: "length" },
  { label: "Breadth", key: "breath" },
  { label: "Density", key: "depth" },
  { label: "Contents", key: "contents" },
];

const NewInletDet = ({ name }) => {
  const { tender_id } = useParams();
  const [detailedEstimate, setDetailedEstimate] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDetailedEstimate = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/detailedestimate/getdatacustomhead?tender_id=${tender_id}&nametype=${name}`
      );
      console.log(res);

      setDetailedEstimate(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch tenders");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDetailedEstimate();
  }, [tender_id, name]);

  return (
    <Table
      loading={loading}
      contentMarginTop="mt-0"
      endpoint={detailedEstimate}
      columns={BoqProjectsColumns}
      // routepoint={"viewnewinletdet"}
      exportModal={false}
      UploadModal={UploadDetailedEstimate}
      onSuccess={fetchDetailedEstimate}
      name={name}
    />
  );
};

export default NewInletDet;
