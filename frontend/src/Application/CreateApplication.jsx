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
    create: "",
    open: "",
    todo: "",
    doing: "",
    done: "",
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log({
      acronym,
      description,
      rnumber,
      startDate,
      endDate,
      permissions,
    });
    // After submission, you can navigate back or to another route
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
                min="0" // Ensures only positive numbers or zero
                step="1" // Ensures integer input
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
            <div>
              <label className="block text-gray-700">Permit_Create:</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={permissions.create}
                onChange={(e) =>
                  setPermissions({ ...permissions, create: e.target.value })
                }
              >
                <option>Select Group</option>
                <option value="group1">Group 1</option>
                <option value="group2">Group 2</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Permit_Open:</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={permissions.open}
                onChange={(e) =>
                  setPermissions({ ...permissions, open: e.target.value })
                }
              >
                <option>Select Group</option>
                <option value="group1">Group 1</option>
                <option value="group2">Group 2</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Permit_ToDo:</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={permissions.todo}
                onChange={(e) =>
                  setPermissions({ ...permissions, todo: e.target.value })
                }
              >
                <option>Select Group</option>
                <option value="group1">Group 1</option>
                <option value="group2">Group 2</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Permit_Doing:</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={permissions.doing}
                onChange={(e) =>
                  setPermissions({ ...permissions, doing: e.target.value })
                }
              >
                <option>Select Group</option>
                <option value="group1">Group 1</option>
                <option value="group2">Group 2</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Permit_Done:</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={permissions.done}
                onChange={(e) =>
                  setPermissions({ ...permissions, done: e.target.value })
                }
              >
                <option>Select Group</option>
                <option value="group1">Group 1</option>
                <option value="group2">Group 2</option>
              </select>
            </div>
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
