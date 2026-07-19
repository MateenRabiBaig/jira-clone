import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/reduxHooks";

function ProtectedRoute() {
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    return isAuthenticated ? (
        <Outlet />
    ) : (
        <Navigate to="/login" replace />
    );
}

export default ProtectedRoute;