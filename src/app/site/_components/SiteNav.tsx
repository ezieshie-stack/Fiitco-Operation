"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../site.module.css";

const MINDBODY_URL = "https://www.mindbodyonline.com/explore/deals/fiit-co/intro-offer-10377";

const LINKS = [
  { label: "About",    href: "/site/about" },
  { label: "Programs", href: "/site/programs" },
  { label: "Studio",   href: "/site/studio" },
  { label: "Blog",     href: "/site/blog" },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <Link href="/site" className={styles.navLogo}>
        FIIT<span className={styles.navLogoAccent}>.CO</span>
      </Link>

      <ul className={styles.navLinks}>
        {LINKS.map(({ label, href }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href}>
              <Link href={href} className={active ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <a href={MINDBODY_URL} target="_blank" rel="noopener noreferrer" className={styles.navCta}>
        Book Free Class ↗
      </a>
    </nav>
  );
}
