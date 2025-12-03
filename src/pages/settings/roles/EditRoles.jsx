import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Title from "../../../components/Title";
import axios from "axios";
import { API } from "../../../constant";
import { toast } from "react-toastify";

const EditRoles = ({ item }) => {
  const [roleName, setRoleName] = useState("");
  const [createdBy, setCreatedBy] = useState("System");
  const [selectedSettings, setSelectedSettings] = useState({});
  const [permissions, setPermissions] = useState({});
  const navigate = useNavigate();
  const { state } = useLocation();
  const roleId = state?.item.role_id;
  const [loading, setLoading] = useState(false);

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
  useEffect(() => {
    if (roleId) {
      fetchExistingRoles();
    }
  }, [roleId]);

  const fetchExistingRoles = async () => {
    try {
      const response = await axios.get(
        `${API}/role/getbyroleid?roleId=${roleId}`
      );

      setRoleName(response.data.data.role_name); // Set the existing role name
      const accessLevelsArr = response.data.data.accessLevels || [];
      const perms = {};
      const selected = {};
      accessLevelsArr.forEach((item) => {
        selected[item.feature] = true;
        perms[item.feature] = item.permissions;
      });
      console.log(selected);

      setSelectedSettings(selected);
      setPermissions(perms);
    } catch (error) {
      console.log(error);
    }
  };

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
        updatedPermissions = checked ? permissionOptions.slice(1) : [];
      } else {
        updatedPermissions = checked
          ? [...updatedPermissions, permission]
          : updatedPermissions.filter((p) => p !== permission);

        if (!checked) {
          updatedPermissions = updatedPermissions.filter((p) => p !== "All");
        }
      }

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
      status: "active",
    };

    try {
       setLoading(true);
      const response = await axios.put(
        `${API}/role/updatebyroleid?roleId=${roleId}`,
        roleAccessLevel
      );
      if (response.status === 200) {
        navigate("/settings/roles");
        toast.success("Role Updated Successfully");  
      }

    } catch (error) {
      console.log(error);
       setLoading(false);
    }

    // console.log("Saved role:", {
    //   roleName,
    //   createdBy,
    //   permissions,
    // });
  };

  return (
    <>
      <div className="flex justify-between items-center  mb-2">
        <Title
          title="Settings"
          sub_title="Role Access"
          page_title="Edit role Access"
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
          className="  px-3 py-1.5 rounded-md outline-none dark:bg-layout-dark dark:text-white bg-white text-black "
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

export default EditRoles;
