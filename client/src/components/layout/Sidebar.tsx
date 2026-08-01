import { CalendarDays, ChevronRight, Home, LayoutDashboard, Plus, Search, Settings, Users, Workflow } from "lucide-react";
import { useAppSelector } from "../../hooks/reduxHooks";
import SidebarItem from "./SidebarItem";

function Sidebar() {
    const collapsed = useAppSelector((state) => state.sidebar.collapsed);

    return (
        <aside className={`fixed left-0 top-[55px] bottom-0 z-40 bg-[#1c1d1f] border-r border-[#36373a] text-white transition-all duration-300 ${collapsed ? "hidden" : "w-[300px]"}`}>
            <nav className="h-full overflow-y-auto py-4">
                {!collapsed && <div className="px-4 mb-2 text-[12px] uppercase tracking-wider text-[#85878a]">Workspace</div>}
                <SidebarItem to="/dashboard" label="For you" icon={Home} collapsed={collapsed} />
                <SidebarItem to="/tasks" label="Recent" icon={CalendarDays} collapsed={collapsed} />
                <SidebarItem to="/projects" label="Spaces" icon={Workflow} collapsed={collapsed} />
                {!collapsed && <div className="mt-6 px-4 flex items-center justify-between text-[12px] uppercase tracking-wider text-[#85878a]"><span>Spaces</span><Plus size={16} /></div>}
                <div className={collapsed ? "mt-5 px-2" : "mt-2 px-3"}>
                    <div className={`flex items-center gap-3 py-2 bg-[#252629] text-[#d7d9db] text-sm ${collapsed ? "justify-center px-1" : "px-3"}`}><div className="w-5 h-5 bg-[#42a5f5] flex items-center justify-center text-[11px]">✣</div>{!collapsed && <>Platform-app <ChevronRight size={15} className="ml-auto text-[#85878a]" /></>}</div>
                    <div className="ml-3 border-l border-[#45464a] pl-3 mt-1"><SidebarItem to="/projects" label="PA board" icon={LayoutDashboard} collapsed={collapsed} /></div>
                </div>
                {!collapsed && <div className="mt-6 px-4 flex items-center justify-between text-[12px] uppercase tracking-wider text-[#85878a]"><span>Navigation</span><Search size={15} /></div>}
                <SidebarItem to="/profile" label="Teams" icon={Users} collapsed={collapsed} />
                <SidebarItem to="/settings" label="Settings" icon={Settings} collapsed={collapsed} />
                {!collapsed && <><div className="mt-8 mx-4 border-t border-[#36373a] pt-4 text-[#85878a] text-xs">Recommended</div><div className="mx-4 mt-3 bg-[#242528] p-4 text-[#d7d9db]"><div className="text-sm font-semibold">Unlock your AI teammate</div><p className="text-xs text-[#96999e] mt-2 leading-5">Rovo connects your tools and knowledge so work gets done for you.</p><span className="block text-[#75a4f7] text-xs mt-3">Try Rovo now</span></div></>}
            </nav>
        </aside>
    );
}

export default Sidebar;
