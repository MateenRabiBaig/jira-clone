import { useCallback, useEffect, useRef, useState } from "react";
import {
    Calendar, ChevronDown, Flag, Loader2, Paperclip, Pencil, Plus, Share2, Tag, Trash2, User as UserIcon, X,
} from "lucide-react";
import { toast } from "react-toastify";
import type { Attachment, Task, TaskPriority, TaskStatus, TaskWorkType, UserRef } from "../../types";
import { commentApi } from "../../api/commentApi";
import { taskApi, type TaskUpdateData } from "../../api/taskApi";
import { attachmentApi, formatFileSize, validateFile } from "../../api/attachmentApi";
import { getErrorMessage } from "../../api/axios";
import { timeAgo } from "../../utils/date";
import { priorityLabels, statusLabels, workTypeLabels } from "../../utils/badges";
import Avatar from "../common/Avatar";
import ConfirmDialog from "../common/ConfirmDialog";

interface Props {
    task: Task;
    projectMembers: UserRef[];
    canDelete: boolean;
    onClose: () => void;
    /** Keeps the board, list and summary views in sync after every change. */
    onUpdated: (task: Task) => void;
    onDeleted: (taskId: string) => void;
}

const selectClass =
    "bg-[#1c1d1f] border border-[#45464a] px-2.5 py-1.5 text-xs text-[#d0d2d5] focus:border-[#75a4f7] focus:outline-none max-w-[170px]";

