"use client";
import { useState } from "react";
import Link from "next/link";

const RED  = "#D92B2B";
const GRAY = "#1A1A1A";

const CLASS_DATA: Record<string, {
  name: string; category: string; duration: number; tier: string; emoji: string;
  heroImg: string; description: string; whatYouGet: string[];
  ideal: string[]; schedule: { day: string; time: string; trainer: string; spots: number }[];
  equipment: string[];
}> = {
  "heavy-bag-smash": {
    name: "Heavy Bag Smash",
    category: "Boxing",
    duration: 60,
    tier: "All Levels",
    emoji: "🥊",
    heroImg: "https://images.pexels.com/photos/4761779/pexels-photo-4761779.jpeg?auto=compress&cs=tinysrgb&w=1260",
    description: "Our signature class. 60 minutes of non-stop heavy bag work combining combination drilling, power sets, and cardio intervals. You'll leave every session drenched and dialled-in. No sparring — just you and the bag.",
    whatYouGet: [
      "Combination drilling — jab, cross, hook, uppercut progressions",
      "3-minute bag rounds with 45-second active rest",
      "Footwork and ring movement fundamentals",
      "Core conditioning finisher (last 10 minutes)",
      "Post-session cool-down and mobility work",
    ],
    ideal: ["Beginners to advanced — scaled by instructor", "Anyone looking to improve cardio and power", "Stress relief that actually works"],
    schedule: [
      { day: "MON", time: "06:00", trainer: "Jason Battiste", spots: 4 },
      { day: "WED", time: "06:00", trainer: "Jason Battiste", spots: 10 },
      { day: "FRI", time: "06:00", trainer: "Jason Battiste", spots: 7 },
      { day: "SAT", time: "09:00", trainer: "Sarah Green",    spots: 14 },
    ],
    equipment: ["Heavy Bags (x30)", "16oz Gloves", "Hand Wraps", "Jump Ropes"],
  },
  "ring-technicals": {
    name: "Ring Technicals",
    category: "Boxing",
    duration: 60,
    tier: "Intermediate+",
    emoji: "🎯",
    heroImg: "https://images.pexels.com/photos/4761779/pexels-photo-4761779.jpeg?auto=compress&cs=tinysrgb&w=1260",
    description: "Technique-first boxing class focusing on precision, defence, and ring generalship. Smaller class sizes allow for personalised coaching and technical feedback.",
    whatYouGet: [
      "Pad work with trainer feedback",
      "Defensive drills — slips, rolls, parries",
      "Advanced combination sequences",
      "Footwork ladder drills",
    ],
    ideal: ["Intermediate and advanced boxers", "Those wanting technical improvement", "Anyone preparing for amateur competition"],
    schedule: [
      { day: "TUE", time: "08:00", trainer: "Sarah Green", spots: 6 },
      { day: "THU", time: "08:00", trainer: "Sarah Green", spots: 8 },
    ],
    equipment: ["Focus Mitts", "Speed Bags", "Slip Balls", "Ladder"],
  },
};

const FALLBACK = CLASS_DATA["heavy-bag-smash"];

const TIER_COLORS: Record<string, string> = {
  "All Levels":    "#66B685",
  "Intermediate+": "#8E62CD",
  "Advanced":      RED,
};

