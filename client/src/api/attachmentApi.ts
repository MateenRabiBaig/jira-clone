import api from './axios';
import type { Attachment } from '../types';

export const attachmentApi = {
  upload: (taskId: string, file: File, onProgress?: (percent: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    form.append('taskId', taskId);
    return api
      .post<{ attachments: Attachment[] }>('/attachments', form, {
        onUploadProgress: (event) => {
          if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
        },
      })
      .then((r) => r.data);
  },

  delete: (fileId: string) => api.delete<{ attachments: Attachment[] }>(`/attachments/${fileId}`).then((r) => r.data),

  /** Fetches a protected file as a blob and opens it in a new tab. */
  view: async (fileId: string): Promise<void> => {
    const response = await api.get<Blob>(`/attachments/${fileId}`, { responseType: 'blob' });
    const url = URL.createObjectURL(response.data);
    window.open(url, '_blank', 'noopener');
    // Revoke later so the new tab has time to load the blob.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },
};

export const MAX_FILE_SIZE_MB = 5;

export const validateFile = (file: File): string | null => {
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `File must be ${MAX_FILE_SIZE_MB} MB or smaller`;
  const allowed = /\.(png|jpe?g|gif|webp|svg|pdf|txt|md|csv|json|zip|docx?|xlsx?|pptx?)$/i;
  if (!allowed.test(file.name)) return 'This file type is not supported';
  return null;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
