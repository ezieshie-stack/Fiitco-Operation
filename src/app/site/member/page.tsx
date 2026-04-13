"use client";
import { useState } from "react";
import Link from "next/link";

const RED  = "#D92B2B";
const GRAY = "#1A1A1A";

type Tab = "upcoming" | "history" | "membership";

const UPCOMING = [
  { day: "MON", date: "Apr 14", time: "06:00", name: "Heavy Bag Smash", trainer: "Jason Battiste", spot: "Bag 7" },
  { day: "WED", date: "Apr 16", time: "12:00", name: "Power Hour",      trainer: "Matt Makar",     spot: "Station 3" },
  { day: "FRI", date: "Apr 18", time: "06:00", name: "Heavy Bag Smash", trainer: "Jason Battiste", spot: "Bag 12" },
];

const HISTORY = [
  { date: "Apr 9",  name: "Ring Technicals",  trainer: "Sarah Green",   attended: true },
  { date: "Apr 7",  name: "Heavy Bag Smash",  trainer: "Jason Battiste", attended: true },
  { date: "Apr 4",  name: "Intro To FIIT",    trainer: "Jaye Pan",      attended: true },
  { date: "Apr 2",  name: "Power Hour",       trainer: "Matt Makar",    attended: false },
  { date: "Mar 31", name: "Advanced Boxing",  trainer: "Nick Radionov", attended: true },
  { date: "Mar 28", name: "Heavy Bag Smash",  trainer: "Jason Battiste", attended: true },
];

const STATS = [
  { label: "Sessions This Month", value: "9",   sub: "+2 vs last month" },
  { label: "Current Streak",      value: "6",   sub: "days in a row" },
  { label: "Total Sessions",      value: "84",  sub: "since joining" },
  { label: "Classes Remaining",   value: "3",   sub: "in current pack" },
];

