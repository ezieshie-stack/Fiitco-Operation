"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  AppUser,
  LEGACY_SESSION_KEY,
  SESSION_TOKEN_KEY,
} from "@/lib/auth";

interface AuthContextValue {
  /** The session token, or null if the user isn't logged in. Components
   *  rarely need to touch this directly — the `useAuthedQuery` /
   *  `useAuthedMutation` hooks pull it implicitly. */
  sessionToken: string | null;
  /** The current user, fetched from the server on every mount via the
   *  session token. Null when logged out. Undefined while still resolving. */
  currentUser: AppUser | null;
  /** True until the initial token rehydration + user fetch has completed. */
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  sessionToken: null,
  currentUser: null,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const convex = useConvex();
  const loginMutation = useMutation(api.auth.loginUser);
  const logoutMutation = useMutation(api.auth.logout);

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  // `tokenHydrated` flips true once we've read localStorage; before that we
  // can't yet say whether the user is authed or not.
  const [tokenHydrated, setTokenHydrated] = useState(false);

  // Rehydrate the token (and clear any pre-migration full-user JSON) on mount.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_TOKEN_KEY);
      if (stored) setSessionToken(stored);
      // Clean up any leftover legacy session payload from before the
      // token-only flow.
      localStorage.removeItem(LEGACY_SESSION_KEY);
    } catch {
      // localStorage may be disabled (privacy mode) — silently treat as
      // logged out.
    }
    setTokenHydrated(true);
  }, []);

  // Server roundtrip to get the user behind the token. Returns null if the
  // token is missing/expired/invalid (server wipes the row on expiry).
  const meResult = useQuery(
    api.auth.me,
    tokenHydrated ? { sessionToken: sessionToken ?? undefined } : "skip"
  );

  const currentUser: AppUser | null = useMemo(() => {
    if (!meResult) return null;
    return {
      id: meResult.id as string,
      email: meResult.email,
      role: meResult.role as AppUser["role"],
      name: meResult.name,
      displayName: meResult.displayName,
      instructorId: meResult.instructorId ?? undefined,
      status: meResult.status,
    };
  }, [meResult]);

  // We're "loading" until both the token is hydrated AND, if we have a
  // token, the `me` query has resolved.
  const isLoading =
    !tokenHydrated || (sessionToken !== null && meResult === undefined);

  // If the server invalidated our token (returned null while we still have
  // one), wipe it on the client so we don't keep retrying.
  useEffect(() => {
    if (
      tokenHydrated &&
      sessionToken !== null &&
      meResult === null
    ) {
      try {
        localStorage.removeItem(SESSION_TOKEN_KEY);
      } catch {}
      setSessionToken(null);
    }
  }, [tokenHydrated, sessionToken, meResult]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await loginMutation({ email, password });
        if (result.success && result.sessionToken) {
          try {
            localStorage.setItem(SESSION_TOKEN_KEY, result.sessionToken);
          } catch {}
          setSessionToken(result.sessionToken);
          return { success: true as const };
        }
        return {
          success: false as const,
          message: result.success === false ? result.message : "Login failed",
        };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Login failed";
        return { success: false as const, message };
      }
    },
    [loginMutation]
  );

  const logout = useCallback(async () => {
    const token = sessionToken;
    setSessionToken(null);
    try {
      localStorage.removeItem(SESSION_TOKEN_KEY);
    } catch {}
    if (token) {
      // Best-effort server-side invalidation. Failures here are fine —
      // expired tokens are also rejected by `requireAuth` going forward.
      try {
        await logoutMutation({ sessionToken: token });
      } catch {}
    }
  }, [sessionToken, logoutMutation]);

  // Suppress unused warnings on convex if reactivity is bypassed in dev.
  void convex;

  return (
    <AuthContext.Provider
      value={{ sessionToken, currentUser, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
