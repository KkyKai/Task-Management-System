import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../login/UserContext";

const Navbar = () => {
  const { state } = useContext(UserContext);

  return (
    <div className="w-full bg-white p-4 shadow-md mb-6 flex justify-between items-center">
      <div className="flex space-x-4">
        <Link to="/" className="text-gray-700 hover:text-blue-500">
          Home
        </Link>
        <Link to="/profile" className="text-gray-700 hover:text-blue-500">
          Profile
        </Link>
        {state.isAuthenticated && (
          <Link
            to="/usermanagement"
            className="text-gray-700 hover:text-blue-500"
          >
            User Management
          </Link>
        )}
        <Link to="/landing">Landing</Link>
      </div>
      <button className="bg-red-500 text-white px-4 py-2 rounded">
        Log Out
      </button>
    </div>
  );
};

export default Navbar;

{
  /* 
          
                {state.role === "admin" && (
          <Link to="/usermanagement">User Management</Link>
        )}*/
}
