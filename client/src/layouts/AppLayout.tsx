import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import { useAppSelector } from "../hooks/reduxHooks";

function AppLayout() {
    const collapsed = useAppSelector((state) => state.sidebar.collapsed);
    // Desktop: content clears the 260px sidebar (or the 56px rail when collapsed).
    // Mobile: the sidebar is an overlay, so content spans the full width.
    return (
        <div className="min-h-screen bg-jira-bg text-jira-text">
            <TopBar />
            <Sidebar />
            <main
                className={`pt-[55px] min-h-screen transition-[margin] duration-300
                    ${collapsed ? "md:ml-[56px]" : "md:ml-[260px]"}`}
            >
                <Outlet />
            </main>
        </div>
    );
}

export default AppLayout;
