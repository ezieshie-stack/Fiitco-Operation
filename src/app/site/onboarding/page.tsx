"use client";
import { useState } from "react";
import Link from "next/link";

const RED  = "#D92B2B";
const GRAY = "#1A1A1A";

type Step = 0 | 1 | 2 | 3 | 4;

const STEPS = ["Welcome", "Your Goal", "Experience", "Schedule", "Your Plan"];

const GOALS = [
  { id: "fitness",    label: "General Fitness",    desc: "Improve cardio, lose weight, feel stronger" },
  { id: "boxing",     label: "Learn To Box",        desc: "Build real boxing technique from the ground up" },
  { id: "stress",     label: "Stress Relief",       desc: "Unplug, decompress, hit something hard" },
  { id: "compete",    label: "Compete",             desc: "Train with serious intent — amateur or beyond" },
];

const LEVELS = [
  { id: "zero",  label: "Zero Experience",   desc: "Never worn gloves before" },
  { id: "some",  label: "Some Experience",   desc: "Tried boxing a few times" },
  { id: "regular", label: "Regular Boxer",   desc: "Train consistently already" },
  { id: "advanced", label: "Advanced",       desc: "Competitive or prior coaching" },
];

const TIMES = [
  { id: "early", label: "Early Bird",  desc: "06:00 – 08:00", emoji: "🌅" },
  { id: "mid",   label: "Midday",      desc: "11:00 – 13:00", emoji: "☀️" },
  { id: "eve",   label: "Evening",     desc: "17:00 – 20:00", emoji: "🌆" },
  { id: "flex",  label: "Flexible",    desc: "No preference",  emoji: "🔀" },
];

const DAYS_OPTIONS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const PLAN_MAP: Record<string, { title: string; desc: string; price: string; classes: string[] }> = {
  "fitness-zero":   { title: "Intro To FIIT",    desc: "Perfect start for absolute beginners.", price: "$35/session", classes: ["Intro To FIIT × 3", "1-on-1 Foundations Session"] },
  "boxing-some":    { title: "Ring Technicals",   desc: "Fast-track your technique.",            price: "$249/mo",     classes: ["Heavy Bag Smash × 2", "Ring Technicals × 2"] },
  "compete-advanced": { title: "Elite Track",    desc: "For serious competitors.",              price: "Custom",      classes: ["Advanced Boxing × 3", "Private Coaching × 1", "Sparring Session × 1"] },
  default:          { title: "Unlimited FIIT",   desc: "Our most popular plan for every goal.", price: "$249/mo",     classes: ["Heavy Bag Smash", "Power Hour", "Ring Technicals", "All group classes"] },
};

function getPlan(goal: string, level: string) {
  return PLAN_MAP[`${goal}-${level}`] ?? PLAN_MAP.default;
}

