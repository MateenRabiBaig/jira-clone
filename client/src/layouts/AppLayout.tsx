import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import { useAppSelector } from "../hooks/reduxHooks";

function AppLayout() {
    const collapsed = useAppSelector((state) => state.sidebar.collapsed);
    return (
        <div className="min-h-screen bg-jira-bg text-jira-text">
            <TopBar />
            <Sidebar />
            <main className={`${collapsed ? 'ml-0' : 'ml-[290px]'} pl-3 pt-[55px] min-h-screen overflow-auto transition-[margin] duration-300`}>
                <Outlet />
            </main>
        </div>
    );
}

export default AppLayout;
