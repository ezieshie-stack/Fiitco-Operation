"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const RED = "#D92B2B";
const MINDBODY_URL = "https://www.mindbodyonline.com/explore/deals/fiit-co/intro-offer-10377";

const NAV_LINKS = [
  { label: "About",    href: "/site/about" },
  { label: "Programs", href: "/site/programs" },
  { label: "Studio",   href: "/site/studio" },
  { label: "Blog",     href: "/site/blog" },
];

export default function SiteNav() {
  const pathname = usePathname();

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
        <span style={{
          fontFamily: "var(--font-oswald)", fontSize: "2rem",
          fontWeight: 700, letterSpacing: "-1px", color: "#fff",
        }}>
          FIIT<span style={{ color: RED }}>.CO</span>
        </span>
      </Link>

      <div style={{
        display: "flex", gap: "3rem",
        fontFamily: "var(--font-chakra)", fontSize: "0.7rem",
        textTransform: "uppercase", letterSpacing: "0.14em",
      }}>
        {NAV_LINKS.map(({ label, href }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={label} href={href} style={{
              color: active ? "#fff" : "rgba(255,255,255,0.6)",
              textDecoration: "none", transition: "color 0.2s",
              borderBottom: active ? `2px solid ${RED}` : "2px solid transparent",
              paddingBottom: "2px",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.6)";
              }}
            >{label}</Link>
          );
        })}
      </div>

      <a href={MINDBODY_URL} target="_blank" rel="noopener noreferrer"
        style={{
          background: RED, color: "#fff",
          padding: "0.7rem 1.75rem",
          fontFamily: "var(--font-oswald)", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.1em",
          fontSize: "0.85rem", textDecoration: "none",
          transition: "background 0.2s", display: "flex",
          alignItems: "center", gap: "0.4rem",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#b01f1f"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = RED; }}
      >
        Book A Free Class
        <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>↗</span>
      </a>
    </nav>
  );
}
