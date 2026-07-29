import { NavLink, useNavigate } from "react-router-dom";
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
import { useAppDispatch } from "../hooks/reduxHooks";
import { logout } from "../redux/slices/authSlice";
import { useState } from "react";

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
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreate, setShowCreate] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <aside className="w-[240px] bg-[#1d2125] flex flex-col h-screen sticky top-0 text-[#b6c2cf]">
            {/* Logo */}
            <div className="px-4 py-4 border-b border-[#2d333b]">
                <NavLink to="/dashboard" className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                        <Kanban size={18} className="text-white" />
                    </div>
                    <span className="text-white font-semibold text-lg">Jira Clone</span>
                </NavLink>
            </div>

            {/* Create Button */}
            <div className="px-3 py-2">
                <button className="flex items-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition text-sm font-medium">
                    <Plus size={16} />
                    Create
                </button>
            </div>

            {/* Search */}
            <div className="px-3 py-2">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7780]" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#2d333b] border-none rounded pl-9 pr-3 py-1.5 text-sm text-white placeholder-[#6b7780] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-2 py-1 overflow-y-auto">
                <div className="space-y-0.5">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-1.5 text-sm font-medium transition ${
                                isActive ? "bg-[#22272b] text-white" : "hover:bg-[#22272b] hover:text-white"
                            }`
                        }
                    >
                        <House size={18} />
                        <span>Home</span>
                    </NavLink>

                    <div className="px-3 py-1.5 text-xs font-semibold text-[#6b7780] uppercase tracking-wider mt-2">
                        Planning
                    </div>
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-1.5 text-sm font-medium transition ${
                                    isActive ? "bg-[#22272b] text-white" : "hover:bg-[#22272b] hover:text-white"
                                }`
                            }
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </NavLink>
                    ))}

                    <div className="px-3 py-1.5 text-xs font-semibold text-[#6b7780] uppercase tracking-wider mt-4">
                        Quick Filters
                    </div>
                    {quickActions.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-1.5 text-sm font-medium transition ${
                                    isActive ? "bg-[#22272b] text-white" : "hover:bg-[#22272b] hover:text-white"
                                }`
                            }
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* User Section */}
            <div className="border-t border-[#2d333b] p-3">
                <div className="flex items-center gap-3 px-3 py-2 hover:bg-[#22272b] rounded cursor-pointer">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-sm font-medium">
                        U
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">User</div>
                        <div className="text-xs text-[#6b7780] truncate">user@example.com</div>
                    </div>
                    <ChevronDown size={16} className="text-[#6b7780]" />
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;