import Link from "next/link";
import styles from "../site.module.css";
import SiteFooter from "../_components/SiteFooter";

export const metadata = {
  title: "About — FIIT Co.",
  description: "How a boxing obsession became Toronto's sharpest fitness studio.",
};

export default function AboutPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.label}>About</div>
          <h1 className={styles.headlineLg}>
            Built By Fighters.<br />Run For Everyone.
          </h1>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.twoColGrid}>
            <div>
              <div className={styles.label}>The Story</div>
              <h2 className={styles.headlineMd} style={{ marginBottom: "1.5rem" }}>
                Boxing Was The Start.
              </h2>
              <p className={styles.bodyLg} style={{ marginBottom: "1.5rem" }}>
                FIIT Co. was built in Leslieville by a crew that grew up around the
                ring. What started as a place for serious boxing turned into a full
                training floor — strength, conditioning, mobility, the whole picture.
              </p>
              <p className={styles.body}>
                The standard never moved. Real coaching. Real technique. A room that
                welcomes first-timers and sharpens fighters on the same floor.
              </p>
            </div>
            <div>
              <div className={styles.label}>What We Stand For</div>
              <h2 className={styles.headlineMd} style={{ marginBottom: "1.5rem" }}>
                The Standard.
              </h2>
              <p className={styles.body} style={{ marginBottom: "1.25rem" }}>
                <span className={styles.accent}>Technique over volume.</span> We'd
                rather you throw ten sharp punches than a hundred sloppy ones.
              </p>
              <p className={styles.body} style={{ marginBottom: "1.25rem" }}>
                <span className={styles.accent}>Coaching over choreography.</span>
                {" "}Classes aren't playlists. Coaches watch, correct, and progress you.
              </p>
              <p className={styles.body}>
                <span className={styles.accent}>Community over clientele.</span> You
                learn every name on the floor. That's the point.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionDark}>
        <div className={styles.container}>
          <div className={styles.label}>The Room</div>
          <h2 className={styles.headlineLg} style={{ marginBottom: "3rem" }}>
            6,000 Square Feet<br />Of Work To Do.
          </h2>
          <p className={styles.bodyLg} style={{ maxWidth: "780px", marginBottom: "3rem" }}>
            The main floor holds a full boxing ring, heavy bag line, and an open
            strength area. Everything is designed so classes can flow from skill
            work to conditioning without breaking rhythm.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/site/studio" className={styles.btnRed}>
              See The Studio
            </Link>
            <Link href="/site/programs" className={styles.btnOutline}>
              View Programs
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
