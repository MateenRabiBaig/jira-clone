import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderKanban, User, Settings, LogOut } from "lucide-react";
import { useAppDispatch } from "../hooks/reduxHooks";
import { logout } from "../redux/slices/authSlice";

const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/settings", label: "Settings", icon: Settings },
];

function Sidebar() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
            <div className="px-6 py-5 border-b border-slate-200">
                <h1 className="text-xl font-bold text-indigo-600">Jira Clone</h1>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                                isActive
                                    ? "bg-indigo-50 text-indigo-600"
                                    : "text-slate-600 hover:bg-slate-100"
                            }`
                        }
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            <div className="px-3 py-4 border-t border-slate-200">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full transition"
                >
                    <LogOut size={18} />
                    Log out
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;