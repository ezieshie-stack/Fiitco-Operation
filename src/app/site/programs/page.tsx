"use client";
import { useState } from "react";
import Link from "next/link";

const RED = "#D92B2B";
const MINDBODY_URL = "https://www.mindbodyonline.com/explore/deals/fiit-co/intro-offer-10377";

const PROGRAMS = [
  {
    id: "group",
    label: "01",
    title: "Group Training",
    tag: "All Levels",
    desc: "Group fitness classes designed to push your limits and achieve your goals with expert coaching, variety, and community motivation. Our group classes combine boxing technique with functional fitness — every session is different, every session is hard.",
    includes: ["FIIT Endure", "FIIT Hybrid", "FIIT Lift", "FIIT Caveman Circuit"],
    who: "Anyone looking to get fit, build endurance, and train alongside a community.",
  },
  {
    id: "personal",
    label: "02",
    title: "Personal Training",
    tag: "1-on-1",
    desc: "Customized one-on-one training with a dedicated focus on form, technique, mental toughness, and faster results tailored specifically to your individual goals. You get the trainer's full attention, every minute.",
    includes: ["Custom programming", "Form & technique coaching", "Progress tracking", "Flexible scheduling"],
    who: "Anyone who wants accelerated results or has specific performance goals.",
  },
  {
    id: "small-group",
    label: "03",
    title: "Small Group Training",
    tag: "Up to 6",
    desc: "The best of both worlds — individualized instruction combined with group support and energy, at a more accessible price point. Maximum 6 participants means the coach knows your name and your goals.",
    includes: ["Semi-private coaching", "Customized programming", "Group energy", "Individual attention"],
    who: "Those who want more coaching than a group class but prefer training with others.",
  },
  {
    id: "academy",
    label: "04",
    title: "Boxing Academy",
    tag: "3-Tier Programme",
    desc: "FIIT Co.'s signature structured boxing programme. Three progressive tiers take you from absolute beginner to competitive boxer with authentic pugilist methodology under Olympic-certified coaching.",
    includes: ["Level 1 — Foundation & fundamentals", "Level 2 — Technical sparring & ring intelligence", "Level 3 — Competition prep for registered boxers"],
    who: "Anyone serious about learning to box properly — from beginners to competitive athletes.",
  },
  {
    id: "kids",
    label: "05",
    title: "Kids & Teens",
    tag: "Ages 12–17",
    desc: "Youth boxing programme emphasising confidence building, discipline, physical fitness, and respect in an engaging, structured environment. Coached by Nick Radionov, former Olympic Team member.",
    includes: ["Boxing fundamentals", "Discipline & focus training", "Fitness conditioning", "Safe sparring (teens)"],
    who: "Youth ages 12–17 looking to build confidence, fitness, and focus.",
  },
  {
    id: "team",
    label: "06",
    title: "Sports Team Training",
    tag: "Teams",
    desc: "Customized athletic conditioning programmes designed for sports teams. Advanced techniques and performance monitoring tailored to your team's specific sport and goals.",
    includes: ["Team-specific conditioning", "Advanced athletic techniques", "Performance monitoring", "Flexible group scheduling"],
    who: "Sports teams and athletic groups looking for expert cross-training.",
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

export default function ProgramsPage() {
  const [guestOpen, setGuestOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);

  return (
    <div style={{ background: "#000", color: "#fff" }}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{
        minHeight: "50vh", position: "relative",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        background: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.92)), url('https://images.pexels.com/photos/4761779/pexels-photo-4761779.jpeg?auto=compress&cs=tinysrgb&w=1260') center/cover no-repeat",
        padding: "0 4rem 5rem",
      }}>
        <SectionLabel text="What We Offer" />
        <h1 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "clamp(3rem, 8vw, 7rem)", textTransform: "uppercase", lineHeight: 0.9 }}>
          OUR<br /><span style={{ color: RED }}>PROGRAMS</span>
        </h1>
      </section>

      {/* ── PROGRAMS GRID ─────────────────────────────────────── */}
      <section style={{ padding: "7rem 4rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "2rem" }}>
          {PROGRAMS.map(({ id, label, title, tag, desc, includes, who }) => (
            <div key={id} style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "3rem 2.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.2em", color: RED }}>{label}</span>
                <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", border: "1px solid rgba(255,255,255,0.2)", padding: "0.25rem 0.6rem", color: "rgba(255,255,255,0.5)" }}>{tag}</span>
              </div>
              <h2 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)", textTransform: "uppercase", lineHeight: 1, marginBottom: "1.25rem" }}>{title}</h2>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.8, color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem" }}>{desc}</p>

              <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: RED, marginBottom: "0.75rem" }}>Includes</p>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: "1.5rem" }}>
                {includes.map((item) => (
                  <li key={item} style={{ fontSize: "0.825rem", color: "rgba(255,255,255,0.55)", paddingBottom: "0.4rem", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: "0.4rem" }}>
                    <span style={{ color: RED, marginRight: "0.5rem" }}>—</span>{item}
                  </li>
                ))}
              </ul>

              <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", marginBottom: "0.5rem" }}>Ideal For</p>
              <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: "2rem" }}>{who}</p>

              <a href={MINDBODY_URL} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-block", background: RED, color: "#fff", padding: "0.8rem 1.75rem",
                fontFamily: "var(--font-oswald)", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.1em", fontSize: "0.8rem", textDecoration: "none",
              }}>Book Now ↗</a>
            </div>
          ))}
        </div>
      </section>

      {/* ── REFER / GUEST CTA BAR ─────────────────────────────── */}
      <section style={{ padding: "5rem 4rem", background: "#0a0a0a", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div style={{ border: `1px solid ${RED}`, padding: "3rem 2.5rem" }}>
          <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: RED, marginBottom: "0.75rem" }}>Member Benefit</p>
          <h3 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "1.8rem", textTransform: "uppercase", marginBottom: "0.75rem" }}>BRING A GUEST</h3>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "1.75rem" }}>Members get up to 2 guest passes per month. Submit online and have your guest give their name at the front desk.</p>
          <button onClick={() => setGuestOpen(true)} style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", cursor: "pointer", padding: "0.85rem 1.75rem", fontFamily: "var(--font-oswald)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.85rem" }}>
            Submit Guest Pass
          </button>
        </div>
        <div style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "3rem 2.5rem" }}>
          <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: RED, marginBottom: "0.75rem" }}>Referral Reward</p>
          <h3 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "1.8rem", textTransform: "uppercase", marginBottom: "0.75rem" }}>REFER A CONTENDER</h3>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "1.75rem" }}>Get 50% off your next month for every friend you refer who signs up. No limit on referrals.</p>
          <button onClick={() => setReferralOpen(true)} style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", cursor: "pointer", padding: "0.85rem 1.75rem", fontFamily: "var(--font-oswald)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.85rem" }}>
            Submit a Referral
          </button>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ padding: "4rem", borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <p style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-1px" }}>FIIT<span style={{ color: RED }}>.CO</span></p>
        <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>1047 Gerrard St E, Toronto · (416) 565-9300</p>
        <Link href="/site" style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.14em", color: RED, textDecoration: "none" }}>← Back to Home</Link>
      </footer>

      {guestOpen    && <GuestPassModal onClose={() => setGuestOpen(false)} />}
      {referralOpen && <ReferralModal  onClose={() => setReferralOpen(false)} />}
    </div>
  );
}

