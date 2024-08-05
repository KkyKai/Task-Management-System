import React, { createContext, useReducer, useEffect, useState } from "react";
import axios from "axios";
import { produce } from "immer";
const UserContext = createContext(null);

// Function to get the initial state including token handling
const getInitialState = async () => {
  try {
    const response = await axios.get("http://localhost:8080/status", {
      withCredentials: true,
    });

    const data = response.data;
    return {
      isAuthenticated: data.isAuthenticated,
      user: data.user ? data.user : null,
    };
  } catch (error) {
    console.error("Error fetching auth status:", error);
    return { isAuthenticated: false, user: null };
  }
};

// Reducer function to manage state changes
const reducer = produce((draft, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      draft.isAuthenticated = true;
      draft.user = action.payload.user;
      break;
    case "LOGOUT":
      draft.isAuthenticated = false;
      draft.user = null;
      break;
    default:
      return draft;
  }
});

const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    isAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    const initializeAuthState = async () => {
      const initialState = await getInitialState();
      dispatch({
        type: initialState.isAuthenticated ? "LOGIN_SUCCESS" : "LOGOUT",
        payload: initialState,
      });
    };

    initializeAuthState();
  }, []);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };

/*const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    const initializeAuthState = async () => {
      const initialState = await getInitialState();
      if (!initialState.isAuthenticated) {
        console.log("User is not authenticated");
        setRedirectTo("/"); // Set redirection state
      } else {
        console.log("User is authenticated:", initialState.user);
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: initialState,
        });
      }
    };

    initializeAuthState();
  }, []);

  useEffect(() => {
    if (!state.isAuthenticated) {
      console.log("User is not authenticated after state change");
      setRedirectTo("/"); // Set redirection state
    } else {
      console.log("User is authenticated after state change:", state.user);
    }
  }, [state.isAuthenticated]); */
