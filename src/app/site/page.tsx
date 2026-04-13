"use client";
import { useState } from "react";
import Link from "next/link";

const RED   = "#D92B2B";
const GRAY  = "#1A1A1A";

const SCHEDULE = [
  { time: "06:00", name: "Heavy Bag Smash",   trainer: "Jason Battiste", spots: 4 },
  { time: "08:00", name: "Ring Technicals",    trainer: "Sarah Green",    spots: 12 },
  { time: "12:00", name: "Power Hour",         trainer: "Matt Makar",     spots: 2 },
  { time: "17:00", name: "Advanced Boxing",    trainer: "Nick Radionov",  spots: 8 },
  { time: "19:00", name: "Intro To FIIT",      trainer: "Jaye Pan",       spots: 14 },
];

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const TRAINERS = [
  { name: "Jason Battiste", slug: "jason-battiste", img: "https://images.pexels.com/photos/1544540/pexels-photo-1544540.jpeg?auto=compress&cs=tinysrgb&w=800", tag: "Counter-Punching" },
  { name: "Matt Makar",     slug: "matt-makar",     img: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800",    tag: "Strength & Power" },
  { name: "Sarah Green",    slug: "sarah-green",    img: "https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=800",    tag: "Technique & Flow" },
  { name: "Jaye Pan",       slug: "jaye-pan",       img: "https://images.pexels.com/photos/1153370/pexels-photo-1153370.jpeg?auto=compress&cs=tinysrgb&w=800",  tag: "Endurance" },
  { name: "Nick Radionov",  slug: "nick-radionov",  img: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=800",  tag: "Explosive Output" },
];

function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{
      fontFamily: "var(--font-chakra)", fontSize: "10px", letterSpacing: "0.2em",
      textTransform: "uppercase", color: RED, marginBottom: "1rem",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{ width: 30, height: 1, background: RED, display: "inline-block" }} />
      {text}
    </p>
  );
}

