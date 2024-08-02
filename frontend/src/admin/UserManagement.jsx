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
  const [newGroup, setNewGroup] = useState("");
  const navigate = useNavigate();
  const [message, setMessage] = useState(""); // State for feedback messages

  const [editIndex, setEditIndex] = useState(-1);
  const [editValues, setEditValues] = useState({
    username: "",
    email: "",
    password: "",
    groupname: [],
    disabled: false,
  });

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    groupname: [],
    disabled: false,
  });

  //const [userStatus, setUserStatus] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accountsResponse = await axios.get(
          `http://localhost:8080/getAllAccounts/${state.user}`,
          { withCredentials: true }
        );
        const allAccounts = accountsResponse.data;

        const groupRequests = allAccounts.map((account) =>
          axios.get(`http://localhost:8080/getGroupbyUsers/${state.user}`, {
            params: { username: account.username },
            withCredentials: true,
          })
        );

        const groupsResponses = await Promise.all(groupRequests);

        const accountsWithGroups = allAccounts.map((account, index) => {
          const groupsForUser = groupsResponses[index].data.map(
            (g) => g.groupname
          );
          return {
            ...account,
            groupname: groupsForUser,
          };
        });

        setAccounts(accountsWithGroups);

        const groupsResponse = await axios.get(
          `http://localhost:8080/getAllGroups/${state.user}`,
          { withCredentials: true }
        );
        setGroups(groupsResponse.data.map((group) => group.groupname));

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
  }, [state.user]);

  if (loading) return <div>Loading... due to fetch</div>;
  if (error) return <div>{error}</div>;

  const handleEdit = (index) => {
    const accountToEdit = accounts[index];
    setEditIndex(index);
    setEditValues({
      username: accountToEdit.username,
      email: accountToEdit.email,
      password: "",
      groupname: accountToEdit.groupname || [],
      disabled: accountToEdit.disabled,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Update user information
      const updateResponse = await axios.put(
        `http://localhost:8080/updateUser/${state.user}`,
        {
          username: editValues.username,
          email: editValues.email,
          password: editValues.password,
          disabled: editValues.disabled,
        },
        { withCredentials: true }
      );

      // Display success message from update response
      setMessage(updateResponse.data.message || "User updated successfully");

      const account = accounts.find(
        (acc) => acc.username === editValues.username
      );
      const existingGroups = account.groupname || [];
      const updatedGroups = editValues.groupname;

      const groupsToAdd = updatedGroups.filter(
        (group) => !existingGroups.includes(group)
      );
      const groupsToRemove = existingGroups.filter(
        (group) => !updatedGroups.includes(group)
      );

      // Add new groups
      if (groupsToAdd.length > 0) {
        for (const group of groupsToAdd) {
          const addGroupResponse = await axios.post(
            `http://localhost:8080/createUserGroup/${state.user}`,
            {
              groupname: group,
              username: editValues.username,
            },
            { withCredentials: true }
          );

          // Display success message from add group response
          setMessage(
            addGroupResponse.data.message || "Group added successfully"
          );
        }
      }

      // Remove old groups
      if (groupsToRemove.length > 0) {
        for (const group of groupsToRemove) {
          const removeGroupResponse = await axios.delete(
            `http://localhost:8080/removeGroup/${state.user}`,
            {
              data: { groupname: group, userID: editValues.username },
              withCredentials: true,
            }
          );

          // Display success message from remove group response
          setMessage(
            removeGroupResponse.data.message || "Group removed successfully"
          );
        }
      }

      const updatedAccounts = accounts.map((account, index) =>
        index === editIndex ? { ...account, ...editValues } : account
      );
      setAccounts(updatedAccounts);
      setEditIndex(-1);
    } catch (error) {
      // Display error message
      setMessage(error.response?.data.message || "Error updating user");
      console.error("Error updating user:", error);
    }
  };

  const cancelEdit = () => {
    setEditIndex(-1);
  };

  const handleCreateUser = async () => {
    try {
      // Convert disabled state to boolean
      const isDisabled = newUser.disabled === "Disabled";
      // Construct the new user details
      const newUserDetails = {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        groupname: newUser.groupname.join(","),
        disabled: isDisabled,
      };

      console.log(newUserDetails);

      // Send a POST request to create the new user
      const response = await axios.post(
        `http://localhost:8080/createAccount/${state.user}`,
        newUserDetails,
        { withCredentials: true }
      );

      // Display success message from response
      setMessage(response.data.message || "User created successfully");

      console.log("User created successfully:", response.data);

      // Add the new user to the accounts state
      setAccounts([
        ...accounts,
        {
          ...newUserDetails,
          groupname: newUser.groupname,
        },
      ]);

      for (const group of newUser.groupname) {
        await axios.post(
          `http://localhost:8080/createUserGroup/${state.user}`,
          {
            groupname: group,
            username: newUser.username,
          },
          { withCredentials: true }
        );
      }

      // Reset the newUser state
      setNewUser({
        username: "",
        email: "",
        password: "",
        groupname: [],
        disabled: false,
      });

      // Display success message
      setMessage("User created successfully.");
    } catch (error) {
      console.error("Error creating user:", error);
      setMessage(error.response?.data.message || "Error creating user");
    }
  };

  const handleCreateGroup = async () => {
    try {
      await axios.post(
        `http://localhost:8080/addGroup/${state.user}`,
        { groupname: newGroup, username: null },
        { withCredentials: true }
      );

      // Update the groups state to include the new group
      setGroups((prevGroups) => [...prevGroups, newGroup]);

      // Reset the new group state
      setNewGroup("");

      // Display success message
      setMessage("Group created successfully.");
    } catch (error) {
      console.error("Error creating group:", error);
      setMessage(error.response?.data.message || "Error creating group");
    }
  };

  const handleGroupChange = (selectedGroups) => {
    setEditValues({
      ...editValues,
      groupname: selectedGroups,
    });
  };

  const handleNewUserGroupChange = (selectedGroups) => {
    setNewUser({
      ...newUser,
      groupname: selectedGroups,
    });
  };

  const isAdmin = (username) => username === "admin";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <Navbar />

      <div className="w-full max-w-6xl bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">User Management</h1>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-4 p-2 rounded ${
              message.startsWith("Error")
                ? "bg-red-200 text-red-800"
                : "bg-green-200 text-green-800"
            }`}
          >
            {message}
          </div>
        )}

        <div className="overflow-x-auto mb-4">
          {/* New Group Creation Section */}
          <div className="flex justify-center mb-4">
            <input
              type="text"
              placeholder="New Group"
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            />
            <button
              className="bg-blue-500 text-white p-2 rounded ml-2"
              onClick={handleCreateGroup}
            >
              Create Group
            </button>
          </div>

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

                  <td className="py-2 px-4 border">
                    {editIndex === index ? (
                      <input
                        type="text"
                        value={editValues.email}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            email: e.target.value,
                          })
                        }
                        className="p-2 border border-gray-300 rounded"
                      />
                    ) : (
                      `${account.email}`
                    )}
                  </td>

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
                      isAdmin(editValues.username) ? (
                        (String(account.groupname) || "")
                          .split(",")
                          .map((group) => group.trim())
                          .join(", ")
                      ) : (
                        <MultiSelectDropdown
                          options={groups}
                          selectedOptions={editValues.groupname}
                          onChange={handleGroupChange}
                        />
                      )
                    ) : (
                      (String(account.groupname) || "")
                        .split(",")
                        .map((group) => group.trim())
                        .join(", ")
                    )}
                  </td>

                  <td className="py-2 px-4 border">
                    {editIndex === index ? (
                      isAdmin(editValues.username) ? (
                        account.disabled ? (
                          "Disabled"
                        ) : (
                          "Enabled"
                        )
                      ) : (
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
                      )
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
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="p-2 border border-gray-300 rounded mx-2"
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              className="p-2 border border-gray-300 rounded mx-2"
            />
            <MultiSelectDropdown
              options={groups}
              selectedOptions={newUser.groupname}
              onChange={handleNewUserGroupChange}
            />

            <select
              value={newUser.disabled ? "Disabled" : "Enabled"}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  disabled: e.target.value,
                })
              }
              className="p-2 px-4 border border-gray-300 rounded mx-2 w-64"
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
