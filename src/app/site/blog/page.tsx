import styles from "../site.module.css";
import SiteFooter from "../_components/SiteFooter";

export const metadata = {
  title: "Journal — FIIT Co.",
  description: "Notes from the floor: training, recovery, and community from FIIT Co.",
};

const FEATURED = {
  category: "Training",
  title: "Why We Teach Stance Before Combinations",
  excerpt:
    "A sharp jab starts at the feet. Here's why every new FIIT member spends their first two classes on footwork — and what it changes.",
  author: "Jason Battiste",
  date: "April 2026",
  readTime: "6 min read",
};

const POSTS = [
  {
    category: "Recovery",
    title: "The Mobility Block Every Fighter Should Own",
    excerpt: "Ten minutes a day that keeps hips, shoulders, and ankles ready for work.",
    author: "Sarah Green",
    date: "April 2026",
    readTime: "4 min read",
  },
  {
    category: "Strength",
    title: "Strength For Boxers: Less Grind, More Pop",
    excerpt: "Why we program strength alongside boxing — and how we avoid killing speed.",
    author: "Jaye Pan",
    date: "March 2026",
    readTime: "5 min read",
  },
  {
    category: "Academy",
    title: "Inside The Boxing Academy",
    excerpt: "How Nick's program turns raw beginners into confident, competitive boxers.",
    author: "Nick Radionov",
    date: "March 2026",
    readTime: "7 min read",
  },
  {
    category: "Community",
    title: "The First-Class Nerves (And What We Do About Them)",
    excerpt: "Walking in for the first time is the hardest part. Here's what to expect.",
    author: "Tyrone Warner",
    date: "March 2026",
    readTime: "3 min read",
  },
];

export default function BlogPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.label}>Journal</div>
          <h1 className={styles.headlineLg}>
            Notes From<br />The Floor.
          </h1>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.container}>
          {/* FEATURED */}
          <div className={styles.blogFeatured}>
            <div className={styles.blogFeaturedImg}>
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
                  fontSize: "8rem",
                  color: "rgba(217,43,43,0.26)",
                  letterSpacing: "-4px",
                }}
              >
                FIIT
              </div>
            </div>
            <div>
              <div className={styles.blogCategory}>{FEATURED.category}</div>
              <h2 className={styles.headlineMd} style={{ marginBottom: "1.25rem" }}>
                {FEATURED.title}
              </h2>
              <p className={styles.bodyLg} style={{ marginBottom: "1.5rem" }}>
                {FEATURED.excerpt}
              </p>
              <div className={styles.blogMeta}>
                {FEATURED.author} · {FEATURED.date} · {FEATURED.readTime}
              </div>
            </div>
          </div>

          {/* GRID */}
          <div className={styles.blogGrid}>
            {POSTS.map((post) => (
              <article key={post.title} className={styles.blogCard}>
                <div className={styles.blogCategory}>{post.category}</div>
                <h3 className={styles.blogTitle}>{post.title}</h3>
                <p className={styles.blogExcerpt}>{post.excerpt}</p>
                <div className={styles.blogMeta}>
                  {post.author} · {post.date} · {post.readTime}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
