import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, FolderKanban, Home, Plus, Settings, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { closeSidebar } from "../../redux/slices/sidebarSlice";
import { projectApi } from "../../api/projectApi";
import { teamApi } from "../../api/teamApi";
import type { Project, Team } from "../../types";
import SidebarItem from "./SidebarItem";

const MAX_SIDEBAR_PROJECTS = 4;
const MAX_SIDEBAR_TEAMS = 3;

/**
 * The app sidebar. On desktop it is a fixed column that collapses to an
 * icon rail; on mobile (< md) it becomes an overlay drawer with backdrop.
 */
function Sidebar() {
    const collapsed = useAppSelector((state) => state.sidebar.collapsed);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        let cancelled = false;
        // Keep the quick-access lists fresh; failures are non-fatal here.
        projectApi.getAll().then((data) => !cancelled && setProjects(data)).catch(() => undefined);
        teamApi.getAll().then((data) => !cancelled && setTeams(data)).catch(() => undefined);
        return () => {
            cancelled = true;
        };
    }, []);

    const handleNavigate = () => {
        // On small screens the sidebar is a drawer - close it after navigating.
        if (window.innerWidth < 768) dispatch(closeSidebar());
    };

    return (
        <>
            {/* Backdrop for the mobile drawer */}
            {!collapsed && (
                <div
                    className="fixed inset-0 top-[55px] bg-black/50 z-30 md:hidden"
                    aria-hidden="true"
                    onClick={() => dispatch(closeSidebar())}
                />
            )}

            <aside
                aria-label="Sidebar navigation"
                className={`fixed left-0 top-[55px] bottom-0 z-40 bg-[#1c1d1f] border-r border-[#36373a] text-white transition-all duration-300 overflow-hidden
                    ${collapsed ? "w-[56px] -translate-x-full md:translate-x-0" : "w-[260px] translate-x-0"}`}
            >
                <nav className="h-full overflow-y-auto overflow-x-hidden py-4 px-2">
                    <div className="space-y-0.5">
                        <SidebarItem to="/dashboard" label="For you" icon={Home} collapsed={collapsed} onNavigate={handleNavigate} />
                        <SidebarItem to="/tasks" label="My Tasks" icon={CalendarDays} collapsed={collapsed} onNavigate={handleNavigate} />
                        <SidebarItem to="/projects" label="Projects" icon={FolderKanban} collapsed={collapsed} onNavigate={handleNavigate} />
                        <SidebarItem to="/teams" label="Teams" icon={Users} collapsed={collapsed} onNavigate={handleNavigate} />
                        <SidebarItem to="/settings" label="Settings" icon={Settings} collapsed={collapsed} onNavigate={handleNavigate} />
                    </div>

                    {!collapsed && projects.length > 0 && (
                        <SidebarSection
                            title="Recent projects"
                            action={{ to: "/projects", label: "View all" }}
                        >
                            {projects.slice(0, MAX_SIDEBAR_PROJECTS).map((project) => (
                                <SidebarItem
                                    key={project.id}
                                    to={`/projects/${project.id}`}
                                    label={project.name}
                                    icon={FolderKanban}
                                    collapsed={false}
                                    onNavigate={handleNavigate}
                                />
                            ))}
                        </SidebarSection>
                    )}

                    {!collapsed && teams.length > 0 && (
                        <SidebarSection title="Your teams" action={{ to: "/teams", label: "View all" }}>
                            {teams.slice(0, MAX_SIDEBAR_TEAMS).map((team) => (
                                <SidebarItem
                                    key={team.id}
                                    to={`/teams/${team.id}`}
                                    label={team.name}
                                    icon={Users}
                                    collapsed={false}
                                    onNavigate={handleNavigate}
                                />
                            ))}
                        </SidebarSection>
                    )}

                    {!collapsed && (
                        <button
                            onClick={() => { handleNavigate(); navigate('/teams?new=1'); }}
                            className="mt-2 flex items-center gap-2 px-4 py-2 w-full text-left text-xs text-[#85878a] hover:text-[#b7b9bc] hover:bg-[#252629] rounded transition-colors"
                        >
                            <Plus size={14} /> New team
                        </button>
                    )}
                </nav>
            </aside>
        </>
    );
}

function SidebarSection({
    title,
    action,
    children,
}: {
    title: string;
    action?: { to: string; label: string };
    children: React.ReactNode;
}) {
    return (
        <div className="mt-6">
            <div className="px-4 mb-1.5 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-[#85878a]">{title}</span>
                {action && (
                    <Link to={action.to} className="text-[11px] text-[#75a4f7] hover:underline">
                        {action.label}
                    </Link>
                )}
            </div>
            <div className="space-y-0.5">{children}</div>
        </div>
    );
}

export default Sidebar;
