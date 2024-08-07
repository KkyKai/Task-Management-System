import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../util/Navbar";
import { UserContext } from "../login/UserContext";
import axios from "axios";

const CreatePlanPage = () => {
  const [planName, setPlanName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);

  const { applicationName } = location.state || {};

  // Check if the context is loading or user data is not available
  useEffect(() => {
    if (state.loading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [state.loading]);

  const handleBack = () => {
    navigate(-1); // Navigates to the previous page
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Plan Name:", planName);
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    console.log("plan_app_Acronym Name:", applicationName);

    // Example of a POST request to create a new plan
    axios
      .post(
        "http://localhost:8080/createPlan",
        {
          user: state.user,
          plan_MVP_name: planName,
          plan_startDate: startDate,
          plan_endDate: endDate,
          plan_app_Acronym: applicationName,
        },
        { withCredentials: true }
      )
      .then((response) => {
        // Handle success
        console.log(response.data);
      })
      .catch((error) => {
        // Handle error
        console.error(error);
      });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Navbar />
      <div className="flex justify-between items-center mb-4">
        <button
          className="bg-gray-200 text-black px-4 py-2 rounded shadow-lg hover:bg-gray-300"
          onClick={handleBack}
        >
          &lt;- Back
        </button>
        <h1 className="text-3xl font-bold text-center w-full">Create Plan</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        <div>
          <label className="block text-xl font-medium" htmlFor="planName">
            Plan Name:
          </label>
          <input
            type="text"
            id="planName"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            className="w-full p-2 border rounded shadow-lg"
            placeholder="Enter Plan Name"
            required
          />
        </div>
        <div>
          <label className="block text-xl font-medium" htmlFor="startDate">
            Start Date:
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border rounded shadow-lg"
            required
          />
        </div>
        <div>
          <label className="block text-xl font-medium" htmlFor="endDate">
            End Date:
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border rounded shadow-lg"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePlanPage;
