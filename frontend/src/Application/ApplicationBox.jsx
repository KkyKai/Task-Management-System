import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../login/UserContext";

const ApplicationBox = ({ name, isProjectLead }) => {
  const { state } = useContext(UserContext);
  const navigate = useNavigate();

  if (state.loading || !state.user) return; // Ensure user is available

  // Function to handle the redirection when the box is clicked
  const handleClick = () => {
    navigate(`/applications/${name}`, {
      state: { applicationName: name, isProjectLead: isProjectLead },
    });
  };

  // Function to handle the redirection when the edit button is clicked
  const handleEdit = (e) => {
    e.stopPropagation(); // Prevents the click from bubbling up to the parent button
    navigate(`/applications/${name}/edit`);
  };

  return (
    <div className="relative w-full max-w-lg">
      <button
        className="border rounded-lg p-8 flex flex-col items-center w-full text-left bg-white shadow-lg hover:bg-gray-100"
        onClick={handleClick}
      >
        <div className="text-xl font-medium mb-4">{name}</div>
      </button>
      {isProjectLead && (
        <button
          className="absolute bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600"
          onClick={handleEdit}
        >
          + Edit
        </button>
      )}
    </div>
  );
};

export default ApplicationBox;
