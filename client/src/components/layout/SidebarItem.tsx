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
            className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 transition-colors
            ${ isActive ? "bg-[#222e45] text-[#75a4f7]" : "text-[#b7b9bc] hover:bg-[#252629] hover:text-[#e1e3e5]" }`}
        >
            <Icon size={19} />
            {!collapsed && (
                <span className="text-sm font-medium">{label}</span>
            )}
        </NavLink>
    );
}

export default SidebarItem;
