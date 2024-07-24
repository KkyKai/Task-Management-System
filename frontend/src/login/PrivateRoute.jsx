import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";

const PrivateRoute = ({ children }) => {
  const { state } = useContext(UserContext);

  return state.isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute;
