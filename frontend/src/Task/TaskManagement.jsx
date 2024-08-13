import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../util/Navbar";
import { UserContext } from "../login/UserContext";

const TaskManagementPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useContext(UserContext);
  const [isProjectManager, setIsProjectManager] = useState(false);
  const [canCreateApp, setCanCreateApp] = useState(false);
  const [canEditOpen, setCanEditOpen] = useState(false);
  const [canEditToDo, setCanEditToDo] = useState(false);
  const [canEditDoing, setCanEditDoing] = useState(false);
  const [canEditDone, setCanEditDone] = useState(false);
  const [tasks, setTasks] = useState({
    open: [],
    todo: [],
    doing: [],
    done: [],
    closed: [],
  });

  // Retrieve state passed through navigation
  const { applicationName } = location.state || {};

  useEffect(() => {
    if (state.loading) return;

    const fetchData = async () => {
      try {
        // Fetch authentication status
        const authResponse = await axios.get(
          "http://localhost:8080/check-projmg",
          {
            withCredentials: true,
          }
        );
        setIsProjectManager(authResponse.data.isAuthenticated);

        // Fetch app creation permission
        const permissionResponse = await axios.post(
          "http://localhost:8080/getAppPermitCreate",
          {
            user: state.user,
            app_acronym: applicationName,
          },
          {
            withCredentials: true,
          }
        );
        setCanCreateApp(permissionResponse.data.hasPermission);

        // Fetch permissions for each task state
        const reviewPermissionResponse = await axios.post(
          "http://localhost:8080/getAppPermitOpen",
          {
            user: state.user,
            app_acronym: applicationName,
          },
          {
            withCredentials: true,
          }
        );
        setCanEditOpen(reviewPermissionResponse.data.hasPermission);

        const todoPermissionResponse = await axios.post(
          "http://localhost:8080/getAppPermitTodo",
          {
            user: state.user,
            app_acronym: applicationName,
          },
          {
            withCredentials: true,
          }
        );
        setCanEditToDo(todoPermissionResponse.data.hasPermission);

        const doingPermissionResponse = await axios.post(
          "http://localhost:8080/getAppPermitDoing",
          {
            user: state.user,
            app_acronym: applicationName,
          },
          {
            withCredentials: true,
          }
        );
        setCanEditDoing(doingPermissionResponse.data.hasPermission);

        const donePermissionResponse = await axios.post(
          "http://localhost:8080/getAppPermitDone",
          {
            user: state.user,
            app_acronym: applicationName,
          },
          {
            withCredentials: true,
          }
        );
        setCanEditDone(donePermissionResponse.data.hasPermission);

        // Fetch tasks for the given app acronym
        const tasksResponse = await axios.post(
          "http://localhost:8080/getAllTask",
          {
            user: state.user,
            task_app_Acronym: applicationName,
          },
          {
            withCredentials: true,
          }
        );

        // Organize tasks by their state
        const organizedTasks = {
          open: [],
          todo: [],
          doing: [],
          done: [],
          closed: [],
        };

        tasksResponse.data.forEach((task) => {
          if (organizedTasks[task.task_state]) {
            organizedTasks[task.task_state].push(task);
          }
        });

        setTasks(organizedTasks);
      } catch (error) {
        console.error("Failed to fetch data", error);
        setIsProjectManager(false);
        setCanCreateApp(false);
        setCanEditOpen(false);
        setCanEditToDo(false);
        setCanEditDoing(false);
        setCanEditDone(false);
      }
    };

    fetchData();
  }, [state.loading, applicationName]);

  const handleTaskClick = (taskId) => {
    navigate(`/applications/${applicationName}/tasks/${taskId}`, {
      state: {
        applicationName: applicationName,
        canEditOpen: canEditOpen,
        canEditToDo: canEditToDo,
        canEditDoing: canEditDoing,
        canEditDone: canEditDone,
      },
    });
  };

  const handleCreateTask = () => {
    navigate(`/applications/${applicationName}/tasks/create`, {
      state: {
        applicationName: applicationName,
      },
    });
  };

  /* const handleReviewTask = (taskId, e) => {
    e.stopPropagation();
    navigate(`/applications/${applicationName}/tasks/${taskId}`);
  }; */

  const handleReviewTask = (taskId, e) => {
    e.stopPropagation();
    navigate(`/applications/${applicationName}/tasks/${taskId}`, {
      state: {
        applicationName: applicationName,
        canEditOpen: canEditOpen,
        canEditToDo: canEditToDo,
        canEditDoing: canEditDoing,
        canEditDone: canEditDone,
      },
    });
  };

  const handlePlan = () => {
    navigate(`/applications/${applicationName}/plan`, {
      state: {
        applicationName: applicationName,
        isProjectManager: isProjectManager,
      },
    });
  };

  const renderTaskList = (taskList, canEdit) => {
    return taskList.map((task) => (
      <div
        key={task.task_id}
        onClick={() => handleTaskClick(task.task_id)}
        className="cursor-pointer border p-2 rounded mb-2"
      >
        <div className="flex">
          <div className="font-bold w-32">Task Name:</div>
          <div>{task.task_name}</div>
        </div>

        <div className="flex">
          <div className="font-bold w-32">Description:</div>
          <div>{task.task_description || ""}</div>
        </div>

        <div className="flex">
          <div className="font-bold w-32">Plan Name:</div>
          <div>{task.task_plan || ""}</div>
        </div>

        {canEdit && (
          <button
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600"
            onClick={(e) => handleReviewTask(task.task_id, e)}
          >
            Review Task
          </button>
        )}
      </div>
    ));
  };

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Tasks for {applicationName}</h1>
        {canCreateApp && (
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
            {renderTaskList(tasks.open, canEditOpen)}
          </div>
        </div>
        <div className="flex-1">
          <h2 className="font-bold">To Do</h2>
          <div className="border p-2 rounded">
            {renderTaskList(tasks.todo, canEditToDo)}
          </div>
        </div>
        <div className="flex-1">
          <h2 className="font-bold">Doing</h2>
          <div className="border p-2 rounded">
            {renderTaskList(tasks.doing, canEditDoing)}
          </div>
        </div>
        <div className="flex-1">
          <h2 className="font-bold">Done</h2>
          <div className="border p-2 rounded">
            {renderTaskList(tasks.done, canEditDone)}
          </div>
        </div>

        <div className="flex-1">
          <h2 className="font-bold">Closed</h2>
          <div className="border p-2 rounded">
            {renderTaskList(tasks.closed, false)}{" "}
            {/* No edit permissions for Closed tasks */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManagementPage;
