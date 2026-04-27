"use client";

/**
 * Admin-only route guard.
 *
 * Call at the top of any page that should be inaccessible to non-admin
 * users (instructors, etc.). Redirects the user to /dashboard if they're
 * not an admin, and returns a `ready` flag so the page can skip rendering
 * while the check is in flight.
 *
 * Usage:
 *
 *   export default function SomeAdminPage() {
 *     const { ready } = useRequireAdmin();
 *     if (!ready) return null;
 *     // ...rest of the page, guaranteed admin from here
 *   }
 *
 * Why a hook + early return (vs. a wrapper component):
 * Keeps each page's existing hooks in a stable order and avoids a
 * Suspense/fallback wrapper in the tree. The early return also runs
 * _before_ any Convex mutations mount, so we never accidentally expose
 * admin-only queries to a non-admin user.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function useRequireAdmin(): { ready: boolean } {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    // Wait for auth to finish loading before deciding.
    if (isLoading) return;
    // Logged out → send to login (layout already handles this, but belt-
    // and-suspenders in case this hook mounts before the layout redirect).
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    // Logged in but not admin → bounce to dashboard.
    if (!isAdmin) {
      router.replace("/dashboard");
    }
  }, [isLoading, currentUser, isAdmin, router]);

  return { ready: !isLoading && isAdmin };
}
