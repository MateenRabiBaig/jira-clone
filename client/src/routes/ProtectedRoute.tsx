import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAppSelector } from "../hooks/reduxHooks";

/**
 * Gates protected routes. While the stored token is being verified via
 * /auth/me a splash is shown, so refreshing a protected route never
 * flashes the login page or renders broken data.
 */
function ProtectedRoute() {
    const status = useAppSelector((state) => state.auth.status);
    const location = useLocation();

    if (status === "initializing") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#1f2022] text-[#96999e]" role="status" aria-live="polite">
                <div className="flex items-center gap-3 text-sm">
                    <Loader2 size={18} className="animate-spin" />
                    Restoring your session...
                </div>
            </div>
        );
    }

    if (status !== "authenticated") {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
