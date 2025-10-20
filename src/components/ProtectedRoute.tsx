import React from "react";
import { Outlet } from "react-router-dom";

// Temporary open route — disables auth checks for dev
const ProtectedRoute: React.FC = () => {
  return <Outlet />;
};

export default ProtectedRoute;
