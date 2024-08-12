import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../login/UserContext";
import Navbar from "../util/Navbar";

const TaskDetailsPage = () => {
  const { applicationName, taskId } = useParams();
  const { state } = useContext(UserContext);
  const navigate = useNavigate();

  const [task, setTask] = useState({});
  const [newNote, setNewNote] = useState("");
  const [canEditDescription, setCanEditDescription] = useState(false);
  const [canEditPlan, setCanEditPlan] = useState(false);
  const [canEditNotes, setCanEditNotes] = useState(false);
  const [planOptions, setPlanOptions] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!state.user || state.loading) return;
      try {
        // Fetch task details
        const taskResponse = await axios.post(
          "http://localhost:8080/getTaskDetails",
          {
            user: state.user,
            task_id: taskId,
          },
          { withCredentials: true }
        );
        setTask(taskResponse.data);

        // Fetch plan options
        const planResponse = await axios.post(
          "http://localhost:8080/getApplicationPlan",
          { user: state.user, app_acronym: applicationName },
          { withCredentials: true }
        );
        setPlanOptions(planResponse.data);

        // Fetch permissions
        const openPermissionResponse = await axios.post(
          "http://localhost:8080/getAppPermitOpen",
          { user: state.user, app_acronym: applicationName },
          { withCredentials: true }
        );
        setCanEditDescription(openPermissionResponse.data.hasPermission);
        setCanEditPlan(openPermissionResponse.data.hasPermission);

        // Fetch audit trail
        const auditTrailResponse = await axios.post(
          "http://localhost:8080/getAuditTrail",
          { user: state.user, task_id: taskId },
          { withCredentials: true }
        );
        setAuditTrail(auditTrailResponse.data);
        console.log(auditTrailResponse);

        const notesPermissionResponse = await axios.post(
          "http://localhost:8080/getAppPermitNotes",
          { user: state.user, app_acronym: applicationName },
          { withCredentials: true }
        );
        setCanEditNotes(notesPermissionResponse.data.hasPermission);
      } catch (error) {
        console.error("Error fetching task details:", error);
      }
    };

    fetchTaskDetails();
  }, [applicationName, taskId, state.user, state.loading]);

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleSave = async () => {
    // Handle the save logic here
    try {
      const updateResponse = await axios.post(
        "http://localhost:8080/updateTaskDetails",
        {
          task_id: taskId,
          task_app_Acronym: applicationName,
          task_description: task.task_description,
          task_plan: task.task_plan,
          task_notes: `${task.task_notes}\n\n${newNote}`, // Append new note to existing notes
        },
        { withCredentials: true }
      );
      console.log("Update response:", updateResponse.data);
      // Navigate back or show a success message
    } catch (error) {
      console.error("Error updating task details:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <h1 className="text-3xl font-bold mb-4">Task Details</h1>
      <div className="grid grid-cols-2 gap-4">
        {/* Task Details */}
        <div>
          <div className="mb-4">
            <label className="block font-bold">Description:</label>
            {canEditDescription ? (
              <textarea
                value={task.task_description}
                onChange={(e) =>
                  setTask({ ...task, task_description: e.target.value })
                }
                className="w-full border rounded p-2"
              />
            ) : (
              <p className="border rounded p-2">{task.task_description}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-bold">Task ID:</label>
            <p>{task.task_id}</p>
          </div>

          <div className="mb-4">
            <label className="block font-bold">State:</label>
            <p>{task.task_state}</p>
          </div>

          <div className="mb-4">
            <label className="block font-bold">Creator:</label>
            <p>{task.task_creator}</p>
          </div>

          <div className="mb-4">
            <label className="block font-bold">Owner:</label>
            <p>{task.task_owner}</p>
          </div>

          <div className="mb-4">
            <label className="block font-bold">Create Date:</label>
            <p>{task.task_create_date}</p>
          </div>

          <div className="mb-4">
            <label className="block font-bold">Plan:</label>
            {canEditPlan ? (
              <select
                value={task.task_plan}
                onChange={(e) =>
                  setTask({ ...task, task_plan: e.target.value })
                }
                className="w-full border rounded p-2"
              >
                <option value="">Select Plan</option>
                {planOptions.map((plan) => (
                  <option key={plan.plan_MVP_name} value={plan.plan_MVP_name}>
                    {plan.plan_MVP_name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="border rounded p-2">{task.task_plan}</p>
            )}
          </div>
        </div>

        {/* Notes and Audit Trail */}
        <div>
          <div className="mb-4">
            <label className="block font-bold">Notes:</label>
            <div className="h-48 overflow-y-auto border p-2 mb-4">
              <p>{task.task_notes}</p>
              {auditTrail.length > 0 && (
                <div className="mt-4">
                  <ul>
                    {auditTrail.map((entry, index) => (
                      <li key={index} className="mb-2 border-b border-gray-200">
                        <p>{entry.notes}</p>
                        <p className="text-gray-600 text-sm">
                          Created At:{" "}
                          {new Date(entry.tasknote_created).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block font-bold">Enter New Note:</label>
              {canEditNotes ? (
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full border rounded p-2"
                />
              ) : (
                <p className="border rounded p-2">
                  You do not have permission to add notes.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded shadow-lg hover:bg-gray-600 mr-2"
          onClick={handleBack}
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
    </div>
  );
};

export default TaskDetailsPage;
