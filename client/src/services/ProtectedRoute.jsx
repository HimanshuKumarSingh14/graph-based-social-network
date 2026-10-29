import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!user && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