export default function SitePage() {
  const [activeDay, setActiveDay] = useState(0);

  return (
    <div style={{ background: "#000", color: "#fff" }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        position: "relative",
        background: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.82)), url('https://images.pexels.com/photos/4761779/pexels-photo-4761779.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2') center/cover no-repeat",
        textAlign: "center",
        padding: "0 2rem",
      }}>
        {/* watermark */}
        <span style={{
          position: "absolute", fontFamily: "var(--font-oswald)", fontSize: "22vw",
          color: "rgba(255,255,255,0.025)", whiteSpace: "nowrap",
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          pointerEvents: "none", userSelect: "none",
        }}>BOXING</span>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 900 }}>
          <SectionLabel text="High Intensity Interval Training" />
          <h1 style={{
            fontFamily: "var(--font-oswald)", fontSize: "clamp(4rem, 11vw, 10rem)",
            lineHeight: 0.85, textTransform: "uppercase", marginBottom: "2.5rem",
          }}>
            FIGHT FOR<br />YOUR BEST<br />SELF
          </h1>
          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/site/booking"
              style={{ background: RED, color: "#fff", padding: "1rem 2.5rem", fontFamily: "var(--font-oswald)", fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none", transition: "all 0.2s" }}>
              Book Now
            </Link>
            <Link href="/site/onboarding"
              style={{ border: "1px solid #fff", color: "#fff", padding: "1rem 2.5rem", fontFamily: "var(--font-oswald)", fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none", transition: "all 0.2s" }}>
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* ── INFO BAR ─────────────────────────────────────── */}
      <div style={{
        display: "flex", flexWrap: "wrap", justifyContent: "space-between",
        padding: "1.25rem 4rem", background: GRAY,
        borderTop: `1px solid ${RED}`,
        fontFamily: "var(--font-chakra)", fontSize: "0.75rem", textTransform: "uppercase",
        gap: "1rem",
      }}>
        {[
          ["LOC:", "481 Richmond St W, Toronto"],
          ["PH:", "(416) 555-FIIT"],
          ["HOURS:", "06:00 – 22:00 DAILY"],
        ].map(([label, val]) => (
          <span key={label}><span style={{ color: RED, marginRight: 6 }}>{label}</span>{val}</span>
        ))}
      </div>

      {/* ── SCHEDULE ─────────────────────────────────────── */}
      <section style={{ padding: "7rem 4rem" }}>
        <SectionLabel text="Daily Operations" />
        <h2 style={{ fontFamily: "var(--font-oswald)", fontSize: "clamp(2rem, 5vw, 4rem)", textTransform: "uppercase", marginBottom: "2.5rem" }}>
          This Week's Classes
        </h2>

        {/* Day tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${GRAY}`, marginBottom: "2.5rem", overflowX: "auto" }}>
          {DAYS.map((day, i) => (
            <button key={day} onClick={() => setActiveDay(i)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--font-oswald)", fontSize: "1.3rem",
                textTransform: "uppercase", padding: "0.75rem 1.5rem",
                color: activeDay === i ? "#fff" : "rgba(255,255,255,0.35)",
                borderBottom: activeDay === i ? `4px solid ${RED}` : "4px solid transparent",
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}>
              {day}
            </button>
          ))}
        </div>

        {/* Schedule rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: GRAY }}>
          {SCHEDULE.map((row) => (
            <div key={row.time} style={{
              display: "grid", gridTemplateColumns: "140px 1fr 1fr auto",
              alignItems: "center", padding: "1.25rem 1.5rem",
              background: "#000", gap: "1rem",
              transition: "background 0.2s",
            }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#0a0a0a")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#000")}
            >
              <span style={{ fontFamily: "var(--font-chakra)", fontSize: "1.2rem", color: RED }}>{row.time}</span>
              <Link href={`/site/classes/${row.name.toLowerCase().replace(/ /g, "-")}`}
                style={{ fontFamily: "var(--font-oswald)", fontSize: "1.4rem", textTransform: "uppercase", color: "#fff", textDecoration: "none" }}>
                {row.name}
              </Link>
              <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.8rem", textTransform: "uppercase", opacity: 0.55 }}>{row.trainer}</span>
              <Link href="/site/booking"
                style={{
                  border: "1px solid rgba(255,255,255,0.4)", color: "#fff",
                  padding: "0.6rem 1.25rem", fontFamily: "var(--font-oswald)",
                  fontSize: "0.8rem", textTransform: "uppercase", textDecoration: "none",
                  letterSpacing: "0.08em", whiteSpace: "nowrap",
                  background: row.spots <= 4 ? "rgba(217,43,43,0.12)" : "transparent",
                  borderColor: row.spots <= 4 ? RED : "rgba(255,255,255,0.4)",
                }}>
                {row.spots <= 4 ? `${row.spots} Left` : "Book"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRAINERS ─────────────────────────────────────── */}
      <section style={{ padding: "7rem 4rem", background: GRAY }}>
        <SectionLabel text="Elite Personnel" />
        <h2 style={{ fontFamily: "var(--font-oswald)", fontSize: "clamp(2rem, 5vw, 4rem)", textTransform: "uppercase", marginBottom: "3rem" }}>
          Our Trainers
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem" }}>
          {TRAINERS.map((t) => (
            <Link key={t.slug} href={`/site/trainers/${t.slug}`} style={{ textDecoration: "none" }}>
              <div style={{ position: "relative", aspectRatio: "4/5", overflow: "hidden", background: "#111", cursor: "pointer" }}
                onMouseEnter={(e) => {
                  const img = (e.currentTarget as HTMLDivElement).querySelector("img") as HTMLImageElement;
                  if (img) { img.style.transform = "scale(1.07)"; img.style.filter = "grayscale(0)"; }
                  const info = (e.currentTarget as HTMLDivElement).querySelector(".t-info") as HTMLDivElement;
                  if (info) info.style.transform = "translateY(0)";
                }}
                onMouseLeave={(e) => {
                  const img = (e.currentTarget as HTMLDivElement).querySelector("img") as HTMLImageElement;
                  if (img) { img.style.transform = "scale(1)"; img.style.filter = "grayscale(1)"; }
                  const info = (e.currentTarget as HTMLDivElement).querySelector(".t-info") as HTMLDivElement;
                  if (info) info.style.transform = "translateY(65%)";
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.img} alt={t.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1)", transition: "transform 0.5s, filter 0.5s" }} />
                <div className="t-info" style={{
                  position: "absolute", bottom: 0, left: 0, width: "100%",
                  padding: "2rem 1.25rem 1.25rem",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.95))",
                  transform: "translateY(65%)", transition: "transform 0.3s ease",
                }}>
                  <p style={{ fontFamily: "var(--font-oswald)", fontSize: "1.5rem", textTransform: "uppercase", color: "#fff", lineHeight: 1, marginBottom: 4 }}>{t.name}</p>
                  <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", color: RED, letterSpacing: "0.12em" }}>{t.tag}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── THREE PILLARS ─────────────────────────────────── */}
      <section style={{ padding: "7rem 4rem", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4rem" }}>
        {[
          { n: "01", title: "The Training", body: "Authentic pugilist methodology meets high-science interval training. Every session is designed to push past your threshold." },
          { n: "02", title: "The Space",    body: "6,000 sq ft facility with professional-grade bags, a competition ring, and recovery equipment. Industrial grit meets boutique luxury." },
          { n: "03", title: "The Community", body: "Founded on mutual respect and unrelenting effort. No egos. We fight together, grow together." },
        ].map(({ n, title, body }) => (
          <div key={n}>
            <SectionLabel text={n} />
            <h3 style={{ fontFamily: "var(--font-oswald)", fontSize: "clamp(1.8rem, 3vw, 3rem)", textTransform: "uppercase", color: RED, marginBottom: "1rem" }}>{title}</h3>
            <p style={{ opacity: 0.65, lineHeight: 1.7, fontSize: "0.95rem" }}>{body}</p>
          </div>
        ))}
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section style={{ padding: "7rem 4rem", background: GRAY }}>
        <SectionLabel text="Investment Tiers" />
        <h2 style={{ fontFamily: "var(--font-oswald)", fontSize: "clamp(2rem, 5vw, 4rem)", textTransform: "uppercase", marginBottom: "3rem" }}>
          Memberships
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
          {[
            { label: "STARTER", title: "Single Fight", price: "$35", per: "/cad", features: ["1 Group Session", "Gloves Rental Included", "Valid 30 Days"], featured: false },
            { label: "RECOMMENDED", title: "Unlimited FIIT", price: "$249", per: "/mo", features: ["Unlimited Group Classes", "2 Guest Passes/Month", "15% Pro Shop Discount", "Priority Booking"], featured: true },
            { label: "COMMITTED", title: "10-Pack", price: "$280", per: "/cad", features: ["10 Group Sessions", "No Expiry Date", "Shareable Access"], featured: false },
          ].map(({ label, title, price, per, features, featured }) => (
            <div key={title} style={{
              border: `1px solid ${featured ? RED : "rgba(255,255,255,0.1)"}`,
              padding: "2.5rem",
              background: featured ? "rgba(217,43,43,0.05)" : "transparent",
              textAlign: "center",
            }}>
              <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.15em", marginBottom: "0.75rem" }}>{label}</p>
              <p style={{ fontFamily: "var(--font-oswald)", fontSize: "2rem", textTransform: "uppercase", marginBottom: "0.5rem" }}>{title}</p>
              <p style={{ fontFamily: "var(--font-oswald)", fontSize: "3.5rem", marginBottom: "1.5rem" }}>{price}<span style={{ fontSize: "0.9rem", verticalAlign: "middle", opacity: 0.6 }}>{per}</span></p>
              <ul style={{ listStyle: "none", marginBottom: "2rem", color: "rgba(255,255,255,0.65)", fontSize: "0.9rem" }}>
                {features.map(f => <li key={f} style={{ marginBottom: "0.6rem" }}>— {f}</li>)}
              </ul>
              <Link href="/site/booking"
                style={{
                  display: "inline-block",
                  background: featured ? RED : "transparent",
                  border: `1px solid ${featured ? RED : "rgba(255,255,255,0.4)"}`,
                  color: "#fff", padding: "0.85rem 2rem",
                  fontFamily: "var(--font-oswald)", textTransform: "uppercase",
                  fontSize: "0.9rem", letterSpacing: "0.08em", textDecoration: "none",
                }}>
                {featured ? "Select Plan" : "Buy Now"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── REFERRAL BANNER ──────────────────────────────── */}
      <div style={{ background: RED, padding: "4rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-oswald)", fontSize: "clamp(2.5rem, 6vw, 5rem)", textTransform: "uppercase", letterSpacing: "-1px", marginBottom: "0.5rem" }}>
          REFER A CONTENDER
        </h2>
        <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Get 50% off your next month for every referral that signs up.
        </p>
      </div>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{
        padding: "5rem 4rem",
        borderTop: `1px solid ${GRAY}`,
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "3rem",
      }}>
        <div>
          <p style={{ fontFamily: "var(--font-oswald)", fontSize: "1.8rem", letterSpacing: "-1px" }}>FIIT<span style={{ color: RED }}>.CO</span></p>
          <p style={{ marginTop: "1rem", opacity: 0.4, fontSize: "0.8rem", lineHeight: 1.7 }}>The ultimate boutique boxing destination in downtown Toronto. Est. 2015.</p>
        </div>
        {[
          { head: "EXPLORE",  links: ["Classes", "Workshops", "Our Story", "Franchise"] },
          { head: "SUPPORT",  links: ["FAQ", "Terms & Waiver", "Contact Us", "Privacy Policy"] },
          { head: "CONNECT",  links: ["Instagram", "TikTok", "YouTube", "Newsletter"] },
        ].map(({ head, links }) => (
          <div key={head}>
            <p style={{ fontFamily: "var(--font-oswald)", textTransform: "uppercase", marginBottom: "1.5rem", color: RED, fontSize: "1rem" }}>{head}</p>
            <ul style={{ listStyle: "none" }}>
              {links.map(l => <li key={l} style={{ marginBottom: "0.7rem", fontSize: "0.85rem", opacity: 0.55 }}>{l}</li>)}
            </ul>
          </div>
        ))}
      </footer>
    </div>
  );
}
