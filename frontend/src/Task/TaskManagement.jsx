import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../util/Navbar";

const TaskManagementPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProjectManager, setIsProjectManager] = useState(false);
  const [isProjectLead, setIsProjectLead] = useState(false); // State to hold project lead status

  // Retrieve state passed through navigation
  const { applicationName, isProjectLead: initialProjectLead } =
    location.state || {};

  console.log(applicationName);

  useEffect(() => {
    // Set the initial project lead state
    setIsProjectLead(initialProjectLead);

    const fetchAuthStatus = async () => {
      try {
        const response = await axios.get("http://localhost:8080/check-projmg", {
          withCredentials: true,
        });
        setIsProjectManager(response.data.isAuthenticated); // Set based on boolean response
      } catch (error) {
        console.error("Failed to fetch authentication status", error);
        setIsProjectManager(false);
      }
    };

    fetchAuthStatus();
  }, [initialProjectLead]);

  const handleTaskClick = (taskId) => {
    navigate(`/applications/${applicationName}/tasks/${taskId}`);
  };

  const handleCreateTask = () => {
    navigate(`/applications/${applicationName}/tasks/create`, {
      state: {
        applicationName: applicationName,
      },
    });
  };

  const handleReviewTask = (taskId, e) => {
    e.stopPropagation();
    navigate(`/applications/${applicationName}/tasks/${taskId}/edit`);
  };

  const handlePlan = () => {
    navigate(`/applications/${applicationName}/plan`, {
      state: {
        applicationName: applicationName,
        isProjectManager: isProjectManager,
      },
    });
  };

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Tasks for {applicationName}</h1>
        {isProjectLead && (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600"
            onClick={handleCreateTask}
          >
            + Create Task
          </button>
        )}
        {isProjectManager && (
          <button
            className="bg-green-500 text-white px-4 py-2 rounded shadow-lg hover:bg-green-600"
            onClick={handlePlan}
          >
            Plan
          </button>
        )}
      </div>
      <div className="flex justify-between mb-4">
        <div className="flex-1">
          <h2 className="font-bold">Open</h2>
          <div className="border p-2 rounded">
            <div
              onClick={() => handleTaskClick("task1")}
              className="cursor-pointer"
            >
              <div>Task Name</div>
              <div>Description</div>
              <div>Plan Name</div>
            </div>
            {/* Repeat task items as needed */}
          </div>
        </div>
        <div className="flex-1">
          <h2 className="font-bold">To Do</h2>
          <div className="border p-2 rounded">{/* Add tasks similarly */}</div>
        </div>
        <div className="flex-1">
          <h2 className="font-bold">Doing</h2>
          <div className="border p-2 rounded">{/* Add tasks similarly */}</div>
        </div>
        <div className="flex-1">
          <h2 className="font-bold">Done</h2>
          <div className="border p-2 rounded">
            <div
              onClick={() => handleTaskClick("task2")}
              className="cursor-pointer"
            >
              <div>Task Name</div>
              <div>Description</div>
              <div>Plan Name</div>
              {isProjectLead && (
                <button
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600"
                  onClick={(e) => handleReviewTask("task2", e)}
                >
                  Review Task
                </button>
              )}
            </div>
            {/* Repeat task items as needed */}
          </div>
        </div>
        <div className="flex-1">
          <h2 className="font-bold">Closed</h2>
          <div className="border p-2 rounded">{/* Add tasks similarly */}</div>
        </div>
      </div>
    </div>
  );
};

export default TaskManagementPage;
