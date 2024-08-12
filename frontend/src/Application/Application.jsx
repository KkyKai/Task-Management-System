import React, { useContext, useState, useEffect } from "react";
import Navbar from "../util/Navbar";
import ApplicationBox from "./ApplicationBox";
import { UserContext } from "../login/UserContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Application = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const { state } = useContext(UserContext); // `dispatch` is not used
  const [isProjectLead, setIsProjectLead] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (state.loading) return; // Return early if user data is still loading

    const fetchAuthStatus = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/check-projlead",
          {
            withCredentials: true,
          }
        );
        setIsProjectLead(response.data.isAuthenticated); // Set based on boolean response
      } catch (error) {
        console.error("Failed to fetch authentication status", error);
        setIsProjectLead(false);
      }
    };

    fetchAuthStatus();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8080/getAllAppNames",
          { user: state.user },
          { withCredentials: true }
        );
        console.log("Response data:", response.data);
        setApplications(response.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [state.user, state.loading]);

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Applications</h1>
      {isProjectLead && (
        <div className="flex justify-end mb-4">
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded"
            onClick={() => navigate("/create-application")}
          >
            + Create App
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {applications.map((app, index) => (
          <ApplicationBox
            key={index}
            name={app.app_acronym}
            isProjectLead={isProjectLead} // Pass the `isProjectLead` prop
          />
        ))}
      </div>
    </div>
  );
};

export default Application;
