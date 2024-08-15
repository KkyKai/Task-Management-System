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
import CreateTask from "../Task/CreateTask";
import TaskDetailsPage from "../Task/TaskDetails";

function PageRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/usermanagement"
          element={
            <ProtectedRoute element={UserManagement} requiredRole="admin" />
          }
        />

        <Route path="/profile" element={<Profile />} />

        <Route path="/landing" element={<Application />} />

        <Route
          path="/create-application"
          element={
            <ProtectedRoute
              element={CreateApplication}
              requiredRole="projectlead"
            />
          }
        />
        <Route
          path="/applications/:name/edit"
          element={
            <ProtectedRoute
              element={EditApplication}
              requiredRole="projectlead"
            />
          }
        />
        <Route
          path="/applications/:name/plan"
          element={
            <ProtectedRoute
              element={PlanManagementPage}
              requiredRole="projectmanager"
            />
          }
        />
        <Route
          path="/applications/:applicationName/plans/create"
          element={
            <ProtectedRoute
              element={CreatePlanPage}
              requiredRole="projectmanager"
            />
          }
        />

        <Route path="/applications/:name" element={<TaskBoard />} />

        <Route
          path="/applications/:applicationName/tasks/create"
          element={
            <ProtectedRoute element={CreateTask} checkAppPermission={true} />
          }
        />

        <Route path="/applications/tasks" element={<TaskDetailsPage />} />

        {/* 
                <Route
          path="/applications/:applicationName/tasks/:taskId"
          element={<TaskDetailsPage />}
        />
        
        
        
        <Route
          path="/usermanagement"
          element={<ProtectedRoute element={UserManagement} />}
        />

        <Route path="/create-application" element={<CreateApplication />} />

        <Route path="/applications/:name/edit" element={<EditApplication />} />

        <Route
          path="/applications/:name/plan"
          element={<PlanManagementPage />}
        />
        <Route
          path="/applications/:applicationName/plans/create"
          element={<CreatePlanPage />}
        />

        <Route
          path="/applications/:applicationName/tasks/create"
          element={<CreateTask />}
        />

        <Route
          path="/applications/:applicationName/tasks/create"
          element={<CreateTask />}
        /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default PageRoutes;
