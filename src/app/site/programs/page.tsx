import styles from "../site.module.css";
import SiteFooter from "../_components/SiteFooter";

export const metadata = {
  title: "Programs — FIIT Co.",
  description: "FIIT Co. class formats, memberships, and personal training pricing.",
};

const MINDBODY_URL =
  "https://www.mindbodyonline.com/explore/deals/fiit-co/intro-offer-10377";

const PROGRAMS = [
  {
    num: "01",
    tag: "Boxing",
    title: "Muay Thai Kickboxing",
    includes: ["Stance & footwork", "Pad rounds", "Bag work", "Conditioning"],
    who: "All levels. Gloves and wraps provided for first class.",
  },
  {
    num: "02",
    tag: "Boxing",
    title: "Boxing Pad & Bag Work",
    includes: ["Combinations", "Defense & slip drills", "Live pads", "Finisher rounds"],
    who: "Stand-up boxing for every level.",
  },
  {
    num: "03",
    tag: "Strength",
    title: "Full Body Strength",
    includes: ["Compound lifts", "Accessory work", "Core", "Mobility finish"],
    who: "Barbell, free weight, and kettlebell strength training.",
  },
  {
    num: "04",
    tag: "Conditioning",
    title: "Hybrid Circuit",
    includes: ["Stations", "Interval timing", "Strength + cardio blend", "Team rounds"],
    who: "High-output training for conditioning and work capacity.",
  },
  {
    num: "05",
    tag: "Mobility",
    title: "Pilates",
    includes: ["Core stability", "Controlled movement", "Spinal mobility", "Breath work"],
    who: "Low-impact, high-control. Great paired with boxing.",
  },
  {
    num: "06",
    tag: "Mobility",
    title: "Yoga",
    includes: ["Flow sequences", "Hip & shoulder openers", "Balance", "Recovery"],
    who: "All levels. Built to keep fighters and lifters moving.",
  },
  {
    num: "07",
    tag: "Academy",
    title: "Boxing Academy",
    includes: ["Coached by Nick Radionov", "Technical boxing program", "Structured progression", "Sparring track"],
    who: "Separate program for dedicated boxing development.",
  },
  {
    num: "08",
    tag: "Kids",
    title: "Kids Program (7–12)",
    includes: ["Foundations", "Footwork games", "Pad drills", "Fitness play"],
    who: "Ages 7–12. Skill, confidence, and fun on the floor.",
  },
];

const GROUP_CLASS_PRICING = [
  {
    price: "$49",
    name: "2-Week Trial",
    note: "Unlimited · 2 weeks",
    features: ["All group classes", "Gloves provided", "No commitment", "New members only"],
    featured: false,
    badge: null,
  },
  {
    price: "$170",
    name: "Monthly Unlimited",
    note: "Auto-renew · $169.99/mo",
    features: [
      "Unlimited classes",
      "Monthly billing",
      "30-day cancel notice",
      "2 guest passes / month",
    ],
    featured: true,
    badge: "Most Popular",
  },
  {
    price: "$150",
    name: "10/Month Plan",
    note: "Auto-renew · $149.99/mo",
    features: ["10 classes / month", "Monthly billing", "30-day cancel notice", "Guest passes"],
    featured: false,
    badge: null,
  },
];

const CLASS_PACKS = [
  { price: "$30", label: "Drop In" },
  { price: "$125", label: "5-Class Pack" },
  { price: "$239", label: "10-Class Pack" },
  { price: "$425", label: "20-Class Pack" },
];

const PT_PRICING = [
  {
    price: "$39",
    name: "Intro · 30 min",
    note: "First PT session",
    features: ["1-on-1 with a coach", "Assessment + plan", "30 minutes"],
    featured: false,
    badge: null,
  },
  {
    price: "$50",
    name: "30 Min PT",
    note: "Per session",
    features: ["Focused skill work", "Fast & sharp", "One-on-one"],
    featured: false,
    badge: null,
  },
  {
    price: "$95",
    name: "60 Min PT",
    note: "Per session",
    features: ["Full session", "Full coaching attention", "Programmed progressions"],
    featured: false,
    badge: null,
  },
];

export default function ProgramsPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.label}>Programs</div>
          <h1 className={styles.headlineLg}>
            Nine Formats.<br />One Training Floor.
          </h1>
        </div>
      </header>

      {/* CLASS FORMATS */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.label}>Class Formats</div>
          <h2 className={styles.headlineMd} style={{ marginBottom: "4rem" }}>
            Pick Your Weapon.
          </h2>
          <div className={styles.programsGrid}>
            {PROGRAMS.map((p) => (
              <div key={p.num} className={styles.programCard}>
                <div className={styles.programHeader}>
                  <div className={styles.programNum}>{p.num}</div>
                  <div className={styles.programTag}>{p.tag}</div>
                </div>
                <h3 className={styles.programTitle}>{p.title}</h3>
                <ul className={styles.programIncludes}>
                  {p.includes.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
                <div className={styles.programWho}>{p.who}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GROUP CLASS PRICING */}
      <section className={styles.sectionDark}>
        <div className={styles.container}>
          <div className={styles.label}>Group Class Memberships</div>
          <h2 className={styles.headlineLg} style={{ marginBottom: "4rem" }}>
            Train The Way<br />That Works For You.
          </h2>
          <div className={styles.pricingGrid}>
            {GROUP_CLASS_PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`${styles.pricingCard} ${plan.featured ? styles.pricingFeatured : ""}`}
              >
                {plan.badge && <div className={styles.pricingBadge}>{plan.badge}</div>}
                <div className={styles.pricingPrice}>{plan.price}</div>
                <div className={styles.pricingName}>{plan.name}</div>
                <div className={styles.pricingNote}>{plan.note}</div>
                <ul className={styles.pricingFeatures}>
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <a
                  href={MINDBODY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={plan.featured ? styles.btnRed : styles.btnOutline}
                  style={{ width: "100%", textAlign: "center", display: "block" }}
                >
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLASS PACKS */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.label}>Class Packs · Pay As You Go</div>
          <h2 className={styles.headlineMd} style={{ marginBottom: "3.5rem" }}>
            No Commitment. Still Sharp.
          </h2>
          <div className={styles.giftGrid}>
            {CLASS_PACKS.map((pack) => (
              <div key={pack.label} className={styles.giftCard}>
                <div className={styles.giftPrice}>{pack.price}</div>
                <div className={styles.giftLabel}>{pack.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PT PRICING */}
      <section className={styles.sectionDark}>
        <div className={styles.container}>
          <div className={styles.label}>Personal Training</div>
          <h2 className={styles.headlineLg} style={{ marginBottom: "4rem" }}>
            One Coach.<br />One Focus.
          </h2>
          <div className={styles.pricingGrid}>
            {PT_PRICING.map((plan) => (
              <div key={plan.name} className={styles.pricingCard}>
                <div className={styles.pricingPrice}>{plan.price}</div>
                <div className={styles.pricingName}>{plan.name}</div>
                <div className={styles.pricingNote}>{plan.note}</div>
                <ul className={styles.pricingFeatures}>
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <a
                  href={MINDBODY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btnOutline}
                  style={{ width: "100%", textAlign: "center", display: "block" }}
                >
                  Book
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
