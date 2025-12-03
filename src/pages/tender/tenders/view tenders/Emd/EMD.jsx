import React, { useEffect, useState } from "react";
import Table from "../../../../../components/Table";
import { EMDTableData } from "../../../../../components/Data";
import DeleteModal from "../../../../../components/DeleteModal";
import { Check, Pencil } from "lucide-react";
import EditEMD from "./EditEMD";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API } from "../../../../../constant";
import AddEMD from "./AddEMD";
import { LuUserRoundSearch } from "react-icons/lu";
import { toast } from "react-toastify";

const EMD = () => {
  const { tender_id } = useParams();
  const [emdData, setEmdData] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const Columns = [
    {
      label: "Date",
      key: "payment_date",
      render: (row) => {
        if (!row.payment_date) return "-";
        const date = new Date(row.payment_date);
        return date.toLocaleDateString("en-GB");
      },
    },

    { label: "Company", key: "company_name" },
    { label: "Proposed Value", key: "proposed_amount" },
    { label: "EMD Amount", key: "emd_amount" },
    { label: "Bank Name", key: "payment_bank" },
    { label: "Level", key: "level" },
    { label: "Status", key: "status" },
  ];

  const fetchEMD = async () => {
    try {
      const res = await axios.get(`${API}/tender/gettenderemd/${tender_id}`);
      if (res.data.status && res.data.data) {
        console.log(res.data.data);

        setEmdData(res.data.data || []);
      } else {
        setEmdData([]);
      }
    } catch {
      toast.error("Failed to load EMD data");
    }
  };

  useEffect(() => {
    fetchEMD();
  }, [tender_id]);

  const fetchemdItems = async () => {
    if (!tender_id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/emd/proposals/${tender_id}`, {
        params: {
          page: currentPage,
          limit: 10,
        },
      });

      setItems(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast.error("Failed to fetch BOQ items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchemdItems();
  }, [tender_id, currentPage]);

  const handleDeleteEmdItem = async (proposal_id) => {
    try {
      await axios.delete(`${API}/emd/removeproposal/${tender_id}/${proposal_id}`);
      toast.success("Item deleted successfully");
      fetchemdItems(); // refresh table
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete BOQ item");
    }
  };
  return (
    <div className="h-full">
      <div className="dark:bg-layout-dark bg-white w-full flex flex-col sm:grid grid-cols-2 gap-y-2 rounded-md px-4 py-6">
        <div className="col-span-2 flex justify-center items-center mb-4 ">
          <p className="text-xl font-semibold">EMD</p>
        </div>
        <div className="flex flex-col col-span-2 sm:grid grid-cols-2 w-full space-y-2">
          {/* <p className="text-sm col-span-1 font-bold dark:text-white text-gray-800">
            EMD Percentage
          </p>
          <p className="text-sm col-span-1 dark:text-gray-300 text-gray-600">
            {emdData?.emd?.emd_percentage}
          </p> */}
          <p className="text-sm col-span-1 font-bold dark:text-white text-gray-800">
            EMD Value
          </p>
          <p className="text-sm col-span-1 dark:text-gray-300 text-gray-600">
            {emdData?.emd?.emd_amount}
          </p>
          <p className="text-sm col-span-1 font-bold dark:text-white text-gray-800">
            Expiry Date
          </p>
          <p className="text-sm col-span-1 dark:text-gray-300 text-gray-600">
            {emdData?.emd?.emd_validity
              ? new Date(emdData.emd.emd_validity).toLocaleDateString("en-GB")
              : ""}
          </p>
        </div>
      </div>
      <Table
        contentMarginTop="mt-0"
        endpoint={items}
        columns={Columns}
        EditModal={EditEMD}
        DeleteModal={DeleteModal}
        deletetitle={"delete EMD"}
        exportModal={false}
        AddModal={AddEMD}
        addButtonLabel="Add EMD"
        addButtonIcon={<LuUserRoundSearch size={24} />}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onUpdated={fetchemdItems}
        onSuccess={fetchemdItems}
        onDelete={handleDeleteEmdItem}
        idKey="proposal_id"
      />
    </div>
  );
};

export default EMD;
