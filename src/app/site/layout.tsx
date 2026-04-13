import { Oswald, Chakra_Petch, Inter } from "next/font/google";
import Link from "next/link";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "700"],
});

const chakra = Chakra_Petch({
  subsets: ["latin"],
  variable: "--font-chakra",
  weight: ["400", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "700"],
});

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${oswald.variable} ${chakra.variable} ${inter.variable}`}
      style={{
        background: "#000",
        color: "#fff",
        fontFamily: "var(--font-inter, Inter, sans-serif)",
        minHeight: "100vh",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* ── NAV ───────────────────────────────────────────── */}
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
          <span style={{
            fontFamily: "var(--font-oswald)", fontSize: "1.8rem",
            letterSpacing: "-1px", color: "#fff",
          }}>
            FIIT<span style={{ color: "#D92B2B" }}>.CO</span>
          </span>
        </Link>

        <div style={{
          display: "flex", gap: "2.5rem",
          fontFamily: "var(--font-chakra)", fontSize: "0.75rem",
          textTransform: "uppercase", letterSpacing: "0.12em",
        }}>
          {[
            { label: "Schedule", href: "/site" },
            { label: "Trainers",  href: "/site/trainers/jason-battiste" },
            { label: "Classes",   href: "/site/classes/heavy-bag-smash" },
            { label: "Members",   href: "/site/member" },
          ].map(({ label, href }) => (
            <Link key={label} href={href}
              style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.7)")}
            >{label}</Link>
          ))}
        </div>

        <Link href="/site/booking"
          style={{
            background: "#D92B2B", color: "#fff",
            padding: "0.65rem 1.5rem",
            fontFamily: "var(--font-oswald)", textTransform: "uppercase",
            letterSpacing: "0.08em", fontSize: "0.85rem",
            textDecoration: "none", transition: "background 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#fff", (e.currentTarget as HTMLAnchorElement).style.color = "#000")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#D92B2B", (e.currentTarget as HTMLAnchorElement).style.color = "#fff")}
        >
          Book Session
        </Link>
      </nav>

      <div style={{ paddingTop: 72 }}>
        {children}
      </div>
    </div>
  );
}
