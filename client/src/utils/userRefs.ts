import type { User, UserRef } from '../types';

/** Resolves a possibly-unpopulated user reference. */
export const resolveUser = (ref: UserRef): User | null =>
    typeof ref === 'object' && ref !== null ? ref : null;

/** Narrows a member list to populated users only, in order. */
export const resolveUsers = (refs: UserRef[]): User[] =>
    refs.map(resolveUser).filter((user): user is User => user !== null);

/** Convenience accessors that are safe on unpopulated references. */
export const userId = (ref: UserRef): string | null => resolveUser(ref)?.id ?? null;
export const userName = (ref: UserRef): string => resolveUser(ref)?.name ?? 'Unknown user';
export const userAvatar = (ref: UserRef): string | null => resolveUser(ref)?.avatarUrl ?? null;
