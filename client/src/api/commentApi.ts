import api from "./axios";
import type { Comment } from "../types";

export const commentApi = {
    getByTask: (taskId: string) => api.get<Comment[]>('/comments/task/${taskId}').then((r) => r.data),
    add: (taskId: string, text: string) => api.post<Comment>('/comments', {taskId, text}).then((r) => r.data)
}