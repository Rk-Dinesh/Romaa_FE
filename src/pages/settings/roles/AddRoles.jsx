import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Title from "../../../components/Title";
import axios from "axios";
import { API } from "../../../constant";
import { toast } from "react-toastify";

const AddRoles = () => {
  const [roleName, setRoleName] = useState("");
  const [createdBy, setCreatedBy] = useState("System");
  const [selectedSettings, setSelectedSettings] = useState({});
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const settingsOptions = [
    "Dashboard",
    "Tender",
    "Projects",
    "Purchase",
    "Site",
    "HR",
    "Finance",
    "Reports",
    "Settings",
  ];

  const permissionOptions = [
    "All",
    "View",
    "Create",
    "Edit",
    "Delete",
    "Download",
  ];

  // Toggle Settings Checkbox
  const toggleSetting = (setting) => {
    setSelectedSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));

    setPermissions((prev) => {
      if (prev[setting]) {
        const updated = { ...prev };
        delete updated[setting];
        return updated;
      }
      return { ...prev, [setting]: [] };
    });
  };

  // Handle Permission Changes
  const handlePermissionChange = (setting, permission, checked) => {
    setPermissions((prev) => {
      let updatedPermissions = prev[setting] || [];

      if (permission === "All") {
        // If "All" is checked, select all permissions
        updatedPermissions = checked ? permissionOptions.slice(1) : [];
      } else {
        // Add or remove individual permission
        updatedPermissions = checked
          ? [...updatedPermissions, permission]
          : updatedPermissions.filter((p) => p !== permission);

        // If "All" was checked and one is unchecked, uncheck "All"
        if (!checked) {
          updatedPermissions = updatedPermissions.filter((p) => p !== "All");
        }
      }

      // If all individual permissions are checked, check "All" again
      if (updatedPermissions.length === permissionOptions.length - 1) {
        updatedPermissions = ["All", ...updatedPermissions];
      }

      return { ...prev, [setting]: updatedPermissions };
    });
  };

  const handleSave = async () => {
    const accessLevels = Object.entries(permissions).map(
      ([feature, perms]) => ({
        feature,
        permissions: perms,
      })
    );

    const roleAccessLevel = {
      role_name: roleName,
      accessLevels,
      created_by_user: createdBy,
      status: "active",
    };

    console.log("Sending payload:", roleAccessLevel);
      if (!roleName.trim()) {
    // ✅ Show error if empty
    toast.error("Role name cannot be empty");
    return;
  }
    try {
      setLoading(true);
      const response = await axios.post(
        `${API}/role/addrole`,
        roleAccessLevel,
        {}
      );

      if (response.status === 200) {
        toast.success("Role created Successfully");
        navigate("/settings/roles");
      } else {
        console.error("Error in posting data", response);
        toast.error("Failed to Upload");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error in posting data", error);
      setLoading(false);
    }

    // console.log(
    //   "Role Access Level JSON:",
    //   JSON.stringify(roleAccessLevel, null, 2)
    // );
  };

  return (
    <>
      <div className="flex justify-between items-center  mb-2">
        <Title
          title="Settings"
          sub_title="Role Access"
          page_title="Add role Access"
        />
        <div className="flex gap-3">
          <p
            onClick={() => navigate("/settings/roles")}
            className="cursor-pointer  border dark:border-white border-darkest-blue px-8 py-2 rounded-sm"
          >
            Cancel
          </p>
          <button
            disabled={loading}
            onClick={handleSave}
            className={`cursor-pointer px-6 text-white rounded ${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-darkest-blue"
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      <div className="flex items-center  gap-10 mb-4">
        <span className="font-semibold ">Role name</span>
        <input
          type="text"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          className="  px-3 py-1.5 rounded-md outline-none dark:bg-layout-dark bg-white text-black dark:text-white"
        />
        <span className="font-semibold ">Created By</span>
        <input
          type="text"
          value={createdBy}
          onChange={(e) => setCreatedBy(e.target.value)}
          className="  px-3 py-1.5 rounded-md outline-none dark:bg-layout-dark dark:text-white
           bg-white text-black"
        />
      </div>

      <div className="dark:bg-layout-dark bg-white p-10  rounded-xl  ">
        <div className="grid grid-cols-3 gap-2 ">
          <div className="border-r-2 p-3 h-80">
            <h2 className="text-lg font-medium mb-4 w-1/2 text-center">
              Settings
            </h2>
            {settingsOptions.map((setting) => (
              <div key={setting} className="flex items-center  mb-3">
                <label className="flex items-center gap-2  cursor-pointer">
                  <label className="relative flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!selectedSettings[setting]}
                      onChange={() => toggleSetting(setting)}
                      className="appearance-none w-5 h-5 border-2 dark:border-white border-darkest-blue rounded-md checked:bg-darkest-blue  checked:border-transparent focus:outline-none transition-all duration-200"
                    />
                    {/* Custom Checkmark */}
                    <span className="absolute w-5 h-5 flex justify-center items-center pointer-events-none">
                      {selectedSettings[setting] && (
                        <svg
                          className="w-10 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      )}
                    </span>
                  </label>

                  {setting}
                </label>
              </div>
            ))}
          </div>

          <div className="p-4">
            <h2 className="text-lg font-medium mb-3">Permissions</h2>
            {settingsOptions.map((setting) => (
              <div key={setting} className=" flex items-center">
                {selectedSettings[setting] ? (
                  <div className="flex items-center justify-between p-2 rounded-md">
                    <div className="flex gap-4 w-3/4">
                      {permissionOptions.map((perm) => (
                        <label
                          key={perm}
                          className="flex items-center gap-4 cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={
                              permissions[setting]?.includes(perm) || false
                            }
                            onChange={(e) =>
                              handlePermissionChange(
                                setting,
                                perm,
                                e.target.checked
                              )
                            }
                            className="appearance-none w-5 h-5 border-2 dark:border-white border-darkest-blue rounded-md checked:bg-darkest-blue checked:border-transparent focus:outline-none transition-all duration-200"
                          />
                          {/* Custom Checkmark */}
                          <span className="absolute w-5 h-5 flex justify-center items-center pointer-events-none">
                            {permissions[setting]?.includes(perm) && (
                              <svg
                                className="w-10 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                ></path>
                              </svg>
                            )}
                          </span>
                          {perm}
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-9"></div> // Keeps spacing even when unchecked
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddRoles;
