"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";

const nav = [
  { label: "Dashboard",           href: "/dashboard" },
  { label: "Weekly Schedule",     href: "/schedule" },
  { label: "Class Library",       href: "/classes" },
  { label: "Exercise Library",    href: "/exercises" },
  { label: "Category Library",    href: "/categories" },
  { label: "Instructor Library",  href: "/instructors" },
  { label: "Availability & Subs", href: "/availability" },
  { label: "Lesson Plans",        href: "/lesson-plans" },
  { label: "Delivery Logs",       href: "/delivery-log" },
  { label: "Equipment",           href: "/equipment" },
  { label: "Training Pathways",   href: "/pathways" },
  { label: "Client Journey",      href: "/client-journey" },
  { label: "Front Desk",          href: "/front-desk" },
];

export default function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void } = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const pendingCount = useQuery(api.queries.getPendingChangeCount) ?? 0;
  const pendingUserCount = useQuery(api.auth.getPendingUserCount) ?? 0;

  return (
    <aside
      className={`sidebar${open ? " open" : ""}`}
      style={{
        width: 260,
        minHeight: "100vh",
        padding: "40px 24px",
        borderRight: "1px solid rgba(0,0,0,0.04)",
        background: "var(--bg-app)",
        display: "flex",
        flexDirection: "column",
        gap: 40,
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        overflowY: "auto",
      }}
    >
      {/* Logo + mobile close */}
      <div style={{ paddingLeft: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p
          className="font-serif"
          style={{ fontSize: 24, fontWeight: 500, color: "var(--text-main)", letterSpacing: "-0.02em" }}
        >
          FIIT Co.
        </p>
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            fontSize: 22,
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: 4,
            lineHeight: 1,
          }}
          aria-label="Close sidebar"
        >
          &#x2715;
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
          {nav.map(({ label, href }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  style={{
                    display: "block",
                    padding: "10px 16px",
                    borderRadius: "var(--radius-pill)",
                    fontSize: 15,
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                    background: active ? "var(--ui-dark)" : "transparent",
                    color: active ? "#FFFFFF" : "var(--text-muted)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-beige)";
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-main)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                    }
                  }}
                >
                  {label}
                </Link>
              </li>
            );
          })}

          {/* Review Queue — admin only */}
          {currentUser?.role === "admin" && (() => {
            const href = "/review";
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 16px",
                    borderRadius: "var(--radius-pill)",
                    fontSize: 15,
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                    background: active ? "var(--ui-dark)" : "transparent",
                    color: active ? "#FFFFFF" : "var(--text-muted)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-beige)";
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-main)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                    }
                  }}
                >
                  Review Queue
                  {pendingCount > 0 && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#D32F2F",
                        color: "white",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        minWidth: 18,
                        height: 18,
                        padding: "0 4px",
                        marginLeft: 8,
                      }}
                    >
                      {pendingCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })()}

          {/* Manage Users — admin only */}
          {currentUser?.role === "admin" && (() => {
            const href = "/manage-users";
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 16px",
                    borderRadius: "var(--radius-pill)",
                    fontSize: 15,
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                    background: active ? "var(--ui-dark)" : "transparent",
                    color: active ? "#FFFFFF" : "var(--text-muted)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-beige)";
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-main)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
                    }
                  }}
                >
                  Manage Users
                  {pendingUserCount > 0 && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#D32F2F",
                        color: "white",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        minWidth: 18,
                        height: 18,
                        padding: "0 4px",
                        marginLeft: 8,
                      }}
                    >
                      {pendingUserCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })()}
        </ul>
      </nav>

      {/* User info section */}
      <div
        style={{
          borderTop: "1px solid rgba(0,0,0,0.06)",
          paddingTop: 20,
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          paddingLeft: 16,
        }}
      >
        {/* Role badge */}
        <span
          style={{
            display: "inline-block",
            alignSelf: "flex-start",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            padding: "2px 8px",
            borderRadius: 4,
            background: currentUser?.role === "admin" ? "var(--ui-dark)" : "var(--bg-beige)",
            color: currentUser?.role === "admin" ? "white" : "var(--text-main)",
          }}
        >
          {currentUser?.role === "admin" ? "ADMIN" : "INSTRUCTOR"}
        </span>

        {/* Display name */}
        <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
          {currentUser?.displayName}
        </p>

        {/* Sign out */}
        <button
          onClick={() => { logout(); router.push("/login"); }}
          style={{
            background: "none",
            border: "none",
            fontSize: 13,
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: 0,
            textAlign: "left",
            fontFamily: "inherit",
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
