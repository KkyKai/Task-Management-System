// session.jsx
import Cookies from "js-cookie";

export const getSession = () => {
  const jwt = Cookies.get("__session");
  console.log(jwt);
  let session;
  try {
    if (jwt) {
      const base64Url = jwt.split(".")[1];
      const base64 = base64Url.replace("-", "+").replace("_", "/");
      session = JSON.parse(window.atob(base64));
    }
  } catch (error) {
    console.log(error);
  }
  return session;
};

export const isAdmin = () => {
  const session = getSession();
  return session && session.role === "admin"; // Assuming your session object has a 'role' field
};

export const logOut = () => {
  Cookies.remove("__session");
};
