import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import { UserContext } from "../login/UserContext";

function ProtectedRoute({
  element: Element,
  requiredRole,
  checkAppPermission,
}) {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const { applicationName } = useParams();
  const { state } = useContext(UserContext);
  const user = state.user;

  useEffect(() => {
    if (!state.user || state.loading) return;
    const checkAuthorization = async () => {
      try {
        let url;
        let config = { withCredentials: true };
        let requestData;

        if (checkAppPermission) {
          url = "http://localhost:8080/getAppPermitCreate";
          requestData = {
            user: user, // Send user data from context
            app_acronym: applicationName,
          };
        } else {
          switch (requiredRole) {
            case "admin":
              url = "http://localhost:8080/check-auth";
              break;
            case "projectlead":
              url = "http://localhost:8080/check-projlead";
              break;
            case "projectmanager":
              url = "http://localhost:8080/check-projmg";
              break;
            default:
              console.error("Invalid role specified.");
              setIsAuthorized(false);
              return;
          }
        }

        const response = checkAppPermission
          ? await axios.post(url, requestData, config)
          : await axios.get(url, config);

        console.log("Authorization response:", response.data);

        const isAuthorized =
          response.data.isAuthenticated || response.data.hasPermission;
        console.log("Is Authorized:", isAuthorized);

        setIsAuthorized(isAuthorized);
      } catch (error) {
        console.error("Authorization error:", error);
        setIsAuthorized(false);
      }
    };

    if (user) {
      checkAuthorization();
    } else {
      // Handle case where user is not logged in
      setIsAuthorized(false);
    }
  }, [requiredRole, checkAppPermission, applicationName, user, state.loading]);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? <Element /> : <Navigate to="/" replace />;
}

export default ProtectedRoute;

/* import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ element: Element, requiredRole }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        let url;
        switch (requiredRole) {
          case "admin":
            url = "http://localhost:8080/check-auth";
            break;
          case "projectlead":
            url = "http://localhost:8080/check-projlead";
            break;
          case "projectmanager":
            url = "http://localhost:8080/check-projmg";
            break;
          default:
            console.error("Invalid role specified.");
            setIsAuthorized(false);
            return;
        }

        const response = await axios.get(url, { withCredentials: true });
        console.log("Authorization response:", response.data);

        const isAuthorized = response.data.isAuthenticated;
        console.log("Is Authorized:", isAuthorized);

        setIsAuthorized(isAuthorized);
      } catch (error) {
        console.error("Authorization error:", error);
        setIsAuthorized(false);
      }
    };

    checkAuthorization();
  }, [requiredRole]);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? <Element /> : <Navigate to="/" replace />;
}

export default ProtectedRoute; */
