import axios from "axios";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../../../constant";
import Table from "../../../../components/Table";
import { useProject } from "../../../../context/ProjectContext";

const NewInletAbsColumns = [
  { label: "Abstract ID", key: "abstract_id" },
  { label: "Item Description", key: "description" },
  { label: "Quantity", key: "quantity" },
  { label: "Unit", key: "unit" },
  { label: "Rate", key: "rate", formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value) },
  { label: "Amount", key: "amount", formatter: (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value) },
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
      pagination={false}
      // UploadModal={abstract.length > 0 ? null : UploadAbstract}
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
