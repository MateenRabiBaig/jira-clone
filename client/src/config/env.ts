/** Central API configuration derived from VITE_API_URL (see .env.example). */

const RAW_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api';

/** Base URL of the REST API, e.g. https://api.example.com/api */
export const API_BASE_URL = RAW_BASE_URL.replace(/\/$/, '');

/** Server origin, e.g. https://api.example.com - used for uploaded files. */
export const SERVER_ORIGIN = new URL(API_BASE_URL, window.location.origin).origin;

/** Turns an API-relative path like /api/attachments/x into an absolute URL. */
export const absoluteUrl = (path: string): string => {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${SERVER_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};

export const TOKEN_KEY = 'token';

export const getStoredToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setStoredToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};
