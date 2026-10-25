type TabKey = 'summary' | 'list' | 'board';

interface Props {
    activeTab: TabKey;
    onTabChange: (tab: TabKey) => void;
}

const TABS: { id: TabKey; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'board', label: 'Kanban board' },
    { id: 'list', label: 'List' },
];

export default function BoardTabs({ activeTab, onTabChange }: Props) {
    return (
        <div role="tablist" aria-label="Project views" className="flex items-center gap-5 px-4 border-b border-[#36373a] overflow-x-auto bg-[#1c1d1f]">
            {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onTabChange(tab.id)}
                        className={`py-2 text-sm whitespace-nowrap transition border-b-2 ${
                            isActive
                                ? 'text-[#75a4f7] border-[#75a4f7] font-medium'
                                : 'text-[#b7b9bc] border-transparent hover:text-[#e0e1e3]'
                        }`}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
