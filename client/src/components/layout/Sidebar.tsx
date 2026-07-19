import { FolderKanban, ListTodo, Settings, User } from "lucide-react";
import { useAppSelector } from "../../hooks/reduxHooks";
import SidebarItem from "./SidebarItem";

function Sidebar() {
    const collapsed = useAppSelector((state) => state.sidebar.collapsed);

    return (
        <aside className={`h-screen bg-slate-900 text-white transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
            <div className="flex h-16 items-center justify-center border-b border-slate-700">
                {collapsed ? (
                    <h1 className="text-2xl font-bold">J</h1>
                ) : (
                    <h1 className="text-xl font-bold">Jira</h1>
                )}
            </div>

            <nav className="space-y-2 p-4">
                <SidebarItem
                    to="/projects"
                    label="Projects"
                    icon={FolderKanban}
                    collapsed={collapsed}
                />

                <SidebarItem
                    to="/tasks"
                    label="Tasks"
                    icon={ListTodo}
                    collapsed={collapsed}
                />

                <SidebarItem
                    to="/profile"
                    label="Profile"
                    icon={User}
                    collapsed={collapsed}
                />

                <SidebarItem
                    to="/settings"
                    label="Settings"
                    icon={Settings}
                    collapsed={collapsed}
                />
            </nav>

            {!collapsed && (
                <div className="border-t border-slate-800 p-4">
                    <p className="text-xs text-slate-400">Jira v1.0</p>
                </div>
            )}
        </aside>
    );
}

export default Sidebar;