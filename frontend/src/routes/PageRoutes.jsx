import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../login/Login";
import UserManagement from "../admin/UserManagement";
import ProtectedRoute from "../login/PrivateRoute";
import Profile from "../Profile/profile";
import Application from "../Application/Application";
import CreateApplication from "../Application/CreateApplication";

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
      </Routes>
    </BrowserRouter>
  );
}

export default PageRoutes;
