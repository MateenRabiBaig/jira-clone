import { useEffect, type RefObject } from 'react';

/** Calls `onOutside` when a pointer-down lands outside the referenced element. */
export function useClickOutside(ref: RefObject<HTMLElement | null>, onOutside: () => void, active = true) {
    useEffect(() => {
        if (!active) return undefined;
        const handler = (event: MouseEvent | TouchEvent) => {
            const element = ref.current;
            if (element && !element.contains(event.target as Node)) onOutside();
        };
        document.addEventListener('mousedown', handler);
        document.addEventListener('touchstart', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
            document.removeEventListener('touchstart', handler);
        };
    }, [ref, onOutside, active]);
}

/** Calls `onEscape` when the Escape key is pressed. */
export function useEscapeKey(onEscape: () => void, active = true) {
    useEffect(() => {
        if (!active) return undefined;
        const handler = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onEscape();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onEscape, active]);
}
