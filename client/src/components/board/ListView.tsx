import type { Task } from '../../types';
import Avatar from '../common/Avatar';
import { priorityBadgeStyles, statusBadgeStyles, statusLabels } from '../../utils/badges';

interface Props {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

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
          {tasks.map((task) => (
            <tr
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="border-b border-jira-border last:border-0 hover:bg-jira-card cursor-pointer"
            >
              <td className="px-4 py-2 text-jira-muted whitespace-nowrap">{task.ticketKey ?? '—'}</td>
              <td className="px-4 py-2 text-jira-textBright">{task.title}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${statusBadgeStyles[task.status]}`}>
                  {statusLabels[task.status]}
                </span>
              </td>
              <td className="px-4 py-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize whitespace-nowrap ${priorityBadgeStyles[task.priority]}`}>
                  {task.priority}
                </span>
              </td>
              <td className="px-4 py-2">
                {typeof task.assignee === 'object' && task.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar name={task.assignee.name} src={task.assignee.avatarUrl} size={18} />
                    <span className="text-jira-muted text-xs whitespace-nowrap">{task.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-jira-muted text-xs">Unassigned</span>
                )}
              </td>
              <td className="px-4 py-2 text-jira-muted text-xs whitespace-nowrap">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
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
