"use client";
import Link from "next/link";

const RED = "#D92B2B";

const NAV_LINKS = [
  { label: "Schedule",    href: "/site" },
  { label: "Trainers",    href: "/site/trainers/jason-battiste" },
  { label: "Memberships", href: "/site" },
  { label: "The Studio",  href: "/site" },
];

export default function SiteNav() {
  return (
    <nav style={{
      position: "fixed", top: 0, width: "100%", height: 72,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0 4rem",
      background: "rgba(0,0,0,0.95)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      zIndex: 1000,
      backdropFilter: "blur(12px)",
    }}>
      <Link href="/site" style={{ textDecoration: "none" }}>
        <span style={{ fontFamily: "var(--font-oswald)", fontSize: "2rem", fontWeight: 700, letterSpacing: "-1px", color: "#fff" }}>
          FIIT<span style={{ color: RED }}>.CO</span>
        </span>
      </Link>

      <div style={{
        display: "flex", gap: "3rem",
        fontFamily: "var(--font-chakra)", fontSize: "0.7rem",
        textTransform: "uppercase", letterSpacing: "0.14em",
      }}>
        {NAV_LINKS.map(({ label, href }) => (
          <Link key={label} href={href}
            style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.65)"; }}
          >{label}</Link>
        ))}
      </div>

      <Link href="/site/booking"
        style={{
          background: RED, color: "#fff",
          padding: "0.7rem 1.75rem",
          fontFamily: "var(--font-oswald)", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.1em",
          fontSize: "0.85rem", textDecoration: "none",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#b01f1f"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = RED; }}
      >
        Book Session
      </Link>
    </nav>
  );
}
