import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { projectApi } from '../../api/projectApi';
import { taskApi } from '../../api/taskApi';
import type { Project, Task } from '../../types';
import Board from '../../components/board/Board';
import CreateTaskModal from '../../components/tasks/CreateTaskModal';
import TaskDetailModal from '../../components/tasks/TaskDetailModal';
export default function ProjectBoard() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [proj, tsk] = await Promise.all([projectApi.getById(id), taskApi.getByProject(id)]);
    setProject(proj);
    setTasks(tsk);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading || !project) return <div className="p-6">Loading board...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-gray-500 text-sm">{project.description}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-indigo-600 text-white px-4 py-2 rounded">New Task</button>
      </div>

      <Board tasks={tasks} setTasks={setTasks} onTaskClick={setActiveTask} />

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
    </div>
  )
}