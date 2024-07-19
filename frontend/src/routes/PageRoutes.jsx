import Login from "../login/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function PageRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default PageRoutes;
