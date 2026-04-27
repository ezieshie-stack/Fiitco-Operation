"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useAuthedQuery as useQuery } from "@/hooks/useAuthedConvex";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";

// ── Ops tool nav (operational / internal gym management) ──────────────
const opsNav = [
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

/**
 * Website CMS group — a single collapsible sidebar item that expands to
 * show all 9 content modules powering the customer-facing website. As each
 * module ships, flip its `built: true` — unbuilt modules render disabled
 * with a "Soon" tag so the full roadmap is visible to the team.
 */
const websiteCmsGroup = {
  label: "Website UI/UX",
  basePath: "/website-",
  children: [
    { label: "Trainers",      href: "/website-trainers",      built: true },
    { label: "Community",     href: "/website-community",     built: true },
    { label: "Class Formats", href: "/website-class-formats", built: true },
    { label: "Pricing",       href: "/website-pricing",       built: true },
    { label: "Blog",          href: "/website-blog",          built: true },
    { label: "Locations",     href: "/website-locations",     built: true },
    { label: "Testimonials",  href: "/website-testimonials",  built: true },
    { label: "FAQ",           href: "/website-faq",           built: true },
    { label: "Promo Videos",  href: "/website-promo-videos",  built: true },
    { label: "Images",        href: "/website-images",        built: true },
    { label: "Legal Docs",    href: "/website-legal-docs",    built: true },
  ],
};

export default function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void } = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const pendingCount = useQuery(api.queries.getPendingChangeCount) ?? 0;
  const pendingUserCount = useQuery(api.auth.getPendingUserCount) ?? 0;

  // Website CMS group expands automatically when user is on any of its
  // child routes. Otherwise tracks a local toggle state.
  const isOnCmsRoute = useMemo(
    () => websiteCmsGroup.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/")),
    [pathname]
  );
  const [cmsOpen, setCmsOpen] = useState(isOnCmsRoute);

  useEffect(() => {
    if (isOnCmsRoute) setCmsOpen(true);
  }, [isOnCmsRoute]);

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
          {opsNav.map(({ label, href }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  style={navLinkStyle(active)}
                  onMouseEnter={navHoverIn(active)}
                  onMouseLeave={navHoverOut(active)}
                >
                  {label}
                </Link>
              </li>
            );
          })}

          {/* ── Website UI/UX — admin-only CMS group. Hidden from
               instructors to prevent accidental navigation attempts
               (individual pages also redirect non-admins, but hiding
               the entry point keeps the sidebar cleaner). ─────────── */}
          {currentUser?.role === "admin" && (
          <li style={{ marginTop: 4 }}>
            <button
              type="button"
              onClick={() => setCmsOpen((v) => !v)}
              style={{
                ...navLinkStyle(isOnCmsRoute && !cmsOpen),
                width: "100%",
                textAlign: "left",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              onMouseEnter={navHoverIn(isOnCmsRoute && !cmsOpen)}
              onMouseLeave={navHoverOut(isOnCmsRoute && !cmsOpen)}
              aria-expanded={cmsOpen}
              aria-controls="website-cms-submenu"
            >
              <span>{websiteCmsGroup.label}</span>
              <span
                style={{
                  fontSize: 10,
                  transition: "transform 0.2s",
                  transform: cmsOpen ? "rotate(90deg)" : "rotate(0deg)",
                  display: "inline-block",
                  opacity: 0.7,
                }}
                aria-hidden="true"
              >
                ▶
              </span>
            </button>

            {cmsOpen && (
              <ul
                id="website-cms-submenu"
                style={{
                  listStyle: "none",
                  margin: "4px 0 0 8px",
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  borderLeft: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                {websiteCmsGroup.children.map(({ label, href, built }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  if (!built) {
                    return (
                      <li key={href}>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "7px 12px 7px 20px",
                            marginLeft: 0,
                            fontSize: 13.5,
                            color: "rgba(0,0,0,0.32)",
                            cursor: "not-allowed",
                          }}
                        >
                          <span>{label}</span>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              padding: "2px 6px",
                              borderRadius: 3,
                              background: "rgba(0,0,0,0.06)",
                              color: "rgba(0,0,0,0.45)",
                            }}
                          >
                            SOON
                          </span>
                        </span>
                      </li>
                    );
                  }
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={onClose}
                        style={{
                          ...navLinkStyle(active),
                          padding: "7px 12px 7px 20px",
                          fontSize: 13.5,
                          marginLeft: 0,
                        }}
                        onMouseEnter={navHoverIn(active)}
                        onMouseLeave={navHoverOut(active)}
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
          )}

          {/* Review Queue — admin only */}
          {currentUser?.role === "admin" && (() => {
            const href = "/review";
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  style={{ ...navLinkStyle(active), display: "flex", alignItems: "center" }}
                  onMouseEnter={navHoverIn(active)}
                  onMouseLeave={navHoverOut(active)}
                >
                  Review Queue
                  {pendingCount > 0 && (
                    <span style={badgeStyle}>{pendingCount}</span>
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
                  style={{ ...navLinkStyle(active), display: "flex", alignItems: "center" }}
                  onMouseEnter={navHoverIn(active)}
                  onMouseLeave={navHoverOut(active)}
                >
                  Manage Users
                  {pendingUserCount > 0 && (
                    <span style={badgeStyle}>{pendingUserCount}</span>
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
        <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
          {currentUser?.displayName}
        </p>
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

// ── Style helpers — keep the original look ──────────────────────────────

function navLinkStyle(active: boolean): React.CSSProperties {
  return {
    display: "block",
    padding: "10px 16px",
    borderRadius: "var(--radius-pill)",
    fontSize: 15,
    fontWeight: 500,
    textDecoration: "none",
    transition: "all 0.15s ease",
    background: active ? "var(--ui-dark)" : "transparent",
    color: active ? "#FFFFFF" : "var(--text-muted)",
  };
}

function navHoverIn(active: boolean) {
  return (e: React.MouseEvent<HTMLElement>) => {
    if (!active) {
      (e.currentTarget as HTMLElement).style.background = "var(--bg-beige)";
      (e.currentTarget as HTMLElement).style.color = "var(--text-main)";
    }
  };
}

function navHoverOut(active: boolean) {
  return (e: React.MouseEvent<HTMLElement>) => {
    if (!active) {
      (e.currentTarget as HTMLElement).style.background = "transparent";
      (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
    }
  };
}

const badgeStyle: React.CSSProperties = {
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
};
