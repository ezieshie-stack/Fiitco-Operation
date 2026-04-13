"use client";
import { useState } from "react";
import styles from "../site.module.css";
import GuestPassModal from "./GuestPassModal";
import ReferralModal from "./ReferralModal";

export default function CtaSection() {
  const [guestOpen, setGuestOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);

  return (
    <>
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <p className={styles.label}>Member Benefits</p>
          <h2 className={styles.headlineLg}>
            BRING SOMEONE<br />
            <span className={styles.accent}>IN.</span>
          </h2>

          <div className={styles.ctaGrid}>
            <div className={`${styles.ctaCard} ${styles.ctaCardAccent}`}>
              <p className={styles.label}>Guest Pass</p>
              <h3 className={styles.headlineMd} style={{ marginBottom: "1rem" }}>BRING A GUEST</h3>
              <p className={styles.body} style={{ marginBottom: "2rem" }}>
                Members get up to 2 guest passes per month. Submit online — your guest gives their name at the front desk on arrival. No charge.
              </p>
              <button className={styles.btnOutline} onClick={() => setGuestOpen(true)}>
                Submit Guest Pass
              </button>
            </div>

            <div className={styles.ctaCard}>
              <p className={styles.label}>Referral</p>
              <h3 className={styles.headlineMd} style={{ marginBottom: "1rem" }}>REFER A CONTENDER</h3>
              <p className={styles.body} style={{ marginBottom: "2rem" }}>
                Get 50% off your next month for every friend you refer who signs up for a membership. No cap on referrals.
              </p>
              <button className={styles.btnOutline} onClick={() => setReferralOpen(true)}>
                Submit a Referral
              </button>
            </div>
          </div>
        </div>
      </section>

      {guestOpen    && <GuestPassModal onClose={() => setGuestOpen(false)} />}
      {referralOpen && <ReferralModal  onClose={() => setReferralOpen(false)} />}
    </>
  );
}
