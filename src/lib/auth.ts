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

export const SESSION_KEY = "fiit_session";
