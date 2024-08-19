import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../login/UserContext";
import axios from "axios";
import Navbar from "../util/Navbar";

const EditApplication = () => {
  const { state } = useContext(UserContext);
  const { name } = useParams(); // Extract application name from route params
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
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!state.user || state.loading) return;

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

    const fetchApplicationData = async () => {
      try {
        const response = await axios.post(
          `http://localhost:8080/getApplicationDetails`,
          { user: state.user, app_acronym: name },
          { withCredentials: true }
        );
        const appData = response.data[0];

        const formatDate = (date) => new Date(date).toISOString().split("T")[0]; // Converts to YYYY-MM-DD

        setAcronym(appData.app_acronym);
        setDescription(appData.app_description);
        setRnumber(appData.app_rnumber);
        setStartDate(formatDate(appData.app_startdate));
        setEndDate(formatDate(appData.app_enddate));
        setPermissions({
          app_permit_create: appData.app_permit_create || "",
          app_permit_open: appData.app_permit_open || "",
          app_permit_todolist: appData.app_permit_todolist || "",
          app_permit_doing: appData.app_permit_doing || "",
          app_permit_done: appData.app_permit_done || "",
        });
      } catch (error) {
        console.error("Error fetching application data:", error);
        setError("Error fetching application details");
      }
    };

    fetchGroups();
    fetchApplicationData();
  }, [name, state.user, state.loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous success and error messages
    setSuccessMessage("");
    setError("");

    const processedPermissions = {
      app_permit_create: (permissions.app_permit_create || "").trim() || null,
      app_permit_open: (permissions.app_permit_open || "").trim() || null,
      app_permit_todolist:
        (permissions.app_permit_todolist || "").trim() || null,
      app_permit_doing: (permissions.app_permit_doing || "").trim() || null,
      app_permit_done: (permissions.app_permit_done || "").trim() || null,
    };

    console.log({
      acronym,
      description,
      startDate,
      endDate,
      ...processedPermissions,
    });

    try {
      await axios.post(
        "http://localhost:8080/editApplication",
        {
          user: state.user,
          app_acronym: acronym,
          app_description: description,
          app_startdate: startDate,
          app_enddate: endDate,
          ...processedPermissions,
        },
        { withCredentials: true }
      );

      setSuccessMessage("Application edited successfully!");

      // Redirect to /landing on successful edit
      navigate("/landing");
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data); // Capture and display the backend error message
      } else {
        setError("An unexpected error occurred"); // Default error message
      }
      console.error("Error updating application:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <Navbar />
      <button
        className="text-blue-500 underline mb-4"
        onClick={() => navigate(-1)}
      >
        &lt;- Back
      </button>
      <h1 className="text-2xl font-bold mb-6 text-center">Edit Application</h1>
      {successMessage && (
        <div className="mb-4 p-4 bg-green-200 text-green-800 rounded">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-200 text-red-800 rounded">{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700">Acronym:</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={acronym}
                readOnly // Make this field read-only
              />
            </div>
            <div>
              <label className="block text-gray-700">Description:</label>
              <textarea
                className="w-full h-32 p-2 border border-gray-300 rounded"
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
                readOnly
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
                    value={permissions[`app_permit_${permission}`] || ""}
                    onChange={(e) => {
                      const selectedValue = e.target.value || null; // Set to null if empty string
                      setPermissions({
                        ...permissions,
                        [`app_permit_${permission}`]: selectedValue,
                      });
                    }}
                  >
                    <option value="">Select Group</option>{" "}
                    {/* Default option */}
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

export default EditApplication;
