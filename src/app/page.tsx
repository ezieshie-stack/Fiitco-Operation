"use client";

// The ops app's root URL is a pure auth-aware redirect:
//   - signed in → /dashboard
//   - not signed in → /login
// The customer-facing marketing site lives on its own project
// (fiit-website-liart.vercel.app), so we no longer render one here.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(currentUser ? "/dashboard" : "/login");
  }, [currentUser, isLoading, router]);

  // Blank while redirecting — nothing useful to render on the root URL.
  return null;
}
