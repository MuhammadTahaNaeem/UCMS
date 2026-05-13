import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export function RequireAuth({ allowedRoles }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const role = useSelector((state) => state.auth.role);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    const destination =
      role === "SuperAdmin"
        ? "/super-admin"
        : role === "Admin"
          ? "/admin"
          : role === "Staff"
            ? "/staff"
            : "/user";
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