function ModalShell({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#111", borderTop: `4px solid ${RED}`, width: "100%", maxWidth: 480, padding: "2.5rem", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "1.25rem", cursor: "pointer" }}>✕</button>
        <h2 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "1.8rem", textTransform: "uppercase", marginBottom: "0.4rem" }}>{title}</h2>
        <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.45)", marginBottom: "2rem" }}>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <label style={{ display: "block", fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: "#000", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "0.75rem 1rem", fontFamily: "var(--font-inter)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
        onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = RED; }}
        onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.15)"; }}
      />
    </div>
  );
}

function GuestPassModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ memberFirst: "", memberPhone: "", guestFirst: "", guestPhone: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.memberFirst || !form.memberPhone || !form.guestFirst || !form.guestPhone) { setMessage("Please fill in all fields."); setStatus("error"); return; }
    setStatus("loading");
    try {
      const res = await fetch("/api/guest-passes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberFirstName: form.memberFirst, memberPhone: form.memberPhone, guestFirstName: form.guestFirst, guestPhone: form.guestPhone }) });
      const data = await res.json();
      if (data.success) { setStatus("success"); setMessage(`Guest pass for ${form.guestFirst} submitted! Have them give their name at the front desk on arrival.`); }
      else { setStatus("error"); setMessage(data.message || "Something went wrong."); }
    } catch { setStatus("error"); setMessage("Network error. Please try again."); }
  }
  return (
    <ModalShell title="Guest Pass" subtitle="Members get up to 2 guest passes per month" onClose={onClose}>
      {status === "success" ? (
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
          <p style={{ fontFamily: "var(--font-oswald)", fontSize: "1.2rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.75rem" }}>Guest Pass Submitted!</p>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: RED, marginBottom: "1rem" }}>Member Info</p>
          <FormField label="Your First Name" value={form.memberFirst} onChange={(v) => setForm(f => ({ ...f, memberFirst: v }))} placeholder="Jason" />
          <FormField label="Your Phone Number" value={form.memberPhone} onChange={(v) => setForm(f => ({ ...f, memberPhone: v }))} placeholder="(416) 555-0100" type="tel" />
          <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: RED, margin: "1.5rem 0 1rem" }}>Guest Info</p>
          <FormField label="Guest's First Name" value={form.guestFirst} onChange={(v) => setForm(f => ({ ...f, guestFirst: v }))} placeholder="Mike" />
          <FormField label="Guest's Phone Number" value={form.guestPhone} onChange={(v) => setForm(f => ({ ...f, guestPhone: v }))} placeholder="(416) 555-0200" type="tel" />
          {status === "error" && <p style={{ color: RED, fontSize: "0.8rem", marginBottom: "1rem" }}>{message}</p>}
          <button type="submit" disabled={status === "loading"} style={{ width: "100%", background: RED, color: "#fff", border: "none", cursor: "pointer", padding: "1rem", fontFamily: "var(--font-oswald)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.9rem", opacity: status === "loading" ? 0.6 : 1 }}>
            {status === "loading" ? "Submitting..." : "Submit Guest Pass"}
          </button>
        </form>
      )}
    </ModalShell>
  );
}

function ReferralModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ refFirst: "", refPhone: "", friendFirst: "", friendPhone: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.refFirst || !form.refPhone || !form.friendFirst || !form.friendPhone) { setMessage("Please fill in all fields."); setStatus("error"); return; }
    setStatus("loading");
    try {
      const res = await fetch("/api/referrals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ referrerFirstName: form.refFirst, referrerPhone: form.refPhone, friendFirstName: form.friendFirst, friendPhone: form.friendPhone }) });
      const data = await res.json();
      if (data.success) { setStatus("success"); setMessage(`Your referral for ${form.friendFirst} has been submitted!`); }
      else { setStatus("error"); setMessage(data.message || "Something went wrong."); }
    } catch { setStatus("error"); setMessage("Network error. Please try again."); }
  }
  return (
    <ModalShell title="Refer a Contender" subtitle="50% off your next month for every referral that signs up" onClose={onClose}>
      {status === "success" ? (
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
          <p style={{ fontFamily: "var(--font-oswald)", fontSize: "1.2rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.75rem" }}>Referral Submitted!</p>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: RED, marginBottom: "1rem" }}>Your Info</p>
          <FormField label="Your First Name" value={form.refFirst} onChange={(v) => setForm(f => ({ ...f, refFirst: v }))} placeholder="Jason" />
          <FormField label="Your Phone Number" value={form.refPhone} onChange={(v) => setForm(f => ({ ...f, refPhone: v }))} placeholder="(416) 555-0100" type="tel" />
          <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: RED, margin: "1.5rem 0 1rem" }}>Friend&apos;s Info</p>
          <FormField label="Friend's First Name" value={form.friendFirst} onChange={(v) => setForm(f => ({ ...f, friendFirst: v }))} placeholder="Mike" />
          <FormField label="Friend's Phone Number" value={form.friendPhone} onChange={(v) => setForm(f => ({ ...f, friendPhone: v }))} placeholder="(416) 555-0200" type="tel" />
          {status === "error" && <p style={{ color: RED, fontSize: "0.8rem", marginBottom: "1rem" }}>{message}</p>}
          <button type="submit" disabled={status === "loading"} style={{ width: "100%", background: RED, color: "#fff", border: "none", cursor: "pointer", padding: "1rem", fontFamily: "var(--font-oswald)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.9rem", opacity: status === "loading" ? 0.6 : 1 }}>
            {status === "loading" ? "Submitting..." : "Submit Referral"}
          </button>
        </form>
      )}
    </ModalShell>
  );
}
