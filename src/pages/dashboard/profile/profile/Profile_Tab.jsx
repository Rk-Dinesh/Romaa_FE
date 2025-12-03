import React, { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { profiledetailsData } from "../../../../components/Data";
import DonutChart from "../../../../components/DonutChart";
import {
  sitecompleted,
  Projectcolor,
  leave,
} from "../../../../components/Data";
import Dropdown from "../../../../components/Dropdown";
import EditProfile from "./EditProfile";
import ChangePassword from "./ChangePassword";

const Profile_Tab = () => {
  const [editprofile, setEditprofile] = useState(false);
  const [changepassword, setChangepassword] = useState(false);
  const profileFields = [
    { label: "Employee ID", key: "employeeId" },
    { label: "Name", key: "name" },
    { label: "Designation", key: "designation" },
    { label: "Gender", key: "gender" },
    { label: "Date of Birth", key: "dateOfBirth" },
    { label: "Mobile Number", key: "mobileNumber" },
    { label: "Email ID", key: "emailId" },
    { label: "Joining Date", key: "joiningDate" },
    { label: "Language", key: "language" },
    { label: "Reporting Person", key: "reportingPerson" },
    { label: "Address", key: "address" },
  ];

  const dropdownItems = [
    {
      label: "Edit Profile",
      onClick: () => setEditprofile(true),
    },
    {
      label: "Change Password",
      onClick: () => setChangepassword(true),
    },
    {
      label: "Logout",
      onClick: () => alert("Settings clicked"),
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-12  gap-2 p-3  ">
        <div className="col-span-5 grid grid-rows-12 gap-2 ">
          <div className="row-span-4 bg-white p-6 rounded-xl">
            <div className="flex justify-between mb-5">
              <div className="flex items-center gap-4">
                <p className="bg-indigo-200 w-24 h-24 rounded-md"></p>
                <span>
                  <p className="font-bold text-xl">Name</p>
                  <p className="text-sm">
                    Designation: <span className="text-gray-500">Doctor</span>
                  </p>
                  <p className="text-sm">
                    Login: <span className="text-gray-500">9:30am</span>
                  </p>
                </span>
              </div>
              <div className="">
                <Dropdown items={dropdownItems} />
              </div>
            </div>
            <hr className="text-indigo-200 " />
            <div className=" flex justify-between mt-4">
              <p className="flex flex-col">
                <span className="font-semibold">Task</span>{" "}
                <span className="text-gray-500">9</span>
              </p>
              <p className="flex flex-col">
                <span className="font-semibold">Project</span>{" "}
                <span className="text-gray-500">10</span>
              </p>
              <p className="flex flex-col">
                <span className="font-semibold">Hours Logged</span>{" "}
                <span className="text-gray-500">4</span>
              </p>
            </div>
          </div>
          <div className="row-span-8 rounded-xl p-6 bg-white">
            <p className="text-lg font-semibold pb-6">Profile info</p>
            <div className="grid grid-cols-2 gap-y-4 gap-x-12">
              {profileFields.map(({ label, key }) => (
                <React.Fragment key={key}>
                  <div className="col-span-1">
                    <p className="text-sm font-semibold">{label}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm text-gray-600">
                      {profiledetailsData[key] || "—"}
                    </p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-7 grid grid-rows-12 gap-2 ">
          <div className="row-span-6 grid grid-cols-2 gap-2 ">
            <div className=" bg-white pt-4 px-2 rounded-xl ">
              <DonutChart
                title="Site Completed"
                data={sitecompleted}
                colors={Projectcolor}
                project_name={false}
              />
            </div>
            <div className="bg-white rounded-xl p-7"><p className="font-semibold">Achivements</p></div>
          </div>
          <div className="row-span-6 bg-white rounded-xl grid grid-cols-2 ">
            <div className="col-span-1 my-6 ">
              <DonutChart
                title="Leave"
                data={leave}
                colors={Projectcolor}
                project_name={false}
              />
            </div>
            <div className="col-span-1 px-6 py-2 my-8 space-y-4 border-l">
              <p className="text-lg font-bold">Pending Leave</p>
              <p className="flex justify-between">
                <span className="font-semibold">Paid Leave</span> <span>2</span>{" "}
              </p>
              <p className="flex justify-between">
                <span className="font-semibold">Sick Leave</span> <span>5</span>{" "}
              </p>
              <p className="flex justify-between">
                <span className="font-semibold">Casual</span> <span>2</span>{" "}
              </p>
              <p className="flex justify-between">
                <span className="font-semibold">Earned</span> <span>5</span>{" "}
              </p>
              <p className="flex justify-between">
                <span className="font-semibold">Permission</span> <span>5</span>{" "}
              </p>
            </div>
          </div>
        </div>
      </div>
      {editprofile && <EditProfile data={profiledetailsData} onclose={()=>{setEditprofile(false)}}/> }
      {changepassword && <ChangePassword onclose={()=>{setChangepassword(false)}}/> }
    </div>
    
  );
};

export default Profile_Tab;
