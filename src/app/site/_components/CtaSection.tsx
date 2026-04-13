"use client";

import { useState } from "react";
import GuestPassModal from "./GuestPassModal";
import ReferralModal from "./ReferralModal";
import styles from "../site.module.css";

type Mode = null | "guest" | "referral";

export default function CtaSection() {
  const [mode, setMode] = useState<Mode>(null);

  return (
    <>
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.label}>Member Perks</div>
          <h2 className={styles.headlineLg} style={{ marginBottom: "3.5rem" }}>
            Share The Fight.
          </h2>
          <div className={styles.ctaGrid}>
            <div className={`${styles.ctaCard} ${styles.ctaCardAccent}`}>
              <div className={styles.label}>Guest Pass</div>
              <h3 className={styles.headlineMd} style={{ margin: "1.25rem 0 1rem" }}>
                Bring A Friend For Free
              </h3>
              <p className={styles.body} style={{ marginBottom: "2rem", color: "rgba(255,255,255,0.66)" }}>
                Every active member gets two free guest passes per month. Your friend trains
                on us — no card, no catch.
              </p>
              <button type="button" className={styles.btnRed} onClick={() => setMode("guest")}>
                Send A Guest Pass
              </button>
            </div>
            <div className={styles.ctaCard}>
              <div className={styles.label}>Referral Reward</div>
              <h3 className={styles.headlineMd} style={{ margin: "1.25rem 0 1rem" }}>
                Refer & Get Rewarded
              </h3>
              <p className={styles.body} style={{ marginBottom: "2rem", color: "rgba(255,255,255,0.66)" }}>
                Refer a friend who joins with a full membership and we'll credit your
                account. The more you bring in, the more you save.
              </p>
              <button type="button" className={styles.btnOutline} onClick={() => setMode("referral")}>
                Refer A Friend
              </button>
            </div>
          </div>
        </div>
      </section>

      {mode === "guest" && <GuestPassModal onClose={() => setMode(null)} />}
      {mode === "referral" && <ReferralModal onClose={() => setMode(null)} />}
    </>
  );
}
