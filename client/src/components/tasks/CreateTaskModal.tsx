import { useForm } from 'react-hook-form';
import { taskApi } from '../../api/taskApi';
import type { Project } from '../../types';

interface Props {
  projectId: string;
  members: Project['members'];
  onClose: () => void;
  onCreated: () => void;
}

interface FormData {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignee?: string;
}

export default function CreateTaskModal({ projectId, members, onClose, onCreated }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ defaultValues: { priority: 'medium' } });

  const onSubmit = async (data: FormData) => {
    await taskApi.create({ ...data, project: projectId, assignee: data.assignee || undefined });
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">New Task</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <input
              {...register('title', { required: 'Title is required' })}
              placeholder="Task title"
              className="w-full border rounded px-3 py-2"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>
          <textarea
            {...register('description')}
            placeholder="Description"
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
          <select {...register('priority')} className="w-full border rounded px-3 py-2">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select {...register('assignee')} className="w-full border rounded px-3 py-2">
            <option value="">Unassigned</option>
            {(members as any[]).map((m) => (
              <option key={m._id ?? m} value={m._id ?? m}>
                {m.name ?? m}
              </option>
            ))}
          </select>
          <input type="date" {...register('dueDate')} className="w-full border rounded px-3 py-2" />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}