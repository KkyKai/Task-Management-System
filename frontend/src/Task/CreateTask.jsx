import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../util/Navbar";

const CreateTask = () => {
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [plan, setPlan] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const { applicationName } = location.state || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission, e.g., send data to backend
    console.log("Task Created:", { taskName, description, plan });
    // Navigate back to the task management page
    navigate(-1); // This navigates back to the previous page
  };

  const handleBack = () => {
    navigate(-1); // This navigates back to the previous page
  };

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg">
        <button
          className="mb-4 bg-gray-300 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-400"
          onClick={handleBack}
        >
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold mb-4 text-center">
          Create Task for {applicationName}
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="taskName"
            >
              Name:
            </label>
            <input
              id="taskName"
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="description"
            >
              Description:
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="plan"
            >
              Plan:
            </label>
            <select
              id="plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              required
            >
              <option value="">Select Plan</option>
              <option value="Plan 1">Plan 1</option>
              <option value="Plan 2">Plan 2</option>
              <option value="Plan 3">Plan 3</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;
