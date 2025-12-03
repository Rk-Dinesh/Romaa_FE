import axios from "axios";
import Table from "../../../../components/Table";
import { API } from "../../../../constant";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProject } from "../../ProjectContext";

const NewInletAbsColumns = [
  { label: "Item Description", key: "description" },
  { label: "Quantity", key: "quantity" },
  { label: "Unit", key: "unit" },
  { label: "Rate", key: "rate" },
  { label: "Amount", key: "amount" },
];

const NewInletAbs = ({ name }) => {
  const { tenderId } = useProject();
  const [abstract, setAbstract] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAbstract = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/detailedestimate/getdatacustomhead?tender_id=${tenderId}&nametype=${name}`
      );

      setAbstract(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch tenders");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAbstract();
  }, [tenderId, name]);
  return (
    <Table
      loading={loading}
      contentMarginTop="mt-0"
      endpoint={abstract}
      columns={NewInletAbsColumns}
      // routepoint={"viewnewinletabs"}
      onSuccess={fetchAbstract}
      exportModal={false}
      name={name}
    />
  );
};

export default NewInletAbs;
