import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../util/Navbar";
import axios from "axios";
import { UserContext } from "../login/UserContext";

const CreateTask = () => {
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [plan, setPlan] = useState("");
  const [plans, setPlans] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useContext(UserContext);

  const { applicationName } = location.state || {};

  useEffect(() => {
    if (!state.user || state.loading) return;

    const fetchPlans = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8080/getApplicationPlan",
          { user: state.user, app_acronym: applicationName },
          { withCredentials: true }
        );
        const planNames = response.data.map((plan) => plan.plan_MVP_name);
        setPlans(planNames);
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    };

    fetchPlans();
  }, [state.user, state.loading, applicationName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/createTask",
        {
          user: state.user,
          task_name: taskName,
          task_description: description,
          task_plan: plan,
          task_app_Acronym: applicationName,
          task_creator: state.user,
          task_owner: state.user,
        },
        { withCredentials: true }
      );

      console.log("Task Created:", response.data);

      // Clear form fields after successful task creation
      setTaskName("");
      setDescription("");
      setPlan("");
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
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
            >
              <option value="">Select Plan</option>
              {plans.map((p, index) => (
                <option key={index} value={p}>
                  {p}
                </option>
              ))}
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
