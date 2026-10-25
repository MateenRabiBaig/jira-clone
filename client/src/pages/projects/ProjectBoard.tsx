import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { projectApi } from '../../api/projectApi';
import { taskApi } from '../../api/taskApi';
import { getErrorMessage } from '../../api/axios';
import type { Project, Task, TaskPriority, TaskWorkType } from '../../types';
import { useAppSelector } from '../../hooks/reduxHooks';
import Board from '../../components/board/Board';
import SpaceHeader from '../../components/board/SpaceHeader';
import BoardTabs from '../../components/board/BoardTabs';
import BoardToolbar from '../../components/board/BoardToolbar';
import SummaryView from '../../components/board/SummaryView';
import ListView from '../../components/board/ListView';
import QuickCreateTaskModal from '../../components/tasks/QuickCreateTaskModal';
import TaskDetailModal from '../../components/tasks/TaskDetailModal';
import ProjectMembersModal from '../../components/projects/ProjectMembersModal';
import EditProjectModal from '../../components/projects/EditProjectModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { LoadingState, ErrorState } from '../../components/common/States';

type TabKey = 'summary' | 'list' | 'board';

export default function ProjectBoard() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('board');
  const [membersOpen, setMembersOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [typeFilter, setTypeFilter] = useState<TaskWorkType | ''>('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  const currentUser = useAppSelector((state) => state.auth.user);

  // Never sets state synchronously, so it is safe to call from an effect.
  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [proj, tsk] = await Promise.all([projectApi.getById(id), taskApi.getByProject(id)]);
      setProject(proj);
      setTasks(tsk);
      setLoadError(null);
    } catch (err: unknown) {
      setLoadError(getErrorMessage(err, 'Could not load this project'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  // With a spinner - used from event handlers such as retry and after mutations.
  const reload = useCallback(async () => {
    setLoading(true);
    await load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [proj, tsk] = await Promise.all([projectApi.getById(id ?? ''), taskApi.getByProject(id ?? '')]);
        if (cancelled) return;
        setProject(proj);
        setTasks(tsk);
        setLoadError(null);
      } catch (err: unknown) {
        if (!cancelled) setLoadError(getErrorMessage(err, 'Could not load this project'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Deep link: /projects/:id?task=:taskId opens the task detail modal.
  const openTaskId = searchParams.get('task');
  const activeTask = openTaskId ? tasks.find((task) => task.id === openTaskId) ?? null : null;

  const openTask = (task: Task) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('task', task.id);
      return next;
    });
  };

  const closeTask = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('task');
      return next;
    }, { replace: true });
  };

  const owner = useMemo(
    () => (project && typeof project.owner === 'object' ? project.owner : null),
    [project],
  );
  const isOwner = Boolean(owner && currentUser && owner.id === currentUser.id);
  const canDeleteTask = (task: Task) => {
    if (isOwner) return true;
    const reporterId = typeof task.reporter === 'object' && task.reporter ? task.reporter.id : task.reporter;
    return reporterId === currentUser?.id;
  };

  const onTaskUpdated = (updated: Task) => {
    setTasks((prev) => prev.map((task) => (task.id === updated.id ? updated : task)));
  };

  const onTaskDeleted = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    closeTask();
  };

  const deleteProject = async () => {
    if (!project) return;
    setDeleting(true);
    try {
      await projectApi.delete(project.id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Could not delete project'));
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading project..." />;
  }

  if (loadError || !project) {
    return (
      <div className="p-4">
        <ErrorState message={loadError ?? 'Project not found'} onRetry={() => void reload()} />
      </div>
    );
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.ticketKey ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    const matchesType = !typeFilter || task.workType === typeFilter;
    const matchesAssignee = !assigneeFilter ||
      (typeof task.assignee === 'object' && task.assignee ? task.assignee.id === assigneeFilter : false);
    return matchesSearch && matchesPriority && matchesType && matchesAssignee;
  });

  return (
    <div className="min-h-[calc(100vh-52px)] max-w-[1700px] mx-auto bg-[#1f2022]">
      <SpaceHeader
        project={project}
        canManage={isOwner}
        onOpenMembers={() => setMembersOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onDelete={() => setConfirmDelete(true)}
      />
      <BoardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'summary' && <SummaryView project={project} tasks={tasks} />}

      {(activeTab === 'board' || activeTab === 'list') && (
        <>
          <BoardToolbar
            search={search}
            onSearchChange={setSearch}
            priority={priorityFilter}
            onPriorityChange={setPriorityFilter}
            type={typeFilter}
            onTypeChange={setTypeFilter}
            assignee={assigneeFilter}
            onAssigneeChange={setAssigneeFilter}
            members={project.members}
          />

          {activeTab === 'board' ? (
            <Board
              tasks={filteredTasks}
              setTasks={setTasks}
              onTaskClick={openTask}
              onCreateTask={() => setShowCreate(true)}
            />
          ) : (
            <div className="px-4 pb-4">
              <ListView tasks={filteredTasks} onTaskClick={openTask} />
            </div>
          )}
        </>
      )}

      {activeTask && (
        <TaskDetailModal
          task={activeTask}
          projectMembers={project.members}
          canDelete={canDeleteTask(activeTask)}
          onClose={closeTask}
          onUpdated={onTaskUpdated}
          onDeleted={onTaskDeleted}
        />
      )}

      {showCreate && (
        <QuickCreateTaskModal
          onClose={() => setShowCreate(false)}
          defaultProjectId={project.id}
          onCreated={() => {
            setShowCreate(false);
            void reload();
          }}
        />
      )}

      {membersOpen && (
        <ProjectMembersModal
          project={project}
          isOwner={isOwner}
          currentUserId={currentUser?.id ?? ''}
          onClose={() => setMembersOpen(false)}
          onMembersChanged={setProject}
        />
      )}

      {settingsOpen && (
        <EditProjectModal
          project={project}
          onClose={() => setSettingsOpen(false)}
          onSaved={setProject}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title={`Delete "${project.name}"?`}
          message="All tasks, comments and attachments in this project will be permanently deleted. This cannot be undone."
          confirmLabel="Delete project"
          danger
          busy={deleting}
          onConfirm={() => void deleteProject()}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
