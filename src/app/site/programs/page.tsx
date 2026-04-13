import Link from "next/link";
import styles from "../site.module.css";
import CtaSection from "../_components/CtaSection";

const MINDBODY_URL = "https://www.mindbodyonline.com/explore/deals/fiit-co/intro-offer-10377";

const PROGRAMS = [
  {
    num: "01", tag: "All Levels",
    title: "Group Training",
    desc: "High-energy group classes combining boxing technique with functional fitness. Every session is different, every session is hard. FIIT Endure, FIIT Hybrid, FIIT Lift, and FIIT Caveman Circuit — four formats built to push you.",
    includes: ["FIIT Endure", "FIIT Hybrid", "FIIT Lift", "FIIT Caveman Circuit"],
    who: "Anyone looking to get fit, build endurance, and train alongside a community.",
  },
  {
    num: "02", tag: "1-on-1",
    title: "Personal Training",
    desc: "Customized one-on-one training with a dedicated focus on your specific goals. You get the trainer's full attention every minute — faster results, better technique, no wasted time.",
    includes: ["Custom programming", "Form & technique coaching", "Progress tracking", "Flexible scheduling"],
    who: "Anyone who wants accelerated results or has specific performance goals.",
  },
  {
    num: "03", tag: "Up to 6",
    title: "Small Group Training",
    desc: "Maximum 6 participants. The coach knows your name, your goals, and what you need to do next. The energy of a group with the precision of personal coaching at a more accessible price.",
    includes: ["Semi-private coaching", "Customized programming", "Group energy", "Individual attention"],
    who: "Those who want more coaching than a group class but prefer training with others.",
  },
  {
    num: "04", tag: "3-Tier Programme",
    title: "Boxing Academy",
    desc: "FIIT Co.'s signature structured boxing programme. Three progressive tiers take you from absolute beginner to competitive boxer under Olympic-certified coaching. This is real boxing, not fitness boxing.",
    includes: ["Level 1 — Foundation & fundamentals", "Level 2 — Technical sparring & ring work", "Level 3 — Competition prep"],
    who: "Anyone serious about learning to box properly, from beginners to competitive athletes.",
  },
  {
    num: "05", tag: "Ages 12–17",
    title: "FIIT Teens",
    desc: "Youth boxing programme emphasising confidence, discipline, physical fitness, and respect. Coached by Nick Radionov, former Olympic Team member. Structured, supervised, and progressive — no contact before they're ready.",
    includes: ["Boxing fundamentals", "Discipline & focus training", "Fitness conditioning", "Safe sparring (when ready)"],
    who: "Youth ages 12–17 looking to build confidence, fitness, and focus.",
  },
  {
    num: "06", tag: "Teams",
    title: "Sports Team Training",
    desc: "Customized athletic conditioning for sports teams. Advanced techniques and performance monitoring tailored to your team's specific sport and goals. Book a consultation to discuss your programme.",
    includes: ["Team-specific conditioning", "Athletic technique work", "Performance monitoring", "Flexible group scheduling"],
    who: "Sports teams and athletic groups looking for expert cross-training.",
  },
];

export default function ProgramsPage() {
  return (
    <main>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <p className={styles.label}>What We Offer</p>
        <h1 className={styles.headlineXl}>
          BUILT FOR<br />EVERY<br />
          <span className={styles.accent}>LEVEL.</span>
        </h1>
        <div className={styles.heroBottom}>
          <p className={styles.heroAddress}>Six programmes &nbsp;·&nbsp; Every fitness goal &nbsp;·&nbsp; Every ability</p>
          <a href={MINDBODY_URL} target="_blank" rel="noopener noreferrer" className={styles.btnRed}>
            Book Free Class ↗
          </a>
        </div>
      </section>

      {/* ── PROGRAMMES GRID ────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.programsGrid}>
            {PROGRAMS.map(({ num, tag, title, desc, includes, who }) => (
              <div key={num} className={styles.programCard}>
                <div className={styles.programHeader}>
                  <span className={styles.programNum}>{num}</span>
                  <span className={styles.programTag}>{tag}</span>
                </div>
                <h2 className={styles.programTitle}>{title}</h2>
                <p className={styles.bodySm} style={{ marginBottom: "1.5rem" }}>{desc}</p>
                <p className={styles.label} style={{ marginBottom: "0.75rem" }}>Includes</p>
                <ul className={styles.programIncludes}>
                  {includes.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <p className={styles.programWho}>Ideal for</p>
                <p className={styles.bodySm} style={{ marginBottom: "2rem" }}>{who}</p>
                <a href={MINDBODY_URL} target="_blank" rel="noopener noreferrer" className={styles.btnRed}>
                  Book Now ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GUEST PASS + REFERRAL ───────────────────────────────────── */}
      <CtaSection />

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <p className={styles.footerLogo}>FIIT<span className={styles.accent}>.CO</span></p>
        <p className={styles.footerCenter}>1047 Gerrard St E &nbsp;·&nbsp; (416) 565-9300</p>
        <div className={styles.footerRight}>
          <Link href="/site" className={styles.footerLink}>← Back to Home</Link>
        </div>
      </footer>

    </main>
  );
}
