import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const response = await axios.get("http://localhost:8080/check-auth", {
          withCredentials: true,
        });
        setIsAuthenticated(response.data.isAuthenticated); // Set based on boolean response
      } catch (error) {
        console.error("Failed to fetch authentication status", error);
        setIsAuthenticated(false); // When User is not admin
      }
    };

    fetchAuthStatus();
  }, []);

  const handleLogout = async () => {
    try {
      // Make a POST request to the backend logout endpoint
      const response = await axios.post(
        "http://localhost:8080/logout",
        {},
        {
          withCredentials: true,
        }
      );

      // Check if the response indicates a successful logout
      if (response.status === 200) {
        setIsAuthenticated(false);
        navigate("/"); // Redirect to home page or login page after logout
      } else {
        console.error("Logout failed with status:", response.status);
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="w-full bg-white p-4 shadow-md mb-6 flex justify-between items-center">
      <div className="flex space-x-4">
        <Link to="/landing" className="text-gray-700 hover:text-blue-500">
          Home
        </Link>
        <Link to="/profile" className="text-gray-700 hover:text-blue-500">
          Profile
        </Link>
        {isAuthenticated && (
          <Link
            to="/usermanagement"
            className="text-gray-700 hover:text-blue-500"
          >
            User Management
          </Link>
        )}
      </div>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded"
        onClick={handleLogout}
      >
        Log Out
      </button>
    </div>
  );
};

export default Navbar;
