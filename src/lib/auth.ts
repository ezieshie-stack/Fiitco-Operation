export type UserRole = "admin" | "instructor";

export interface AppUser {
  id: string;           // Convex _id as string
  email: string;
  role: UserRole;
  name: string;         // fullName
  displayName: string;
  instructorId?: string;
  status: string;
}

// localStorage key holding the *session token only*. The full user object
// is fetched from the server via api.auth.me on every mount, so a stolen
// localStorage value cannot impersonate a user without the token still
// being valid server-side.
export const SESSION_TOKEN_KEY = "fiit_session_token";

// Legacy key that previously held the full user JSON. Removed on the next
// AuthContext mount so old browsers don't carry stale auth state into the
// new flow. Kept here just so the cleanup site has a single source.
export const LEGACY_SESSION_KEY = "fiit_session";
