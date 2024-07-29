import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../login/UserContext";
import Navbar from "../util/Navbar";
import MultiSelectDropdown from "./MultiSelectDropdown";

const UserManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [groups, setGroups] = useState([]);
  const { state } = useContext(UserContext);
  const navigate = useNavigate();

  const [editIndex, setEditIndex] = useState(-1);
  const [editValues, setEditValues] = useState({
    username: "",
    email: "",
    password: "",
    groupname: [],
    disabled: false,
    id: "",
  });

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const accountsResponse = await axios.get(
          "http://localhost:8080/getAllAccounts",
          { withCredentials: true }
        );
        setAccounts(accountsResponse.data);

        const groupsResponse = await axios.get(
          "http://localhost:8080/getAllGroups",
          { withCredentials: true }
        );
        setGroups(groupsResponse.data.map((group) => group.groupname));
        console.log(accounts);

        setLoading(false);
      } catch (error) {
        console.error(
          "Error fetching data:",
          error.response ? error.response.data : error.message
        );
        setError("Error fetching data. Check the console.");
        setLoading(false);
      }
    };

    fetchData();
  }, [state.isAuthenticated, navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const handleEdit = (index) => {
    const accountToEdit = accounts[index];
    console.log(accountToEdit);
    setEditIndex(index);
    setEditValues({
      username: accountToEdit.username,
      email: accountToEdit.email,
      password: "",
      groupname: Array.isArray(accountToEdit.groupname)
        ? accountToEdit.groupname
        : (accountToEdit.groupname || "")
            .split(",")
            .map((group) => group.trim()),
      disabled: accountToEdit.disabled,
      id: accountToEdit.id,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update user details
      await axios.put(
        `http://localhost:8080/updateUser/${editValues.username}`,
        {
          email: editValues.email,
          password: editValues.password,
          disabled: editValues.disabled,
        }
      );

      // Get existing groups for comparison
      const account = accounts.find(
        (acc) => acc.username === editValues.username
      );
      const existingGroups = Array.isArray(account.groupname)
        ? account.groupname
        : account.groupname.split(",");
      const updatedGroups = editValues.groupname;

      // Determine groups to be added, removed, or updated
      const groupsToAdd = updatedGroups.filter(
        (group) => !existingGroups.includes(group)
      );
      const groupsToRemove = existingGroups.filter(
        (group) => !updatedGroups.includes(group)
      );

      // Update groups
      if (groupsToAdd.length > 0) {
        for (const group of groupsToAdd) {
          await axios.post("http://localhost:8080/addGroup", {
            groupname: group,
            username: editValues.username,
          });
        }
      }

      // Send individual DELETE requests for each group to remove
      if (groupsToRemove.length > 0) {
        for (const group of groupsToRemove) {
          // Extract ID based on group name
          const groupId = account.id.split(",")[existingGroups.indexOf(group)];
          await axios.delete(`http://localhost:8080/removeGroup/${groupId}`);
        }
      }

      // Update the state with the new account details
      const updatedAccounts = accounts.map((account, index) =>
        index === editIndex ? { ...account, ...editValues } : account
      );
      setAccounts(updatedAccounts);
      setEditIndex(-1);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const cancelEdit = () => {
    setEditIndex(-1);
  };

  const handleCreateUser = async () => {
    try {
      const newUser = {
        username: editValues.username,
        email: editValues.email,
        password: editValues.password,
        groupname: editValues.groupname.join(","),
        disabled: editValues.disabled,
      };
      const response = await axios.post(
        "http://localhost:8080/createUser",
        newUser,
        { withCredentials: true }
      );
      console.log("User created successfully:", response.data);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleGroupChange = (selectedGroups) => {
    setEditValues({
      ...editValues,
      groupname: selectedGroups,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <Navbar />

      <div className="w-full max-w-6xl bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">User Management</h1>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 border">Username</th>
                <th className="py-2 px-4 border">Email</th>
                <th className="py-2 px-4 border">Password</th>
                <th className="py-2 px-4 border">Group</th>
                <th className="py-2 px-4 border">Status</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border">{account.username}</td>
                  <td className="py-2 px-4 border">{account.email}</td>

                  <td className="py-2 px-4 border">
                    {editIndex === index ? (
                      <input
                        type="password"
                        value={editValues.password}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            password: e.target.value,
                          })
                        }
                        className="p-2 border border-gray-300 rounded"
                      />
                    ) : (
                      "******"
                    )}
                  </td>
                  <td className="py-2 px-4 border">
                    {editIndex === index ? (
                      <MultiSelectDropdown
                        options={groups}
                        selectedOptions={editValues.groupname}
                        onChange={handleGroupChange}
                      />
                    ) : (
                      (String(account.groupname) || "")
                        .split(",")
                        .map((group) => group.trim())
                        .join(", ")
                    )}
                  </td>

                  <td className="py-2 px-4 border">
                    {editIndex === index ? (
                      <select
                        value={editValues.disabled ? "Disabled" : "Enabled"}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            disabled: e.target.value === "Disabled",
                          })
                        }
                        className="p-2 border border-gray-300 rounded"
                      >
                        <option>Enabled</option>
                        <option>Disabled</option>
                      </select>
                    ) : account.disabled ? (
                      "Disabled"
                    ) : (
                      "Enabled"
                    )}
                  </td>
                  <td className="py-2 px-4 border">
                    {editIndex === index ? (
                      <>
                        <button
                          className="bg-green-500 text-white p-1 rounded mr-2"
                          onClick={handleSubmit}
                        >
                          Save
                        </button>
                        <button
                          className="bg-red-500 text-white p-1 rounded"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="bg-blue-500 text-white p-1 rounded"
                        onClick={() => handleEdit(index)}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Username"
              value={editValues.username}
              onChange={(e) =>
                setEditValues({ ...editValues, username: e.target.value })
              }
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Email"
              value={editValues.email}
              onChange={(e) =>
                setEditValues({ ...editValues, email: e.target.value })
              }
              className="p-2 border border-gray-300 rounded mx-2"
            />
            <input
              type="password"
              placeholder="Password"
              value={editValues.password}
              onChange={(e) =>
                setEditValues({ ...editValues, password: e.target.value })
              }
              className="p-2 border border-gray-300 rounded mx-2"
            />
            <MultiSelectDropdown
              options={groups}
              selectedOptions={editValues.groupname}
              onChange={handleGroupChange}
            />
            <select
              value={editValues.disabled ? "Disabled" : "Enabled"}
              onChange={(e) =>
                setEditValues({
                  ...editValues,
                  disabled: e.target.value === "Disabled",
                })
              }
              className="p-2 border border-gray-300 rounded mx-2"
            >
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
            <button
              className="bg-green-500 text-white p-2 rounded ml-2"
              onClick={handleCreateUser}
            >
              Create User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
