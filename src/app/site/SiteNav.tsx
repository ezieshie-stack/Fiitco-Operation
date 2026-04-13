"use client";
import Link from "next/link";

const RED = "#D92B2B";

const NAV_LINKS = [
  { label: "Schedule", href: "/site" },
  { label: "Trainers", href: "/site/trainers/jason-battiste" },
  { label: "Classes",  href: "/site/classes/heavy-bag-smash" },
  { label: "Members",  href: "/site/member" },
];

export default function SiteNav() {
  return (
    <nav style={{
      position: "fixed", top: 0, width: "100%", height: 72,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0 4rem",
      background: "rgba(0,0,0,0.92)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      zIndex: 1000,
      backdropFilter: "blur(12px)",
    }}>
      <Link href="/site" style={{ textDecoration: "none" }}>
        <span style={{ fontFamily: "var(--font-oswald)", fontSize: "1.8rem", letterSpacing: "-1px", color: "#fff" }}>
          FIIT<span style={{ color: RED }}>.CO</span>
        </span>
      </Link>

      <div style={{ display: "flex", gap: "2.5rem", fontFamily: "var(--font-chakra)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>
        {NAV_LINKS.map(({ label, href }) => (
          <Link key={label} href={href}
            style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.7)"; }}
          >{label}</Link>
        ))}
      </div>

      <Link href="/site/booking"
        style={{ background: RED, color: "#fff", padding: "0.65rem 1.5rem", fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.85rem", textDecoration: "none", transition: "all 0.2s" }}
        onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "#fff"; el.style.color = "#000"; }}
        onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = RED; el.style.color = "#fff"; }}
      >
        Book Session
      </Link>
    </nav>
  );
}
