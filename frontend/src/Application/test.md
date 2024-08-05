import React, { useContext, useState, useEffect } from "react";
import ApplicationBox from "./ApplicationBox";
import Navbar from "../util/Navbar";
import { UserContext } from "../login/UserContext";
import axios from "axios";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const { state, dispatch } = useContext(UserContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8080/getAllApplications",
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
  }, [state.user]);
  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Applications</h1>
      <div className="flex justify-end mb-4">
        <button className="bg-purple-600 text-white px-4 py-2 rounded">
          + Create App
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {applications.map((app, index) => (
          <ApplicationBox key={index} name={app.app_acronym} />
        ))}
      </div>
    </div>
  );
};

export default Applications;
