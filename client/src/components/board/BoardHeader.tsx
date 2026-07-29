import { Kanban, List, Timeline, Table, Settings } from "lucide-react";
import { useState } from "react";

interface BoardHeaderProps {
  projectName: string;
  projectKey: string;
  onTabChange: (tab: string) => void;
}

const viewTabs = [
  { id: "board", label: "Board", icon: Kanban },
  { id: "list", label: "List", icon: List },
  { id: "timeline", label: "Timeline", icon: Timeline },
  { id: "table", label: "Table", icon: Table },
];

export default function BoardHeader({ projectName, projectKey, onTabChange }: BoardHeaderProps) {
  const [activeTab, setActiveTab] = useState("board");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange(tabId);
  };

  return (
    <div className="bg-[#f4f5f7] border-b border-[#dfe1e6]">
      {/* Project Navigation */}
      <div className="px-4 py-3 flex items-center gap-2 text-sm">
        <div className="flex items-center gap-2 hover:bg-[#ebecf0] px-2 py-1 rounded cursor-pointer">
          <span className="text-[#6b7780] font-medium">Projects</span>
          <span className="text-[#6b7780]">/</span>
        </div>
        <div className="flex items-center gap-2 hover:bg-[#ebecf0] px-2 py-1 rounded cursor-pointer relative group">
          <span className="text-[#172b4d] font-medium">{projectName}</span>
        </div>
        <div className="flex items-center gap-2 text-[#6b7780]">
          <span className="text-[#6b7780]">/</span>
          <span className="text-[#6b7780]">Board</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button className="p-1.5 hover:bg-[#ebecf0] rounded text-[#6b7780]">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center px-4">
        {viewTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-[#6b7780] hover:text-[#172b4d]"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}

        <div className="flex items-center gap-2 ml-auto">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#6b7780] hover:bg-[#ebecf0] rounded">
            <span>More</span>
          </button>
        </div>
      </div>
    </div>
  );
}
