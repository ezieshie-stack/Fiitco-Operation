"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import styles from "../site.module.css";

export default function ReferralModal({ onClose }: { onClose: () => void }) {
  const create = useMutation(api.referrals.create);
  const [referrerFirstName, setReferrerFirstName] = useState("");
  const [referrerPhone, setReferrerPhone] = useState("");
  const [friendFirstName, setFriendFirstName] = useState("");
  const [friendPhone, setFriendPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await create({ referrerFirstName, referrerPhone, friendFirstName, friendPhone });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className={styles.label}>Refer A Friend</div>
        <h2 className={styles.modalTitle}>Get Rewarded</h2>
        <p className={styles.modalSubtitle}>
          Refer a friend who joins with a full membership, and we'll credit your account. Fill
          this out so we know who to thank.
        </p>

        {success ? (
          <div className={styles.formSuccess}>
            <div className={styles.formSuccessIcon}>✓</div>
            <h3 className={styles.headlineSm}>Thanks for the referral.</h3>
            <p className={styles.body}>
              We'll reach out to your friend. Once they sign up, your reward gets applied to
              your next billing cycle.
            </p>
            <button type="button" className={styles.btnRed} onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <div className={styles.label}>About You</div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>First name</label>
                <input
                  className={styles.formInput}
                  value={referrerFirstName}
                  onChange={(e) => setReferrerFirstName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone</label>
                <input
                  type="tel"
                  className={styles.formInput}
                  value={referrerPhone}
                  onChange={(e) => setReferrerPhone(e.target.value)}
                  placeholder="416 555 0100"
                  required
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.label}>Your Friend</div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Friend's first name</label>
                <input
                  className={styles.formInput}
                  value={friendFirstName}
                  onChange={(e) => setFriendFirstName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Friend's phone</label>
                <input
                  type="tel"
                  className={styles.formInput}
                  value={friendPhone}
                  onChange={(e) => setFriendPhone(e.target.value)}
                  placeholder="416 555 0100"
                  required
                />
              </div>
            </div>

            {error && <div className={styles.formError}>{error}</div>}

            <button type="submit" className={styles.btnRed} disabled={submitting}>
              {submitting ? "Sending…" : "Submit Referral"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
