import Link from "next/link";
import styles from "../site.module.css";

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

const EQUIPMENT = [
  "Heavy Bags (×30)", "Speed Bags (×5)", "Olympic Squat Rack",
  "Assault Bikes (×12)", "Custom 18ft Ring", "Ice Bath Facility",
];

export default function AboutPage() {
  return (
    <main>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <p className={styles.label}>Our Story</p>
        <h1 className={styles.headlineXl}>
          THE PEOPLE<br />BEHIND THE<br />
          <span className={styles.accent}>GLOVES.</span>
        </h1>
        <div className={styles.heroBottom}>
          <p className={styles.heroAddress}>Founded 2015 &nbsp;·&nbsp; Leslieville, Toronto</p>
          <a href={MINDBODY_URL} target="_blank" rel="noopener noreferrer" className={styles.btnRed}>
            Book Free Class ↗
          </a>
        </div>
      </section>

      {/* ── MISSION ────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.twoColGrid}>
            <div>
              <p className={styles.label}>Who We Are</p>
              <h2 className={styles.headlineLg}>
                A COMMUNITY<br />WHERE EVERYONE<br />
                <span className={styles.accent}>THRIVES.</span>
              </h2>
            </div>
            <div style={{ paddingTop: "3rem" }}>
              <p className={styles.body} style={{ marginBottom: "1.5rem" }}>
                FIIT Co. was founded in 2015 by Jason Battiste with a simple mission: combine expert fight training with a dynamic and welcoming environment where every person — regardless of background or fitness level — can grow.
              </p>
              <p className={styles.body} style={{ marginBottom: "1.5rem" }}>
                We&apos;re located at the heart of Toronto&apos;s east end. Our 6,000 sq ft facility houses professional-grade heavy bags, a full competition ring, functional training equipment, and dedicated recovery facilities.
              </p>
              <p className={styles.body}>
                We don&apos;t play boxing — we train boxers. The discipline, resilience, and confidence you build here follows you into every part of your life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ───────────────────────────────────────────────────── */}
      <section className={styles.sectionDark}>
        <div className={styles.container}>
          <p className={styles.label}>The Team</p>
          <div className={styles.teamGrid}>
            {TRAINERS.map((t) => (
              <div key={t.name} className={styles.trainerCard}>
                <div className={styles.trainerImg}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.img} alt={t.name} />
                </div>
                <p className={styles.trainerRole}>{t.role}</p>
                <h3 className={styles.trainerName}>{t.name}</h3>
                <p className={styles.trainerBio}>{t.bio}</p>
                <div className={styles.trainerTags}>
                  {t.tags.map((tag) => <span key={tag} className={styles.tag}>{tag}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR SPACE ──────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.twoColGrid}>
            <div>
              <p className={styles.label}>Our Space</p>
              <h2 className={styles.headlineLg}>
                6,000 SQ FT<br />OF SERIOUS<br />
                <span className={styles.accent}>TRAINING.</span>
              </h2>
              <p className={styles.body} style={{ marginTop: "2rem", marginBottom: "1.25rem" }}>
                We built the studio around what serious training actually requires. Professional heavy bags, a custom 18ft competition ring, speed bags, assault bikes, squat racks, and a full ice bath facility.
              </p>
              <p className={styles.body}>
                Industrial grit meets boutique quality. Whether you&apos;re a first-timer or a competitive boxer, you&apos;ll have everything you need to do the work.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "rgba(255,255,255,0.07)", alignSelf: "start" }}>
              {EQUIPMENT.map((item) => (
                <div key={item} style={{ background: "#000", padding: "2.25rem 1.5rem", display: "flex", alignItems: "center" }}>
                  <p className={styles.statLabel} style={{ lineHeight: 1.5 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FREE CLASS CTA ─────────────────────────────────────────── */}
      <section className={styles.sectionDark}>
        <div className={styles.container} style={{ textAlign: "center" }}>
          <p className={styles.label} style={{ justifyContent: "center" }}>Get Started</p>
          <h2 className={styles.headlineLg} style={{ marginBottom: "1rem" }}>
            FIRST CLASS<br /><span className={styles.accent}>ON US.</span>
          </h2>
          <p className={styles.body} style={{ maxWidth: 480, margin: "0 auto 2.5rem" }}>
            No commitment, no pressure. Come in, try a class, and see if FIIT Co. is for you.
          </p>
          <a href={MINDBODY_URL} target="_blank" rel="noopener noreferrer" className={styles.btnRed}>
            Book a Free Class ↗
          </a>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <p className={styles.footerLogo}>FIIT<span className={styles.accent}>.CO</span></p>
        <p className={styles.footerCenter}>1047 Gerrard St E &nbsp;·&nbsp; (416) 565-9300 &nbsp;·&nbsp; info@fiitco.ca</p>
        <div className={styles.footerRight}>
          <Link href="/site" className={styles.footerLink}>← Back to Home</Link>
        </div>
      </footer>

    </main>
  );
}
