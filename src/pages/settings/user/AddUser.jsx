import React, { useEffect, useState } from "react";
import Modal from "../../../components/Modal";
import { set, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { InputField } from "../../../components/InputField";
import { API } from "../../../constant";
import axios from "axios";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  userid: yup.string().required("User ID is required"),
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email ID is required"),
  mobile: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone Number must be 10 digits")
    .required("Phone Number is required"),
  role: yup.string().required("Role is required"),
});

const AddUser = ({ onclose,onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/employee/getallemployees`)
      .then((res) => setUsers(res.data.data))
      .catch((err) => console.error("Error fetching clients", err));
  }, []);
  useEffect(() => {
    axios
      .get(`${API}/role/getallroles`)
      .then((res) => setRoles(res.data.data))
      .catch((err) => console.error("Error fetching clients", err));
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const availableUsers = users.filter((u) => !u.role_id && !u.role);

  const userIdOptions = availableUsers.map((c) => ({
    value: c.employee_id,
    label: c.employee_id,
  }));
  const rolesOptions = roles.map((r) => ({
    value: r.role_name,
    label: r.role_name,
  }));

  const handleUserIdChange = (e) => {
    const selectedId = e.target.value;
    const selectedUser = users.find((u) => u.employee_id === selectedId);

    if (selectedUser) {
      setValue("name", selectedUser.name || "");
      setValue("email", selectedUser.contact_email || "");
      setValue("mobile", selectedUser.contact_phone || "");
    }
  };

  const onSubmit = async (data) => {
    const selectedRole = roles.find((r) => r.role_name === data.role);

    if (!selectedRole) {
      alert("Please select a valid role.");
      return;
    }

    const payload = {
      role_id: selectedRole.role_id,
      role: selectedRole.role_name,
    };
    const employee_id = data.userid;

    try {
      setLoading(true);
      await axios.put(
        `${API}/employee/updateemployee/${employee_id}`, // <-- employee_id in URL
        payload
      );
      onSuccess();
      toast.success("User added successfully ✅");
      onclose();
    } catch (err) {
      console.error("Error updating user:", err);
      alert(err.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <>
        <Modal
          title="Add User"
          onclose={onclose}
          child={
            <>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-c gap-4 px-6 py-6">
                  <div className="space-y-4">
                    <InputField
                      label="User ID"
                      name="userid"
                      register={register}
                      errors={errors}
                      placeholder="Type Here"
                      type="select"
                      options={userIdOptions}
                      onChange={handleUserIdChange}
                    />
                    <InputField
                      label="Name"
                      name="name"
                      register={register}
                      errors={errors}
                      placeholder="Type Here"
                    />
                    <InputField
                      label="Email ID"
                      name="email"
                      register={register}
                      errors={errors}
                      placeholder="Type Here"
                      type="email"
                    />
                    <InputField
                      label="Phone Number"
                      name="mobile"
                      register={register}
                      errors={errors}
                      placeholder="Type Here"
                    />
                    <InputField
                      label="Role"
                      type="select"
                      name="role"
                      placeholder="select role"
                      register={register}
                      errors={errors}
                      options={rolesOptions}
                    />
                  </div>
                </div>
                <div className="mx-5 text-xs flex lg:justify-end md:justify-center justify-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={onclose}
                    disabled={loading}
                    className="cursor-pointer border border-darkest-blue dark:border-white px-6 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`cursor-pointer px-6 text-white rounded ${
                      loading
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-darkest-blue"
                    }`}
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </>
          }
        />
      </>
    </>
  );
};

export default AddUser;
