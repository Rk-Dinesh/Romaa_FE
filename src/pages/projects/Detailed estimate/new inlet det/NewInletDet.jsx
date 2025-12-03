import { toast } from "react-toastify";
import Table from "../../../../components/Table";
import axios from "axios";
import { API } from "../../../../constant";
import { use, useEffect, useState } from "react";
import { useProject } from "../../ProjectContext";

const BoqProjectsColumns = [
  { label: "Item Description", key: "description" },
  { label: "Number", key: "number" },
  { label: "Length", key: "length" },
  { label: "Breadth", key: "breath" },
  { label: "Density", key: "depth" },
  { label: "Contents", key: "contents" },
];

const NewInletDet = ({ name }) => {
   const { tenderId } = useProject();
  const [detailedEstimate, setDetailedEstimate] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDetailedEstimate = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/detailedestimate/getdatacustomhead?tender_id=${tenderId}&nametype=${name}`
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
  }, [tenderId, name]);

  return (
    <Table
      loading={loading}
      contentMarginTop="mt-0"
      endpoint={detailedEstimate}
      columns={BoqProjectsColumns}
      // routepoint={"viewnewinletdet"}
      exportModal={false}
      onSuccess={fetchDetailedEstimate}
      name={name}
    />
  );
};

export default NewInletDet;
