import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react"

interface SidebarItemProps {
    to: string;
    label: string;
    icon: LucideIcon;
    collapsed: boolean;
    onNavigate?: () => void;
}

function SidebarItem({ to, label, icon: Icon, collapsed, onNavigate }: SidebarItemProps) {
    const link = (
        <NavLink
            to={to}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            aria-label={collapsed ? label : undefined}
            className={({ isActive }) => `flex items-center gap-4 rounded transition-colors
            ${collapsed ? "justify-center w-9 h-9 mx-auto my-0.5" : "px-4 py-2.5"}
            ${isActive ? "bg-[#222e45] text-[#75a4f7]" : "text-[#b7b9bc] hover:bg-[#252629] hover:text-[#e1e3e5]"}`}
        >
            <Icon size={collapsed ? 18 : 19} className="shrink-0" />
            {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
        </NavLink>
    );

    // When collapsed the label travels via a CSS tooltip so the icon rail stays usable.
    if (!collapsed) return link;

    return (
        <div className="group relative">
            {link}
            <span
                role="tooltip"
                className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap bg-[#101214] border border-[#45464a] text-[#d7d9db] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50"
            >
                {label}
            </span>
        </div>
    );
}

export default SidebarItem;
