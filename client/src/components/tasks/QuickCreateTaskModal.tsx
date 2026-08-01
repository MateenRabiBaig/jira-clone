import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { projectApi } from "../../api/projectApi";
import { taskApi } from "../../api/taskApi";
import type { Project } from "../../types";

interface Props {
    onClose: () => void;
    onCreated: (projectId: string) => void;
}

interface FormData {
    project: string;
    title: string;
    priority: "low" | "medium" | "high";
    dueDate?: string;
}

function QuickCreateTaskModal({ onClose, onCreated }: Props) {
    const [projects, setProjects] = useState<Project[]>([])
    const [loadingProjects, setLoadingProjects] = useState(true)
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ defaultValues: { priority: "medium" } })

    useEffect(() => {
        projectApi.getAll()
            .then(setProjects)
            .finally(() => setLoadingProjects(false))
    }, [])

    const onSubmit = async (data: FormData) => {
        await taskApi.create({ title: data.title, priority: data.priority, dueDate: data.dueDate, project: data.project })
        onCreated(data.project)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#242528] border border-[#55575c] p-5 w-full max-w-md shadow-2xl">
                <h2 className="text-xl font-bold mb-4 text-[#e0e1e3]">New Task</h2>

                {loadingProjects ? (
                    <p className="text-sm text-[#96999e]">Loading your projects...</p>
                ) : projects.length === 0 ? (
                    <p className="text-sm text-[#96999e]">
                        You need a project before creating a task.{" "}
                        <button onClick={onClose} className="text-indigo-600 underline">
                            Close and create one first
                        </button>
                    </p>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                        <div>
                            <select
                                {...register("project", { required: "Select a project" })}
                                defaultValue=""
                                className="w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] px-3 py-2 text-sm"
                            >
                                <option value="" disabled>Select project</option>
                                {projects.map((p) => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                            {errors.project && (
                                <p className="text-red-500 text-sm mt-1">{errors.project.message}</p>
                            )}
                        </div>

                        <div>
                            <input
                                {...register("title", { required: "Title is required" })}
                                placeholder="Task title"
                                className="w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] placeholder:text-[#85878a] px-3 py-2 text-sm"
                            />
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                            )}
                        </div>

                        <select {...register("priority")} className="w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] px-3 py-2 text-sm">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>

                        <input
                            type="date"
                            {...register("dueDate")}
                            className="w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] px-3 py-2 text-sm"
                        />

                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 border border-[#55575c] text-[#b7b9bc] text-sm">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-[#6f9deb] text-[#101214] font-semibold text-sm disabled:opacity-50"
                            >
                                {isSubmitting ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default QuickCreateTaskModal;
