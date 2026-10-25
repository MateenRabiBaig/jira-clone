import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../config/env';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

/**
 * A 401 means the token is invalid or expired - drop it and send the user
 * to login. The auth slice listens for `auth/sessionExpired` to reset state.
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            axios.isAxiosError(error) &&
            error.response?.status === 401 &&
            !error.config?.url?.startsWith('/auth/login') &&
            !error.config?.url?.startsWith('/auth/register')
        ) {
            localStorage.removeItem(TOKEN_KEY);
            window.dispatchEvent(new CustomEvent('auth/sessionExpired'));
        }
        return Promise.reject(error);
    },
);

/** Extracts the server's error message from an axios error. */
export const getErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
    if (axios.isAxiosError<{ message?: string }>(error)) {
        return error.response?.data?.message ?? error.message ?? fallback;
    }
    if (error instanceof Error) return error.message;
    return fallback;
};

export default api;
