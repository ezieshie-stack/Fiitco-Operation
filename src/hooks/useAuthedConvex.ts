"use client";

/**
 * Drop-in replacements for `useQuery` and `useMutation` that automatically
 * inject the current session token into the call's args. Use these for any
 * Convex function gated by `authedQuery` / `authedMutation` / `adminQuery` /
 * `adminMutation` on the server side.
 *
 * Behaviour:
 *  - `useAuthedQuery` skips the request entirely until a session token is
 *    available, mirroring Convex's `"skip"` semantics. Returns `undefined`
 *    while loading, the result once resolved, or `undefined` again if the
 *    token is cleared.
 *  - `useAuthedMutation` returns a callable that throws if the user isn't
 *    signed in. Useful for buttons that should never fire pre-login.
 *
 * For the small handful of public Convex functions still callable without a
 * token (login, signup, password reset, public guest-pass / referral
 * submissions on the customer site), use vanilla `useQuery` / `useMutation`
 * from `convex/react` instead.
 */

import { useMutation, useQuery } from "convex/react";
import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from "convex/server";
import { useAuth } from "@/contexts/AuthContext";

type ArgsWithoutToken<F extends FunctionReference<any>> = Omit<
  FunctionArgs<F>,
  "sessionToken"
>;

/**
 * Like `useQuery`, but automatically attaches the current session token. The
 * query is skipped while no token is available so the loading state cleanly
 * resolves to `undefined` (matching Convex's own `"skip"` behaviour).
 *
 * The `args` parameter is optional — for queries whose only arg is the
 * session token, callers can omit it entirely.
 */
export function useAuthedQuery<F extends FunctionReference<"query">>(
  query: F,
  args?: ArgsWithoutToken<F> | "skip"
): FunctionReturnType<F> | undefined {
  const { sessionToken } = useAuth();

  const finalArgs =
    args === "skip" || !sessionToken
      ? "skip"
      : ({ ...((args ?? {}) as object), sessionToken } as FunctionArgs<F>);

  // Convex's `useQuery` has overloads we can't easily satisfy via a
  // generic wrapper, so we cast at the call site. The runtime contract is
  // unchanged: pass either the args object or the "skip" sentinel.
  return useQuery(query, finalArgs as never);
}

/**
 * Like `useMutation`, but injects the session token on every call. The
 * returned function throws if there's no active session.
 */
export function useAuthedMutation<F extends FunctionReference<"mutation">>(
  mutation: F
): (args?: ArgsWithoutToken<F>) => Promise<FunctionReturnType<F>> {
  const { sessionToken } = useAuth();
  const fn = useMutation(mutation);

  return async (args) => {
    if (!sessionToken) {
      throw new Error("You're not signed in. Please log in again.");
    }
    return fn({
      ...((args ?? {}) as object),
      sessionToken,
    } as FunctionArgs<F>);
  };
}
