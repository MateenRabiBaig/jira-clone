import { BarChart3, Filter, ListFilter, Search, SlidersHorizontal, UserRound } from 'lucide-react';
import type { Project, TaskPriority } from '../../types';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  priority: TaskPriority | '';
  onPriorityChange: (value: TaskPriority | '') => void;
  assignee: string;
  onAssigneeChange: (value: string) => void;
  members: Project['members'];
}

export default function BoardToolbar({ search, onSearchChange, priority, onPriorityChange, assignee, onAssigneeChange, members }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2">
      <div className="relative w-[240px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-jira-muted" />
        <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search board" className="w-full bg-[#1c1d1f] border border-[#6e7075] px-9 py-1.5 text-[13px] text-jira-textBright placeholder:text-[#96999e] focus:outline-none focus:border-[#75a4f7]" />
      </div>
      <div className="flex items-center -space-x-1 mr-2"><div className="w-8 h-8 rounded-full bg-[#5a50b5] border-2 border-[#75a4f7] flex items-center justify-center text-[11px]">MB</div><div className="w-8 h-8 rounded-full bg-[#277d9c] border-2 border-[#1c1d1f] flex items-center justify-center text-[11px]">AC</div><div className="w-8 h-8 rounded-full bg-[#39486c] border-2 border-[#1c1d1f] flex items-center justify-center text-[11px]">DR</div><div className="w-8 h-8 rounded-full bg-[#278ca2] border-2 border-[#1c1d1f] flex items-center justify-center text-[11px]">SK</div></div>
      <select value={priority} onChange={(event) => onPriorityChange(event.target.value as TaskPriority | '')} className="bg-[#1c1d1f] border border-[#45464a] px-3 py-1.5 text-xs text-[#d0d2d5]">
        <option value="">All priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <label className="relative">
        <UserRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-jira-muted" />
        <select value={assignee} onChange={(event) => onAssigneeChange(event.target.value)} className="bg-[#1c1d1f] border border-[#45464a] pl-9 pr-3 py-1.5 text-xs text-[#d0d2d5]">
          <option value="">All assignees</option>
          {members.map((member) => {
            const id = typeof member === 'string' ? member : member.id;
            const name = typeof member === 'string' ? member : member.name;
            return <option key={id} value={id}>{name}</option>;
          })}
        </select>
      </label>
      <button className="flex items-center gap-2 border border-[#45464a] px-3 py-1.5 text-xs text-[#d0d2d5]"><Filter size={14} /> Type</button>
      <button className="flex items-center gap-2 border border-[#45464a] px-3 py-1.5 text-xs text-[#d0d2d5]"><ListFilter size={14} /> More</button>
      <button className="text-[#b7b9bc] text-xs ml-1">Clear filters</button>
      <div className="ml-auto flex items-center gap-2"><button className="border border-[#45464a] px-3 py-1.5 text-[#d0d2d5] text-xs">Group</button><button className="p-1.5 border border-[#45464a] text-[#b7b9bc]"><BarChart3 size={15} /></button><button className="p-1.5 border border-[#45464a] text-[#b7b9bc]"><SlidersHorizontal size={15} /></button></div>
    </div>
  );
}
