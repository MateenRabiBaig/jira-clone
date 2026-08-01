import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";

function AppLayout() {
    return (
        <div className="min-h-screen bg-jira-bg text-jira-text">
            <TopBar />
            <Sidebar />
            <main className="ml-[200px] pt-[52px] min-h-screen overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}

export default AppLayout;
