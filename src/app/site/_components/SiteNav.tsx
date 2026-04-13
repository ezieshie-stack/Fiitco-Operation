"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../site.module.css";

const MINDBODY_URL =
  "https://www.mindbodyonline.com/explore/deals/fiit-co/intro-offer-10377";

const LINKS = [
  { href: "/site", label: "Home" },
  { href: "/site/about", label: "About" },
  { href: "/site/programs", label: "Programs" },
  { href: "/site/studio", label: "Studio" },
  { href: "/site/blog", label: "Journal" },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <Link href="/site" className={styles.navLogo}>
        FIIT<span className={styles.navLogoAccent}>.CO</span>
      </Link>
      <ul className={styles.navLinks}>
        {LINKS.map((link) => {
          const active =
            link.href === "/site"
              ? pathname === "/site"
              : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <a
        href={MINDBODY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.navCta}
      >
        Book a Class
      </a>
    </nav>
  );
}
