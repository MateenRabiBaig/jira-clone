import type { Project, Task } from '../../types';
import Avatar from '../common/Avatar';
import { Link } from 'react-router-dom';
import { resolveUsers } from '../../utils/userRefs';

interface Props {
  project: Project;
  tasks: Task[];
}

export default function SummaryView({ project, tasks }: Props) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const todo = tasks.filter((t) => t.status === 'todo').length;

  const owner = typeof project.owner === 'object' ? project.owner : null;

  return (
    <div className="space-y-6 px-4 pb-6">
      <div className="bg-jira-card border border-jira-border rounded-xl p-5">
        <h3 className="text-jira-textBright font-semibold mb-2">About this project</h3>
        <p className="text-jira-muted text-sm">{project.description || 'No description provided.'}</p>
        {owner && (
          <p className="text-xs text-jira-muted mt-3">
            Owned by <span className="text-jira-textBright">{owner.name}</span>
            {project.team && typeof project.team === 'object' && (
              <> · Team: <Link to={`/teams/${project.team.id}`} className="text-[#75a4f7] hover:underline">{project.team.name}</Link></>
            )}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-jira-card border border-jira-border rounded-xl p-4">
          <p className="text-jira-muted text-xs">Total tasks</p>
          <p className="text-jira-textBright text-2xl font-semibold mt-1">{total}</p>
        </div>
        <div className="bg-jira-card border border-jira-border rounded-xl p-4">
          <p className="text-jira-muted text-xs">To do</p>
          <p className="text-jira-textBright text-2xl font-semibold mt-1">{todo}</p>
        </div>
        <div className="bg-jira-card border border-jira-border rounded-xl p-4">
          <p className="text-jira-muted text-xs">In progress</p>
          <p className="text-jira-textBright text-2xl font-semibold mt-1">{inProgress}</p>
        </div>
        <div className="bg-jira-card border border-jira-border rounded-xl p-4">
          <p className="text-jira-muted text-xs">Done</p>
          <p className="text-jira-textBright text-2xl font-semibold mt-1">{done}</p>
        </div>
      </div>

      <div className="bg-jira-card border border-jira-border rounded-xl p-5">
        <h3 className="text-jira-textBright font-semibold mb-3">Members ({project.members.length})</h3>
        <div className="flex flex-wrap gap-3">
          {resolveUsers(project.members).map((member) => {
            const isOwner = owner?.id === member.id;
            return (
              <div key={member.id} className="flex items-center gap-2 bg-jira-panel border border-jira-border rounded-full pl-1 pr-3 py-1">
                <Avatar name={member.name} src={member.avatarUrl} size={22} />
                <span className="text-jira-text text-sm">{member.name}</span>
                {isOwner && <span className="text-[9px] uppercase tracking-wide text-[#ddb30e]">Owner</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
