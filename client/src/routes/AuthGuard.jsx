import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export function AuthGuard() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const role = useSelector((state) => state.auth.role);

  if (isAuthenticated) {
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
