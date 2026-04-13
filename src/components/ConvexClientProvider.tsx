"use client";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Fall back to a placeholder so the module loads without crashing when
// NEXT_PUBLIC_CONVEX_URL hasn't been set yet (e.g. before running `npx convex dev`).
// Pages that don't use Convex (e.g. /site) will render fine; the internal
// app will show a login error until a real URL is configured.
const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud";
const convex = new ConvexReactClient(url);

export default function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
