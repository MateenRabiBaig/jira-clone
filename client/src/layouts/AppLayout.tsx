import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";

function AppLayout() {
    return (
        <div className="flex min-h-screen bg-slate-100">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}

export default AppLayout;