export default function MemberDashboardPage() {
  const [tab, setTab] = useState<Tab>("upcoming");

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "4rem 2rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* ── HEADER ─────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
              — Member Portal —
            </p>
            <h1 style={{ fontFamily: "var(--font-oswald)", fontSize: "clamp(2.5rem, 5vw, 4rem)", textTransform: "uppercase", lineHeight: 0.9 }}>
              Welcome Back,<br />Marcus
            </h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ border: `1px solid ${RED}`, padding: "0.75rem 1.25rem", marginBottom: "0.5rem" }}>
              <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", color: RED, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Membership</p>
              <p style={{ fontFamily: "var(--font-oswald)", fontSize: "1.2rem", textTransform: "uppercase" }}>Unlimited FIIT</p>
            </div>
            <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Renews May 1, 2026
            </p>
          </div>
        </div>

        {/* ── STATS GRID ─────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "rgba(255,255,255,0.07)", marginBottom: "3rem" }}>
          {STATS.map(({ label, value, sub }) => (
            <div key={label} style={{ background: "#000", padding: "1.5rem 1.25rem", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-oswald)", fontSize: "2.8rem", color: RED, lineHeight: 1, marginBottom: 4 }}>{value}</p>
              <p style={{ fontFamily: "var(--font-oswald)", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
              <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", opacity: 0.4, letterSpacing: "0.08em" }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* ── TABS ───────────────────────────────── */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: "2rem" }}>
          {(["upcoming", "history", "membership"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--font-oswald)", fontSize: "1.1rem",
                textTransform: "uppercase", padding: "0.75rem 1.5rem",
                color: tab === t ? "#fff" : "rgba(255,255,255,0.3)",
                borderBottom: tab === t ? `3px solid ${RED}` : "3px solid transparent",
                transition: "all 0.2s", letterSpacing: "0.04em",
              }}>
              {t === "upcoming" ? "Upcoming" : t === "history" ? "History" : "Membership"}
            </button>
          ))}
        </div>

        {/* ── UPCOMING ────────────────────────────── */}
        {tab === "upcoming" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "rgba(255,255,255,0.06)", marginBottom: "2rem" }}>
              {UPCOMING.map((cls) => (
                <div key={cls.name + cls.date} style={{
                  display: "grid", gridTemplateColumns: "80px 1fr auto",
                  alignItems: "center", gap: "1rem",
                  background: "#000", padding: "1.25rem 1.5rem",
                }}>
                  {/* Date */}
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, textTransform: "uppercase", letterSpacing: "0.1em" }}>{cls.day}</p>
                    <p style={{ fontFamily: "var(--font-oswald)", fontSize: "1.4rem", lineHeight: 1 }}>{cls.date.split(" ")[1]}</p>
                    <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", opacity: 0.4, textTransform: "uppercase" }}>Apr</p>
                  </div>
                  {/* Class info */}
                  <div>
                    <p style={{ fontFamily: "var(--font-oswald)", fontSize: "1.2rem", textTransform: "uppercase", marginBottom: 4 }}>{cls.name}</p>
                    <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.7rem", textTransform: "uppercase", opacity: 0.5, letterSpacing: "0.08em" }}>
                      {cls.time} · {cls.trainer} · {cls.spot}
                    </p>
                  </div>
                  {/* Actions */}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button style={{
                      background: "transparent", border: `1px solid rgba(255,255,255,0.2)`,
                      color: "rgba(255,255,255,0.5)", padding: "6px 14px",
                      fontFamily: "var(--font-chakra)", fontSize: "0.65rem",
                      textTransform: "uppercase", cursor: "pointer", letterSpacing: "0.08em",
                    }}>Cancel</button>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/site/booking"
              style={{
                display: "inline-block", background: RED, color: "#fff",
                padding: "0.85rem 2rem", fontFamily: "var(--font-oswald)",
                fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em",
                textDecoration: "none",
              }}>
              + Book A Session
            </Link>
          </div>
        )}

        {/* ── HISTORY ─────────────────────────────── */}
        {tab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "rgba(255,255,255,0.06)" }}>
            {HISTORY.map((cls) => (
              <div key={cls.date + cls.name} style={{
                display: "grid", gridTemplateColumns: "80px 1fr auto",
                alignItems: "center", gap: "1rem",
                background: "#000", padding: "1rem 1.5rem",
                opacity: cls.attended ? 1 : 0.45,
              }}>
                <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.75rem", textTransform: "uppercase", opacity: 0.5 }}>{cls.date}</p>
                <div>
                  <p style={{ fontFamily: "var(--font-oswald)", fontSize: "1.05rem", textTransform: "uppercase", marginBottom: 2 }}>{cls.name}</p>
                  <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", opacity: 0.4, letterSpacing: "0.08em" }}>{cls.trainer}</p>
                </div>
                <span style={{
                  fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase",
                  letterSpacing: "0.1em", padding: "4px 10px",
                  background: cls.attended ? "rgba(102,182,133,0.12)" : "rgba(255,255,255,0.05)",
                  color: cls.attended ? "#66B685" : "rgba(255,255,255,0.3)",
                  border: `1px solid ${cls.attended ? "rgba(102,182,133,0.3)" : "rgba(255,255,255,0.1)"}`,
                }}>
                  {cls.attended ? "Attended" : "No-show"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── MEMBERSHIP ──────────────────────────── */}
        {tab === "membership" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* Plan card */}
            <div style={{ border: `1px solid ${RED}`, padding: "2rem", background: "rgba(217,43,43,0.05)" }}>
              <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Current Plan</p>
              <p style={{ fontFamily: "var(--font-oswald)", fontSize: "2rem", textTransform: "uppercase", marginBottom: "0.5rem" }}>Unlimited FIIT</p>
              <p style={{ fontFamily: "var(--font-oswald)", fontSize: "2.8rem", marginBottom: "1.5rem" }}>$249<span style={{ fontSize: "0.85rem", opacity: 0.5, verticalAlign: "middle" }}>/mo</span></p>
              <ul style={{ listStyle: "none", marginBottom: "1.75rem", display: "flex", flexDirection: "column", gap: 8 }}>
                {["Unlimited Group Classes", "2 Guest Passes/Month", "15% Pro Shop Discount", "Priority Booking"].map((f) => (
                  <li key={f} style={{ display: "flex", gap: 10, fontSize: "0.85rem", color: "rgba(255,255,255,0.65)" }}>
                    <span style={{ color: RED }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Next billing: May 1, 2026
              </p>
            </div>

            {/* Side panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ background: GRAY, padding: "1.5rem" }}>
                <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Guest Passes</p>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  {[1, 2].map((i) => (
                    <div key={i} style={{ flex: 1, height: 8, background: i === 1 ? RED : "rgba(255,255,255,0.15)", borderRadius: 2 }} />
                  ))}
                </div>
                <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.7rem", opacity: 0.45, textTransform: "uppercase" }}>1 of 2 used this month</p>
              </div>

              <div style={{ background: GRAY, padding: "1.5rem" }}>
                <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Referral Code</p>
                <p style={{ fontFamily: "var(--font-oswald)", fontSize: "1.5rem", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>MARCUS-FIIT</p>
                <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", opacity: 0.45, textTransform: "uppercase" }}>3 referrals · 1 month credit earned</p>
              </div>

              <button style={{
                background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.4)", padding: "0.85rem",
                fontFamily: "var(--font-chakra)", fontSize: "0.7rem",
                textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer",
              }}>
                Pause or Cancel Membership
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
