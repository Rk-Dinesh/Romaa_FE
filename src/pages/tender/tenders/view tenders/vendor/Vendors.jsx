import { LuUserRoundSearch } from "react-icons/lu";
import { VendorData } from "../../../../../components/Data";
import DeleteModal from "../../../../../components/DeleteModal";
import Table from "../../../../../components/Table";
import AddPermittedVendor from "./vendorPermitted";
import axios from "axios";
import { API } from "../../../../../constant";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const customerColumns = [
  { label: "Vendor ID", key: "vendor_id" },
  { label: "Vendor Name", key: "vendor_name" },
  { label: "Vendor Type", key: "type" },
  //{ label: "Address", key: "address" },
  { label: "Status", key: "permitted_status" },
];

const Vendor = () => {
  const { tender_id } = useParams();
  const [permittedVendor, setPermittedVendor] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterParams, setFilterParams] = useState({
    fromdate: "",
    todate: "",
  });

  const fetchVendorPermitted = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/permittedvendor/permitted-vendors/${tender_id}`,
        {
          params: {
            page: currentPage,
            limit: 10,
            search: searchTerm,
            fromdate: filterParams.fromdate,
            todate: filterParams.todate,
          },
        }
      );

      setPermittedVendor(res.data.data);
      setTotalPages(res.data.totalPages);
      console.log(res.data);
    } catch (err) {
      toast.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorPermitted();
  }, [currentPage, searchTerm, filterParams]);

  const handleDeletePermittedVendor = async (vendor_id) => {
    try {
      const res = await axios.delete(
        `${API}/permittedvendor/remove/${tender_id}/${vendor_id}`
      );
      console.log(res);

      toast.success("Vendor was successfully removed!");
      // Refresh the vendor list after deletion
      fetchVendorPermitted();
    } catch (error) {
      toast.error("Failed to remove vendor.");
    }
  };

  return (
    <>
      <Table
        contentMarginTop="mt-0"
        endpoint={permittedVendor}
        columns={customerColumns}
        ViewModal={true}
        AddModal={AddPermittedVendor}
        addButtonLabel="Add Vendor"
        addButtonIcon={<LuUserRoundSearch size={24} />}
        exportModal={false}
        DeleteModal={DeleteModal}
        deletetitle="vendor"
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        filterParams={filterParams}
        setFilterParams={setFilterParams}
        onUpdated={fetchVendorPermitted}
        onSuccess={fetchVendorPermitted}
        onDelete={handleDeletePermittedVendor}
        idKey="vendor_id"
      />
    </>
  );
};

export default Vendor;
