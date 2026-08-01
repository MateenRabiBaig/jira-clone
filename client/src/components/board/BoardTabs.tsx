type TabKey = 'summary' | 'list' | 'board';

interface Props {
    activeTab: TabKey;
    onTabChange: (tab: TabKey) => void;
}

const ALL_TABS = [
    { id: 'summary', label: 'Summary' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'board', label: 'Kanban board' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'reports', label: 'Reports' },
    { id: 'list', label: 'List' },
    { id: 'forms', label: 'Forms' },
    { id: 'goals', label: 'Goals' },
    { id: 'components', label: 'Components' },
    { id: 'more', label: 'More 7' },
];
const ENABLED_TABS = new Set(['summary', 'list', 'board']);

export default function BoardTabs({ activeTab, onTabChange }: Props) {
    return (
        <div className="flex items-center gap-5 px-4 border-b border-[#36373a] overflow-x-auto bg-[#1c1d1f]">
            {ALL_TABS.map((tab) => {
                const key = tab.id as TabKey;
                const isEnabled = ENABLED_TABS.has(tab.id);
                const isActive = isEnabled && activeTab === key;

                return (
                        <button key={tab.id} disabled={!isEnabled} onClick={() => isEnabled && onTabChange(key) } className={`py-2 text-sm whitespace-nowrap transition border-b-2 ${isActive ? 'text-[#75a4f7] border-[#75a4f7] font-medium' : isEnabled ? 'text-[#b7b9bc] border-transparent hover:text-[#e0e1e3]' : 'text-[#85878a] border-transparent cursor-default'}`}>
                        {tab.label}
                    </button>
                )
            })}
        </div>
    )
}
