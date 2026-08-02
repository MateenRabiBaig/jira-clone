import { useEffect, useState } from "react";
import { ChevronDown, Eye, Maximize2, MoreHorizontal, Paperclip, Share2, X } from "lucide-react";
import type { Task, Comment } from "../../types";
import { commentApi } from "../../api/commentApi";
import { timeAgo } from "../../utils/date";
import Avatar from "../common/Avatar";

interface Props {
    task: Task;
    onClose: () => void;
}

export default function TaskDetailModal({ task, onClose }: Props) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    const loadComments = async () => {
        setLoading(true);
        try {
            setComments(await commentApi.getByTask(task._id));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [task._id]);

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        setPosting(true);
        try {
            await commentApi.add(task._id, newComment.trim());
            setNewComment("");
            await loadComments();
        } finally {
            setPosting(false);
        }
    };

    const reporterName = typeof task.reporter === "object" && task.reporter ? task.reporter.name : task.reporter || "Current user";

    return (
        <div className="fixed inset-0 bg-[#101112]/85 z-[70] flex items-center justify-center p-4 lg:p-8">
            <div className="w-full max-w-[980px] max-h-[90vh] overflow-y-auto bg-[#242528] text-[#d0d2d5] border border-[#45464a] shadow-2xl">
                <header className="h-11 flex items-center justify-between border-b border-[#36373a] px-4">
                    <div className="text-xs text-[#d0d2d5]">{task.ticketKey || `KAN-${task._id.slice(-4)}`}</div>
                    <div className="flex items-center gap-1.5"><button className="flex items-center gap-1.5 border border-[#75a4f7] px-2.5 py-1.5 text-xs text-[#75a4f7]"><Eye size={14} />1</button><button className="p-1.5 border border-[#45464a]"><Share2 size={15} /></button><button className="p-1.5 border border-[#45464a]"><MoreHorizontal size={15} /></button><button className="p-1.5 border border-[#45464a]"><Maximize2 size={15} /></button><button onClick={onClose} className="p-1.5 border border-[#45464a] hover:text-white"><X size={16} /></button></div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-7 px-6 lg:px-8 py-7">
                    <main className="min-w-0">
                        <div className="flex items-center gap-2 mb-3"><span className="text-[#75a4f7] text-xs">☑ {task.ticketKey || `KAN-${task._id.slice(-4)}`}</span><span className="text-[#96999e] text-xs">• {task.workType || "Task"}</span></div>
                        <h1 className="text-2xl lg:text-3xl font-bold leading-tight text-[#e0e1e3] max-w-4xl">{task.title}</h1>
                        <div className="flex items-center gap-1.5 mt-4 mb-7"><button className="p-1.5 border border-[#45464a] text-[#b7b9bc]"><span className="text-base">＋</span></button><button className="p-1.5 border border-[#45464a] text-[#b7b9bc]">◉</button><button className="p-1.5 border border-[#45464a] text-[#b7b9bc]">☷</button></div>

                        <section className="mb-7"><h2 className="flex items-center gap-2 text-lg font-semibold text-[#e0e1e3] mb-3"><ChevronDown size={17} />Description</h2><p className="whitespace-pre-wrap text-sm leading-6 text-[#d0d2d5]">{task.description || "No description provided."}</p></section>
                        <section><h2 className="text-lg font-semibold text-[#e0e1e3] mb-3">Comments</h2>{loading ? <p className="text-xs text-[#96999e]">Loading comments...</p> : <div className="space-y-2 max-w-3xl">{comments.length === 0 && <p className="text-xs text-[#96999e]">No comments yet.</p>}{comments.map((comment) => <div key={comment._id} className="border-b border-[#36373a] pb-2"><div className="flex items-center gap-2 text-[11px] text-[#96999e]"><Avatar name={comment.author.name} size={20} /><span className="text-[#d0d2d5]">{comment.author.name}</span><span>{timeAgo(comment.createdAt)}</span></div><p className="text-xs text-[#d0d2d5] mt-1.5">{comment.text}</p></div>)}</div>}<div className="flex gap-2 max-w-3xl mt-4"><input value={newComment} onChange={(event) => setNewComment(event.target.value)} placeholder="Add a comment..." className="flex-1 bg-[#1c1d1f] border border-[#55575c] px-3 py-1.5 text-xs text-[#e0e1e3] placeholder:text-[#85878a]" onKeyDown={(event) => event.key === "Enter" && void handlePostComment()} /><button onClick={handlePostComment} disabled={posting} className="bg-[#6f9deb] px-3 py-1.5 text-xs font-semibold text-[#101214] disabled:opacity-50">Post</button></div></section>
                    </main>

                    <aside className="space-y-3">
                        <div className="flex flex-wrap gap-1.5 mb-4"><button className="border border-[#75a4f7] bg-[#1c3764] px-3 py-1.5 text-xs text-[#d0d2d5]">{task.status === "in-progress" ? "In Development" : task.status}<ChevronDown size={13} className="inline ml-1.5" /></button><button className="border border-[#45464a] px-3 py-1.5 text-xs text-[#d0d2d5]">◉ Agents</button><button className="border border-[#45464a] px-2.5 py-1.5 text-xs">ϟ</button><button className="basis-full w-fit border border-[#45464a] px-3 py-1.5 text-xs text-[#d0d2d5]">✦ Improve Task</button></div>
                        <section className="border border-[#45464a] p-4"><h2 className="flex items-center gap-2 text-lg font-semibold text-[#e0e1e3] mb-4"><ChevronDown size={17} />Details</h2><div className="space-y-4 text-xs"><Detail label="Assignee" value={task.assignee ? <Person name={task.assignee.name} /> : "Unassigned"} /><Detail label="Reporter" value={<Person name={reporterName} />} /><Detail label="Due date" value={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "None"} /><Detail label="Labels" value="None" /><Detail label="Priority" value={<span className="text-[#d0d2d5]">＝ {task.priority}</span>} />{task.attachments && task.attachments.length > 0 && <Detail label="Attachments" value={<span className="flex items-center gap-2"><Paperclip size={13} />{task.attachments.join(", ")}</span>} />}</div></section>
                        <button className="w-full flex items-center gap-2 border border-[#45464a] px-4 py-3 text-base font-semibold text-[#e0e1e3]"><ChevronDown className="rotate-[-90deg]" size={17} />Development</button><button className="w-full flex items-center gap-2 border border-[#45464a] px-4 py-3 text-base font-semibold text-[#e0e1e3]"><ChevronDown className="rotate-[-90deg]" size={17} />More fields <span className="text-xs font-normal text-[#96999e]">Original estimate, Time tracking</span></button>
                    </aside>
                </div>
            </div>
        </div>
    );
}

function Person({ name }: { name: string }) {
    return <span className="inline-flex items-center gap-2 text-[#d0d2d5]"><Avatar name={name} size={22} />{name}</span>;
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
    return <div className="grid grid-cols-[100px_1fr] items-center gap-2"><span className="text-[#96999e]">{label}</span><span>{value}</span></div>;
}
