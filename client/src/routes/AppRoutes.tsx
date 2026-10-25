import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Login from "../pages/auth/Login"
import Register from "../pages/auth/Register"
import Dashboard from "../pages/dashboard/Dashboard"
import Projects from "../pages/projects/Projects"
import Profile from "../pages/profile/Profile"
import Settings from "../pages/settings/Settings"
import Teams from "../pages/teams/Teams"
import TeamDetail from "../pages/teams/TeamDetail"
import NotFound from "../pages/NotFound"
import ProtectedRoute from "./ProtectedRoute"
import AppLayout from "../layouts/AppLayout"
import Tasks from "../pages/tasks/Tasks"
import ProjectBoard from "../pages/projects/ProjectBoard"
import { useAppSelector } from "../hooks/reduxHooks"
import type { ReactNode } from "react"

/** Sends authenticated users to the dashboard and others to login. */
function RootRedirect() {
    const status = useAppSelector((state) => state.auth.status);
    if (status === "initializing") return null;
    return <Navigate to={status === "authenticated" ? "/dashboard" : "/login"} replace />;
}

/** Redirects to /dashboard when an already-authenticated user opens /login. */
function PublicOnlyRoute({ children }: { children: ReactNode }) {
    const status = useAppSelector((state) => state.auth.status);
    if (status === "authenticated") return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/projects/:id" element={<ProjectBoard />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/teams" element={<Teams />} />
                        <Route path="/teams/:id" element={<TeamDetail />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes;
