import SummaryCard from "./SummaryCard";
import { TbProgress } from "react-icons/tb";
import { TbCalendarDue } from "react-icons/tb";
import { LuClipboardList } from "react-icons/lu";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { TbFolderQuestion } from "react-icons/tb";
import { TbPlaylistAdd } from "react-icons/tb";
import { BsCart3 } from "react-icons/bs";
import { SlBadge } from "react-icons/sl";
import LineCharts from "../../components/LineChart";
import DonutChart from "../../components/PieChart";
import {
  Billreceivedcolors,
  Locationcolor,
  PiechartBillvsReceived,
  PiechartLocationdata,
  Piechartprojectdata,
  PiechartProjectType,
  Projectcolor,
  ProjectTypecolor,
} from "../../components/Data";
import Title from "../../components/Title";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ViewWorkOrderDashboard from "./ViewWorkOrderDashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const[ViewWorkOrderModal,setViewWorkOrderModal] = useState(false)
  return (
    <>
    <div className="h-full pb-16">
      <div className="flex justify-between items-center ">
        <Title
          title="Dashboard"
          sub_title="Main Dashboard"
          page_title="Main Dashboard"
        />
        <div className="flex gap-2 items-center">
          <Button onClick={()=>navigate("employeedashboard")} button_name="Employee"  paddingY="py-2.5"/>
          <Button onClick={()=>navigate("viewcalendar")} button_name="Calendar" bgColor="dark:bg-layout-dark bg-white" textColor="dark:text-white text-darkest-blue" button_icon={<TbCalendarDue size={23} />}  paddingY="py-2.5"/>
          <Button onClick={()=>setViewWorkOrderModal(true)} button_name="View Work Orders" bgColor="dark:bg-layout-dark bg-white" textColor="dark:text-white text-darkest-blue" button_icon={<LuClipboardList size={23} />} paddingY="py-2.5"/>
        </div>
      </div>
      <div className="mt-4 space-y-4 overflow-y-auto h-full no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <SummaryCard
            title="Total Payments"
            value="₹3,56,67,000"
            status="Ongoing Project"
            icon={<TbProgress size={20} />}
          />
          <SummaryCard
            title="Collected Payments"
            value="₹3,56,67,000"
            status="Ongoing Project"
            icon={<IoIosCheckmarkCircleOutline size={20} />}
          />
          <SummaryCard
            title="Pending Payments"
            value="₹3,56,67,000"
            status="Ongoing Project"
            icon={<TbFolderQuestion size={20} />}
          />
          <SummaryCard
            title="To be Billed Payments"
            value="₹3,56,67,000"
            status="Ongoing Project"
            icon={<TbPlaylistAdd size={20} />}
          />
          <SummaryCard
            title="Collected Payments"
            value="₹3,56,67,000"
            status="Completed Project"
            icon={<BsCart3 size={20} />}
          />
          <SummaryCard
            title="Pending Payments"
            value="₹3,56,67,000"
            status="Completed Project"
            icon={<SlBadge size={20} />}
          />
        </div>

        <div className="grid grid-cols-1  lg:grid-cols-3 gap-4">
          <DonutChart
            title="Project Value Chart"
            data={Piechartprojectdata}
            colors={Projectcolor}
          />
          <DonutChart
            title="Location"
            data={PiechartLocationdata}
            colors={Locationcolor}
          />
          <DonutChart
            title="Project Type"
            data={PiechartProjectType}
            colors={ProjectTypecolor}
          />
     
  
          <div className="lg:col-span-2">
            <LineCharts />
          </div>
          <div className="lg:col-span-1">
            <DonutChart
              title="Billed vs Received"
              height={330}
              data={PiechartBillvsReceived}
              colors={Billreceivedcolors}
              outerRadius={74}
            />
          </div>
        </div>
      </div>
      {ViewWorkOrderModal && <ViewWorkOrderDashboard onclose={()=>setViewWorkOrderModal(false)}/>}
      </div>
    </>
  );
};

export default Dashboard;
