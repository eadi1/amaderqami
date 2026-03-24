import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

export default function ProtectedRoute() {
  const token = Cookies.get("token");

  if (!token) return <Navigate to="/auth" replace />;

  return <Outlet />; // nested routes render here
}
