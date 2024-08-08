import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../login/UserContext";
import axios from "axios";

const PlanManagementPage = () => {
  const { state } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isProjectManager, setIsProjectManager] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");

  const { applicationName, isProjectManager: initialProjectManager } =
    location.state || {};

  useEffect(() => {
    if (initialProjectManager !== undefined) {
      setIsProjectManager(initialProjectManager);
    }
  }, [initialProjectManager]);

  useEffect(() => {
    if (state.loading) return; // Return early if user data is still loading

    const fetchPlans = async () => {
      try {
        console.log("Sending request with:", {
          user: state.user,
          app_acronym: applicationName,
        });
        const response = await axios.post(
          "http://localhost:8080/getApplicationPlan",
          { user: state.user, app_acronym: applicationName },
          { withCredentials: true }
        );
        setPlans(response.data);
      } catch (err) {
        setError("Error fetching plans");
        console.error("Error fetching plans:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [state.user, state.loading, applicationName]);

  const handleEditClick = (plan) => {
    setEditingPlanId(plan.plan_MVP_name);
    setEditStartDate(plan.plan_startDate);
    setEditEndDate(plan.plan_endDate);
  };

  const handleSave = async () => {
    try {
      await axios.post(
        "http://localhost:8080/editPlan",
        {
          user: state.user,
          plan_startDate: editStartDate,
          plan_endDate: editEndDate,
          plan_MVP_name: editingPlanId,
          plan_app_Acronym: applicationName,
        },
        { withCredentials: true }
      );
      // Update the local state with the new values
      setPlans(
        plans.map((plan) =>
          plan.plan_MVP_name === editingPlanId
            ? {
                ...plan,
                plan_startDate: editStartDate,
                plan_endDate: editEndDate,
              }
            : plan
        )
      );
      setEditingPlanId(null);
    } catch (err) {
      setError("Error updating plan");
      console.error("Error updating plan:", err);
    }
  };

  const handleCancel = () => {
    setEditingPlanId(null);
  };

  if (state.loading) return <div>Loading user data...</div>;
  if (loading) return <div>Loading plans...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          className="bg-gray-200 text-black px-4 py-2 rounded shadow-lg hover:bg-gray-300"
          onClick={() => navigate(-1)}
        >
          &lt;- Back
        </button>
        <h1 className="text-3xl font-bold">
          Application {applicationName} Plans
        </h1>
        {isProjectManager && (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600"
            onClick={() =>
              navigate(`/applications/${applicationName}/plans/create`, {
                state: { applicationName },
              })
            }
          >
            + Create Plan
          </button>
        )}
      </div>
      <div className="space-y-4">
        {plans.length > 0 ? (
          plans.map((plan) => (
            <div
              key={plan.plan_MVP_name}
              className="border p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-100"
            >
              <div>
                <div className="font-bold">{plan.plan_MVP_name}</div>
                <div>
                  Plan Start Date:{" "}
                  {editingPlanId === plan.plan_MVP_name ? (
                    <input
                      type="date"
                      value={editStartDate.split("T")[0]}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="border p-2 rounded"
                    />
                  ) : (
                    new Date(plan.plan_startDate).toLocaleDateString()
                  )}
                </div>
                <div>
                  Plan End Date:{" "}
                  {editingPlanId === plan.plan_MVP_name ? (
                    <input
                      type="date"
                      value={editEndDate.split("T")[0]}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="border p-2 rounded"
                    />
                  ) : (
                    new Date(plan.plan_endDate).toLocaleDateString()
                  )}
                </div>
              </div>
              {isProjectManager && (
                <div>
                  {editingPlanId === plan.plan_MVP_name ? (
                    <div>
                      <button
                        className="bg-gray-500 text-white px-4 py-2 rounded shadow-lg hover:bg-gray-600 mr-2"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600"
                        onClick={handleSave}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600"
                      onClick={() => handleEditClick(plan)}
                    >
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div>No plans available.</div>
        )}
      </div>
    </div>
  );
};

export default PlanManagementPage;