function ProgressBar({ step }: { step: Step }) {
  return (
    <div style={{ marginBottom: "3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        {STEPS.map((label, i) => (
          <span key={label} style={{
            fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase",
            letterSpacing: "0.1em", color: i <= step ? RED : "rgba(255,255,255,0.25)",
          }}>{label}</span>
        ))}
      </div>
      <div style={{ height: 2, background: "rgba(255,255,255,0.1)", borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${(step / (STEPS.length - 1)) * 100}%`, background: RED, borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

function OptionCard({ id, label, desc, selected, onSelect, emoji }: {
  id: string; label: string; desc: string; selected: boolean; onSelect: () => void; emoji?: string;
}) {
  return (
    <div onClick={onSelect} style={{
      border: `1px solid ${selected ? RED : "rgba(255,255,255,0.12)"}`,
      background: selected ? "rgba(217,43,43,0.08)" : "transparent",
      padding: "1.25rem 1.5rem",
      cursor: "pointer", transition: "all 0.2s",
      display: "flex", alignItems: "center", gap: "1rem",
    }}>
      {emoji && <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{emoji}</span>}
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: "var(--font-oswald)", fontSize: "1.1rem", textTransform: "uppercase", marginBottom: 3 }}>{label}</p>
        <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.68rem", textTransform: "uppercase", opacity: 0.5, letterSpacing: "0.08em" }}>{desc}</p>
      </div>
      <div style={{
        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
        border: `2px solid ${selected ? RED : "rgba(255,255,255,0.25)"}`,
        background: selected ? RED : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}>
        {selected && <span style={{ fontSize: 10, color: "#fff" }}>✓</span>}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const [step, setStep]   = useState<Step>(0);
  const [goal, setGoal]   = useState("");
  const [level, setLevel] = useState("");
  const [time, setTime]   = useState("");
  const [days, setDays]   = useState<string[]>([]);

  const plan = getPlan(goal, level);
  const canNext = step === 0 ? true : step === 1 ? !!goal : step === 2 ? !!level : step === 3 ? !!time && days.length > 0 : false;

  function toggleDay(d: string) {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  function next() { if (step < 4) setStep((step + 1) as Step); }
  function back() { if (step > 0) setStep((step - 1) as Step); }

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "4rem 2rem" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        <ProgressBar step={step} />

        {/* ── STEP 0: WELCOME ─────────────────────── */}
        {step === 0 && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1rem" }}>
              — New Member —
            </p>
            <h1 style={{ fontFamily: "var(--font-oswald)", fontSize: "clamp(3rem, 8vw, 6rem)", textTransform: "uppercase", lineHeight: 0.88, marginBottom: "1.5rem" }}>
              Let's Find<br />Your Fight
            </h1>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: 420, margin: "0 auto 2.5rem" }}>
              Answer 3 quick questions and we'll match you to the right classes and a training plan built for your goals.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: GRAY, marginBottom: "3rem" }}>
              {[
                { n: "2,400+", label: "Members Trained" },
                { n: "5",      label: "Elite Trainers" },
                { n: "12+",    label: "Classes / Week" },
              ].map(({ n, label }) => (
                <div key={label} style={{ background: "#000", padding: "1.25rem", textAlign: "center" }}>
                  <p style={{ fontFamily: "var(--font-oswald)", fontSize: "2rem", color: RED, lineHeight: 1 }}>{n}</p>
                  <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", opacity: 0.45, marginTop: 4 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 1: GOAL ────────────────────────── */}
        {step === 1 && (
          <div>
            <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Step 1 of 3</p>
            <h2 style={{ fontFamily: "var(--font-oswald)", fontSize: "clamp(2rem, 5vw, 3.5rem)", textTransform: "uppercase", marginBottom: "2rem", lineHeight: 0.95 }}>
              What's Your<br />Main Goal?
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: GRAY }}>
              {GOALS.map((g) => (
                <OptionCard key={g.id} id={g.id} label={g.label} desc={g.desc} selected={goal === g.id} onSelect={() => setGoal(g.id)} />
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: EXPERIENCE ──────────────────── */}
        {step === 2 && (
          <div>
            <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Step 2 of 3</p>
            <h2 style={{ fontFamily: "var(--font-oswald)", fontSize: "clamp(2rem, 5vw, 3.5rem)", textTransform: "uppercase", marginBottom: "2rem", lineHeight: 0.95 }}>
              Your Boxing<br />Experience?
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: GRAY }}>
              {LEVELS.map((l) => (
                <OptionCard key={l.id} id={l.id} label={l.label} desc={l.desc} selected={level === l.id} onSelect={() => setLevel(l.id)} />
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 3: SCHEDULE ────────────────────── */}
        {step === 3 && (
          <div>
            <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Step 3 of 3</p>
            <h2 style={{ fontFamily: "var(--font-oswald)", fontSize: "clamp(2rem, 5vw, 3.5rem)", textTransform: "uppercase", marginBottom: "2rem", lineHeight: 0.95 }}>
              When Do You<br />Train?
            </h2>
            <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5, marginBottom: "0.75rem" }}>Preferred time</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, background: GRAY, marginBottom: "1.5rem" }}>
              {TIMES.map((t) => (
                <OptionCard key={t.id} id={t.id} label={t.label} desc={t.desc} emoji={t.emoji} selected={time === t.id} onSelect={() => setTime(t.id)} />
              ))}
            </div>
            <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5, marginBottom: "0.75rem" }}>Days you can train (select all that apply)</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {DAYS_OPTIONS.map((d) => (
                <button key={d} onClick={() => toggleDay(d)}
                  style={{
                    background: days.includes(d) ? RED : "transparent",
                    border: `1px solid ${days.includes(d) ? RED : "rgba(255,255,255,0.2)"}`,
                    color: "#fff", padding: "10px 16px",
                    fontFamily: "var(--font-chakra)", fontSize: "0.7rem",
                    textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s",
                    letterSpacing: "0.08em",
                  }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 4: YOUR PLAN ───────────────────── */}
        {step === 4 && (
          <div>
            <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", color: RED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
              — Your Plan —
            </p>
            <h2 style={{ fontFamily: "var(--font-oswald)", fontSize: "clamp(2rem, 5vw, 3.5rem)", textTransform: "uppercase", marginBottom: "2rem", lineHeight: 0.95 }}>
              We Found Your<br />Match
            </h2>

            {/* Plan card */}
            <div style={{ border: `1px solid ${RED}`, background: "rgba(217,43,43,0.06)", padding: "2rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.62rem", color: RED, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Recommended Plan</p>
                  <p style={{ fontFamily: "var(--font-oswald)", fontSize: "2rem", textTransform: "uppercase" }}>{plan.title}</p>
                </div>
                <p style={{ fontFamily: "var(--font-oswald)", fontSize: "1.8rem", color: RED }}>{plan.price}</p>
              </div>
              <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.65)", marginBottom: "1.25rem" }}>{plan.desc}</p>
              <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", color: RED, marginBottom: "0.75rem" }}>Includes</p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.classes.map((c) => (
                  <li key={c} style={{ display: "flex", gap: 10, fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
                    <span style={{ color: RED }}>✓</span>{c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Summary */}
            <div style={{ background: GRAY, padding: "1.25rem", marginBottom: "1.5rem" }}>
              <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.4, marginBottom: "0.75rem" }}>Your Profile</p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {[
                  GOALS.find(g => g.id === goal)?.label,
                  LEVELS.find(l => l.id === level)?.label,
                  TIMES.find(t => t.id === time)?.label,
                  ...days,
                ].filter(Boolean).map((tag) => (
                  <span key={tag} style={{ border: "1px solid rgba(255,255,255,0.2)", padding: "4px 10px", fontFamily: "var(--font-chakra)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.7 }}>{tag}</span>
                ))}
              </div>
            </div>

            <Link href="/site/booking"
              style={{
                display: "block", textAlign: "center",
                background: RED, color: "#fff", padding: "1rem",
                fontFamily: "var(--font-oswald)", textTransform: "uppercase",
                fontSize: "1rem", letterSpacing: "0.1em", textDecoration: "none",
                marginBottom: "0.75rem",
              }}>
              Start With A Free Trial Class
            </Link>
            <Link href="/site"
              style={{
                display: "block", textAlign: "center",
                border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.5)",
                padding: "0.85rem",
                fontFamily: "var(--font-chakra)", textTransform: "uppercase",
                fontSize: "0.7rem", letterSpacing: "0.1em", textDecoration: "none",
              }}>
              Browse All Classes First
            </Link>
          </div>
        )}

        {/* ── NAV BUTTONS ─────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2.5rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={back}
            style={{
              background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.5)", padding: "0.75rem 1.5rem",
              fontFamily: "var(--font-chakra)", fontSize: "0.7rem",
              textTransform: "uppercase", cursor: step > 0 ? "pointer" : "default",
              letterSpacing: "0.1em",
              opacity: step > 0 ? 1 : 0,
            }}>
            ← Back
          </button>

          {step < 4 && (
            <button onClick={next} disabled={!canNext}
              style={{
                background: canNext ? RED : "rgba(255,255,255,0.08)",
                border: "none", color: "#fff", padding: "0.85rem 2.5rem",
                fontFamily: "var(--font-oswald)", fontSize: "1rem",
                textTransform: "uppercase", cursor: canNext ? "pointer" : "not-allowed",
                letterSpacing: "0.1em", opacity: canNext ? 1 : 0.4, transition: "all 0.2s",
              }}>
              {step === 0 ? "Get Started →" : step === 3 ? "See My Plan →" : "Next →"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
