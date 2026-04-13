"use client";
import Link from "next/link";

const RED  = "#D92B2B";
const GRAY = "#1A1A1A";

const TRAINER_DATA: Record<string, {
  name: string; title: string; img: string; heroImg: string;
  bio: string; philosophy: string;
  stats: { label: string; value: string }[];
  specialisations: string[];
  certifications: string[];
  classes: { time: string; name: string; day: string }[];
}> = {
  "jason-battiste": {
    name: "Jason Battiste",
    title: "Head Coach & Founder",
    img: "https://images.pexels.com/photos/1544540/pexels-photo-1544540.jpeg?auto=compress&cs=tinysrgb&w=800",
    heroImg: "https://images.pexels.com/photos/4761779/pexels-photo-4761779.jpeg?auto=compress&cs=tinysrgb&w=1260",
    bio: "Former Golden Gloves champion with over 15 years in competitive boxing. Jason founded FIIT Co. in 2015 after recognising a gap in Toronto's fitness scene — a place where real boxing technique meets elite conditioning. He believes the ring teaches you more about yourself than any other training environment.",
    philosophy: "\"The bag doesn't lie. Neither does the clock. Show up every day and the results will speak for themselves.\"",
    stats: [
      { label: "Years Coaching", value: "15+" },
      { label: "Clients Trained", value: "2,400+" },
      { label: "Titles", value: "3" },
      { label: "Classes / Week", value: "12" },
    ],
    specialisations: ["Counter-Punching", "Defensive Footwork", "Ring IQ", "Elite Cardio"],
    certifications: ["NCCP Boxing Coach Level 3", "CSCS Certified", "CPR-C / AED"],
    classes: [
      { time: "06:00", name: "Heavy Bag Smash", day: "MON / WED / FRI" },
      { time: "09:00", name: "Private Training", day: "TUE / THU" },
    ],
  },
  "matt-makar": {
    name: "Matt Makar",
    title: "Strength & Conditioning Coach",
    img: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800",
    heroImg: "https://images.pexels.com/photos/4761779/pexels-photo-4761779.jpeg?auto=compress&cs=tinysrgb&w=1260",
    bio: "10 years in professional S&C. Matt specialises in building the physical infrastructure that allows boxers to perform at peak output round after round.",
    philosophy: "\"Strength is the base. Everything else is built on top of it.\"",
    stats: [
      { label: "Years Coaching", value: "10+" },
      { label: "Clients Trained", value: "800+" },
      { label: "Titles", value: "0" },
      { label: "Classes / Week", value: "8" },
    ],
    specialisations: ["Power Generation", "Explosive Strength", "Athletic Conditioning"],
    certifications: ["NSCA-CSCS", "Olympic Lifting Level 1", "CPR-C"],
    classes: [
      { time: "12:00", name: "Power Hour", day: "MON / WED" },
      { time: "17:00", name: "Strength Lab", day: "TUE / THU / SAT" },
    ],
  },
};

const FALLBACK = TRAINER_DATA["jason-battiste"];

