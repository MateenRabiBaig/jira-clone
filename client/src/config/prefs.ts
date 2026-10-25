/** Local UI preferences persisted in localStorage. */

const KEYS = {
    sidebarCollapsed: 'prefs.sidebarCollapsed',
} as const;

export const getSidebarCollapsed = (): boolean => {
    const raw = localStorage.getItem(KEYS.sidebarCollapsed);
    if (raw !== null) return raw === 'true';
    // First visit: on small screens the sidebar is a drawer, so start closed.
    return typeof window !== 'undefined' && window.innerWidth < 768;
};

export const setSidebarCollapsed = (value: boolean): void => {
    localStorage.setItem(KEYS.sidebarCollapsed, String(value));
};
