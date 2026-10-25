import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Grid3x3, HelpCircle, PanelLeft, Plus, Search, Settings, User as UserIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { toggleSidebar } from "../../redux/slices/sidebarSlice";
import { logout } from "../../redux/slices/authSlice";
import { notificationApi } from "../../api/notificationApi";
import Avatar from "../common/Avatar";
import QuickCreateTaskModal from "../tasks/QuickCreateTaskModal";
import GlobalSearch from "./GlobalSearch";
import NotificationsMenu from "./NotificationsMenu";
import HelpModal from "./HelpModal";

export default function TopBar() {
    const user = useAppSelector((state) => state.auth.user);
    const [showCreate, setShowCreate] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const avatarRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const closeSearch = useCallback(() => {
        setSearchOpen(false);
        setSearchQuery('');
    }, []);

    // Close search on outside click.
    useEffect(() => {
        if (!searchOpen) return undefined;
        const onPointerDown = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) closeSearch();
        };
        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, [searchOpen, closeSearch]);

    // Poll the unread badge occasionally so it stays fresh while the tab is open.
    useEffect(() => {
        let cancelled = false;
        const refresh = () => {
            notificationApi
                .getUnreadCount()
                .then(({ count }) => {
                    if (!cancelled) setUnreadCount(count);
                })
                .catch(() => undefined);
        };
        refresh();
        const interval = window.setInterval(refresh, 60_000);
        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, []);

    const closeAvatarMenu = useCallback(() => setAvatarMenuOpen(false), []);

    useEffect(() => {
        if (!avatarMenuOpen) return undefined;
        const onPointerDown = (event: MouseEvent) => {
            if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) closeAvatarMenu();
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeAvatarMenu();
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [avatarMenuOpen, closeAvatarMenu]);

    const handleLogout = () => {
        closeAvatarMenu();
        dispatch(logout());
        navigate('/login');
    };

    const onAvatarKeyDown = (event: React.KeyboardEvent) => {
        if (!avatarMenuOpen && (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown')) {
            event.preventDefault();
            setAvatarMenuOpen(true);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-[55px] bg-[#1c1d1f] border-b border-[#36373a] flex items-center px-4 text-jira-text z-50">
            <div className="w-auto md:w-[180px] flex items-center gap-3 shrink-0">
                <button onClick={() => dispatch(toggleSidebar())} aria-label="Toggle sidebar" className="text-[#a9abad] hover:text-white">
                    <PanelLeft size={18} />
                </button>
                <Grid3x3 size={17} className="text-[#a9abad] hidden sm:block" />
                <img src="/jira.png" alt="Jira" className="w-6 h-6 object-contain rounded-md" />
                <span className="font-semibold text-[#d7d9db] text-sm hidden sm:block">Jira</span>
            </div>

            <div className="flex-1 flex items-center justify-center gap-2 min-w-0 px-3">
                <div ref={searchRef} className="relative flex items-center gap-2 bg-[#292a2d] border border-[#45464a] rounded-md px-2.5 h-8 w-full max-w-[560px] focus-within:border-[#75a4f7]">
                    <Search size={16} className="text-[#9b9da1] shrink-0" />
                    <input
                        value={searchQuery}
                        onChange={(event) => {
                            setSearchQuery(event.target.value);
                            setSearchOpen(true);
                        }}
                        onFocus={() => setSearchOpen(true)}
                        onKeyDown={(event) => event.key === 'Escape' && closeSearch()}
                        placeholder="Search"
                        aria-label="Search projects, tasks and people"
                        role="combobox"
                        aria-expanded={searchOpen}
                        aria-autocomplete="list"
                        className="bg-transparent text-sm outline-none w-full placeholder:text-[#9b9da1] text-jira-textBright"
                    />
                    {searchOpen && <GlobalSearch query={searchQuery} onClose={closeSearch} />}
                </div>
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 bg-[#6f9deb] text-[#101214] text-sm px-4 h-8 rounded-md hover:bg-[#87adf0] whitespace-nowrap">
                    <Plus size={18} />Create
                </button>
            </div>

            <div className="w-auto md:w-[260px] flex items-center justify-end gap-2.5 min-w-0">
                <div className="relative">
                    <button
                        onClick={() => setNotificationsOpen((open) => !open)}
                        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                        aria-expanded={notificationsOpen}
                        className="relative p-1.5 text-[#b7b9bc] hover:text-white rounded"
                    >
                        <Bell size={17} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-[#f15b50] text-white text-[9px] font-bold flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                    <NotificationsMenu
                        open={notificationsOpen}
                        onClose={() => setNotificationsOpen(false)}
                        unreadCount={unreadCount}
                        onCountChange={setUnreadCount}
                    />
                </div>

                <button
                    onClick={() => setHelpOpen(true)}
                    aria-label="Help"
                    title="Help"
                    className="p-1.5 text-[#b7b9bc] hover:text-white rounded hidden sm:block"
                >
                    <HelpCircle size={17} />
                </button>

                <Link
                    to="/settings"
                    aria-label="Settings"
                    title="Settings"
                    className="p-1.5 text-[#b7b9bc] hover:text-white rounded"
                >
                    <Settings size={17} />
                </Link>

                <div className="relative" ref={avatarRef}>
                    <button
                        onClick={() => setAvatarMenuOpen((open) => !open)}
                        onKeyDown={onAvatarKeyDown}
                        aria-haspopup="menu"
                        aria-expanded={avatarMenuOpen}
                        aria-label="Account menu"
                        className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#75a4f7]"
                    >
                        {user ? (
                            <Avatar name={user.name} src={user.avatarUrl} size={28} />
                        ) : (
                            <div className="w-[28px] h-[28px] rounded-full bg-[#5146a7] text-white flex items-center justify-center text-xs font-semibold">U</div>
                        )}
                    </button>

                    {avatarMenuOpen && user && (
                        <div
                            role="menu"
                            aria-label="Account"
                            className="absolute right-0 top-full mt-2 w-60 bg-[#242528] border border-[#45464a] rounded-lg shadow-2xl overflow-hidden"
                        >
                            <div className="px-4 py-3 border-b border-[#36373a] flex items-center gap-3">
                                <Avatar name={user.name} src={user.avatarUrl} size={36} />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-[#e0e1e3] truncate">{user.name}</p>
                                    <p className="text-[11px] text-[#96999e] truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className="py-1" onClick={closeAvatarMenu}>
                                <MenuItem to="/profile" icon={UserIcon} label="Profile" onNavigate={closeAvatarMenu} />
                                <MenuItem to="/settings" icon={Settings} label="Settings" onNavigate={closeAvatarMenu} />
                                <div className="border-t border-[#36373a] mt-1 pt-1">
                                    <button
                                        role="menuitem"
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-[#f15b50] hover:bg-[#2c2d30] flex items-center gap-2.5"
                                    >
                                        Log out
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {showCreate && <QuickCreateTaskModal onClose={() => setShowCreate(false)} onCreated={(projectId) => { setShowCreate(false); navigate(`/projects/${projectId}`); }} />}
            {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
        </header>
    )
}

function MenuItem({ to, icon: Icon, label, onNavigate }: { to: string; icon: typeof UserIcon; label: string; onNavigate: () => void }) {
    return (
        <Link
            role="menuitem"
            to={to}
            onClick={onNavigate}
            className="w-full px-4 py-2 text-sm text-[#d0d2d5] hover:bg-[#2c2d30] flex items-center gap-2.5"
        >
            <Icon size={15} className="text-[#96999e]" />
            {label}
        </Link>
    );
}
