import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react"

interface SidebarItemProps {
    to: string;
    label: string;
    icon: LucideIcon;
    collapsed: boolean;
}

function SidebarItem({
    to,
    label,
    icon: Icon,
    collapsed,
}: SidebarItemProps) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200
            ${ isActive ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white" }`}
        >
            <Icon size={20} />
            {!collapsed && (
                <span className="text-sm font-medium">{label}</span>
            )}
        </NavLink>
    );
}

export default SidebarItem;