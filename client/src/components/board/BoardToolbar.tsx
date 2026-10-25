import { Search, X } from 'lucide-react';
import type { Project, TaskPriority, TaskWorkType } from '../../types';
import Avatar from '../common/Avatar';
import { priorityLabels, workTypeLabels } from '../../utils/badges';
import { resolveUsers } from '../../utils/userRefs';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  priority: TaskPriority | '';
  onPriorityChange: (value: TaskPriority | '') => void;
  type: TaskWorkType | '';
  onTypeChange: (value: TaskWorkType | '') => void;
  assignee: string;
  onAssigneeChange: (value: string) => void;
  members: Project['members'];
}

export default function BoardToolbar({
  search, onSearchChange, priority, onPriorityChange, type, onTypeChange, assignee, onAssigneeChange, members,
}: Props) {
  const resolvedMembers = resolveUsers(members);
  const hasFilters = Boolean(search || priority || type || assignee);

  const clearFilters = () => {
    onSearchChange('');
    onPriorityChange('');
    onTypeChange('');
    onAssigneeChange('');
  };

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2">
      <div className="relative w-[220px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-jira-muted" />
        <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search board" aria-label="Search board" className="w-full bg-[#1c1d1f] border border-[#6e7075] px-9 py-1.5 text-[13px] text-jira-textBright placeholder:text-[#96999e] focus:outline-none focus:border-[#75a4f7]" />
      </div>
      <div className="flex items-center -space-x-1 mr-2">
        {resolvedMembers.map((member) => {
          const selected = assignee === member.id;
          return (
            <button
              key={member.id}
              type="button"
              title={selected ? `Clear ${member.name} filter` : `Show tasks assigned to ${member.name}`}
              aria-pressed={selected}
              onClick={() => onAssigneeChange(selected ? '' : member.id)}
              className={`rounded-full border-2 transition-transform hover:z-10 hover:scale-110 ${selected ? 'border-[#75a4f7] ring-2 ring-[#75a4f7]/40 z-10' : 'border-[#1c1d1f]'}`}
            >
              <Avatar name={member.name} src={member.avatarUrl} size={28} />
            </button>
          );
        })}
      </div>
      <label>
        <span className="sr-only">Filter by type</span>
        <select value={type} onChange={(event) => onTypeChange(event.target.value as TaskWorkType | '')} className="bg-[#1c1d1f] border border-[#45464a] px-3 py-1.5 text-xs text-[#d0d2d5]">
          <option value="">All types</option>
          {(Object.keys(workTypeLabels) as TaskWorkType[]).map((t) => (
            <option key={t} value={t}>{workTypeLabels[t]}</option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">Filter by priority</span>
        <select value={priority} onChange={(event) => onPriorityChange(event.target.value as TaskPriority | '')} className="bg-[#1c1d1f] border border-[#45464a] px-3 py-1.5 text-xs text-[#d0d2d5]">
          <option value="">All priorities</option>
          {(Object.keys(priorityLabels) as TaskPriority[]).map((p) => (
            <option key={p} value={p}>{priorityLabels[p]}</option>
          ))}
        </select>
      </label>
      <label className="relative">
        <span className="sr-only">Filter by assignee</span>
        <select value={assignee} onChange={(event) => onAssigneeChange(event.target.value)} className="bg-[#1c1d1f] border border-[#45464a] pl-3 pr-3 py-1.5 text-xs text-[#d0d2d5]">
          <option value="">All assignees</option>
          {resolvedMembers.map((member) => (
            <option key={member.id} value={member.id}>{member.name}</option>
          ))}
        </select>
      </label>
      <button
        onClick={clearFilters}
        disabled={!hasFilters}
        className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 ${hasFilters ? 'text-[#75a4f7] hover:underline' : 'text-[#55575c] cursor-default'}`}
      >
        <X size={13} /> Clear filters
      </button>
      {hasFilters && <span className="text-[11px] text-[#85878a]">Filters active</span>}
    </div>
  );
}
