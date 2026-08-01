import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { projectApi } from '../../api/projectApi';
import { taskApi } from '../../api/taskApi';
import type { Project, Task, TaskPriority } from '../../types';
import { useAppSelector } from '../../hooks/reduxHooks';
import Board from '../../components/board/Board';
import SpaceHeader from '../../components/board/SpaceHeader';
import BoardTabs from '../../components/board/BoardTabs';
import BoardToolbar from '../../components/board/BoardToolbar';
import SummaryView from '../../components/board/SummaryView';
import ListView from '../../components/board/ListView';
import CreateTaskModal from '../../components/tasks/CreateTaskModal';
import TaskDetailModal from '../../components/tasks/TaskDetailModal';
import AddMemberModal from '../../components/projects/AddMemberModal';

type TabKey = 'summary' | 'list' | 'board';

export default function ProjectBoard() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('board');
  const [showCreate, setShowCreate] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  const currentUser = useAppSelector((state) => state.auth.user);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [proj, tsk] = await Promise.all([projectApi.getById(id), taskApi.getByProject(id)]);
    setProject(proj);
    setTasks(tsk);
    setLoading(false);
  };

  useEffect(() => {
    // Fetch project data when the route changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // load is intentionally scoped to the current route id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !project) {
    return <div className="text-jira-muted">Loading project...</div>;
  }

  const ownerId = typeof project.owner === 'string' ? project.owner : project.owner.id;
  const isOwner = currentUser?.id === ownerId;

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = !priorityFilter || t.priority === priorityFilter;
    const matchesAssignee = !assigneeFilter || t.assignee?.id === assigneeFilter;
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  return (
    <div className="min-h-[calc(100vh-52px)] bg-[#1f2022]">
      <SpaceHeader name={project.name} onAddMember={() => setShowAddMember(true)} />
      <BoardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex justify-between items-center px-8 py-2">
        <p className="text-[#96999e] text-sm">
          {project.members.length} member{project.members.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#6f9deb] text-[#101214] px-4 py-2 text-sm font-semibold hover:bg-[#87adf0]"
        >
          + New Task
        </button>
      </div>

      {activeTab === 'summary' && <SummaryView project={project} tasks={tasks} />}

      {(activeTab === 'board' || activeTab === 'list') && (
        <>
          <BoardToolbar
            search={search}
            onSearchChange={setSearch}
            priority={priorityFilter}
            onPriorityChange={setPriorityFilter}
            assignee={assigneeFilter}
            onAssigneeChange={setAssigneeFilter}
            members={project.members}
          />

          {activeTab === 'board' ? (
            <Board tasks={filteredTasks} setTasks={setTasks} onTaskClick={setActiveTask} />
          ) : (
            <ListView tasks={filteredTasks} onTaskClick={setActiveTask} />
          )}
        </>
      )}

      {showCreate && (
        <CreateTaskModal
          projectId={project._id}
          members={project.members}
          onClose={() => setShowCreate(false)}
          onCreated={load}
        />
      )}

      {activeTask && (
        <TaskDetailModal task={activeTask} onClose={() => setActiveTask(null)} onUpdated={load} />
      )}

      {showAddMember && isOwner && (
        <AddMemberModal projectId={project._id} onClose={() => setShowAddMember(false)} onAdded={load} />
      )}
    </div>
  );
}
