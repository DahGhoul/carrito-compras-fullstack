import { Navigate, Outlet } from "react-router-dom";
import { RoleCode } from "../types";
import { useAuthStore } from "../stores/authStore";

type ProtectedRouteProps = {
  roles?: RoleCode[];
};

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.some((role) => user.roles.includes(role))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}