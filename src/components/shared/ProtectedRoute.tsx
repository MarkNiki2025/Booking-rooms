import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function ProtectedRoute() {
  const { user, loading } = useAuth();

  console.log({ user, loading });

  if (loading) return <p>Loading...</p>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
export default ProtectedRoute;