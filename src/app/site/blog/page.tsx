"use client";
import Link from "next/link";

const RED = "#D92B2B";

const POSTS = [
  {
    slug: "why-boxing-is-the-best-full-body-workout",
    category: "Training",
    date: "March 28, 2026",
    title: "Why Boxing Is the Best Full-Body Workout You're Not Doing",
    excerpt: "Most gym routines isolate muscles. Boxing trains your entire body as a system — coordination, power, endurance, and mental focus all at once. Here's the science behind why it works.",
    readTime: "5 min read",
  },
  {
    slug: "beginners-guide-to-the-boxing-academy",
    category: "Academy",
    date: "March 14, 2026",
    title: "A Beginner's Guide to the FIIT Co. Boxing Academy",
    excerpt: "Starting from zero and wondering what Level 1 actually looks like? We break down what to expect in your first month, what you'll learn, and how the three-tier progression works.",
    readTime: "7 min read",
  },
  {
    slug: "recovery-the-forgotten-part-of-training",
    category: "Recovery",
    date: "February 27, 2026",
    title: "Recovery: The Forgotten Part of Your Training Plan",
    excerpt: "You can't out-train bad recovery. Tyrone breaks down why yin yoga, ice baths, and sleep matter just as much as your rounds on the bags — and how to build recovery into your weekly routine.",
    readTime: "6 min read",
  },
  {
    slug: "meet-nick-radionov",
    category: "Team",
    date: "February 10, 2026",
    title: "Meet Nick Radionov: From the Ukrainian Olympic Team to Gerrard St East",
    excerpt: "Two-time World Kickboxing Champion. Former Ukrainian National Olympic Team member. Now coaching the next generation of Toronto boxers. Nick Radionov tells us his story.",
    readTime: "8 min read",
  },
  {
    slug: "small-group-training-why-it-works",
    category: "Training",
    date: "January 22, 2026",
    title: "Why Small Group Training Beats Both Solo and Group Classes",
    excerpt: "Can't afford personal training every session? Not getting enough attention in group classes? Small group training at FIIT Co. hits the sweet spot — here's why.",
    readTime: "4 min read",
  },
  {
    slug: "introducing-fiit-teens",
    category: "Youth",
    date: "January 8, 2026",
    title: "Introducing FIIT Teens: Boxing for the Next Generation",
    excerpt: "We launched our youth programme in January and the response has been overwhelming. Here's why boxing is one of the best sports for teenagers — and what parents need to know.",
    readTime: "5 min read",
  },
];

function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{
      fontFamily: "var(--font-chakra)", fontSize: "10px", letterSpacing: "0.2em",
      textTransform: "uppercase", color: RED, marginBottom: "2.5rem",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{ width: 28, height: 1, background: RED, display: "inline-block", flexShrink: 0 }} />
      {text}
    </p>
  );
}

export default function BlogPage() {
  return (
    <div style={{ background: "#000", color: "#fff" }}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{
        padding: "12rem 4rem 5rem",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <SectionLabel text="FIIT Co. Journal" />
        <h1 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "clamp(3rem, 7vw, 6rem)", textTransform: "uppercase", lineHeight: 0.9 }}>
          TRAINING.<br />STORIES.<br /><span style={{ color: RED }}>COMMUNITY.</span>
        </h1>
      </section>

      {/* ── FEATURED POST ─────────────────────────────────────── */}
      <section style={{ padding: "5rem 4rem 0" }}>
        <Link href={`/site/blog/${POSTS[0].slug}`} style={{ textDecoration: "none", color: "#fff", display: "block" }}>
          <div style={{
            border: "1px solid rgba(255,255,255,0.1)", padding: "3.5rem",
            transition: "border-color 0.2s",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = RED; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
          >
            <div>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.5rem" }}>
                <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", background: RED, color: "#fff", padding: "0.3rem 0.7rem" }}>Featured</span>
                <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>{POSTS[0].category}</span>
              </div>
              <h2 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "clamp(1.8rem, 3vw, 2.8rem)", textTransform: "uppercase", lineHeight: 1.1, marginBottom: "1.25rem" }}>{POSTS[0].title}</h2>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.75, color: "rgba(255,255,255,0.55)", marginBottom: "1.5rem" }}>{POSTS[0].excerpt}</p>
              <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.14em", color: RED, borderBottom: `1px solid ${RED}`, paddingBottom: "2px" }}>Read Article →</span>
            </div>
            <div style={{ aspectRatio: "4/3", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.pexels.com/photos/4761779/pexels-photo-4761779.jpeg?auto=compress&cs=tinysrgb&w=800" alt={POSTS[0].title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.3)", display: "block" }} />
            </div>
          </div>
        </Link>
      </section>

      {/* ── POSTS GRID ────────────────────────────────────────── */}
      <section style={{ padding: "4rem 4rem 7rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
          {POSTS.slice(1).map(({ slug, category, date, title, excerpt, readTime }) => (
            <Link key={slug} href={`/site/blog/${slug}`} style={{ textDecoration: "none", color: "#fff" }}>
              <div style={{ border: "1px solid rgba(255,255,255,0.08)", padding: "2.5rem 2rem", height: "100%", transition: "border-color 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = RED; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                  <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.15em", color: RED }}>{category}</span>
                  <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)" }}>{readTime}</span>
                </div>
                <h3 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "1.35rem", textTransform: "uppercase", lineHeight: 1.1, marginBottom: "1rem" }}>{title}</h3>
                <p style={{ fontSize: "0.825rem", lineHeight: 1.75, color: "rgba(255,255,255,0.5)", marginBottom: "1.5rem" }}>{excerpt}</p>
                <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)" }}>{date}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ padding: "4rem", borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <p style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-1px" }}>FIIT<span style={{ color: RED }}>.CO</span></p>
        <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>1047 Gerrard St E, Toronto</p>
        <Link href="/site" style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.14em", color: RED, textDecoration: "none" }}>← Back to Home</Link>
      </footer>
    </div>
  );
}
