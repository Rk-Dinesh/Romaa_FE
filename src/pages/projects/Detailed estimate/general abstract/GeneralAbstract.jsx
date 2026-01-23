
import axios from "axios";
import { useEffect, useState } from "react";
import Table from "../../../../components/Table";
import { API } from "../../../../constant";
import { useProject } from "../../../../context/ProjectContext";

const Columns = [
  { label: "Abstract ", key: "heading" },
  {
    label: "Abstract Amount ",
    key: "total_amount",
    formatter: (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value),
  },
];

const GeneralAbstract = () => {
  const { tenderId } = useProject();
  const [generalAbstractdata, setGeneralAbstractdata] = useState([]);
  const getGeneralAbstractdata = async () => {
    try {
      const res = await axios.get(
        `${API}/detailedestimate/getgeneralabstract?tender_id=${tenderId}`
      );
      setGeneralAbstractdata(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getGeneralAbstractdata();
  }, []);
  return (
    <Table
      contentMarginTop="mt-0"
      endpoint={generalAbstractdata}
      columns={Columns}
      exportModal={false}
      pagination={false}
    />
  );
};

export default GeneralAbstract;