export default function TrainerProfilePage({ params }: { params: { slug: string } }) {
  const trainer = TRAINER_DATA[params.slug] ?? FALLBACK;

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh" }}>

      {/* ── HERO ─────────────────────────────────── */}
      <section style={{
        position: "relative", height: "70vh", minHeight: 480,
        overflow: "hidden", display: "flex", alignItems: "flex-end",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={trainer.img} alt={trainer.name}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "top center",
            filter: "grayscale(0.3)",
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)" }} />
        <div style={{ position: "relative", zIndex: 1, padding: "0 4rem 4rem", maxWidth: 700 }}>
          <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.7rem", color: RED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            — Elite Personnel —
          </p>
          <h1 style={{ fontFamily: "var(--font-oswald)", fontSize: "clamp(3rem, 7vw, 6rem)", textTransform: "uppercase", lineHeight: 0.88, marginBottom: "0.75rem" }}>
            {trainer.name}
          </h1>
          <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.6 }}>
            {trainer.title}
          </p>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────── */}
      <div style={{ background: GRAY, borderTop: `2px solid ${RED}` }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${trainer.stats.length}, 1fr)`, maxWidth: 900, margin: "0 auto" }}>
          {trainer.stats.map(({ label, value }) => (
            <div key={label} style={{ padding: "1.5rem 2rem", borderRight: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-oswald)", fontSize: "2.2rem", color: RED, lineHeight: 1, marginBottom: 4 }}>{value}</p>
              <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.5 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── BIO + SIDE PANEL ─────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "4rem", padding: "6rem 4rem", maxWidth: 1200, margin: "0 auto" }}>

        {/* Left: bio */}
        <div>
          <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1rem" }}>
            — About —
          </p>
          <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "rgba(255,255,255,0.75)", marginBottom: "2.5rem" }}>
            {trainer.bio}
          </p>

          {/* Philosophy quote */}
          <blockquote style={{
            borderLeft: `3px solid ${RED}`, paddingLeft: "1.5rem", marginBottom: "3rem",
            fontFamily: "var(--font-oswald)", fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)",
            textTransform: "uppercase", lineHeight: 1.2, opacity: 0.85,
          }}>
            {trainer.philosophy}
          </blockquote>

          {/* Specialisations */}
          <div style={{ marginBottom: "2.5rem" }}>
            <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1rem" }}>
              Specialisations
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {trainer.specialisations.map((s) => (
                <span key={s} style={{
                  border: "1px solid rgba(255,255,255,0.2)", padding: "6px 14px",
                  fontFamily: "var(--font-chakra)", fontSize: "0.7rem",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1rem" }}>
              Certifications
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {trainer.certifications.map((c) => (
                <li key={c} style={{ display: "flex", gap: 10, fontSize: "0.85rem", color: "rgba(255,255,255,0.65)" }}>
                  <span style={{ color: RED, flexShrink: 0 }}>✓</span>{c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: class schedule */}
        <div>
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "2rem" }}>
            <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              — Weekly Schedule —
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "rgba(255,255,255,0.05)", marginBottom: "1.5rem" }}>
              {trainer.classes.map((cls) => (
                <div key={cls.name} style={{ background: "#000", padding: "1.25rem 1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <p style={{ fontFamily: "var(--font-oswald)", fontSize: "1.1rem", textTransform: "uppercase" }}>{cls.name}</p>
                    <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.75rem", color: RED }}>{cls.time}</span>
                  </div>
                  <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", opacity: 0.45, letterSpacing: "0.08em" }}>{cls.day}</p>
                </div>
              ))}
            </div>

            <Link href="/site/booking"
              style={{
                display: "block", textAlign: "center",
                background: RED, color: "#fff",
                padding: "0.85rem 1rem",
                fontFamily: "var(--font-oswald)", textTransform: "uppercase",
                fontSize: "0.9rem", letterSpacing: "0.1em", textDecoration: "none",
              }}>
              Book With {trainer.name.split(" ")[0]}
            </Link>
          </div>

          {/* Other trainers */}
          <div style={{ marginTop: "2rem" }}>
            <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>
              Other Trainers
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: GRAY }}>
              {[
                { slug: "matt-makar",    name: "Matt Makar",    tag: "Strength" },
                { slug: "jason-battiste", name: "Jason Battiste", tag: "Boxing" },
              ].filter(t => t.slug !== params.slug).map((t) => (
                <Link key={t.slug} href={`/site/trainers/${t.slug}`}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", background: "#000", textDecoration: "none" }}>
                  <span style={{ fontFamily: "var(--font-oswald)", fontSize: "0.95rem", textTransform: "uppercase", color: "#fff" }}>{t.name}</span>
                  <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", color: RED }}>{t.tag} →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
