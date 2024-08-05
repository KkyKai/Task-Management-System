import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../login/UserContext";
import Navbar from "../util/Navbar";

const Profile = () => {
  const [userProfile, setUserProfile] = useState({
    email: "",
    password: "",
  });

  const [statusMessage, setStatusMessage] = useState(""); // New state for status message

  const { state, dispatch } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (state.user) {
      // Check if state.user is not null
      const fetchUserProfile = async () => {
        try {
          const response = await axios.post(
            "http://localhost:8080/selectByUsers",
            { user: state.user },
            { withCredentials: true }
          );

          console.log(response.data[0].email);
          setUserProfile({
            email: response.data[0].email || "",
            password: "",
          });
        } catch (error) {
          console.error("Failed to fetch user profile", error);

          if (error.response) {
            // Server responded with a status other than 200 range
            if (
              error.response.status === 401 ||
              error.response.status === 403
            ) {
              dispatch({ type: "LOGOUT" });
              navigate("/");
            }
          }
        }
      };

      fetchUserProfile();
    }
  }, [state.user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Make the API request to update user profile
      await axios.put(
        `http://localhost:8080/updateSelectedUser`,
        {
          user: state.user,
          email: userProfile.email,
          password: userProfile.password,
        },
        {
          withCredentials: true,
        }
      );
      // Update status message on success
      setStatusMessage("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile", error);

      if (error.response) {
        // Server responded with a status other than 200 range
        if (error.response.status === 401 || error.response.status === 403) {
          dispatch({ type: "LOGOUT" });
          navigate("/");
        }
      }

      // Set status message based on the error response
      if (
        error.response ||
        error.response.data ||
        error.response.data.message
      ) {
        setStatusMessage(`Failed to update profile: ${error.response.data}`);
      } else {
        setStatusMessage("Failed to update profile. Please try again.");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile((prevState) => ({
      ...prevState,
      [name]: String(value), // Ensure value is always treated as a string
    }));
  };

  return (
    <div>
      <Navbar />

      <div className="flex justify-center py-6">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={userProfile.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={userProfile.password}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Display status message */}
            {statusMessage && (
              <div
                className={`mb-4 text-sm ${
                  statusMessage.startsWith("Failed")
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {statusMessage}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="button"
                className="text-sm font-semibold leading-6 text-gray-900"
                onClick={() => navigate("/landing")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
