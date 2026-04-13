import Link from "next/link";
import styles from "./site.module.css";
import CtaSection from "./_components/CtaSection";
import SiteFooter from "./_components/SiteFooter";

const MINDBODY_URL =
  "https://www.mindbodyonline.com/explore/deals/fiit-co/intro-offer-10377";

const TRAINERS = [
  {
    name: "Jason Battiste",
    role: "Head Coach · Boxing",
    bio: "Competitive boxer turned coach. Builds fighters from the stance up.",
    tags: ["Boxing", "Technique"],
  },
  {
    name: "Sarah Green",
    role: "Coach · Strength",
    bio: "Strength and conditioning specialist focused on durable, functional athletes.",
    tags: ["Strength", "Mobility"],
  },
  {
    name: "Tyrone Warner",
    role: "Coach · Boxing Academy",
    bio: "Turns first-timers into confident boxers through the Academy program.",
    tags: ["Academy", "Fundamentals"],
  },
  {
    name: "Nick Radionov",
    role: "Coach · Conditioning",
    bio: "High-output conditioning and interval training built for fight readiness.",
    tags: ["Conditioning", "HIIT"],
  },
  {
    name: "Matt Makar",
    role: "Coach · Movement",
    bio: "Movement coach blending mobility, recovery, and skill work into every session.",
    tags: ["Movement", "Recovery"],
  },
  {
    name: "Jaye Pan",
    role: "Coach · Bootcamp",
    bio: "High-energy bootcamp lead. Pushes the floor and keeps the pace relentless.",
    tags: ["Bootcamp", "Cardio"],
  },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroWatermark}>FIIT</div>
        <div className={styles.heroInner}>
          <div className={styles.label}>Est. Toronto</div>
          <h1 className={styles.headlineXl}>
            Fight For<br />Your Best Self.
          </h1>
          <div className={styles.heroBottom}>
            <div className={styles.heroCtas}>
              <a
                href={MINDBODY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnRed}
              >
                Book Free Class
              </a>
              <Link href="/site/programs" className={styles.btnOutline}>
                Our Programs
              </Link>
            </div>
            <div className={styles.heroAddress}>
              1047 Gerrard St E<br />
              Toronto · Leslieville
            </div>
          </div>
        </div>
      </section>

      {/* DISCIPLINE STRIP */}
      <div className={styles.strip}>
        <div className={styles.stripText}>
          Boxing · Strength · Conditioning · Bootcamp · Academy · Mobility · HIIT · Recovery · Private Coaching
        </div>
      </div>

      {/* PILLARS */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.label}>The Approach</div>
          <h2 className={styles.headlineLg} style={{ marginBottom: "5rem" }}>
            Three Pillars.<br />One Standard.
          </h2>
          <div className={styles.pillarsGrid}>
            <div className={styles.pillar}>
              <div className={styles.pillarNum}>01</div>
              <h3 className={styles.pillarTitle}>Boxing First</h3>
              <p className={styles.body}>
                Everything at FIIT is built around the sweet science. Real technique,
                real coaching, real fighters on the floor.
              </p>
            </div>
            <div className={styles.pillar}>
              <div className={styles.pillarNum}>02</div>
              <h3 className={styles.pillarTitle}>Nine Disciplines</h3>
              <p className={styles.body}>
                From bootcamp to strength to academy boxing — nine class formats
                designed to stack into a complete program.
              </p>
            </div>
            <div className={styles.pillar}>
              <div className={styles.pillarNum}>03</div>
              <h3 className={styles.pillarTitle}>Serious Recovery</h3>
              <p className={styles.body}>
                Mobility, stretching, and recovery are built into the schedule.
                Training hard only works if the body can keep up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className={styles.sectionDark}>
        <div className={styles.container}>
          <div className={styles.label}>The Team</div>
          <h2 className={styles.headlineLg} style={{ marginBottom: "5rem" }}>
            Coaches Who<br />Coach For Real.
          </h2>
          <div className={styles.teamGrid}>
            {TRAINERS.map((t) => (
              <div key={t.name} className={styles.trainerCard}>
                <div className={styles.trainerImg}>
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background:
                        "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-oswald)",
                      fontSize: "4rem",
                      color: "rgba(255,255,255,0.18)",
                      letterSpacing: "-2px",
                    }}
                  >
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                </div>
                <div className={styles.trainerRole}>{t.role}</div>
                <div className={styles.trainerName}>{t.name}</div>
                <p className={styles.trainerBio}>{t.bio}</p>
                <div className={styles.trainerTags}>
                  {t.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <div className={styles.statNum}>35+</div>
              <div className={styles.statLabel}>Years Combined Experience</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNum}>6000</div>
              <div className={styles.statLabel}>Square Feet</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNum}>9</div>
              <div className={styles.statLabel}>Class Formats</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNum}>3</div>
              <div className={styles.statLabel}>Academy Levels</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA (guest pass + referral) */}
      <CtaSection />

      <SiteFooter />
    </>
  );
}
