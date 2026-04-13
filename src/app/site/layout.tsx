import { Oswald, Chakra_Petch, Inter } from "next/font/google";
import SiteNav from "./SiteNav";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "700"],
});

const chakra = Chakra_Petch({
  subsets: ["latin"],
  variable: "--font-chakra",
  weight: ["400", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "700"],
});

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${oswald.variable} ${chakra.variable} ${inter.variable}`}
      style={{
        background: "#000",
        color: "#fff",
        fontFamily: "var(--font-inter, Inter, sans-serif)",
        minHeight: "100vh",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <SiteNav />

      <div style={{ paddingTop: 72 }}>
        {children}
      </div>
    </div>
  );
}
