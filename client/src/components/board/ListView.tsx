import type { Task } from '../../types';
import Avatar from '../common/Avatar';

interface Props {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const priorityBadgeStyles: Record<string, string> = {
  high: 'bg-[#42221F] text-[#FD9891]',
  medium: 'bg-[#3A2C1F] text-[#EED12B]',
  low: 'bg-[#303134] text-[#A9ABAF]',
};

const statusLabels: Record<string, string> = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };

export default function ListView({ tasks, onTaskClick }: Props) {
  return (
    <div className="bg-jira-panel border border-jira-border rounded-md overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-jira-muted text-xs uppercase border-b border-jira-border">
            <th className="px-4 py-2 font-medium">Key</th>
            <th className="px-4 py-2 font-medium">Title</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Priority</th>
            <th className="px-4 py-2 font-medium">Assignee</th>
            <th className="px-4 py-2 font-medium">Due</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr
              key={t._id}
              onClick={() => onTaskClick(t)}
              className="border-b border-jira-border last:border-0 hover:bg-jira-card cursor-pointer"
            >
              <td className="px-4 py-2 text-jira-muted whitespace-nowrap">{t.ticketKey ?? '—'}</td>
              <td className="px-4 py-2 text-jira-textBright">{t.title}</td>
              <td className="px-4 py-2 text-jira-muted whitespace-nowrap">{statusLabels[t.status]}</td>
              <td className="px-4 py-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${priorityBadgeStyles[t.priority]}`}>
                  {t.priority}
                </span>
              </td>
              <td className="px-4 py-2">
                {t.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar name={t.assignee.name} size={18} />
                    <span className="text-jira-muted text-xs whitespace-nowrap">{t.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-jira-muted text-xs">Unassigned</span>
                )}
              </td>
              <td className="px-4 py-2 text-jira-muted text-xs whitespace-nowrap">
                {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
              </td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-jira-muted text-sm">No tasks match your filters.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}