export default function ClassDetailPage({ params }: { params: { slug: string } }) {
  const cls = CLASS_DATA[params.slug] ?? FALLBACK;
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh" }}>

      {/* ── HERO ─────────────────────────────────── */}
      <section style={{
        position: "relative", height: "55vh", minHeight: 400,
        overflow: "hidden", display: "flex", alignItems: "flex-end",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cls.heroImg} alt={cls.name}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 60%)" }} />
        <div style={{ position: "relative", zIndex: 1, padding: "0 4rem 3.5rem", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", background: "rgba(255,255,255,0.1)", padding: "5px 12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{cls.category}</span>
                <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", background: `${TIER_COLORS[cls.tier]}22`, border: `1px solid ${TIER_COLORS[cls.tier]}`, color: TIER_COLORS[cls.tier], padding: "5px 12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{cls.tier}</span>
                <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", background: "rgba(255,255,255,0.08)", padding: "5px 12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{cls.duration} min</span>
              </div>
              <h1 style={{ fontFamily: "var(--font-oswald)", fontSize: "clamp(2.5rem, 6vw, 5rem)", textTransform: "uppercase", lineHeight: 0.88 }}>
                {cls.emoji} {cls.name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* ── BODY ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "4rem", padding: "4rem", maxWidth: 1200, margin: "0 auto" }}>

        {/* Left: details */}
        <div>
          <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "rgba(255,255,255,0.72)", marginBottom: "3rem" }}>
            {cls.description}
          </p>

          {/* What you get */}
          <div style={{ marginBottom: "3rem" }}>
            <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
              — What You Get —
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {cls.whatYouGet.map((item) => (
                <li key={item} style={{ display: "flex", gap: 12, fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>
                  <span style={{ color: RED, flexShrink: 0, marginTop: 3 }}>→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Ideal for */}
          <div style={{ marginBottom: "3rem" }}>
            <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
              — Ideal For —
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {cls.ideal.map((item) => (
                <span key={item} style={{ border: "1px solid rgba(255,255,255,0.18)", padding: "8px 14px", fontFamily: "var(--font-chakra)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item}</span>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
              — Equipment Used —
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, background: "rgba(255,255,255,0.07)" }}>
              {cls.equipment.map((e) => (
                <div key={e} style={{ background: "#000", padding: "1rem 1.25rem", fontFamily: "var(--font-chakra)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.65 }}>{e}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: booking panel */}
        <div>
          <div style={{ border: "1px solid rgba(255,255,255,0.12)", position: "sticky", top: "5rem" }}>
            <div style={{ height: 3, background: RED }} />
            <div style={{ padding: "1.75rem" }}>
              <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
                — Book A Slot —
              </p>

              {/* Slots */}
              <div style={{ display: "flex", flexDirection: "column", gap: 1, background: GRAY, marginBottom: "1.25rem" }}>
                {cls.schedule.map((slot, i) => (
                  <div key={i} onClick={() => setSelectedSlot(i)}
                    style={{
                      background: selectedSlot === i ? "rgba(217,43,43,0.12)" : "#000",
                      border: selectedSlot === i ? `1px solid ${RED}` : "1px solid transparent",
                      padding: "1rem 1.25rem", cursor: "pointer", transition: "all 0.2s",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                    <div>
                      <p style={{ fontFamily: "var(--font-oswald)", fontSize: "0.95rem", textTransform: "uppercase", marginBottom: 2 }}>
                        {slot.day} · {slot.time}
                      </p>
                      <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.62rem", textTransform: "uppercase", opacity: 0.45, letterSpacing: "0.08em" }}>{slot.trainer}</p>
                    </div>
                    <span style={{
                      fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase",
                      letterSpacing: "0.08em", padding: "4px 8px",
                      background: slot.spots <= 4 ? "rgba(217,43,43,0.15)" : "transparent",
                      color: slot.spots <= 4 ? RED : "rgba(255,255,255,0.4)",
                      border: `1px solid ${slot.spots <= 4 ? RED : "rgba(255,255,255,0.15)"}`,
                    }}>
                      {slot.spots} left
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/site/booking"
                style={{
                  display: "block", textAlign: "center",
                  background: selectedSlot !== null ? RED : "rgba(255,255,255,0.08)",
                  color: "#fff", padding: "0.9rem",
                  fontFamily: "var(--font-oswald)", textTransform: "uppercase",
                  fontSize: "0.9rem", letterSpacing: "0.1em", textDecoration: "none",
                  transition: "background 0.2s",
                  pointerEvents: selectedSlot !== null ? "auto" : "none",
                  opacity: selectedSlot !== null ? 1 : 0.5,
                }}>
                {selectedSlot !== null ? "Confirm Booking" : "Select A Slot"}
              </Link>

              <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", textAlign: "center", opacity: 0.35, letterSpacing: "0.08em", marginTop: "0.75rem" }}>
                Free cancellation up to 4 hrs before
              </p>
            </div>
          </div>

          {/* Trainer teaser */}
          <Link href="/site/trainers/jason-battiste"
            style={{ display: "block", textDecoration: "none", marginTop: "1rem", border: "1px solid rgba(255,255,255,0.08)", padding: "1.25rem" }}>
            <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.62rem", color: RED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Lead Trainer</p>
            <p style={{ fontFamily: "var(--font-oswald)", fontSize: "1.1rem", textTransform: "uppercase", color: "#fff", marginBottom: 2 }}>Jason Battiste</p>
            <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", opacity: 0.4 }}>View Profile →</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
