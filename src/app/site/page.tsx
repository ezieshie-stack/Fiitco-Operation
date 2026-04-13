import Link from "next/link";
import styles from "./site.module.css";
import CtaSection from "./_components/CtaSection";

const MINDBODY_URL = "https://www.mindbodyonline.com/explore/deals/fiit-co/intro-offer-10377";

const TRAINERS = [
  {
    name: "Jason Battiste",
    role: "Owner & Founder",
    img: "https://images.pexels.com/photos/1544540/pexels-photo-1544540.jpeg?auto=compress&cs=tinysrgb&w=800",
    bio: "35+ years in combat training. Former Canadian Super Middleweight Kickboxing Champion. Built FIIT Co. on the belief that boxing changes who you are.",
    tags: ["Counter-Punching", "Kickboxing", "Conditioning"],
  },
  {
    name: "Sarah Green",
    role: "Trainer",
    img: "https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=800",
    bio: "Nearly 20 years of experience. Certified in group fitness, kickboxing, TRX, and yoga. Makes technique accessible at every level.",
    tags: ["Group Fitness", "TRX", "Kickboxing", "Yoga"],
  },
  {
    name: "Tyrone Warner",
    role: "Yoga Instructor",
    img: "https://images.pexels.com/photos/1153370/pexels-photo-1153370.jpeg?auto=compress&cs=tinysrgb&w=800",
    bio: "Hatha, Vinyasa, and Yin traditions. Tyrone's classes are the essential recovery counterpart to hard training.",
    tags: ["Hatha", "Vinyasa", "Yin", "Mobility"],
  },
  {
    name: "Nick Radionov",
    role: "Boxing Academy Coach",
    img: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=800",
    bio: "Two-time World Kickboxing Champion. Former Ukrainian National Olympic Team member. Boxing Ontario Level 3 certified coach.",
    tags: ["Olympic Boxing", "Level 3 Certified", "Competition Prep"],
  },
];

export default function HomePage() {
  return (
    <main>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <p className={styles.label}>FIIT Co. Boxing &amp; Fitness · Toronto</p>
        <h1 className={styles.headlineXl}>
          YOU&apos;RE WORTH<br />THE FIGHT.
        </h1>
        <div className={styles.heroBottom}>
          <p className={styles.heroAddress}>
            1047 Gerrard St E, Toronto, ON<br />
            Boxing · Fitness · Recovery · Est. 2015
          </p>
          <div className={styles.heroCtas}>
            <a href={MINDBODY_URL} target="_blank" rel="noopener noreferrer" className={styles.btnRed}>
              Book Free Class ↗
            </a>
            <Link href="/site/programs" className={styles.btnOutline}>
              Our Programs
            </Link>
          </div>
        </div>
      </section>

      {/* ── DISCIPLINE STRIP ───────────────────────────────────────── */}
      <div className={styles.strip}>
        <p className={styles.stripText}>
          BOXING &nbsp;·&nbsp; KICKBOXING &nbsp;·&nbsp; MUAY THAI &nbsp;·&nbsp;
          YIN YOGA &nbsp;·&nbsp; FIIT ENDURE &nbsp;·&nbsp; FIIT HYBRID &nbsp;·&nbsp;
          FIIT LIFT &nbsp;·&nbsp; BOXING ACADEMY &nbsp;·&nbsp; FIIT TEENS &nbsp;·&nbsp;
          SMALL GROUP TRAINING &nbsp;·&nbsp; PERSONAL TRAINING
        </p>
      </div>

      {/* ── WHAT WE DO ─────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <p className={styles.label}>What We Do</p>
          <div className={styles.pillarsGrid}>
            {[
              {
                num: "01",
                title: "Boxing First",
                body: "Every class is built on authentic boxing technique. Stance, footwork, guard, combinations — real skills on top of real fitness. We don't play boxing. We train boxers.",
              },
              {
                num: "02",
                title: "Nine Disciplines",
                body: "From FIIT Endure to Boxing Academy to Yin Yoga — nine distinct class formats targeting every attribute of fitness. There's always a right session for where you are today.",
              },
              {
                num: "03",
                title: "Serious Recovery",
                body: "Training is only half the equation. Our Yin Yoga programme and ice bath facility exist because the body gets stronger during rest, not during the session.",
              },
            ].map(({ num, title, body }) => (
              <div key={num} className={styles.pillar}>
                <p className={styles.pillarNum}>{num}</p>
                <h3 className={styles.pillarTitle}>{title}</h3>
                <p className={styles.bodySm}>{body}</p>
              </div>
            ))}
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

      {/* ── STATS ──────────────────────────────────────────────────── */}
      <div className={styles.statsRow}>
        {[
          { num: "35+",   label: "Years Coaching" },
          { num: "6,000", label: "Sq Ft Facility" },
          { num: "9",     label: "Class Formats" },
          { num: "3",     label: "Academy Levels" },
        ].map(({ num, label }) => (
          <div key={label} className={styles.stat}>
            <p className={styles.statNum}>{num}</p>
            <p className={styles.statLabel}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── CTA (GUEST PASS + REFERRAL) ────────────────────────────── */}
      <CtaSection />

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <p className={styles.footerLogo}>FIIT<span className={styles.accent}>.CO</span></p>
        <p className={styles.footerCenter}>1047 Gerrard St E, Toronto &nbsp;·&nbsp; (416) 565-9300</p>
        <div className={styles.footerRight}>
          <a href={MINDBODY_URL} target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
            Book a Class ↗
          </a>
        </div>
      </footer>

    </main>
  );
}
