import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

function PublicRoute({ children }) {
  const token = Cookies.get("token");

  // ✅ If token exists → redirect to dashboard
  if (token) {
    return <Navigate to="/" replace />;
  }

  // ✅ Else → allow access
  return children;
}

export default PublicRoute;
