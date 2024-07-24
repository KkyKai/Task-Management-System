import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../login/UserContext"; // Adjust this import path as needed

const UserManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { state } = useContext(UserContext); // Access the global state
  const navigate = useNavigate();

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
        setError("Error fetching accounts. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, [state.isAuthenticated, navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">User Management</h1>
        <div className="mb-4">
          <label
            htmlFor="group-name"
            className="block text-gray-700 font-bold mb-2"
          >
            Enter Group Name:
          </label>
          <div className="flex">
            <input
              type="text"
              id="group-name"
              className="flex-grow p-2 border border-gray-300 rounded-l-lg"
            />
            <button className="bg-blue-500 text-white p-2 rounded-r-lg">
              + Create Group
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 border">Username</th>
                <th className="py-2 px-4 border">Email</th>
                <th className="py-2 px-4 border">Password</th>
                <th className="py-2 px-4 border">Group</th>
                <th className="py-2 px-4 border">Status</th>
                <th className="py-2 px-4 border">Edit</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border">{account.username}</td>
                  <td className="py-2 px-4 border">{account.email}</td>
                  <td className="py-2 px-4 border">******</td>
                  <td className="py-2 px-4 border">
                    <span className="inline-block bg-gray-100 p-1 rounded">
                      {account.group}
                    </span>
                  </td>
                  <td className="py-2 px-4 border text-green-500">Enabled</td>
                  <td className="py-2 px-4 border">
                    <button className="bg-blue-500 text-white p-1 rounded">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td className="py-2 px-4 border">
                  <input
                    type="text"
                    placeholder="Username"
                    className="p-2 border border-gray-300 rounded"
                  />
                </td>
                <td className="py-2 px-4 border">
                  <input
                    type="text"
                    placeholder="Email"
                    className="p-2 border border-gray-300 rounded"
                  />
                </td>
                <td className="py-2 px-4 border">
                  <input
                    type="password"
                    placeholder="Password"
                    className="p-2 border border-gray-300 rounded"
                  />
                </td>
                <td className="py-2 px-4 border">
                  <select className="p-2 border border-gray-300 rounded">
                    <option>DevTeam</option>
                    <option>Admins</option>
                    <option>Leads</option>
                  </select>
                </td>
                <td className="py-2 px-4 border">
                  <select className="p-2 border border-gray-300 rounded">
                    <option>Enabled</option>
                    <option>Disabled</option>
                  </select>
                </td>
                <td className="py-2 px-4 border">
                  <button className="bg-green-500 text-white p-2 rounded">
                    Create User
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
