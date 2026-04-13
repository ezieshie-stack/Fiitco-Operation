import Link from "next/link";

const RED = "#D92B2B";
const MINDBODY_URL = "https://www.mindbodyonline.com/explore/deals/fiit-co/intro-offer-10377";

const TRAINERS = [
  {
    name: "Jason Battiste",
    role: "Owner & Founder",
    img: "https://images.pexels.com/photos/1544540/pexels-photo-1544540.jpeg?auto=compress&cs=tinysrgb&w=800",
    bio: "Former Canadian Super Middleweight Kickboxing Champion with more than 35 years of experience in combat training and fitness. Jason built FIIT Co. on the belief that boxing develops the mental resilience people carry out into every area of their lives.",
    tags: ["Counter-Punching", "Kickboxing", "Conditioning"],
  },
  {
    name: "Sarah Green",
    role: "Trainer",
    img: "https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=800",
    bio: "Certified group fitness, kickboxing, TRX, and yoga instructor with nearly 20 years of experience. Sarah brings infectious energy to every class and specialises in making technique accessible to all levels.",
    tags: ["Group Fitness", "TRX", "Kickboxing", "Yoga"],
  },
  {
    name: "Tyrone Warner",
    role: "Yoga Instructor",
    img: "https://images.pexels.com/photos/1153370/pexels-photo-1153370.jpeg?auto=compress&cs=tinysrgb&w=800",
    bio: "Toronto-based yoga instructor blending Hatha, Vinyasa, and Yin traditions. Tyrone's classes emphasise mindfulness, mobility, and strength — the perfect complement to high-intensity boxing training.",
    tags: ["Hatha", "Vinyasa", "Yin", "Mobility"],
  },
  {
    name: "Nick Radionov",
    role: "Boxing Academy Coach",
    img: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=800",
    bio: "Boxing Ontario-certified Level 3 coach and former Ukrainian National Olympic Team member. Two-time World Kickboxing Champion. Nick coaches the FIIT Co. Boxing Academy with authentic competitive methodology.",
    tags: ["Olympic Boxing", "Level 3 Certified", "Competition Prep"],
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

export default function AboutPage() {
  return (
    <div style={{ background: "#000", color: "#fff" }}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{
        minHeight: "60vh", position: "relative",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        background: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.9)), url('https://images.pexels.com/photos/4761779/pexels-photo-4761779.jpeg?auto=compress&cs=tinysrgb&w=1260') center/cover no-repeat",
        padding: "0 4rem 5rem",
      }}>
        <SectionLabel text="Our Story" />
        <h1 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "clamp(3rem, 8vw, 7rem)", textTransform: "uppercase", lineHeight: 0.9, maxWidth: 700 }}>
          MEET THE<br /><span style={{ color: RED }}>FIIT CO</span><br />TEAM
        </h1>
      </section>

      {/* ── MISSION ───────────────────────────────────────────── */}
      <section style={{ padding: "7rem 4rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "start" }}>
        <div>
          <SectionLabel text="Who We Are" />
          <h2 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "clamp(2rem, 3.5vw, 3.5rem)", textTransform: "uppercase", lineHeight: 1, marginBottom: "2rem" }}>
            A COMMUNITY<br />WHERE EVERYONE<br /><span style={{ color: RED }}>THRIVES</span>
          </h2>
        </div>
        <div style={{ paddingTop: "3.5rem" }}>
          <p style={{ fontSize: "1rem", lineHeight: 1.85, color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem" }}>
            FIIT Co. was founded in 2015 by Jason Battiste with a simple mission: combine expert fight training with a dynamic and welcoming environment where every person — regardless of background or fitness level — can grow.
          </p>
          <p style={{ fontSize: "1rem", lineHeight: 1.85, color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem" }}>
            We&apos;re located at the heart of Toronto&apos;s east end. Our 6,000 sq ft facility houses professional-grade heavy bags, a full competition ring, functional training equipment, and recovery facilities.
          </p>
          <p style={{ fontSize: "1rem", lineHeight: 1.85, color: "rgba(255,255,255,0.7)" }}>
            We don&apos;t play boxing — we train boxers. And we believe the discipline, resilience, and confidence you build here follows you into every part of your life.
          </p>
        </div>
      </section>

      {/* ── TRAINERS ──────────────────────────────────────────── */}
      <section style={{ padding: "2rem 4rem 7rem" }}>
        <SectionLabel text="The Team" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "3rem" }}>
          {TRAINERS.map((t) => (
            <div key={t.name} style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "2rem", alignItems: "start" }}>
              <div style={{ aspectRatio: "3/4", overflow: "hidden", background: "#111", flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.img} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1)", display: "block" }} />
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: RED, marginBottom: "0.4rem" }}>{t.role}</p>
                <h3 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "1.8rem", textTransform: "uppercase", lineHeight: 1, marginBottom: "1rem" }}>{t.name}</h3>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.8, color: "rgba(255,255,255,0.6)", marginBottom: "1.25rem" }}>{t.bio}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {t.tags.map((tag) => (
                    <span key={tag} style={{ fontFamily: "var(--font-chakra)", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.1em", border: "1px solid rgba(255,255,255,0.2)", padding: "0.3rem 0.7rem", color: "rgba(255,255,255,0.5)" }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── OUR SPACE ─────────────────────────────────────────── */}
      <section style={{ padding: "7rem 4rem", background: "#0a0a0a" }}>
        <SectionLabel text="Our Space" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "center" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "clamp(2rem, 3.5vw, 3.5rem)", textTransform: "uppercase", lineHeight: 1, marginBottom: "2rem" }}>
              6,000 SQ FT<br />OF SERIOUS<br /><span style={{ color: RED }}>TRAINING SPACE</span>
            </h2>
            <p style={{ fontSize: "0.95rem", lineHeight: 1.85, color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem" }}>
              We built the studio around what serious training actually requires. Professional heavy bags, a custom 18ft competition ring, speed bags, assault bikes, squat racks, and a full ice bath facility.
            </p>
            <p style={{ fontSize: "0.95rem", lineHeight: 1.85, color: "rgba(255,255,255,0.6)" }}>
              Industrial grit meets boutique luxury. Whether you&apos;re a first-timer or a competitive boxer, you&apos;ll find the equipment and space to do the work.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {["HEAVY BAGS (X30)", "SPEED BAGS (X5)", "OLYMPIC SQUAT RACK", "ASSAULT BIKES (X12)", "CUSTOM 18FT RING", "ICE BATH FACILITY"].map((item) => (
              <div key={item} style={{ background: "#1a1a1a", padding: "2.5rem 1rem", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.75)" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section style={{ padding: "7rem 4rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "clamp(2.5rem, 5vw, 5rem)", textTransform: "uppercase", marginBottom: "1rem" }}>
          TRY US OUT<br /><span style={{ color: RED }}>FOR FREE</span>
        </h2>
        <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", marginBottom: "2.5rem" }}>
          First class on us. No commitment.
        </p>
        <a href={MINDBODY_URL} target="_blank" rel="noopener noreferrer" style={{
          display: "inline-block", background: RED, color: "#fff", padding: "1rem 3rem",
          fontFamily: "var(--font-oswald)", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.1em", fontSize: "1rem", textDecoration: "none",
        }}>Book A Free Class ↗</a>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ padding: "4rem", borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <p style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-1px" }}>FIIT<span style={{ color: RED }}>.CO</span></p>
        <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>1047 Gerrard St E, Toronto · (416) 565-9300 · info@fiitco.ca</p>
        <Link href="/site" style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.14em", color: RED, textDecoration: "none" }}>← Back to Home</Link>
      </footer>
    </div>
  );
}
