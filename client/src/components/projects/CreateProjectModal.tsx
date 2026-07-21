import { useForm } from "react-hook-form";
import { projectApi } from "../../api/projectApi";

interface Props {
    onClose: () => void;
    onCreated: () => void;
}

interface FormData {
    name: string;
    description?: string;
}

export default function CreateProjectModal({ onClose, onCreated }: Props) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();

    const onSubmit = async(data: FormData) => {
        await projectApi.create(data)
        onCreated()
        onClose()
    }
    
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
                <h2 className="text-xl font-bold mb-4">New Project</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <input
                            {...register('name', {required: 'Project name is required'})}
                            placeholder="Project Name"
                            className="w-full border rounded px-3 py-2"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                        <textarea
                            {...register('description')}
                            placeholder="Description"
                            className="w-full border rounded px-3 py-2"
                            rows={3}
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={onClose} className="px-4">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50">{isSubmitting ? 'Creating...' : 'Create'}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}