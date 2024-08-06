import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../login/UserContext";
import axios from "axios";
import Navbar from "../util/Navbar";

const CreateApplication = () => {
  const { state, dispatch } = useContext(UserContext);
  const [acronym, setAcronym] = useState("");
  const [description, setDescription] = useState("");
  const [rnumber, setRnumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [permissions, setPermissions] = useState({
    app_permit_create: "",
    app_permit_open: "",
    app_permit_todolist: "",
    app_permit_doing: "",
    app_permit_done: "",
  });
  const [groups, setGroups] = useState([]); // New state for groups
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch groups on component mount
    const fetchGroups = async () => {
      try {
        const groupsResponse = await axios.post(
          "http://localhost:8080/getAllGroups",
          { user: state.user },
          { withCredentials: true }
        );
        setGroups(groupsResponse.data.map((group) => group.groupname));
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, [state.user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const processedPermissions = {
      app_permit_create:
        permissions.app_permit_create.trim() === ""
          ? null
          : permissions.app_permit_create,
      app_permit_open:
        permissions.app_permit_open.trim() === ""
          ? null
          : permissions.app_permit_open,
      app_permit_todolist:
        permissions.app_permit_todolist.trim() === ""
          ? null
          : permissions.app_permit_todolist,
      app_permit_doing:
        permissions.app_permit_doing.trim() === ""
          ? null
          : permissions.app_permit_doing,
      app_permit_done:
        permissions.app_permit_done.trim() === ""
          ? null
          : permissions.app_permit_done,
    };

    // Logging the current state for debugging
    console.log({
      acronym,
      description,
      rnumber,
      startDate,
      endDate,
      permissions: processedPermissions,
    });

    try {
      // Make the API request
      const response = await axios.post(
        "http://localhost:8080/createApplication",
        {
          user: state.user,
          app_acronym: acronym,
          app_description: description,
          app_rnumber: rnumber,
          app_startdate: startDate,
          app_enddate: endDate,
          permissions: processedPermissions,
        },
        { withCredentials: true }
      );
    } catch (error) {
      // Handle errors
      console.error("Error updating user information:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <Navbar />
      <button
        className="text-blue-500 underline mb-4"
        onClick={() => navigate(-1)}
      >
        &lt;- Back
      </button>
      <h1 className="text-2xl font-bold mb-6 text-center">
        Create Application
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          {/* Column 1: General Information */}
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700">Acronym:</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={acronym}
                onChange={(e) => setAcronym(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700">Description:</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700">Rnumber:</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                value={rnumber}
                onChange={(e) => setRnumber(e.target.value)}
                min="0"
                step="1"
              />
            </div>
            <div>
              <label className="block text-gray-700">Start Date:</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700">End Date:</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Column 2: Permissions */}
          <div className="space-y-6">
            {["create", "open", "todolist", "doing", "done"].map(
              (permission) => (
                <div key={permission}>
                  <label className="block text-gray-700">
                    Permit_
                    {permission.charAt(0).toUpperCase() + permission.slice(1)}:
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded"
                    value={permissions[`app_permit_${permission}`]}
                    onChange={(e) =>
                      setPermissions({
                        ...permissions,
                        [`app_permit_${permission}`]: e.target.value,
                      })
                    }
                  >
                    <option>Select Group</option>
                    {groups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>
              )
            )}
          </div>
        </div>
        <div className="text-center mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateApplication;
