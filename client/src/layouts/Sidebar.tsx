import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
    LayoutDashboard,
    FolderKanban,
    Kanban,
    ChartBar,
    Users,
    Filter,
    Settings,
    Search,
    Plus,
    House,
    AlertCircle,
    Calendar,
    Tag,
    Archive,
    ChevronDown
} from "lucide-react";

const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/issues", label: "Issues", icon: AlertCircle },
    { to: "/teams", label: "Teams", icon: Users },
    { to: "/sprint", label: "Sprint", icon: Calendar },
    { to: "/backlog", label: "Backlog", icon: Archive },
    { to: "/reports", label: "Reports", icon: ChartBar },
    { to: "/settings", label: "Settings", icon: Settings },
];

const quickActions = [
    { to: "/filters", label: "Filters", icon: Filter },
    { to: "/labels", label: "Labels", icon: Tag },
];

function Sidebar() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <aside className="w-[200px] bg-[#1d2125] flex flex-col h-screen sticky top-0 text-[#b6c2cf]">
            {/* Logo */}
            <div className="px-3 py-3 border-b border-[#2d333b]">
                <NavLink to="/dashboard" className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                        <Kanban size={14} className="text-white" />
                    </div>
                    <span className="text-white font-semibold text-sm">Jira Clone</span>
                </NavLink>
            </div>

            {/* Create Button */}
            <div className="px-2 py-1.5">
                <button className="flex items-center gap-1.5 w-full bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded transition text-xs font-medium">
                    <Plus size={14} />
                    Create
                </button>
            </div>

            {/* Search */}
            <div className="px-2 py-1.5">
                <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6b7780]" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#2d333b] border-none rounded pl-8 pr-2.5 py-1 text-xs text-white placeholder-[#6b7780] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-1.5 py-1 overflow-y-auto">
                <div className="space-y-0.5">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-2 py-1 text-xs font-medium transition ${
                                isActive ? "bg-[#22272b] text-white" : "hover:bg-[#22272b] hover:text-white"
                            }`
                        }
                    >
                        <House size={15} />
                        <span>Home</span>
                    </NavLink>

                    <div className="px-2 py-1 text-[10px] font-semibold text-[#6b7780] uppercase tracking-wider mt-1">
                        Planning
                    </div>
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-2 py-1 text-xs font-medium transition ${
                                    isActive ? "bg-[#22272b] text-white" : "hover:bg-[#22272b] hover:text-white"
                                }`
                            }
                        >
                            <Icon size={15} />
                            <span>{label}</span>
                        </NavLink>
                    ))}

                    <div className="px-2 py-1 text-[10px] font-semibold text-[#6b7780] uppercase tracking-wider mt-2">
                        Quick Filters
                    </div>
                    {quickActions.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-2 py-1 text-xs font-medium transition ${
                                    isActive ? "bg-[#22272b] text-white" : "hover:bg-[#22272b] hover:text-white"
                                }`
                            }
                        >
                            <Icon size={15} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* User Section */}
            <div className="border-t border-[#2d333b] p-2">
                <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#22272b] rounded cursor-pointer">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-[10px] font-medium">
                        U
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white truncate">User</div>
                        <div className="text-[10px] text-[#6b7780] truncate">user@example.com</div>
                    </div>
                    <ChevronDown size={12} className="text-[#6b7780]" />
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
