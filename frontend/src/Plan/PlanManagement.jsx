import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PlanManagementPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProjectManager, setIsProjectManager] = useState(false);

  const { applicationName, isProjectManager: initialProjectManager } =
    location.state || {};

  const handlePlanClick = (planId) => {
    navigate(`/applications/${applicationName}/plans/${planId}`);
  };

  const handleCreatePlan = () => {
    navigate(`/applications/${applicationName}/plans/create`);
  };

  const handleEditPlan = (planId, e) => {
    e.stopPropagation();
    navigate(`/applications/${applicationName}/plans/${planId}/edit`);
  };

  const handleBack = () => {
    navigate(-1); // Navigates to the previous page
  };

  useEffect(() => {
    if (initialProjectManager !== undefined) {
      setIsProjectManager(initialProjectManager);
    }
  }, [initialProjectManager]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          className="bg-gray-200 text-black px-4 py-2 rounded shadow-lg hover:bg-gray-300"
          onClick={handleBack}
        >
          &lt;- Back
        </button>
        <h1 className="text-3xl font-bold">
          Application {applicationName} Plans
        </h1>
        {isProjectManager && (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600"
            onClick={handleCreatePlan}
          >
            + Create Plan
          </button>
        )}
      </div>
      <div className="space-y-4">
        <div
          className="border p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-100"
          onClick={() => handlePlanClick("plan1")}
        >
          <div>
            <div className="font-bold">Plan MVP Name</div>
            <div>Plan Start Date: DD/MM/YYYY</div>
            <div>Plan End Date: DD/MM/YYYY</div>
          </div>
          {isProjectManager && (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600"
              onClick={(e) => handleEditPlan("plan1", e)}
            >
              + Edit
            </button>
          )}
        </div>
        <div
          className="border p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-100"
          onClick={() => handlePlanClick("plan2")}
        >
          <div>
            <div className="font-bold">Plan MVP Name</div>
            <div>Plan Start Date: DD/MM/YYYY</div>
            <div>Plan End Date: DD/MM/YYYY</div>
          </div>
          {isProjectManager && (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600"
              onClick={(e) => handleEditPlan("plan2", e)}
            >
              + Edit
            </button>
          )}
        </div>
        {/* Repeat similar divs for more plans */}
      </div>
    </div>
  );
};

export default PlanManagementPage;
