import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { projectApi } from '../../api/projectApi';
import { taskApi } from '../../api/taskApi';
import type { Project, Task } from '../../types';
import Board from '../../components/board/Board';
import BoardHeader from '../../components/board/BoardHeader';
import CreateTaskModal from '../../components/tasks/CreateTaskModal';
import TaskDetailModal from '../../components/tasks/TaskDetailModal';
import FilterBar from '../../components/board/FilterBoard';
import AddMemberModal from '../../components/projects/AddMemberModal';
import { useAppSelector } from '../../hooks/reduxHooks';

export default function ProjectBoard() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [activeView, setActiveView] = useState('board');
  const currentUser = useAppSelector((state) => state.auth.user);
  const isOwner = currentUser?.id === (project?.owner as any)?.id;

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = !priorityFilter || t.priority === priorityFilter;
    const matchesAssignee = !assigneeFilter || t.assignee?.id === assigneeFilter;
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [proj, tsk] = await Promise.all([
        projectApi.getById(id),
        taskApi.getByProject(id)
      ]);
      setProject(proj);
      setTasks(tsk);
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleTabChange = (tab: string) => {
    setActiveView(tab);
  };

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const projectKey = project.name.slice(0, 3).toUpperCase();

  return (
    <div className="flex flex-col h-screen">
      <BoardHeader
        projectName={project.name}
        projectKey={projectKey}
        onTabChange={handleTabChange}
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        priority={priorityFilter as any}
        onPriorityChange={setPriorityFilter}
        assignee={assigneeFilter}
        onAssigneeChange={setAssigneeFilter}
        members={project.members}
      />

      {activeView === 'board' && (
        <Board
          tasks={filteredTasks}
          setTasks={setTasks}
          onTaskClick={(task) => setActiveTask(task)}
        />
      )}

      {activeView === 'list' && (
        <div className="bg-[#f4f5f7] p-4">
          <div className="bg-white border border-[#dfe1e6] rounded">
            <div className="p-4 text-sm text-[#6b7780]">
              List view coming soon...
            </div>
          </div>
        </div>
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
        <TaskDetailModal
          task={activeTask}
          onClose={() => setActiveTask(null)}
          onUpdated={load}
        />
      )}

      {showAddMember && (
        <AddMemberModal
          projectId={project._id}
          onClose={() => setShowAddMember(false)}
          onAdded={load}
        />
      )}
    </div>
  );
}
