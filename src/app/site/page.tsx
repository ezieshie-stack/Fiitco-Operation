"use client";
import { useState } from "react";
import Link from "next/link";

const RED = "#D92B2B";
const MINDBODY_URL = "https://www.mindbodyonline.com/explore/deals/fiit-co/intro-offer-10377";

const TRAINERS = [
  { name: "Jason Battiste", role: "Owner & Founder",   img: "https://images.pexels.com/photos/1544540/pexels-photo-1544540.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { name: "Sarah Green",    role: "Trainer",            img: "https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { name: "Tyrone Warner",  role: "Yoga Instructor",    img: "https://images.pexels.com/photos/1153370/pexels-photo-1153370.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { name: "Nick Radionov",  role: "Boxing Academy Coach", img: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=800" },
];

const PROGRAMS = [
  { title: "Group Training",        desc: "Expert coaching, variety, and community motivation. Every session designed to push past your threshold." },
  { title: "Boxing Academy",        desc: "Three-tier structured programme. Foundation → Development → Competition. Authentic technique from day one." },
  { title: "Kids & Teens",          desc: "Youth boxing ages 12–17. Building confidence, discipline, and fitness in an engaging environment." },
];

const EQUIPMENT = [
  "HEAVY BAGS (X30)", "SPEED BAGS (X5)",
  "OLYMPIC SQUAT RACK", "ASSAULT BIKES (X12)",
  "CUSTOM 18FT RING", "ICE BATH FACILITY",
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

export default function SitePage() {
  const [referralOpen, setReferralOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);

  return (
    <div style={{ background: "#000", color: "#fff" }}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh", position: "relative",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        background: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.85)), url('https://images.pexels.com/photos/4761779/pexels-photo-4761779.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2') center/cover no-repeat",
        textAlign: "center", padding: "0 2rem",
      }}>
        <span style={{
          position: "absolute", fontFamily: "var(--font-oswald)", fontSize: "22vw",
          color: "rgba(255,255,255,0.025)", whiteSpace: "nowrap",
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          pointerEvents: "none", userSelect: "none",
        }}>BOXING</span>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 900 }}>
          <SectionLabel text="Est. 2015 · Toronto" />
          <h1 style={{
            fontFamily: "var(--font-oswald)", fontWeight: 700,
            fontSize: "clamp(4.5rem, 12vw, 11rem)",
            lineHeight: 0.85, textTransform: "uppercase", marginBottom: "2.5rem",
          }}>
            YOU&apos;RE<br />WORTH<br />THE FIGHT
          </h1>
          <div style={{ display: "flex", gap: "1.25rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href={MINDBODY_URL} target="_blank" rel="noopener noreferrer" style={{
              background: RED, color: "#fff", padding: "1rem 2.5rem",
              fontFamily: "var(--font-oswald)", fontWeight: 700,
              fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.12em",
              textDecoration: "none",
            }}>Book A Free Class ↗</a>
            <Link href="/site/programs" style={{
              border: "1px solid rgba(255,255,255,0.6)", color: "#fff", padding: "1rem 2.5rem",
              fontFamily: "var(--font-oswald)", fontWeight: 700,
              fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.12em",
              textDecoration: "none",
            }}>View Programs</Link>
          </div>
        </div>
      </section>

      {/* ── INFO BAR ──────────────────────────────────────────── */}
      <div style={{
        display: "flex", flexWrap: "wrap", justifyContent: "space-between",
        padding: "1.1rem 4rem", background: "#111",
        borderTop: `2px solid ${RED}`,
        fontFamily: "var(--font-chakra)", fontSize: "0.7rem",
        textTransform: "uppercase", letterSpacing: "0.1em", gap: "1rem",
      }}>
        {[
          ["LOC:", "1047 Gerrard St E, Toronto"],
          ["PH:", "(416) 565-9300"],
          ["HOURS:", "Mon/Wed–Fri 6AM–9PM · Tue/Sat–Sun 8AM–5PM"],
        ].map(([label, val]) => (
          <span key={label}><span style={{ color: RED, marginRight: 8 }}>{label}</span>{val}</span>
        ))}
      </div>

      {/* ── TRAINERS ──────────────────────────────────────────── */}
      <section style={{ padding: "7rem 4rem 6rem" }}>
        <SectionLabel text="Elite Personnel" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
          {TRAINERS.map((t) => (
            <Link key={t.name} href="/site/about" style={{ textDecoration: "none", color: "#fff" }}>
              <div
                onMouseEnter={(e) => {
                  const img = (e.currentTarget as HTMLDivElement).querySelector("img") as HTMLImageElement;
                  if (img) { img.style.transform = "scale(1.05)"; img.style.filter = "grayscale(0)"; }
                }}
                onMouseLeave={(e) => {
                  const img = (e.currentTarget as HTMLDivElement).querySelector("img") as HTMLImageElement;
                  if (img) { img.style.transform = "scale(1)"; img.style.filter = "grayscale(1)"; }
                }}
              >
                <div style={{ aspectRatio: "3/4", overflow: "hidden", background: "#111" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.img} alt={t.name} style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    filter: "grayscale(1)", transition: "transform 0.5s ease, filter 0.5s ease",
                    display: "block",
                  }} />
                </div>
                <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.85)", marginTop: "0.75rem" }}>{t.name}</p>
                <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em", color: RED, marginTop: "0.2rem" }}>{t.role}</p>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: "2rem" }}>
          <Link href="/site/about" style={{
            fontFamily: "var(--font-chakra)", fontSize: "0.7rem", textTransform: "uppercase",
            letterSpacing: "0.14em", color: RED, textDecoration: "none",
            borderBottom: `1px solid ${RED}`, paddingBottom: "2px",
          }}>Meet The Full Team →</Link>
        </div>
      </section>

      {/* ── THREE PILLARS ─────────────────────────────────────── */}
      <section style={{ padding: "8rem 4rem", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "5rem" }}>
        {[
          { n: "01", title: "THE TRAINING", body: "Authentic pugilist methodology meets high-science interval training. We don't play boxing — we train boxers. Every session is designed to push past your threshold." },
          { n: "02", title: "THE SPACE",    body: "Our 6,000 sq ft facility features professional-grade bags, a competition ring, and recovery equipment. Industrial grit meets boutique luxury." },
          { n: "03", title: "THE COMMUNITY", body: "Founded on mutual respect and unrelenting effort. No egos allowed. We fight together, we grow together. Join the Toronto FIIT collective." },
        ].map(({ n, title, body }) => (
          <div key={n}>
            <SectionLabel text={n} />
            <h3 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "clamp(1.8rem, 2.8vw, 3rem)", textTransform: "uppercase", color: RED, lineHeight: 1, marginBottom: "1.5rem" }}>{title}</h3>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.8, color: "rgba(255,255,255,0.6)" }}>{body}</p>
          </div>
        ))}
      </section>

      {/* ── PROGRAMS TEASER ───────────────────────────────────── */}
      <section style={{ padding: "7rem 4rem", background: "#0a0a0a" }}>
        <SectionLabel text="What We Offer" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
          {PROGRAMS.map(({ title, desc }) => (
            <div key={title} style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "2.5rem 2rem" }}>
              <h3 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "1.5rem", textTransform: "uppercase", marginBottom: "1rem" }}>{title}</h3>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.75, color: "rgba(255,255,255,0.55)", marginBottom: "1.5rem" }}>{desc}</p>
              <a href={MINDBODY_URL} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase",
                letterSpacing: "0.14em", color: RED, textDecoration: "none",
                borderBottom: `1px solid ${RED}`, paddingBottom: "2px",
              }}>Book Now ↗</a>
            </div>
          ))}
        </div>
        <Link href="/site/programs" style={{
          display: "inline-block", border: "1px solid rgba(255,255,255,0.3)", color: "#fff",
          padding: "0.85rem 2rem", fontFamily: "var(--font-oswald)", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.85rem", textDecoration: "none",
        }}>View All Programs</Link>
      </section>

      {/* ── REFER A CONTENDER ─────────────────────────────────── */}
      <div style={{ background: RED, padding: "5rem 4rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "clamp(3rem, 7vw, 6.5rem)", textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "1rem" }}>
          REFER A CONTENDER
        </h2>
        <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.9)", marginBottom: "2rem" }}>
          GET 50% OFF YOUR NEXT MONTH FOR EVERY REFERRAL THAT SIGNS UP.
        </p>
        <button onClick={() => setReferralOpen(true)} style={{
          background: "#000", color: "#fff", border: "none", cursor: "pointer",
          padding: "1rem 2.5rem", fontFamily: "var(--font-oswald)", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.9rem",
          transition: "opacity 0.2s",
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.8"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
        >Submit a Referral</button>
      </div>

      {/* ── STUDIO CREDITS ────────────────────────────────────── */}
      <section style={{ padding: "7rem 4rem" }}>
        <SectionLabel text="Studio Credits" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          {[50, 100, 250, 500].map((amount) => (
            <a key={amount} href={MINDBODY_URL} target="_blank" rel="noopener noreferrer"
              style={{ textDecoration: "none", display: "block", border: "1px solid rgba(255,255,255,0.2)", padding: "3.5rem 2rem", textAlign: "center", transition: "border-color 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = RED; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.2)"; }}
            >
              <p style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "clamp(2.5rem, 4vw, 4rem)", marginBottom: "0.5rem", color: "#fff" }}>${amount}</p>
              <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)" }}>Digital Gift</p>
            </a>
          ))}
        </div>
      </section>

      {/* ── GUEST PASS CTA ────────────────────────────────────── */}
      <section style={{ padding: "4rem", background: "#0a0a0a", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
        <div>
          <p style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "clamp(1.5rem, 3vw, 2.5rem)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            BRING A GUEST
          </p>
          <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)" }}>
            Members get up to 2 guest passes per month
          </p>
        </div>
        <button onClick={() => setGuestOpen(true)} style={{
          background: "transparent", color: "#fff", border: `1px solid rgba(255,255,255,0.4)`,
          cursor: "pointer", padding: "0.9rem 2rem",
          fontFamily: "var(--font-oswald)", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.85rem",
          transition: "border-color 0.2s, color 0.2s",
        }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = RED; el.style.color = RED; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = "rgba(255,255,255,0.4)"; el.style.color = "#fff"; }}
        >Submit Guest Pass</button>
      </section>

      {/* ── FOUNDRY ───────────────────────────────────────────── */}
      <section style={{ padding: "7rem 4rem" }}>
        <SectionLabel text="Foundry" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "start" }}>
          <div>
            <span style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "8rem", color: RED, lineHeight: 0.6, display: "block", marginBottom: "1rem", userSelect: "none" }}>&ldquo;</span>
            <blockquote style={{ margin: 0, fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "clamp(1.6rem, 2.6vw, 2.6rem)", lineHeight: 1.2, color: "#fff" }}>
              &ldquo;We built FIIT Co. because boxing shouldn&apos;t just be about the ring. It&apos;s about the mental resilience you take out into the streets of Toronto.&rdquo;
            </blockquote>
            <cite style={{ display: "block", marginTop: "1.75rem", fontFamily: "var(--font-chakra)", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", fontStyle: "normal", letterSpacing: "0.04em" }}>
              – Jason Battiste, Founder
            </cite>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {EQUIPMENT.map((item) => (
              <div key={item} style={{ background: "#1a1a1a", padding: "2.75rem 1rem", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.75)" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ padding: "5rem 4rem", borderTop: "1px solid #1a1a1a", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "3rem" }}>
        <div>
          <p style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "2rem", letterSpacing: "-1px" }}>FIIT<span style={{ color: RED }}>.CO</span></p>
          <p style={{ marginTop: "1rem", color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", lineHeight: 1.75 }}>The ultimate boutique boxing destination in downtown Toronto. Est. 2015.</p>
        </div>
        {[
          { head: "EXPLORE",  links: [{ l: "About",    h: "/site/about" }, { l: "Programs", h: "/site/programs" }, { l: "Studio",   h: "/site/studio" }, { l: "Blog",     h: "/site/blog" }] },
          { head: "SUPPORT",  links: [{ l: "FAQ", h: "/site" }, { l: "Contact Us", h: "/site" }, { l: "Privacy Policy", h: "/site" }] },
          { head: "CONNECT",  links: [{ l: "Instagram", h: "https://instagram.com/fiitco.to" }, { l: "Facebook", h: "/site" }, { l: "Yelp", h: "/site" }] },
        ].map(({ head, links }) => (
          <div key={head}>
            <p style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, textTransform: "uppercase", fontSize: "0.95rem", color: RED, letterSpacing: "0.06em", marginBottom: "1.5rem" }}>{head}</p>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {links.map(({ l, h }) => (
                <li key={l} style={{ marginBottom: "0.75rem" }}>
                  <Link href={h} style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>{l}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </footer>

      {/* ── MODALS ────────────────────────────────────────────── */}
      {referralOpen && <ReferralModal onClose={() => setReferralOpen(false)} />}
      {guestOpen    && <GuestPassModal onClose={() => setGuestOpen(false)} />}
    </div>
  );
}

// ── Inline modal components ───────────────────────────────────────────────────

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
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{
        width: "100%", background: "#000", border: "1px solid rgba(255,255,255,0.15)", color: "#fff",
        padding: "0.75rem 1rem", fontFamily: "var(--font-inter)", fontSize: "0.9rem", outline: "none",
        boxSizing: "border-box",
      }}
        onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = RED; }}
        onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.15)"; }}
      />
    </div>
  );
}

function ReferralModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ refFirst: "", refPhone: "", friendFirst: "", friendPhone: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.refFirst || !form.refPhone || !form.friendFirst || !form.friendPhone) {
      setMessage("Please fill in all fields."); setStatus("error"); return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrerFirstName: form.refFirst, referrerPhone: form.refPhone, friendFirstName: form.friendFirst, friendPhone: form.friendPhone }),
      });
      const data = await res.json();
      if (data.success) { setStatus("success"); setMessage(`Your referral for ${form.friendFirst} has been submitted. When they sign up, you'll receive your 50% discount automatically.`); }
      else { setStatus("error"); setMessage(data.message || "Something went wrong. Please try again."); }
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
          <button type="submit" disabled={status === "loading"} style={{
            width: "100%", background: RED, color: "#fff", border: "none", cursor: "pointer",
            padding: "1rem", fontFamily: "var(--font-oswald)", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.9rem",
            opacity: status === "loading" ? 0.6 : 1,
          }}>{status === "loading" ? "Submitting..." : "Submit Referral"}</button>
        </form>
      )}
    </ModalShell>
  );
}

function GuestPassModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ memberFirst: "", memberPhone: "", guestFirst: "", guestPhone: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.memberFirst || !form.memberPhone || !form.guestFirst || !form.guestPhone) {
      setMessage("Please fill in all fields."); setStatus("error"); return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/guest-passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberFirstName: form.memberFirst, memberPhone: form.memberPhone, guestFirstName: form.guestFirst, guestPhone: form.guestPhone }),
      });
      const data = await res.json();
      if (data.success) { setStatus("success"); setMessage(`Guest pass for ${form.guestFirst} submitted! Have them give their name at the front desk on arrival.`); }
      else { setStatus("error"); setMessage(data.message || "Something went wrong. Please try again."); }
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
          <button type="submit" disabled={status === "loading"} style={{
            width: "100%", background: RED, color: "#fff", border: "none", cursor: "pointer",
            padding: "1rem", fontFamily: "var(--font-oswald)", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.9rem",
            opacity: status === "loading" ? 0.6 : 1,
          }}>{status === "loading" ? "Submitting..." : "Submit Guest Pass"}</button>
        </form>
      )}
    </ModalShell>
  );
}
