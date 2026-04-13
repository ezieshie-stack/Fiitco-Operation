"use client";
import { useState } from "react";
import Link from "next/link";

const RED = "#D92B2B";

const TRAINERS = [
  { name: "Jason Battiste", slug: "jason-battiste", img: "https://images.pexels.com/photos/1544540/pexels-photo-1544540.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { name: "Matt Makar",     slug: "matt-makar",     img: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { name: "Sarah Green",    slug: "sarah-green",    img: "https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { name: "Jaye Pan",       slug: "jaye-pan",       img: "https://images.pexels.com/photos/1153370/pexels-photo-1153370.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { name: "Nick Radionov",  slug: "nick-radionov",  img: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=800" },
];

const PILLARS = [
  {
    n: "01", title: "THE TRAINING",
    body: "Authentic pugilist methodology meets high-science interval training. We don't play boxing—we train boxers. Every session is designed to push past your threshold.",
  },
  {
    n: "02", title: "THE SPACE",
    body: "Our 6,000 sq ft facility features professional-grade bags, a competition ring, and recovery equipment. Industrial grit meets boutique luxury.",
  },
  {
    n: "03", title: "THE COMMUNITY",
    body: "Founded on mutual respect and unrelenting effort. No egos allowed. We fight together, we grow together. Join the Toronto FIIT collective.",
  },
];

const PRICING_TABS = ["GROUP CLASSES", "PERSONAL TRAINING", "KIDS ACADEMY"];

const GROUP_PLANS = [
  {
    label: "STARTER",
    title: "SINGLE FIGHT",
    price: "$35",
    per: "/cad",
    features: ["1 Group Session", "Gloves Rental Included", "Valid for 30 Days"],
    featured: false,
    cta: "BUY NOW",
  },
  {
    label: "RECOMMENDED",
    title: "UNLIMITED FIIT",
    price: "$249",
    per: "/mo",
    features: ["Unlimited Group Classes", "2 Guest Passes/Month", "15% Pro Shop Discount", "Mindbody Priority Booking"],
    featured: true,
    cta: "SELECT PLAN",
  },
  {
    label: "COMMITTED",
    title: "10 SESSION PACK",
    price: "$280",
    per: "/cad",
    features: ["10 Group Sessions", "No Expiry Date", "Shared Account Access"],
    featured: false,
    cta: "BUY NOW",
  },
];

const EQUIPMENT = [
  "HEAVY BAGS (X30)",
  "SPEED BAGS (X5)",
  "OLYMPIC SQUAT RACK",
  "ASSAULT BIKES (X12)",
  "CUSTOM 18FT RING",
  "ICE BATH FACILITY",
];

function SectionLabel({ text }: { text: string }) {
  return (
    <p style={{
      fontFamily: "var(--font-chakra)", fontSize: "10px", letterSpacing: "0.2em",
      textTransform: "uppercase", color: RED,
      display: "flex", alignItems: "center", gap: 10,
      marginBottom: "2.5rem",
    }}>
      <span style={{ width: 28, height: 1, background: RED, display: "inline-block", flexShrink: 0 }} />
      {text}
    </p>
  );
}

export default function SitePage() {
  const [pricingTab, setPricingTab] = useState(0);

  return (
    <div style={{ background: "#000", color: "#fff" }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh",
        position: "relative",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        background: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.85)), url('https://images.pexels.com/photos/4761779/pexels-photo-4761779.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2') center/cover no-repeat",
        textAlign: "center",
        padding: "0 2rem",
      }}>
        <span style={{
          position: "absolute", fontFamily: "var(--font-oswald)", fontSize: "22vw",
          color: "rgba(255,255,255,0.025)", whiteSpace: "nowrap",
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          pointerEvents: "none", userSelect: "none",
        }}>BOXING</span>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 900 }}>
          <SectionLabel text="High Intensity Interval Training" />
          <h1 style={{
            fontFamily: "var(--font-oswald)", fontWeight: 700,
            fontSize: "clamp(4.5rem, 12vw, 11rem)",
            lineHeight: 0.85, textTransform: "uppercase",
            marginBottom: "2.5rem",
          }}>
            FIGHT FOR<br />YOUR BEST<br />SELF
          </h1>
          <div style={{ display: "flex", gap: "1.25rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/site/booking" style={{
              background: RED, color: "#fff", padding: "1rem 2.5rem",
              fontFamily: "var(--font-oswald)", fontWeight: 700,
              fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.12em",
              textDecoration: "none",
            }}>Book Now</Link>
            <Link href="/site/onboarding" style={{
              border: "1px solid rgba(255,255,255,0.6)", color: "#fff", padding: "1rem 2.5rem",
              fontFamily: "var(--font-oswald)", fontWeight: 700,
              fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.12em",
              textDecoration: "none",
            }}>Get Started</Link>
          </div>
        </div>
      </section>

      {/* ── INFO BAR ─────────────────────────────────────────── */}
      <div style={{
        display: "flex", flexWrap: "wrap", justifyContent: "space-between",
        padding: "1.1rem 4rem", background: "#111",
        borderTop: `2px solid ${RED}`,
        fontFamily: "var(--font-chakra)", fontSize: "0.7rem",
        textTransform: "uppercase", letterSpacing: "0.1em",
        gap: "1rem",
      }}>
        {[
          ["LOC:", "481 Richmond St W, Toronto"],
          ["PH:", "(416) 555-FIIT"],
          ["HOURS:", "06:00 – 22:00 DAILY"],
        ].map(([label, val]) => (
          <span key={label}>
            <span style={{ color: RED, marginRight: 8 }}>{label}</span>{val}
          </span>
        ))}
      </div>

      {/* ── TRAINERS ─────────────────────────────────────────── */}
      <section style={{ padding: "7rem 4rem 6rem", background: "#000" }}>
        <SectionLabel text="Elite Personnel" />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "0.75rem",
        }}>
          {TRAINERS.map((t) => (
            <Link key={t.slug} href={`/site/trainers/${t.slug}`}
              style={{ textDecoration: "none", color: "#fff" }}>
              <div
                onMouseEnter={(e) => {
                  const img = (e.currentTarget as HTMLDivElement).querySelector("img") as HTMLImageElement;
                  if (img) { img.style.transform = "scale(1.05)"; img.style.filter = "grayscale(0)"; }
                }}
                onMouseLeave={(e) => {
                  const img = (e.currentTarget as HTMLDivElement).querySelector("img") as HTMLImageElement;
                  if (img) { img.style.transform = "scale(1)"; img.style.filter = "grayscale(1)"; }
                }}
              >
                <div style={{ aspectRatio: "3/4", overflow: "hidden", background: "#111" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.img} alt={t.name} style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    filter: "grayscale(1)", transition: "transform 0.5s ease, filter 0.5s ease",
                    display: "block",
                  }} />
                </div>
                <p style={{
                  fontFamily: "var(--font-chakra)", fontSize: "0.7rem",
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.85)", marginTop: "0.75rem",
                }}>{t.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── THREE PILLARS ─────────────────────────────────────── */}
      <section style={{
        padding: "8rem 4rem",
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "5rem",
      }}>
        {PILLARS.map(({ n, title, body }) => (
          <div key={n}>
            <SectionLabel text={n} />
            <h3 style={{
              fontFamily: "var(--font-oswald)", fontWeight: 700,
              fontSize: "clamp(1.8rem, 2.8vw, 3rem)",
              textTransform: "uppercase", color: RED,
              lineHeight: 1, marginBottom: "1.5rem",
            }}>{title}</h3>
            <p style={{
              fontSize: "0.9rem", lineHeight: 1.8,
              color: "rgba(255,255,255,0.6)",
            }}>{body}</p>
          </div>
        ))}
      </section>

      {/* ── INVESTMENT TIERS ─────────────────────────────────── */}
      <section style={{ padding: "7rem 4rem" }}>
        <SectionLabel text="Investment Tiers" />

        {/* Tabs */}
        <div style={{
          display: "flex", justifyContent: "center",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          marginBottom: "4rem",
        }}>
          {PRICING_TABS.map((tab, i) => (
            <button key={tab} onClick={() => setPricingTab(i)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "var(--font-oswald)", fontWeight: 700,
              fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.06em",
              padding: "0.9rem 2.75rem",
              color: pricingTab === i ? "#fff" : "rgba(255,255,255,0.3)",
              borderBottom: pricingTab === i ? `3px solid ${RED}` : "3px solid transparent",
              marginBottom: "-1px",
              transition: "color 0.2s",
              whiteSpace: "nowrap",
            }}>{tab}</button>
          ))}
        </div>

        {/* Pricing cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
          {GROUP_PLANS.map(({ label, title, price, per, features, featured, cta }) => (
            <div key={title} style={{
              border: `${featured ? "2px" : "1px"} solid ${featured ? RED : "rgba(255,255,255,0.15)"}`,
              padding: "3rem 2rem",
              background: featured ? "rgba(217,43,43,0.06)" : "transparent",
              textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center",
            }}>
              <p style={{
                fontFamily: "var(--font-chakra)", fontSize: "0.6rem",
                color: RED, letterSpacing: "0.22em", textTransform: "uppercase",
                marginBottom: "1rem",
              }}>{label}</p>

              <h3 style={{
                fontFamily: "var(--font-oswald)", fontWeight: 700,
                fontSize: "clamp(1.6rem, 2.5vw, 2.4rem)",
                textTransform: "uppercase", lineHeight: 1,
                marginBottom: "1.5rem",
              }}>{title}</h3>

              <div style={{ marginBottom: "2.5rem" }}>
                <span style={{
                  fontFamily: "var(--font-oswald)", fontWeight: 700,
                  fontSize: "clamp(3.5rem, 5vw, 5rem)", lineHeight: 1,
                }}>{price}</span>
                <span style={{
                  fontFamily: "var(--font-chakra)", fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.5)", marginLeft: 4,
                }}>{per}</span>
              </div>

              <ul style={{
                listStyle: "none", padding: 0, margin: "0 0 2.5rem",
                width: "100%", borderTop: "1px solid rgba(255,255,255,0.07)",
              }}>
                {features.map((f) => (
                  <li key={f} style={{
                    padding: "0.85rem 0",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    fontSize: "0.875rem",
                    color: "rgba(255,255,255,0.6)",
                  }}>{f}</li>
                ))}
              </ul>

              <Link href="/site/booking" style={{
                display: "block", width: "100%",
                background: featured ? RED : "transparent",
                border: `1px solid ${featured ? RED : "rgba(255,255,255,0.45)"}`,
                color: "#fff", padding: "1rem",
                fontFamily: "var(--font-oswald)", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.12em",
                fontSize: "0.85rem", textDecoration: "none", textAlign: "center",
                transition: "opacity 0.2s",
              }}>{cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── REFER A CONTENDER ────────────────────────────────── */}
      <div style={{
        background: RED, padding: "5rem 4rem", textAlign: "center",
      }}>
        <h2 style={{
          fontFamily: "var(--font-oswald)", fontWeight: 700,
          fontSize: "clamp(3rem, 7vw, 6.5rem)",
          textTransform: "uppercase", letterSpacing: "-0.02em",
          lineHeight: 1, marginBottom: "1rem",
        }}>REFER A CONTENDER</h2>
        <p style={{
          fontFamily: "var(--font-chakra)", fontSize: "0.75rem",
          textTransform: "uppercase", letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.85)",
        }}>GET 50% OFF YOUR NEXT MONTH FOR EVERY REFERRAL THAT SIGNS UP.</p>
      </div>

      {/* ── STUDIO CREDITS ───────────────────────────────────── */}
      <section style={{ padding: "7rem 4rem" }}>
        <SectionLabel text="Studio Credits" />
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem",
        }}>
          {[50, 100, 250, 500].map((amount) => (
            <div key={amount}
              style={{
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "3.5rem 2rem",
                textAlign: "center",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = RED)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.2)")}
            >
              <p style={{
                fontFamily: "var(--font-oswald)", fontWeight: 700,
                fontSize: "clamp(2.5rem, 4vw, 4rem)",
                textTransform: "uppercase", marginBottom: "0.5rem",
              }}>${amount}</p>
              <p style={{
                fontFamily: "var(--font-chakra)", fontSize: "0.7rem",
                textTransform: "uppercase", letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.5)",
              }}>Digital Gift</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOUNDRY ──────────────────────────────────────────── */}
      <section style={{ padding: "7rem 4rem" }}>
        <SectionLabel text="Foundry" />
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "6rem", alignItems: "start",
        }}>
          {/* Quote */}
          <div>
            <span style={{
              fontFamily: "var(--font-oswald)", fontWeight: 700,
              fontSize: "8rem", color: RED, lineHeight: 0.6,
              display: "block", marginBottom: "1rem",
              userSelect: "none",
            }}>"</span>
            <blockquote style={{
              margin: 0,
              fontFamily: "var(--font-oswald)", fontWeight: 700,
              fontSize: "clamp(1.6rem, 2.6vw, 2.6rem)",
              lineHeight: 1.2, color: "#fff",
            }}>
              "We built FIIT Co. because boxing shouldn't just be about the ring. It's about the mental resilience you take out into the streets of Toronto."
            </blockquote>
            <cite style={{
              display: "block", marginTop: "1.75rem",
              fontFamily: "var(--font-chakra)", fontSize: "0.85rem",
              color: "rgba(255,255,255,0.5)", fontStyle: "normal",
              letterSpacing: "0.04em",
            }}>– Jason Battiste, Founder</cite>
          </div>

          {/* Equipment grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem",
          }}>
            {EQUIPMENT.map((item) => (
              <div key={item} style={{
                background: "#1a1a1a",
                padding: "2.75rem 1rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                textAlign: "center",
              }}>
                <p style={{
                  fontFamily: "var(--font-chakra)", fontSize: "0.65rem",
                  textTransform: "uppercase", letterSpacing: "0.14em",
                  color: "rgba(255,255,255,0.75)",
                }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{
        padding: "5rem 4rem",
        borderTop: "1px solid #1a1a1a",
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "3rem",
      }}>
        <div>
          <p style={{
            fontFamily: "var(--font-oswald)", fontWeight: 700,
            fontSize: "2rem", letterSpacing: "-1px",
          }}>FIIT<span style={{ color: RED }}>.CO</span></p>
          <p style={{
            marginTop: "1rem", color: "rgba(255,255,255,0.4)",
            fontSize: "0.8rem", lineHeight: 1.75,
          }}>The ultimate boutique boxing destination in downtown Toronto. Est. 2015.</p>
        </div>
        {[
          { head: "EXPLORE",  links: ["Classes", "Workshops", "Our Story", "Franchise"] },
          { head: "SUPPORT",  links: ["FAQ", "Terms & Waiver", "Contact Us", "Privacy Policy"] },
          { head: "CONNECT",  links: ["Instagram", "TikTok", "YouTube", "Newsletter"] },
        ].map(({ head, links }) => (
          <div key={head}>
            <p style={{
              fontFamily: "var(--font-oswald)", fontWeight: 700,
              textTransform: "uppercase", fontSize: "0.95rem",
              color: RED, letterSpacing: "0.06em", marginBottom: "1.5rem",
            }}>{head}</p>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {links.map((l) => (
                <li key={l} style={{
                  marginBottom: "0.75rem", fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.5)",
                }}>{l}</li>
              ))}
            </ul>
          </div>
        ))}
      </footer>

    </div>
  );
}
