/**
 * The state of the auth flow.
 * - `null`: no active restrictions, user can proceed normally.
 * - `timeout`: timeout before requesting a new code (1 minute).
 * - `paused`: rate limit exceeded – too many attempts (5 minutes lock).
 * - `blocked`: IP is blocked by the server due to suspicious activity.
 */
export type LockReason =  'blocked' | 'paused' | 'timeout' | null;

export type AuthFlowSnapshot = {
  isLocked: LockReason;
  lockExpires: number | null;
  phone: string;
};

export type StoredAuthFlowSnapshot = AuthFlowSnapshot | null;
