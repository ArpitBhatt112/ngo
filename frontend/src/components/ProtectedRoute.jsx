import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ role, children }) {
  const { session } = useAuth();

  if (!session?.token) {
    return <Navigate to={role === "ngo" ? "/ngo-auth" : "/donor-auth"} replace />;
  }

  if (role && session.role !== role) {
    return <Navigate to={session.role === "ngo" ? "/ngo-dashboard" : "/donor-dashboard"} replace />;
  }

  return children;
}
