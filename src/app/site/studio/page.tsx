import Link from "next/link";

const RED = "#D92B2B";
const MINDBODY_URL = "https://www.mindbodyonline.com/explore/deals/fiit-co/intro-offer-10377";

const CLASSES = [
  { name: "FIIT Endure",          desc: "Interval training focused on stamina and cardiovascular endurance. High-intensity rounds on the bags and floor." },
  { name: "FIIT Hybrid",          desc: "Boxing technique combined with functional training stations. The best of both worlds in one session." },
  { name: "FIIT Lift",            desc: "Strength and muscle building through compound lifts and boxing-specific conditioning." },
  { name: "FIIT Caveman Circuit", desc: "Primal, raw, full-body circuit training. No machines. Just effort." },
  { name: "Boxing Pad Work",      desc: "Develop real boxing technique with mitts and pad work under trainer supervision." },
  { name: "Muay Thai Kickboxing", desc: "Strike with hands, elbows, knees, and kicks. Full-body combat conditioning." },
  { name: "Yin Yoga",             desc: "Deep stretching and mindfulness. The essential recovery complement to hard training." },
  { name: "Boxing Academy",       desc: "Structured 3-level programme from foundation to competition. Coaches by Nick Radionov." },
  { name: "Teens Boxing",         desc: "Youth programme for ages 12–17. Discipline, confidence, and fitness in a safe environment." },
];

const PRICING = [
  { pass: "2-Week Trial",           price: "$49.99",   note: "Unlimited classes",    highlight: true },
  { pass: "5 Class Pass",           price: "$125",     note: "Expires in 2 months",  highlight: false },
  { pass: "10 Class Pass",          price: "$239",     note: "Expires in 4 months",  highlight: false },
  { pass: "20 Class Pass",          price: "$425",     note: "Expires in 6 months",  highlight: false },
  { pass: "Monthly Unlimited",      price: "$179/mo",  note: "Best value",           highlight: false },
  { pass: "Boxing Academy 5-Pack",  price: "$135",     note: "Expires in 2 months",  highlight: false },
  { pass: "Boxing Academy 10-Pack", price: "$220",     note: "Expires in 3 months",  highlight: false },
  { pass: "Boxing Academy 20-Pack", price: "$400",     note: "Expires in 6 months",  highlight: false },
];

const HOURS = [
  { days: "Monday",             time: "6:00 AM – 9:00 PM" },
  { days: "Tuesday",            time: "8:00 AM – 5:00 PM" },
  { days: "Wednesday",          time: "6:00 AM – 9:00 PM" },
  { days: "Thursday",           time: "6:00 AM – 9:00 PM" },
  { days: "Friday",             time: "6:00 AM – 9:00 PM" },
  { days: "Saturday",           time: "8:00 AM – 5:00 PM" },
  { days: "Sunday",             time: "8:00 AM – 5:00 PM" },
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

export default function StudioPage() {
  return (
    <div style={{ background: "#000", color: "#fff" }}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{
        minHeight: "55vh", position: "relative",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        background: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.92)), url('https://images.pexels.com/photos/4761779/pexels-photo-4761779.jpeg?auto=compress&cs=tinysrgb&w=1260') center/cover no-repeat",
        padding: "0 4rem 5rem",
      }}>
        <SectionLabel text="The Space" />
        <h1 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "clamp(3rem, 8vw, 7rem)", textTransform: "uppercase", lineHeight: 0.9 }}>
          STUDIO<br /><span style={{ color: RED }}>INFO</span>
        </h1>
      </section>

      {/* ── CLASSES ───────────────────────────────────────────── */}
      <section style={{ padding: "7rem 4rem" }}>
        <SectionLabel text="Classes" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
          {CLASSES.map(({ name, desc }) => (
            <div key={name} style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", padding: "2rem 1.75rem" }}>
              <h3 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "1.2rem", textTransform: "uppercase", marginBottom: "0.75rem" }}>{name}</h3>
              <p style={{ fontSize: "0.825rem", lineHeight: 1.75, color: "rgba(255,255,255,0.5)" }}>{desc}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "2.5rem" }}>
          <a href={MINDBODY_URL} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-block", background: RED, color: "#fff", padding: "0.9rem 2rem",
            fontFamily: "var(--font-oswald)", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.1em", fontSize: "0.85rem", textDecoration: "none",
          }}>View Full Schedule ↗</a>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────── */}
      <section style={{ padding: "7rem 4rem", background: "#0a0a0a" }}>
        <SectionLabel text="Investment" />
        <h2 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 4rem)", textTransform: "uppercase", marginBottom: "3rem" }}>
          PRICING
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
          {PRICING.map(({ pass, price, note, highlight }) => (
            <div key={pass} style={{
              border: `${highlight ? "2px" : "1px"} solid ${highlight ? RED : "rgba(255,255,255,0.12)"}`,
              padding: "2rem 1.5rem",
              background: highlight ? "rgba(217,43,43,0.06)" : "transparent",
              textAlign: "center",
            }}>
              {highlight && <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.2em", color: RED, marginBottom: "0.75rem" }}>Best Way to Start</p>}
              <p style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)", marginBottom: "0.4rem" }}>{price}</p>
              <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.85)", marginBottom: "0.5rem" }}>{pass}</p>
              <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" }}>{note}</p>
            </div>
          ))}
        </div>
        <a href={MINDBODY_URL} target="_blank" rel="noopener noreferrer" style={{
          display: "inline-block", background: RED, color: "#fff", padding: "0.9rem 2rem",
          fontFamily: "var(--font-oswald)", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.1em", fontSize: "0.85rem", textDecoration: "none",
        }}>Purchase a Pass ↗</a>
      </section>

      {/* ── HOURS + LOCATION ──────────────────────────────────── */}
      <section style={{ padding: "7rem 4rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem" }}>
        <div>
          <SectionLabel text="Hours" />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {HOURS.map(({ days, time }) => (
                <tr key={days} style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <td style={{ padding: "0.9rem 0", fontFamily: "var(--font-chakra)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.55)" }}>{days}</td>
                  <td style={{ padding: "0.9rem 0", fontFamily: "var(--font-chakra)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#fff", textAlign: "right" }}>{time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <SectionLabel text="Location" />
          <h3 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "2rem", textTransform: "uppercase", lineHeight: 1.1, marginBottom: "1.5rem" }}>
            1047 GERRARD ST E<br />TORONTO, ON
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              ["Phone", "(416) 565-9300"],
              ["Email", "info@fiitco.ca"],
              ["Neighbourhood", "Leslieville, East Toronto"],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", gap: "1.5rem" }}>
                <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: RED, minWidth: 80 }}>{label}</span>
                <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.65)" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ padding: "4rem", borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <p style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-1px" }}>FIIT<span style={{ color: RED }}>.CO</span></p>
        <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>1047 Gerrard St E, Toronto · (416) 565-9300</p>
        <Link href="/site" style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.14em", color: RED, textDecoration: "none" }}>← Back to Home</Link>
      </footer>
    </div>
  );
}
