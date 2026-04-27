/*
 * robots.txt for the staff portal at staff.fiitco.ca.
 *
 * This is an internal admin tool — disallow ALL crawlers across every path.
 * The customer-facing fiitco.ca has its own permissive robots.txt; only
 * this admin surface is locked down.
 *
 * Belt-and-suspenders alongside the `robots: { index: false }` metadata in
 * src/app/layout.tsx — well-behaved crawlers respect both, less-behaved
 * ones might respect only one.
 */
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
    ],
  };
}
