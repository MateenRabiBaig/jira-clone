import { Search, Grid3x3, Plus, Bell, Settings, PanelLeft, HelpCircle, SlidersHorizontal } from "lucide-react";
import { useAppSelector } from "../../hooks/reduxHooks";
import Avatar from "../common/Avatar";
import { useState } from "react";
import QuickCreateTaskModal from "../tasks/QuickCreateTaskModal";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { toggleSidebar } from "../../redux/slices/sidebarSlice";

export default function TopBar() {
    const user = useAppSelector((state) => state.auth.user)
    const [showCreate, setShowCreate] = useState(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    return (
        <header className="fixed top-0 left-0 right-0 h-[55px] bg-[#1c1d1f] border-b border-[#36373a] flex items-center px-4 text-jira-text z-50">
            <div className="w-[180px] flex items-center gap-3 shrink-0">
                <button onClick={() => dispatch(toggleSidebar())} aria-label="Toggle sidebar" className="text-[#a9abad] hover:text-white"><PanelLeft size={18} /></button>
                <Grid3x3 size={17} className="text-[#a9abad]" />
                <div className="w-7 h-7 bg-[#2563eb] flex items-center justify-center rounded-md">
                    <span className="text-white font-bold text-base">J</span>
                </div>
                <span className="font-semibold text-[#d7d9db] text-sm">Jira</span>
            </div>

            <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
                <div className="flex items-center gap-2 bg-[#292a2d] border border-[#45464a] rounded-md px-2.5 h-8 w-full max-w-[800px]">
                    <Search size={16} className="text-[#9b9da1] shrink-0" />
                    <input placeholder="Search" className="bg-transparent text-sm outline-none w-full placeholder:text-[#9b9da1] text-jira-textBright" />
                    <SlidersHorizontal size={15} className="text-[#9b9da1]" />
                </div>
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 bg-[#6f9deb] text-[#101214] text-sm font-semibold px-4 h-8 rounded-md hover:bg-[#87adf0] whitespace-nowrap">
                    <Plus size={18} />Create
                </button>
            </div>

            <div className="w-[260px] flex items-center justify-end gap-3 min-w-0">
                <div className="bg-[#242529] px-2 py-1 rounded-md text-[#d7d9db] font-semibold text-xs">◆ Ask Rovo</div>
                <Bell size={17} className="text-[#b7b9bc]" />
                <HelpCircle size={17} className="text-[#b7b9bc]" />
                <Settings size={17} className="text-[#b7b9bc]" />
                {user ? <Avatar name={user.name} size={28} /> : <div className="w-[28px] h-[28px] rounded-full bg-[#5146a7] text-white flex items-center justify-center text-xs font-semibold">U</div>}
            </div>
            {showCreate && <QuickCreateTaskModal onClose={() => setShowCreate(false)} onCreated={(projectId) => { setShowCreate(false); navigate(`/projects/${projectId}`); }} />}
        </header>
    )
}