export default function TaskDetailModal({ task, projectMembers, canDelete, onClose, onUpdated, onDeleted }: Props) {
    const [comments, setComments] = useState<CommentData[]>([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [posting, setPosting] = useState(false);

    const [editingTitle, setEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(task.title);
    const [editingDescription, setEditingDescription] = useState(false);
    const [descriptionDraft, setDescriptionDraft] = useState(task.description ?? "");
    const [savingField, setSavingField] = useState<string | null>(null);

    const [labelInput, setLabelInput] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const reloadComments = useCallback(async () => {
        try {
            setComments(await commentApi.getByTask(task.id));
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Could not load comments"));
        } finally {
            setLoadingComments(false);
        }
    }, [task.id]);

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const data = await commentApi.getByTask(task.id);
                if (!cancelled) setComments(data);
            } catch (err: unknown) {
                if (!cancelled) toast.error(getErrorMessage(err, "Could not load comments"));
            } finally {
                if (!cancelled) setLoadingComments(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [task.id]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !editingTitle && !editingDescription) onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [onClose, editingTitle, editingDescription]);

    const memberOptions = projectMembers
        .map((ref) => (typeof ref === "object" && ref ? ref : null))
        .filter((member): member is NonNullable<typeof member> => member !== null);

    const patch = async (data: TaskUpdateData, fieldLabel: string) => {
        setSavingField(fieldLabel);
        try {
            const updated = await taskApi.update(task.id, data);
            onUpdated(updated);
            return updated;
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, `Could not update ${fieldLabel}`));
            return null;
        } finally {
            setSavingField(null);
        }
    };

    const saveTitle = async () => {
        const trimmed = titleDraft.trim();
        setEditingTitle(false);
        if (!trimmed || trimmed === task.title) {
            setTitleDraft(task.title);
            return;
        }
        await patch({ title: trimmed }, "title");
    };

    const saveDescription = async () => {
        setEditingDescription(false);
        if (descriptionDraft === (task.description ?? "")) return;
        await patch({ description: descriptionDraft }, "description");
    };

    const postComment = async () => {
        const trimmed = newComment.trim();
        if (!trimmed) return;
        setPosting(true);
        try {
            await commentApi.add(task.id, trimmed);
            setNewComment("");
            await reloadComments();
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Could not post comment"));
        } finally {
            setPosting(false);
        }
    };

    const share = async () => {
        const url = `${window.location.origin}/projects/${typeof task.project === "object" ? task.project.id : task.project}?task=${task.id}`;
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Task link copied");
        } catch {
            toast.error("Could not copy the link");
        }
    };

    const deleteTask = async () => {
        try {
            await taskApi.delete(task.id);
            toast.success("Task deleted");
            onDeleted(task.id);
            onClose();
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Could not delete task"));
        }
    };

    const addLabel = async () => {
        const label = labelInput.trim();
        if (!label) return;
        setLabelInput("");
        if (task.labels?.includes(label)) {
            toast.info("That label already exists");
            return;
        }
        await patch({ labels: [...(task.labels ?? []), label] }, "labels");
    };

    const removeLabel = async (label: string) => {
        await patch({ labels: (task.labels ?? []).filter((existing) => existing !== label) }, "labels");
    };

    const uploadFile = async (file: File) => {
        const validation = validateFile(file);
        if (validation) {
            toast.error(validation);
            return;
        }
        setUploading(true);
        setUploadProgress(0);
        try {
            const { attachments } = await attachmentApi.upload(task.id, file, setUploadProgress);
            onUpdated({ ...task, attachments });
            toast.success("File attached");
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Upload failed"));
        } finally {
            setUploading(false);
        }
    };

    const removeAttachment = async (attachment: Attachment) => {
        try {
            const { attachments } = await attachmentApi.delete(attachment.fileId);
            onUpdated({ ...task, attachments });
            toast.success("Attachment removed");
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Could not remove attachment"));
        }
    };

    const viewAttachment = async (attachment: Attachment) => {
        try {
            await attachmentApi.view(attachment.fileId);
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Could not open file"));
        }
    };

    const dueDateValue = task.dueDate ? task.dueDate.slice(0, 10) : "";

    return (
        <div className="fixed inset-0 bg-[#101112]/85 z-[70] flex items-center justify-center p-4 lg:p-8" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label={task.title}
                className="w-full max-w-[980px] max-h-[90vh] overflow-y-auto bg-[#242528] text-[#d0d2d5] border border-[#45464a] shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="h-11 flex items-center justify-between border-b border-[#36373a] px-4 sticky top-0 bg-[#242528] z-10">
                    <div className="text-xs text-[#d0d2d5]">{task.ticketKey ?? task.id}</div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => void share()} title="Copy task link" aria-label="Copy task link" className="p-1.5 border border-[#45464a] hover:bg-[#2c2d30]">
                            <Share2 size={15} />
                        </button>
                        {canDelete && (
                            <button onClick={() => setConfirmDelete(true)} title="Delete task" aria-label="Delete task" className="p-1.5 border border-[#45464a] text-[#f15b50] hover:bg-[#2c2d30]">
                                <Trash2 size={15} />
                            </button>
                        )}
                        <button onClick={onClose} title="Close" aria-label="Close task" className="p-1.5 border border-[#45464a] hover:bg-[#2c2d30]">
                            <X size={16} />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-7 px-6 lg:px-8 py-7">
                    <main className="min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[#75a4f7] text-xs">{task.ticketKey ?? task.id}</span>
                            <span className="text-[#96999e] text-xs">• {task.workType ? workTypeLabels[task.workType] : "Task"}</span>
                        </div>

                        {editingTitle ? (
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    value={titleDraft}
                                    onChange={(event) => setTitleDraft(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") void saveTitle();
                                        if (event.key === "Escape") {
                                            setTitleDraft(task.title);
                                            setEditingTitle(false);
                                        }
                                    }}
                                    aria-label="Task title"
                                    className="flex-1 bg-[#1c1d1f] border border-[#75a4f7] px-3 py-2 text-xl font-bold text-[#e0e1e3] focus:outline-none"
                                />
                                <button onClick={() => void saveTitle()} className="px-3 bg-[#6f9deb] text-[#101214] text-xs font-semibold rounded">
                                    Save
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    setTitleDraft(task.title);
                                    setEditingTitle(true);
                                }}
                                className="group text-left w-full"
                                title="Click to edit title"
                            >
                                <h1 className="text-2xl lg:text-3xl font-bold leading-tight text-[#e0e1e3] max-w-4xl group-hover:bg-[#2c2d30] -mx-1 px-1 rounded transition-colors inline">
                                    {task.title}
                                    <Pencil size={14} className="inline ml-2 text-[#85878a] opacity-0 group-hover:opacity-100" aria-hidden />
                                </h1>
                            </button>
                        )}

                        <section className="mt-6 mb-7">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-lg font-semibold text-[#e0e1e3]">Description</h2>
                                {!editingDescription && (
                                    <button
                                        onClick={() => {
                                            setDescriptionDraft(task.description ?? "");
                                            setEditingDescription(true);
                                        }}
                                        className="text-xs text-[#75a4f7] hover:underline"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                            {editingDescription ? (
                                <div>
                                    <textarea
                                        autoFocus
                                        rows={6}
                                        value={descriptionDraft}
                                        onChange={(event) => setDescriptionDraft(event.target.value)}
                                        aria-label="Task description"
                                        className="w-full bg-[#1c1d1f] border border-[#75a4f7] px-3 py-2 text-sm leading-6 text-[#d0d2d5] focus:outline-none"
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => void saveDescription()} disabled={savingField === "description"} className="px-3 py-1.5 bg-[#6f9deb] text-[#101214] text-xs font-semibold rounded disabled:opacity-50">
                                            {savingField === "description" ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDescriptionDraft(task.description ?? "");
                                                setEditingDescription(false);
                                            }}
                                            className="px-3 py-1.5 border border-[#55575c] text-xs text-[#b7b9bc]"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap text-sm leading-6 text-[#d0d2d5]">
                                    {task.description || <span className="text-[#85878a] italic">No description provided. Click Edit to add one.</span>}
                                </p>
                            )}
                        </section>

                        {/* Attachments */}
                        <section className="mb-7">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-lg font-semibold text-[#e0e1e3]">Attachments ({task.attachments?.length ?? 0})</h2>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="flex items-center gap-1.5 text-xs text-[#75a4f7] hover:underline disabled:opacity-50"
                                >
                                    {uploading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={13} />}
                                    {uploading ? `Uploading ${uploadProgress}%` : "Attach file"}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (file) void uploadFile(file);
                                        event.target.value = "";
                                    }}
                                />
                            </div>
                            {task.attachments && task.attachments.length > 0 ? (
                                <ul className="space-y-1.5 max-w-2xl">
                                    {task.attachments.map((attachment) => (
                                        <li key={attachment.fileId} className="flex items-center gap-2 bg-[#1c1d1f] border border-[#36373a] px-3 py-2">
                                            <Paperclip size={13} className="text-[#96999e] shrink-0" />
                                            <button onClick={() => void viewAttachment(attachment)} className="text-xs text-[#75a4f7] hover:underline truncate" title="Open file">
                                                {attachment.filename}
                                            </button>
                                            <span className="text-[10px] text-[#85878a] shrink-0">{formatFileSize(attachment.size)}</span>
                                            <button
                                                onClick={() => void removeAttachment(attachment)}
                                                aria-label={`Remove ${attachment.filename}`}
                                                title="Remove attachment"
                                                className="ml-auto p-1 text-[#96999e] hover:text-[#f15b50]"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-[#85878a]">No attachments. Add files up to 5 MB.</p>
                            )}
                        </section>

                        {/* Comments */}
                        <section>
                            <h2 className="text-lg font-semibold text-[#e0e1e3] mb-3">Comments</h2>
                            {loadingComments ? (
                                <p className="text-xs text-[#96999e]">Loading comments...</p>
                            ) : (
                                <div className="space-y-2 max-w-3xl">
                                    {comments.length === 0 && <p className="text-xs text-[#96999e]">No comments yet. Mention teammates with @name to notify them.</p>}
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="border-b border-[#36373a] pb-2">
                                            <div className="flex items-center gap-2 text-[11px] text-[#96999e]">
                                                <Avatar
                                                    name={typeof comment.author === "object" && comment.author ? comment.author.name : "?"}
                                                    src={typeof comment.author === "object" ? comment.author?.avatarUrl : undefined}
                                                    size={20}
                                                />
                                                <span className="text-[#d0d2d5]">{typeof comment.author === "object" && comment.author ? comment.author.name : "Unknown"}</span>
                                                <span>{timeAgo(comment.createdAt)}</span>
                                            </div>
                                            <p className="text-xs text-[#d0d2d5] mt-1.5 whitespace-pre-wrap">{comment.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2 max-w-3xl mt-4">
                                <input
                                    value={newComment}
                                    onChange={(event) => setNewComment(event.target.value)}
                                    onKeyDown={(event) => event.key === "Enter" && !event.shiftKey && void postComment()}
                                    placeholder="Add a comment... use @name to mention"
                                    aria-label="Add a comment"
                                    className="flex-1 bg-[#1c1d1f] border border-[#55575c] px-3 py-1.5 text-xs text-[#e0e1e3] placeholder:text-[#85878a] focus:border-[#75a4f7] focus:outline-none"
                                />
                                <button onClick={() => void postComment()} disabled={posting || !newComment.trim()} className="bg-[#6f9deb] px-3 py-1.5 text-xs font-semibold text-[#101214] disabled:opacity-50">
                                    {posting ? "Posting..." : "Post"}
                                </button>
                            </div>
                        </section>
                    </main>

                    <aside className="space-y-3">
                        {/* Status */}
                        <label className="block">
                            <span className="sr-only">Status</span>
                            <div className="relative">
                                <select
                                    value={task.status}
                                    onChange={(event) => void patch({ status: event.target.value as TaskStatus }, "status")}
                                    disabled={savingField === "status"}
                                    className="w-full border border-[#75a4f7] bg-[#1c3764] px-3 py-2 text-xs text-[#d0d2d5] appearance-none cursor-pointer"
                                >
                                    {(Object.keys(statusLabels) as TaskStatus[]).map((status) => (
                                        <option key={status} value={status}>{statusLabels[status]}</option>
                                    ))}
                                </select>
                                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden />
                            </div>
                        </label>

                        <section className="border border-[#45464a] p-4">
                            <h2 className="text-base font-semibold text-[#e0e1e3] mb-4">Details</h2>
                            <div className="space-y-4 text-xs">
                                <Detail label="Assignee">
                                    <select
                                        value={assigneeId(task.assignee) ?? ""}
                                        onChange={(event) => void patch({ assignee: event.target.value || null }, "assignee")}
                                        disabled={savingField === "assignee"}
                                        aria-label="Change assignee"
                                        className={selectClass}
                                    >
                                        <option value="">Unassigned</option>
                                        {memberOptions.map((member) => (
                                            <option key={member.id} value={member.id}>{member.name}</option>
                                        ))}
                                    </select>
                                </Detail>

                                <Detail label="Reporter">
                                    <select
                                        value={assigneeId(task.reporter) ?? ""}
                                        onChange={(event) => event.target.value && void patch({ reporter: event.target.value }, "reporter")}
                                        disabled={savingField === "reporter"}
                                        aria-label="Change reporter"
                                        className={selectClass}
                                    >
                                        {memberOptions.map((member) => (
                                            <option key={member.id} value={member.id}>{member.name}</option>
                                        ))}
                                    </select>
                                </Detail>

                                <Detail label="Priority">
                                    <span className="flex items-center gap-1.5">
                                        <Flag size={12} className="text-[#96999e]" />
                                        <select
                                            value={task.priority}
                                            onChange={(event) => void patch({ priority: event.target.value as TaskPriority }, "priority")}
                                            disabled={savingField === "priority"}
                                            aria-label="Change priority"
                                            className={selectClass}
                                        >
                                            {(Object.keys(priorityLabels) as TaskPriority[]).map((priority) => (
                                                <option key={priority} value={priority}>{priorityLabels[priority]}</option>
                                            ))}
                                        </select>
                                    </span>
                                </Detail>

                                <Detail label="Type">
                                    <select
                                        value={task.workType ?? "task"}
                                        onChange={(event) => void patch({ workType: event.target.value as TaskWorkType }, "work type")}
                                        disabled={savingField === "work type"}
                                        aria-label="Change work type"
                                        className={selectClass}
                                    >
                                        {(Object.keys(workTypeLabels) as TaskWorkType[]).map((type) => (
                                            <option key={type} value={type}>{workTypeLabels[type]}</option>
                                        ))}
                                    </select>
                                </Detail>

                                <Detail label="Due date">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={12} className="text-[#96999e]" />
                                        <input
                                            type="date"
                                            value={dueDateValue}
                                            onChange={(event) => void patch({ dueDate: event.target.value || null }, "due date")}
                                            aria-label="Change due date"
                                            className="bg-[#1c1d1f] border border-[#45464a] px-2 py-1.5 text-xs text-[#d0d2d5] focus:border-[#75a4f7] focus:outline-none"
                                        />
                                        {task.dueDate && (
                                            <button
                                                onClick={() => void patch({ dueDate: null }, "due date")}
                                                aria-label="Clear due date"
                                                title="Clear due date"
                                                className="p-1 text-[#96999e] hover:text-white"
                                            >
                                                <X size={11} />
                                            </button>
                                        )}
                                    </span>
                                </Detail>
                            </div>
                        </section>

                        {/* Labels */}
                        <section className="border border-[#45464a] p-4">
                            <h2 className="flex items-center gap-1.5 text-base font-semibold text-[#e0e1e3] mb-3">
                                <Tag size={14} /> Labels
                            </h2>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {(task.labels ?? []).length === 0 && <span className="text-xs text-[#85878a]">No labels</span>}
                                {(task.labels ?? []).map((label) => (
                                    <span key={label} className="flex items-center gap-1 bg-[#1c3764] text-[#75a4f7] text-[11px] px-2 py-0.5 rounded-full">
                                        {label}
                                        <button onClick={() => void removeLabel(label)} aria-label={`Remove label ${label}`} className="hover:text-white">
                                            <X size={10} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-1.5">
                                <input
                                    value={labelInput}
                                    onChange={(event) => setLabelInput(event.target.value)}
                                    onKeyDown={(event) => event.key === "Enter" && void addLabel()}
                                    placeholder="Add label..."
                                    aria-label="Add label"
                                    className="flex-1 min-w-0 bg-[#1c1d1f] border border-[#45464a] px-2.5 py-1.5 text-xs text-[#d0d2d5] placeholder:text-[#85878a] focus:border-[#75a4f7] focus:outline-none"
                                />
                                <button onClick={() => void addLabel()} disabled={!labelInput.trim()} aria-label="Add label" className="px-2 border border-[#45464a] text-[#b7b9bc] disabled:opacity-40">
                                    <Plus size={13} />
                                </button>
                            </div>
                        </section>

                        {/* Activity */}
                        <section className="border border-[#45464a] p-4">
                            <h2 className="flex items-center gap-1.5 text-base font-semibold text-[#e0e1e3] mb-3">
                                <UserIcon size={14} /> Activity
                            </h2>
                            {(task.activity?.length ?? 0) === 0 ? (
                                <p className="text-xs text-[#85878a]">No activity yet.</p>
                            ) : (
                                <ul className="space-y-2 max-h-56 overflow-y-auto">
                                    {[...(task.activity ?? [])].reverse().map((entry, index) => (
                                        <li key={`${entry.createdAt}-${index}`} className="text-[11px] leading-5 text-[#96999e]">
                                            <span className="text-[#d0d2d5]">
                                                {typeof entry.user === "object" && entry.user ? entry.user.name : "Someone"}
                                            </span>{" "}
                                            {entry.action}
                                            {entry.field && entry.action === "updated" && (
                                                <>
                                                    {" "}
                                                    <span className="text-[#85878a]">{entry.field}</span> from{" "}
                                                    <span className="text-[#85878a]">{entry.from ?? "none"}</span> to{" "}
                                                    <span className="text-[#85878a]">{entry.to ?? "none"}</span>
                                                </>
                                            )}
                                            <span className="block text-[10px] text-[#55575c]">{timeAgo(entry.createdAt)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </aside>
                </div>
            </div>

            {confirmDelete && (
                <ConfirmDialog
                    title="Delete this task?"
                    message={`"${task.title}" and its comments and attachments will be permanently deleted.`}
                    confirmLabel="Delete task"
                    danger
                    onConfirm={() => void deleteTask()}
                    onCancel={() => setConfirmDelete(false)}
                />
            )}
        </div>
    );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-[80px_1fr] items-center gap-2">
            <span className="text-[#96999e]">{label}</span>
            <span>{children}</span>
        </div>
    );
}

const assigneeId = (ref: UserRef): string | null =>
    typeof ref === "object" && ref ? ref.id : typeof ref === "string" ? ref : null;

interface CommentData {
    id: string;
    text: string;
    author: UserRef;
    createdAt: string;
}
