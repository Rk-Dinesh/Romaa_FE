import Table from "../../../components/Table";
import { ProjectAssetData } from "../../../components/Data";
import Filters from "../../../components/Filters";
import { useEffect, useState } from "react";
import { API } from "../../../constant";
import axios from "axios";


const PurchaseAssets = () => {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([])

  

const Columns = [
  {label:"AssetId",key:"assetId"},
  { label: "Asset Name ", key: "assetName" },
  { label: "Asset Type", key: "assetType" },
  { label: "Site Location", key: "location" ,    render: (item) => `${item.currentSite?.location || ""}`,},
  { label: "Assigned to",  key: "siteName" ,    render: (item) => `${item.currentSite?.siteName || ""}`, },
 
        { label: "Date", key: "date",  render: (item) => `${new Date(item.currentSite?.assignedDate).toLocaleDateString() || ""}`,},
        { label: "Status", key: "status", render: (item) => `${item.currentStatus || "" }`,},
];

    const fetchAssets = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${API}/machineryasset/api/allmachinery-assets`) 
            setAssets(res.data.data)
        } catch (err) {
            console.error("Error fetching assets:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAssets()
    }, [])
  return (
    <Table
      title={"Purchase Management"}
      subtitle={"Assets"}
      pagetitle={" Assets"}
      endpoint={assets}
      columns={Columns}
       EditModal={false}
      FilterModal={Filters}
    />
  );
};

export default PurchaseAssets;
