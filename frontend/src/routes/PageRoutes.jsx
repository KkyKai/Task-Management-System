import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../login/Login";
import UserManagement from "../admin/UserManagement";
import ProtectedRoute from "../login/PrivateRoute";
import Profile from "../Profile/profile";
import Application from "../Application/Application";
import CreateApplication from "../Application/CreateApplication";
import EditApplication from "../Application/editApplication";
import TaskBoard from "../Task/TaskManagement";
import PlanManagementPage from "../Plan/PlanManagement";
import CreatePlanPage from "../Plan/CreatePlan";
import EditPlanPage from "../Plan/EditPlan";
import CreateTask from "../Task/CreateTask";
import TaskDetailsPage from "../Task/TaskDetails";

function PageRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/usermanagement"
          element={<ProtectedRoute element={UserManagement} />}
        />

        <Route path="/profile" element={<Profile />} />

        <Route path="/landing" element={<Application />} />

        <Route path="/create-application" element={<CreateApplication />} />
        <Route path="/applications/:name/edit" element={<EditApplication />} />

        <Route path="/applications/:name" element={<TaskBoard />} />

        <Route
          path="/applications/:name/plan"
          element={<PlanManagementPage />}
        />
        <Route
          path="/applications/:applicationName/plans/create"
          element={<CreatePlanPage />}
        />
        <Route
          path="/applications/:applicationName/plans/:planId/edit"
          element={<EditPlanPage />}
        />

        <Route
          path="/applications/:applicationName/tasks/create"
          element={<CreateTask />}
        />

        <Route
          path="/applications/:applicationName/tasks/:taskId"
          element={<TaskDetailsPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default PageRoutes;
