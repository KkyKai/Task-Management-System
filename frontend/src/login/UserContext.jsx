import React, { createContext, useReducer } from "react";
import { produce } from "immer";

const UserContext = createContext(null);

const initialState = {
  isAuthenticated: false,
  user: null,
};

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
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };

