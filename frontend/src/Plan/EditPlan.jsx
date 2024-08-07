import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../util/Navbar";

const EditPlanPage = () => {
  const { applicationName, planId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [planName, setPlanName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/getPlanDetails/${applicationName}/${planId}`
        );
        const { plan_MVP_name, plan_startDate, plan_endDate } = response.data;
        setPlanName(plan_MVP_name);
        setStartDate(plan_startDate);
        setEndDate(plan_endDate);
      } catch (err) {
        console.error("Error fetching plan details:", err);
      }
    };

    fetchPlanDetails();
  }, [applicationName, planId]);

  const handleBack = () => {
    navigate(-1); // Navigates to the previous page
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Updated Plan Name:", planName);
    console.log("Updated Start Date:", startDate);
    console.log("Updated End Date:", endDate);

    // Example of a POST request to update the plan
    // axios.post(`http://localhost:8080/updatePlan/${applicationName}/${planId}`, {
    //   planName,
    //   startDate,
    //   endDate,
    // }).then(response => {
    //   // Handle success
    //   console.log(response.data);
    // }).catch(error => {
    //   // Handle error
    //   console.error(error);
    // });
  };

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="flex justify-between items-center mb-4">
        <button
          className="bg-gray-200 text-black px-4 py-2 rounded shadow-lg hover:bg-gray-300"
          onClick={handleBack}
        >
          &lt;- Back
        </button>
        <h1 className="text-3xl font-bold">Edit Plan</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xl font-medium" htmlFor="planName">
            Plan MVP Name:
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
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default EditPlanPage;
