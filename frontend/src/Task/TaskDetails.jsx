import React, { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../login/UserContext";
import Navbar from "../util/Navbar";

const TaskDetailsPage = () => {
  //const { applicationName, taskId } = useParams();
  const { state } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [task, setTask] = useState({});
  const [newNote, setNewNote] = useState("");
  const [planOptions, setPlanOptions] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [requestExtension, setRequestExtension] = useState(false);
  const [planChanged, setPlanChanged] = useState(false);

  const {
    applicationName,
    taskId,
    canEditOpen,
    canEditToDo,
    canEditDoing,
    canEditDone,
  } = location.state || {};

  const formatForDisplay = (text) => {
    return text
      ? text.split("\n").map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))
      : null;
  };

  // Update the planChanged state when plan is changed
  const handlePlanChange = (e) => {
    setTask({ ...task, task_plan: e.target.value });
    setPlanChanged(true);
  };

  const canEditDescription =
    (task.task_state === "open" || task.task_state === "done") &&
    (canEditOpen || canEditDone);

  const canEditPlan =
    (task.task_state === "open" || task.task_state === "done") &&
    (canEditOpen || canEditDone);

  const canAddNote =
    (task.task_state === "open" && canEditOpen) ||
    (task.task_state === "todo" && canEditToDo) ||
    (task.task_state === "doing" && canEditDoing) ||
    (task.task_state === "done" && canEditDone);

  const fetchTaskDetails = useCallback(async () => {
    if (state.loading) return;
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

      // Fetch audit trail
      const auditTrailResponse = await axios.post(
        "http://localhost:8080/getAuditTrail",
        { user: state.user, task_id: taskId },
        { withCredentials: true }
      );
      setAuditTrail(auditTrailResponse.data);
    } catch (error) {
      console.error("Error fetching task details:", error);
    }
  }, [applicationName, taskId, state.user, state.loading]);

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails, state.user, state.loading]);

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleUpdateDetails = async () => {
    const routeMap = {
      open: "/updateTaskWithNoStateChangeOpen",
      todo: "/updateTaskWithNoStateChangeToDo",
      doing: "/updateTaskWithNoStateChangeDoing",
      done: "/updateTaskWithNoStateChangeDone",
    };

    const route = routeMap[task.task_state];

    if (!route) {
      console.error("Invalid task state");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8080${route}`,
        {
          user: state.user,
          task_id: taskId,
          task_app_Acronym: applicationName,
          task_description: task.task_description,
          task_plan: task.task_plan,
          task_state: task.task_state,
          task_owner: state.user,
          notes: newNote,
        },
        { withCredentials: true }
      );
      setNewNote("");
      fetchTaskDetails(); // Refresh data after update
      setPlanChanged(false);

      console.log("New Note:", newNote);
    } catch (error) {
      console.error("Error updating task details:", error);
    }
  };

  const handleReleaseTask = async () => {
    // Define the state transitions
    const stateTransitions = {
      open: "todo",
      todo: "doing",
      doing: "done",
      done: "closed",
    };

    // Determine the new state
    const newState = stateTransitions[task.task_state];

    if (!newState) {
      console.error("Invalid task state");
      return;
    }

    // Define the routes for each state transition
    const routeMap = {
      open: "/updateTaskWithStateChangeOpen",
      todo: "/updateTaskWithStateChangeToDo",
      doing: "/updateTaskWithStateChangeDoing",
      done: "/updateTaskWithStateChangeDone",
    };

    // Get the route based on the current task state
    const route = routeMap[task.task_state];

    if (!route) {
      console.error("Invalid route for task state");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8080${route}`,
        {
          user: state.user,
          task_id: taskId,
          task_app_Acronym: applicationName,
          task_description: task.task_description,
          task_plan: task.task_plan,
          task_state: newState,
          task_owner: state.user,
          notes: newNote,
          task_name: task.task_name,
        },
        { withCredentials: true }
      );

      setNewNote("");
      fetchTaskDetails(); // Refresh data after release
      navigate(-1);
    } catch (error) {
      console.error("Error releasing task:", error);
    }
  };

  const handleGiveUpTask = async () => {
    // Define the state transitions
    const stateTransitions = {
      doing: "todo",
      done: "doing",
    };

    // Determine the new state
    const newState = stateTransitions[task.task_state];

    if (!newState) {
      console.error("Invalid task state");
      return;
    }

    // Define the routes for each state transition
    const routeMap = {
      doing: "/rejectTaskWithStateChangeDoing",
      done: "/rejectTaskWithStateChangeDone",
    };

    // Get the route based on the current task state
    const route = routeMap[task.task_state];

    if (!route) {
      console.error("Invalid route for task state");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8080${route}`,
        {
          user: state.user,
          task_id: taskId,
          task_app_Acronym: applicationName,
          task_description: task.task_description,
          task_plan: task.task_plan,
          task_state: newState,
          task_owner: state.user,
          notes: newNote,
        },
        { withCredentials: true }
      );
      setNewNote("");
      fetchTaskDetails(); // Refresh data after release
      navigate(-1);
    } catch (error) {
      console.error("Error releasing task:", error);
    }
  };

  useEffect(() => {
    console.log("Task Notes:", task.task_notes);
    if (requestExtension) {
      setNewNote("Requesting for Time Extension. \n");
    } else {
      setNewNote(task.task_notes || "");
    }
  }, [requestExtension, task.task_notes]);

  // Determine the action button text based on task state
  const getActionButtonText = () => {
    if (requestExtension) {
      return "Request for Time Extension";
    }

    /*if (task.task_state === "done" && planChanged) {
      return ""; // Do not show any button text if plan has changed and state is done
    } */

    switch (task.task_state) {
      case "open":
        return "Release Task";
      case "todo":
        return "Take On Task";
      case "doing":
        return "Submit Task for Review";
      case "done":
        return "Approve Task";
      default:
        return "";
    }
  };

  const getRejectButtonText = () => {
    switch (task.task_state) {
      case "doing":
        return "Give Up Task";
      case "done":
        return "Reject Task";
      default:
        return "";
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <button
        className="mb-4 bg-gray-300 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-400"
        onClick={handleBack}
      >
        &lt;- Back
      </button>
      <h1 className="text-3xl font-bold mb-4">Task Name: {task.task_name}</h1>

      <div className="grid grid-cols-2 gap-4">
        {/* Task Details */}
        <div>
          <div className="mb-4">
            <label className="block font-bold">Description:</label>
            {(canEditDescription &&
              canEditOpen &&
              task.task_state === "open") ||
            (canEditDescription &&
              canEditDone &&
              task.task_state === "done") ? (
              <textarea
                value={task.task_description || ""}
                onChange={(e) =>
                  setTask({ ...task, task_description: e.target.value })
                }
                className="w-full border rounded p-2"
                disabled={!canEditDescription}
              />
            ) : (
              <p className="border rounded p-2">
                {task.task_description || "No description available"}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-bold">Task ID:</label>
            <p>{task.task_id || "No ID available"}</p>
          </div>

          <div className="mb-4">
            <label className="block font-bold">State:</label>
            <p>{task.task_state || "No state available"}</p>
          </div>

          <div className="mb-4">
            <label className="block font-bold">Creator:</label>
            <p>{task.task_creator || "No creator available"}</p>
          </div>

          <div className="mb-4">
            <label className="block font-bold">Owner:</label>
            <p>{task.task_owner || "No owner available"}</p>
          </div>

          <div className="mb-4">
            <label className="block font-bold">Create Date:</label>
            <p>
              {task.task_createDate
                ? new Date(task.task_createDate).toLocaleDateString()
                : "No creation date available"}
            </p>
          </div>

          <div className="mb-4">
            <label className="block font-bold">Plan:</label>
            {(canEditPlan && canEditOpen && task.task_state === "open") ||
            (canEditPlan && canEditDone && task.task_state === "done") ? (
              <select
                value={task.task_plan || ""}
                onChange={handlePlanChange}
                className="w-full border rounded p-2"
                disabled={!canEditPlan}
              >
                <option value="">Select Plan</option>
                {planOptions.map((plan) => (
                  <option key={plan.plan_MVP_name} value={plan.plan_MVP_name}>
                    {plan.plan_MVP_name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="border rounded p-2">
                {task.task_plan || "No plan available"}
              </p>
            )}
          </div>
        </div>

        {/* Notes and Audit Trail */}
        <div>
          <div className="mb-4">
            <label className="block font-bold">Notes:</label>
            <div className="h-96 overflow-y-auto border rounded p-2 mb-4 resize-y">
              <p>{formatForDisplay(task.task_notes)}</p>
              {auditTrail.length > 0 && (
                <div className="mt-4">
                  <ul>
                    {auditTrail.map((entry, index) => (
                      <li key={index} className="mb-2 border-b border-gray-200">
                        <p>{formatForDisplay(entry.notes)}</p>
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

            {task.task_state === "doing" && canEditDoing && (
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="request-extension"
                  checked={requestExtension}
                  onChange={(e) => setRequestExtension(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="request-extension" className="font-bold">
                  Request Time Extension
                </label>
              </div>
            )}

            {canAddNote && (
              <>
                <div className="mb-4">
                  <label className="block font-bold">Enter New Note:</label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full border rounded p-2"
                  />
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded shadow-lg hover:bg-gray-600 mr-2"
                    onClick={handleBack}
                  >
                    Cancel
                  </button>
                  {!requestExtension && (
                    <>
                      {!(task.task_state === "done" && planChanged) && (
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600 mr-2"
                          onClick={handleUpdateDetails}
                        >
                          Update Details
                        </button>
                      )}

                      {(task.task_state === "doing" ||
                        task.task_state === "done") && (
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded shadow-lg hover:bg-red-600 mr-2"
                          onClick={handleGiveUpTask}
                        >
                          {getRejectButtonText()}
                        </button>
                      )}
                    </>
                  )}

                  {!(task.task_state === "done" && planChanged) && (
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-green-600"
                      onClick={handleReleaseTask}
                    >
                      {getActionButtonText()}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;
