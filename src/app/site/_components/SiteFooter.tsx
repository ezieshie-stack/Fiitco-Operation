import Link from "next/link";
import styles from "../site.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLogo}>
        FIIT<span className={styles.navLogoAccent}>.CO</span>
      </div>
      <div className={styles.footerCenter}>
        <Link href="/site/about" className={styles.footerLink}>About</Link>
        <Link href="/site/programs" className={styles.footerLink}>Programs</Link>
        <Link href="/site/studio" className={styles.footerLink}>Studio</Link>
        <Link href="/site/blog" className={styles.footerLink}>Journal</Link>
      </div>
      <div className={styles.footerRight}>
        1047 Gerrard St E<br />
        Toronto, ON · Leslieville<br />
        © {new Date().getFullYear()} FIIT Co.
      </div>
    </footer>
  );
}
