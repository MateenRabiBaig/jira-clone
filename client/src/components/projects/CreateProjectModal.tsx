import { useForm } from "react-hook-form";
import { projectApi } from "../../api/projectApi";
import type { Project } from '../../types';

interface Props {
    onClose: () => void;
    onCreated: (project: Project) => void;
}

interface FormData {
    name: string;
    description?: string;
}

export default function CreateProjectModal({ onClose, onCreated }: Props) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();

    const onSubmit = async(data: FormData) => {
        const created = await projectApi.create(data)
        onCreated(created)
        onClose()
    }
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#242528] border border-[#55575c] p-5 w-full max-w-md shadow-2xl">
                <h2 className="text-xl font-bold mb-4 text-[#e0e1e3]">New Project</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <input
                            {...register('name', {required: 'Project name is required'})}
                            placeholder="Project Name"
                            className="w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] placeholder:text-[#85878a] px-3 py-2"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                        <textarea
                            {...register('description')}
                            placeholder="Description"
                            className="w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] placeholder:text-[#85878a] px-3 py-2 mt-2"
                            rows={3}
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={onClose} className="px-4 text-[#b7b9bc]">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#6f9deb] text-[#101214] font-semibold disabled:opacity-50">{isSubmitting ? 'Creating...' : 'Create'}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
