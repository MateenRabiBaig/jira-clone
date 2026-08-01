import { useEffect, useState } from "react";
import type { Task, Comment } from "../../types";
import { commentApi } from "../../api/commentApi";
import { taskApi } from "../../api/taskApi";
import { timeAgo } from "../../utils/date";

interface Props {
    task: Task
    onClose: () => void
    onUpdated: () => void
}

export default function TaskDetailModal({ task, onClose, onUpdated }: Props) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(true)
    const [posting, setPosting] = useState(false)

    const loadComments = async() => {
        setLoading(true)
        const data = await commentApi.getByTask(task._id)
        setComments(data)
        setLoading(false)
    }

    useEffect(() => {
        // Comments are server state and need loading when the selected task changes.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadComments()
        // loadComments is intentionally scoped to the selected task.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [task._id])

    const handlePostComment = async() => {
        if(!newComment.trim()) return
        setPosting(true)
        await commentApi.add(task._id, newComment.trim())
        setNewComment('')
        await loadComments()
        setPosting(false)
    }

    const handleDelete = async () => {
        if(!confirm('Delete this task?')) return
        await taskApi.remove(task._id)
        onUpdated()
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#242528] border border-[#55575c] p-5 w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-[#e0e1e3]">{task.title}</h2>
                    <button onClick={onClose} className="text-[#96999e] hover:text-[#e0e1e3]">✕</button>
                </div>
                
                <p className="text-[#96999e] text-sm mb-4">{task.description || 'No description'}</p>
                
                <div className="flex gap-4 text-sm text-[#96999e] mb-5">
                    <span>Priority: <strong>{task.priority}</strong></span>
                    <span>Status: <strong>{task.status}</strong></span>
                    {task.dueDate && <span>Due: <strong>{new Date(task.dueDate).toLocaleDateString()}</strong></span>}
                </div>
                
                <h3 className="font-semibold mb-2">Comments</h3>
                {loading ? (
                    <p className="text-gray-400 text-sm">Loading comments...</p>
                ) : (
                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                        {comments.length === 0 && <p className="text-gray-400 text-sm">No comments yet.</p>}
                        {comments.map((c) => (
                            <div key={c._id} className="bg-[#1c1d1f] border border-[#36373a] p-2">
                                <div className="flex justify-between text-xs text-[#96999e]">
                                    <span className="font-medium">{c.author.name}</span>
                                    <span>{timeAgo(c.createdAt)}</span>
                                </div>
                                <p className="text-sm mt-1 text-[#d0d2d5]">{c.text}</p>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="flex gap-2">
                    <input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] placeholder:text-[#85878a] px-3 py-2 text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                    />
                    <button onClick={handlePostComment} disabled={posting} className="bg-[#6f9deb] text-[#101214] font-semibold px-4 py-2 text-sm disabled:opacity-50">Post</button>
                </div>
                
                <button onClick={handleDelete} className="text-red-500 text-sm mt-6">Delete task</button>
            </div>
        </div>
    )
}
