import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../login/Login";
import UserManagement from "../admin/UserManagement";
import { UserProvider } from "../login/UserContext";
import PrivateRoute from "../login/PrivateRoute";
import Application from "../Application/Application";
import Profile from "../Profile/profile";

function PageRoutes() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/usermanagement"
            element={
              <PrivateRoute>
                <UserManagement />
              </PrivateRoute>
            }
          />

          <Route path="/landing" element={<Application />} />

          <Route path="/profile" element={<Profile />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default PageRoutes;
