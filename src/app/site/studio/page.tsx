import Link from "next/link";
import styles from "../site.module.css";

const MINDBODY_URL = "https://www.mindbodyonline.com/explore/deals/fiit-co/intro-offer-10377";

const CLASSES = [
  { name: "FIIT Endure",          desc: "Interval training focused on stamina and cardiovascular endurance. High-intensity rounds on the bags and floor." },
  { name: "FIIT Hybrid",          desc: "Boxing technique combined with functional training stations. The best of both worlds in one session." },
  { name: "FIIT Lift",            desc: "Strength and muscle building through compound lifts and boxing-specific conditioning." },
  { name: "FIIT Caveman Circuit", desc: "Primal, raw, full-body circuit training. No machines. Just effort." },
  { name: "Boxing Pad Work",      desc: "Develop real boxing technique with mitts and pad work under trainer supervision." },
  { name: "Muay Thai Kickboxing", desc: "Strike with hands, elbows, knees, and kicks. Full-body combat conditioning." },
  { name: "Yin Yoga",             desc: "Deep stretching and mindfulness. The essential recovery complement to hard training." },
  { name: "Boxing Academy",       desc: "Structured 3-level programme from foundation to competition. Coached by Nick Radionov." },
  { name: "Teens Boxing",         desc: "Youth programme for ages 12–17. Discipline, confidence, and fitness in a safe environment." },
];

const PRICING = [
  { name: "2-Week Trial",           price: "$49.99",   note: "Unlimited classes",    featured: true },
  { name: "5 Class Pass",           price: "$125",     note: "Expires in 2 months",  featured: false },
  { name: "10 Class Pass",          price: "$239",     note: "Expires in 4 months",  featured: false },
  { name: "20 Class Pass",          price: "$425",     note: "Expires in 6 months",  featured: false },
  { name: "Monthly Unlimited",      price: "$179/mo",  note: "Best value",           featured: false },
  { name: "Academy 5-Pack",         price: "$135",     note: "Expires in 2 months",  featured: false },
  { name: "Academy 10-Pack",        price: "$220",     note: "Expires in 3 months",  featured: false },
  { name: "Academy 20-Pack",        price: "$400",     note: "Expires in 6 months",  featured: false },
];

const HOURS = [
  { day: "Monday",    time: "6:00 AM – 9:00 PM" },
  { day: "Tuesday",   time: "8:00 AM – 5:00 PM" },
  { day: "Wednesday", time: "6:00 AM – 9:00 PM" },
  { day: "Thursday",  time: "6:00 AM – 9:00 PM" },
  { day: "Friday",    time: "6:00 AM – 9:00 PM" },
  { day: "Saturday",  time: "8:00 AM – 5:00 PM" },
  { day: "Sunday",    time: "8:00 AM – 5:00 PM" },
];

export default function StudioPage() {
  return (
    <main>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <p className={styles.label}>The Space</p>
        <h1 className={styles.headlineXl}>
          STUDIO<br /><span className={styles.accent}>INFO.</span>
        </h1>
        <div className={styles.heroBottom}>
          <p className={styles.heroAddress}>1047 Gerrard St E &nbsp;·&nbsp; Leslieville, Toronto</p>
          <a href={MINDBODY_URL} target="_blank" rel="noopener noreferrer" className={styles.btnRed}>
            View Full Schedule ↗
          </a>
        </div>
      </section>

      {/* ── CLASSES ────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <p className={styles.label}>Classes</p>
          <div className={styles.classesGrid}>
            {CLASSES.map(({ name, desc }) => (
              <div key={name} className={styles.classCard}>
                <h3 className={styles.className}>{name}</h3>
                <p className={styles.bodySm}>{desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "2.5rem" }}>
            <a href={MINDBODY_URL} target="_blank" rel="noopener noreferrer" className={styles.btnRed}>
              Book a Class ↗
            </a>
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────── */}
      <section className={styles.sectionDark}>
        <div className={styles.container}>
          <p className={styles.label}>Investment</p>
          <h2 className={styles.headlineMd} style={{ marginBottom: "3rem" }}>PRICING</h2>
          <div className={styles.pricingGrid}>
            {PRICING.map(({ name, price, note, featured }) => (
              <div key={name} className={featured ? `${styles.pricingCard} ${styles.pricingFeatured}` : styles.pricingCard}>
                {featured && <span className={styles.pricingBadge}>Best Way to Start</span>}
                <p className={styles.pricingPrice}>{price}</p>
                <p className={styles.pricingName}>{name}</p>
                <p className={styles.pricingNote}>{note}</p>
              </div>
            ))}
          </div>
          <a href={MINDBODY_URL} target="_blank" rel="noopener noreferrer" className={styles.btnRed}>
            Purchase a Pass ↗
          </a>
        </div>
      </section>

      {/* ── HOURS + LOCATION ───────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.twoColGrid}>
            <div>
              <p className={styles.label}>Hours</p>
              <table className={styles.hoursTable}>
                <tbody>
                  {HOURS.map(({ day, time }) => (
                    <tr key={day}>
                      <td>{day}</td>
                      <td>{time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <p className={styles.label}>Location</p>
              <h3 className={styles.headlineMd} style={{ marginBottom: "2rem" }}>
                1047 GERRARD ST E<br />TORONTO, ON
              </h3>
              {[
                ["Phone",        "(416) 565-9300"],
                ["Email",        "info@fiitco.ca"],
                ["Neighbourhood","Leslieville, East Toronto"],
              ].map(([label, val]) => (
                <div key={label} className={styles.contactRow}>
                  <span className={styles.contactLabel}>{label}</span>
                  <span className={styles.body}>{val}</span>
                </div>
              ))}
            </div>
          </div>
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
