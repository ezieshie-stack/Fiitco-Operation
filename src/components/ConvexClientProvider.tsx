"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Fallback to the known deployment URL so preview builds work even when the
// env var isn't configured on the branch's Vercel environment. Prod reads
// NEXT_PUBLIC_CONVEX_URL from the project settings and this fallback never
// triggers.
const CONVEX_URL =
  process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://dutiful-ferret-681.convex.cloud";

const convex = new ConvexReactClient(CONVEX_URL);

export default function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
