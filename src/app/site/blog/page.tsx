import Link from "next/link";
import styles from "../site.module.css";

const POSTS = [
  {
    slug: "why-boxing-is-the-best-full-body-workout",
    category: "Training", date: "March 28, 2026", readTime: "5 min read",
    title: "Why Boxing Is the Best Full-Body Workout You're Not Doing",
    excerpt: "Most gym routines isolate muscles. Boxing trains your entire body as a system — coordination, power, endurance, and mental focus all at once. Here's the science behind why it works.",
    img: "https://images.pexels.com/photos/4761779/pexels-photo-4761779.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    slug: "beginners-guide-to-the-boxing-academy",
    category: "Academy", date: "March 14, 2026", readTime: "7 min read",
    title: "A Beginner's Guide to the FIIT Co. Boxing Academy",
    excerpt: "Starting from zero and wondering what Level 1 actually looks like? We break down what to expect in your first month, what you'll learn, and how the three-tier progression works.",
  },
  {
    slug: "recovery-the-forgotten-part-of-training",
    category: "Recovery", date: "February 27, 2026", readTime: "6 min read",
    title: "Recovery: The Forgotten Part of Your Training Plan",
    excerpt: "You can't out-train bad recovery. Tyrone breaks down why yin yoga, ice baths, and sleep matter just as much as your rounds on the bags — and how to build recovery into your weekly routine.",
  },
  {
    slug: "meet-nick-radionov",
    category: "Team", date: "February 10, 2026", readTime: "8 min read",
    title: "Meet Nick Radionov: From the Ukrainian Olympic Team to Gerrard St East",
    excerpt: "Two-time World Kickboxing Champion. Former Ukrainian National Olympic Team member. Now coaching the next generation of Toronto boxers. Nick Radionov tells us his story.",
  },
  {
    slug: "small-group-training-why-it-works",
    category: "Training", date: "January 22, 2026", readTime: "4 min read",
    title: "Why Small Group Training Beats Both Solo and Group Classes",
    excerpt: "Can't afford personal training every session? Not getting enough attention in group classes? Small group training at FIIT Co. hits the sweet spot — here's why.",
  },
  {
    slug: "introducing-fiit-teens",
    category: "Youth", date: "January 8, 2026", readTime: "5 min read",
    title: "Introducing FIIT Teens: Boxing for the Next Generation",
    excerpt: "We launched our youth programme in January and the response has been overwhelming. Here's why boxing is one of the best sports for teenagers — and what parents need to know.",
  },
];

const [featured, ...rest] = POSTS;

export default function BlogPage() {
  return (
    <main>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className={styles.hero} style={{ minHeight: "45vh" }}>
        <p className={styles.label}>The Journal</p>
        <h1 className={styles.headlineXl}>
          TRAINING.<br />STORIES.<br />
          <span className={styles.accent}>COMMUNITY.</span>
        </h1>
      </section>

      {/* ── FEATURED ───────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <p className={styles.label}>Featured</p>
          <Link href={`/site/blog/${featured.slug}`} className={styles.blogFeatured}>
            <div>
              <p className={styles.blogCategory}>{featured.category}</p>
              <h2 className={styles.headlineMd} style={{ marginBottom: "1.25rem" }}>{featured.title}</h2>
              <p className={styles.body} style={{ marginBottom: "1.75rem" }}>{featured.excerpt}</p>
              <p className={styles.bodySm} style={{ color: "#D92B2B" }}>Read Article →</p>
            </div>
            <div className={styles.blogFeaturedImg}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featured.img} alt={featured.title} />
            </div>
          </Link>
        </div>
      </section>

      {/* ── GRID ───────────────────────────────────────────────────── */}
      <section className={`${styles.sectionDark}`}>
        <div className={styles.container}>
          <div className={styles.blogGrid}>
            {rest.map(({ slug, category, date, readTime, title, excerpt }) => (
              <Link key={slug} href={`/site/blog/${slug}`} className={styles.blogCard}>
                <p className={styles.blogCategory}>{category}</p>
                <h3 className={styles.blogTitle}>{title}</h3>
                <p className={styles.blogExcerpt}>{excerpt}</p>
                <p className={styles.blogMeta}>
                  <span>{date}</span>
                  <span>{readTime}</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <p className={styles.footerLogo}>FIIT<span className={styles.accent}>.CO</span></p>
        <p className={styles.footerCenter}>1047 Gerrard St E, Toronto</p>
        <div className={styles.footerRight}>
          <Link href="/site" className={styles.footerLink}>← Back to Home</Link>
        </div>
      </footer>

    </main>
  );
}
