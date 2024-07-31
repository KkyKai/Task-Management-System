import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ element: Element, allowedGroups }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const response = await axios.get("http://localhost:8080/check-auth", {
          withCredentials: true,
        });

        console.log("Authorization response:", response.data);

        // Assuming response.data.isAuthenticated is a boolean indicating if the user is authorized
        const isAuthorized = response.data.isAuthenticated;

        console.log("Is Authorized:", isAuthorized);

        setIsAuthorized(isAuthorized);
      } catch (error) {
        console.error("Authorization error:", error);
        setIsAuthorized(false);
      }
    };

    checkAuthorization();
  }, [allowedGroups]);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? <Element /> : <Navigate to="/" replace />;
}

export default ProtectedRoute;
