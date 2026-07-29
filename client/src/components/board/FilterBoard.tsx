import { Search, Filter, User, Flag, Calendar, ArrowUpDown, Plus } from "lucide-react";
import type { Project, TaskPriority } from '../../types';

interface Props {
    search: string;
    onSearchChange: (v: string) => void;
    priority: TaskPriority | '';
    onPriorityChange: (v: TaskPriority | '') => void;
    assignee: string;
    onAssigneeChange: (v: string) => void;
    members: Project['members'];
}

const priorityOptions = [
  { value: '', label: 'All priorities' },
  { value: 'high', label: 'Highest', color: 'text-red-600' },
  { value: 'high', label: 'High', color: 'text-orange-500' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'low', label: 'Low', color: 'text-blue-500' },
  { value: 'low', label: 'Lowest', color: 'text-gray-500' },
];

export default function FilterBar({
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  assignee,
  onAssigneeChange,
  members,
}: Props) {
  return (
    <div className="bg-[#f4f5f7] border-b border-[#dfe1e6] px-4 py-3">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7780]" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="w-full border border-[#dfe1e6] rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#172b4d] bg-white border border-[#dfe1e6] rounded hover:bg-[#ebecf0]">
            <Filter size={16} />
            <span>Filter</span>
          </button>

          <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#172b4d] bg-white border border-[#dfe1e6] rounded hover:bg-[#ebecf0]">
            <User size={16} />
            <span>Assignee</span>
          </button>

          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value as TaskPriority | '')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[#172b4d] bg-white border border-[#dfe1e6] rounded hover:bg-[#ebecf0] appearance-none cursor-pointer"
          >
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#172b4d] bg-white border border-[#dfe1e6] rounded hover:bg-[#ebecf0]">
            <Calendar size={16} />
            <span>Due date</span>
          </button>

          <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#172b4d] bg-white border border-[#dfe1e6] rounded hover:bg-[#ebecf0]">
            <ArrowUpDown size={16} />
            <span>Sort</span>
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#172b4d] bg-white border border-[#dfe1e6] rounded hover:bg-[#ebecf0]">
            <span>Share</span>
          </button>

          <button className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
            <Plus size={16} />
            <span>Create issue</span>
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {(priority || assignee) && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs text-[#6b7780] uppercase tracking-wider font-semibold">Active filters:</span>
          {priority && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
              <span>Priority: {priority}</span>
              <button
                onClick={() => onPriorityChange('')}
                className="ml-1 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}
          {assignee && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
              <span>Assignee</span>
              <button
                onClick={() => onAssigneeChange('')}
                className="ml-1 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
