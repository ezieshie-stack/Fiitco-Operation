"use client";
import Link from "next/link";

const RED  = "#D92B2B";
const GRAY = "#1A1A1A";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-oswald)", fontSize: "1rem", textTransform: "uppercase" }}>{value}</span>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "#fff", padding: "5rem 2rem" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* ── HEADER ─────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          {/* Checkmark circle */}
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            border: `2px solid ${RED}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.7rem", color: RED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            — Booking Confirmed —
          </p>
          <h1 style={{ fontFamily: "var(--font-oswald)", fontSize: "clamp(2.5rem, 6vw, 4rem)", textTransform: "uppercase", lineHeight: 0.9, marginBottom: "0.75rem" }}>
            You're In The<br />Ring
          </h1>
          <p style={{ opacity: 0.5, fontSize: "0.9rem" }}>
            A confirmation has been sent to your email.
          </p>
        </div>

        {/* ── BOOKING CARD ───────────────────────── */}
        <div style={{ border: `1px solid rgba(255,255,255,0.12)`, marginBottom: "2rem" }}>
          {/* Red accent top */}
          <div style={{ height: 4, background: RED }} />

          <div style={{ padding: "1.75rem 2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Session</p>
                <p style={{ fontFamily: "var(--font-oswald)", fontSize: "1.8rem", textTransform: "uppercase", lineHeight: 1 }}>Heavy Bag Smash</p>
              </div>
              <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", background: "rgba(217,43,43,0.15)", border: `1px solid ${RED}`, color: RED, padding: "6px 12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Boxing
              </span>
            </div>

            <Row label="Date"        value="Monday, April 14, 2026" />
            <Row label="Time"        value="06:00 – 07:00 AM" />
            <Row label="Trainer"     value="Jason Battiste" />
            <Row label="Location"    value="481 Richmond St W" />
            <Row label="Studio"      value="Main Floor — Bag Station 7" />
            <Row label="Confirmation" value="FIIT-2026-04882" />
          </div>
        </div>

        {/* ── WHAT TO BRING ──────────────────────── */}
        <div style={{ background: GRAY, padding: "1.5rem 2rem", marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-oswald)", textTransform: "uppercase", fontSize: "1rem", marginBottom: "1rem", letterSpacing: "0.05em" }}>
            What To Bring
          </p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Hand wraps (available at front desk)",
              "Boxing gloves (16 oz recommended)",
              "Athletic shoes with ankle support",
              "Water bottle — we have a filling station",
              "Arrive 10 min early for wrap assistance",
            ].map((item) => (
              <li key={item} style={{ display: "flex", gap: 12, fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
                <span style={{ color: RED, flexShrink: 0, marginTop: 1 }}>→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* ── CANCELLATION POLICY ────────────────── */}
        <div style={{ padding: "1rem 1.5rem", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "2.5rem" }}>
          <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Cancellation Policy</p>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
            Cancel up to <strong style={{ color: "#fff" }}>4 hours before</strong> the session for a full credit. Late cancellations or no-shows result in session deduction.
          </p>
        </div>

        {/* ── ACTIONS ────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button style={{
            background: RED, color: "#fff", border: "none",
            padding: "1rem", fontFamily: "var(--font-oswald)",
            fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.1em",
            cursor: "pointer", width: "100%",
          }}>
            Add to Calendar
          </button>
          <Link href="/site/booking"
            style={{
              display: "block", textAlign: "center",
              border: "1px solid rgba(255,255,255,0.25)", color: "#fff",
              padding: "1rem", fontFamily: "var(--font-oswald)",
              fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.1em",
              textDecoration: "none",
            }}>
            Book Another Session
          </Link>
          <Link href="/site/member"
            style={{
              display: "block", textAlign: "center",
              color: "rgba(255,255,255,0.4)", padding: "0.75rem",
              fontFamily: "var(--font-chakra)", fontSize: "0.7rem",
              textTransform: "uppercase", letterSpacing: "0.1em",
              textDecoration: "none",
            }}>
            View Member Dashboard →
          </Link>
        </div>

        {/* ── RECOMMENDED CLASSES ────────────────── */}
        <div style={{ marginTop: "4rem", paddingTop: "3rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
            — You Might Also Like —
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "rgba(255,255,255,0.06)" }}>
            {[
              { time: "08:00", name: "Ring Technicals", trainer: "Sarah Green", day: "MON" },
              { time: "19:00", name: "Power Hour",      trainer: "Matt Makar",   day: "WED" },
            ].map((cls) => (
              <div key={cls.name} style={{
                display: "flex", alignItems: "center", gap: "1.25rem",
                padding: "1rem 1.25rem", background: "#000",
              }}>
                <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.7rem", color: RED, width: 40, flexShrink: 0 }}>{cls.day}</span>
                <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.8rem", opacity: 0.5, width: 48, flexShrink: 0 }}>{cls.time}</span>
                <span style={{ fontFamily: "var(--font-oswald)", fontSize: "1.1rem", textTransform: "uppercase", flex: 1 }}>{cls.name}</span>
                <span style={{ fontSize: "0.75rem", opacity: 0.45 }}>{cls.trainer}</span>
                <Link href="/site/booking"
                  style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", color: RED, textDecoration: "none", letterSpacing: "0.1em" }}>
                  Book →
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
