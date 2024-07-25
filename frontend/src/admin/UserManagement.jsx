import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../login/UserContext";
import Navbar from "../util/Navbar";

const UserManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { state } = useContext(UserContext); // Access the global state
  const navigate = useNavigate();

  const [editIndex, setEditIndex] = useState(-1);
  const [editValues, setEditValues] = useState({
    username: "",
    email: "",
    password: "",
    groupname: [],
    disabled: false,
  });

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/getAllAccounts",
          {
            withCredentials: true, // Ensure cookies are sent with the request
          }
        );
        setAccounts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching accounts:", error);
        setError("Not Authorised to view page");
        setLoading(false);
      }
    };

    fetchData();
  }, [state.isAuthenticated, navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const handleEdit = (index) => {
    const accountToEdit = accounts[index];
    setEditIndex(index);
    setEditValues({
      username: accountToEdit.username,
      email: accountToEdit.email,
      password: "",
      groupname: accountToEdit.groupname.split(","), // Split groupname if it's stored as a comma-separated string
      disabled: accountToEdit.disabled,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Make API call to update user using editValues
      await axios.put(
        `http://localhost:8080/updateUser/${editValues.username}`,
        {
          email: editValues.email,
          password: editValues.password,
          disabled: editValues.disabled,
        }
      );

      await axios.put(
        `http://localhost:8080/updateGroup/${editValues.groupname}`,
        {
          groupname: editValues.groupname.join(","),
          userID: editValues.username,
          id: editValues.id.join(","),
        }
      );
      // Assuming the API updates successfully, update accounts state
      const updatedAccounts = accounts.map((account, index) =>
        index === editIndex ? { ...account, ...editValues } : account
      );
      setAccounts(updatedAccounts);
      setEditIndex(-1); // Reset editIndex after successful update
    } catch (error) {
      console.error("Error updating user:", error);
      // Handle error state as needed
    }
  };

  const cancelEdit = () => {
    setEditIndex(-1); // Reset editIndex to cancel editing
  };

  const handleCreateUser = async () => {
    try {
      // Make API call to create user using form data
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
        { withCredentials: true } // Ensure cookies are sent with the request
      );
      console.log("User created successfully:", response.data);
      // Handle success state or update UI as needed
    } catch (error) {
      console.error("Error creating user:", error);
      // Handle error state as needed
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <Navbar />

      <div className="w-full max-w-6xl bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">User Management</h1>
        <div className="mb-4">
          <label
            htmlFor="group-name"
            className="block text-gray-700 font-bold mb-2"
          >
            Enter Group Name:
          </label>
          <div className="flex mb-4">
            <input
              type="text"
              id="group-name"
              className="flex-grow p-2 border border-gray-300 rounded-l-lg"
              placeholder="Group Name"
            />
            <button
              className="bg-blue-500 text-white p-2 rounded-r-lg"
              onClick={() => {
                //const groupName = document.getElementById("group-name").value;
                //handleCreateGroup(groupName);
              }}
            >
              + Create Group
            </button>
          </div>
        </div>
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
                      <input
                        type="text"
                        value={editValues.groupname.join(",")}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            groupname: e.target.value.split(","),
                          })
                        }
                        className="p-2 border border-gray-300 rounded"
                      />
                    ) : (
                      account.groupname
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
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Email"
              className="p-2 border border-gray-300 rounded mx-2"
            />
            <input
              type="password"
              placeholder="Password"
              className="p-2 border border-gray-300 rounded mx-2"
            />
            <select className="p-2 border border-gray-300 rounded mx-2">
              <option>DevTeam</option>
              <option>Admins</option>
              <option>Leads</option>
            </select>
            <select className="p-2 border border-gray-300 rounded mx-2">
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
