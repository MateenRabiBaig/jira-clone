import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import { projectApi } from "../../api/projectApi";
import { taskApi } from "../../api/taskApi";
import { getErrorMessage } from "../../api/axios";
import type { Project, TaskPriority, TaskStatus, TaskWorkType } from "../../types";
import { useAppSelector } from "../../hooks/reduxHooks";
import { resolveUsers } from "../../utils/userRefs";

interface Props {
    onClose: () => void;
    onCreated: (projectId: string) => void;
    /** Preselects a project (e.g. when creating from a board). */
    defaultProjectId?: string;
}

interface FormData {
    project: string;
    workType: TaskWorkType;
    status: TaskStatus;
    title: string;
    description: string;
    priority: TaskPriority;
    assignee: string;
    dueDate: string;
}

export default function QuickCreateTaskModal({ onClose, onCreated, defaultProjectId }: Props) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const user = useAppSelector((state) => state.auth.user);
    const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormData>({
        defaultValues: {
            workType: "task",
            status: "todo",
            priority: "medium",
            project: defaultProjectId ?? "",
            assignee: "",
        },
    });
    const selectedProjectId = useWatch({ control, name: "project" });
    const selectedProject = projects.find((project) => project.id === selectedProjectId);

    useEffect(() => {
        projectApi
            .getAll()
            .then(setProjects)
            .catch((err: unknown) => toast.error(getErrorMessage(err, 'Could not load projects')))
            .finally(() => setLoadingProjects(false));
    }, []);

    const onSubmit = async (data: FormData) => {
        try {
            await taskApi.create({
                project: data.project,
                title: data.title,
                description: data.description,
                workType: data.workType,
                status: data.status,
                priority: data.priority,
                assignee: data.assignee || undefined,
                reporter: user?.id,
                dueDate: data.dueDate || undefined,
            });
            toast.success("Issue created");
            onCreated(data.project);
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Could not create issue"));
        }
    };

    const fieldClass = "w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] placeholder:text-[#85878a] px-3 py-2 text-sm focus:border-[#75a4f7] focus:outline-none";
    const labelClass = "block text-xs font-semibold text-[#b7b9bc] mb-1";

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Create issue"
                className="bg-[#242528] border border-[#55575c] w-full max-w-[720px] max-h-[92vh] overflow-y-auto shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-[#36373a] px-6 py-4">
                    <h2 className="text-lg font-semibold text-[#e0e1e3]">Create issue</h2>
                    <button type="button" onClick={onClose} className="text-[#96999e] text-xl hover:text-white" aria-label="Close">×</button>
                </div>

                {loadingProjects ? (
                    <p className="p-6 text-sm text-[#96999e]">Loading projects...</p>
                ) : projects.length === 0 ? (
                    <p className="p-6 text-sm text-[#96999e]">Create a project before creating an issue.</p>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4" noValidate>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="create-project" className={labelClass}>Project <span className="text-[#f15b50]">*</span></label>
                                <select id="create-project" {...register("project", { required: "Project is required" })} className={fieldClass}>
                                    <option value="">Select project</option>
                                    {projects.map((project) => (
                                        <option key={project.id} value={project.id}>{project.name}</option>
                                    ))}
                                </select>
                                {errors.project && <p className="text-xs text-[#f15b50] mt-1">{errors.project.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="create-worktype" className={labelClass}>Work type</label>
                                <select id="create-worktype" {...register("workType")} className={fieldClass}>
                                    <option value="task">Task</option>
                                    <option value="story">Story</option>
                                    <option value="bug">Bug</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="create-status" className={labelClass}>Status</label>
                                <select id="create-status" {...register("status")} className={fieldClass}>
                                    <option value="todo">To do</option>
                                    <option value="in-progress">In progress</option>
                                    <option value="in-review">In review</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="create-priority" className={labelClass}>Priority</label>
                                <select id="create-priority" {...register("priority")} className={fieldClass}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="create-title" className={labelClass}>Summary <span className="text-[#f15b50]">*</span></label>
                            <input id="create-title" {...register("title", { required: "Summary is required" })} placeholder="What needs to be done?" className={fieldClass} />
                            {errors.title && <p className="text-xs text-[#f15b50] mt-1">{errors.title.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="create-description" className={labelClass}>Description</label>
                            <textarea id="create-description" {...register("description")} rows={4} placeholder="Add details, acceptance criteria, or context" className={fieldClass} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="create-reporter" className={labelClass}>Reporter</label>
                                <input id="create-reporter" value={user?.name ?? "Current user"} readOnly className={`${fieldClass} text-[#96999e]`} />
                            </div>
                            <div>
                                <label htmlFor="create-assignee" className={labelClass}>Assignee</label>
                                <select id="create-assignee" {...register("assignee")} className={fieldClass} disabled={!selectedProject}>
                                    <option value="">Unassigned</option>
                                    {selectedProject && resolveUsers(selectedProject.members).map((member) => (
                                        <option key={member.id} value={member.id}>{member.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="create-duedate" className={labelClass}>Due date</label>
                                <input id="create-duedate" type="date" {...register("dueDate")} className={fieldClass} />
                            </div>
                        </div>

                        <p className="text-[11px] text-[#85878a]">Files and labels can be added after the issue is created.</p>

                        <div className="flex justify-end gap-2 border-t border-[#36373a] pt-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 border border-[#55575c] text-[#b7b9bc] text-sm hover:bg-[#2c2d30]">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#6f9deb] text-[#101214] font-semibold text-sm disabled:opacity-50">
                                {isSubmitting ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
