import React, { useState } from "react";
import { IoChevronBackSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import Title from "../../../components/Title";
import Button from "../../../components/Button";

const ViewPurchaseBill = () => {
  const location = useLocation();
  const rowData = location.state?.item;
  const navigate = useNavigate();

  const [data, setData] = useState(
    rowData
      ? {
          0: [
            { label: "Invoice no", value: rowData.invoiceno, key: "invoiceno" },
            { label: "Particle", value: rowData.particle, key: "particle" },
            { label: "Date", value: rowData.date, key: "date" },
            { label: "Due date", value:"12-01-2005", key: "duedate" },
            { label: "Total", value: `₹${rowData.amount}`, key: "amount" },
            { label: "Tax", value: rowData.tax, key: "tax" },
            {
              label: "Grand Total",
              value: `₹${rowData.grandtotal}`,
              key: "grandtotal",
            },
          ],
        }
      : {}
  );

  const renderField = (field) => {
    return <p className="text-xs opacity-50">{field.value}</p>;
  };

  return (
    <>
      <div className="  h-full ">
        <div className="h-1/12">
          <Title
            title="Purchase"
            sub_title="Purchase Bill"
            active_title={" View Purchase Bill"}
          />
        </div>
        <div className="overflow-auto h-11/12 no-scrollbar">
          <div className="dark:bg-layout-dark bg-white p-4 rounded-lg space-y-2 text-sm mt-6">
            <div className="grid grid-cols-12 gap-2 items-start">
              {Object.entries(data).map(([section, fields]) => (
                <React.Fragment key={section}>
                  {fields.map((field) => (
                    <React.Fragment key={field.key}>
                      <p className="col-span-4 font-medium">{field.label}</p>
                      <div className="col-span-8">
                        {renderField(field, section)}
                      </div>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex justify-end py-2 ">
            <Button
              onClick={() => navigate("..")}
              button_name="Back"
              button_icon={<IoChevronBackSharp />}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewPurchaseBill;
