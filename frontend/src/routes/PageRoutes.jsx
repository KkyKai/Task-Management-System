import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../login/Login";
import UserManagement from "../admin/UserManagement";
import ProtectedRoute from "../login/PrivateRoute";
import Application from "../Application/Application";
import Profile from "../Profile/profile";

function PageRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/usermanagement"
          element={<ProtectedRoute element={UserManagement} />}
        />
        <Route path="/landing" element={<Application />} />

        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default PageRoutes;
