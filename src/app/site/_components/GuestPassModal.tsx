"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import styles from "../site.module.css";

export default function GuestPassModal({ onClose }: { onClose: () => void }) {
  const create = useMutation(api.guestPasses.create);
  const [memberFirstName, setMemberFirstName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await create({ memberFirstName, memberPhone, guestFirstName, guestPhone });
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
        <div className={styles.label}>Member Perk</div>
        <h2 className={styles.modalTitle}>Bring a Friend</h2>
        <p className={styles.modalSubtitle}>
          Every active member gets two free guest passes per month. Fill this out, and your
          friend can walk in and train on us.
        </p>

        {success ? (
          <div className={styles.formSuccess}>
            <div className={styles.formSuccessIcon}>✓</div>
            <h3 className={styles.headlineSm}>You're all set.</h3>
            <p className={styles.body}>
              We'll text your friend shortly with how to book. Pass is valid for 30 days.
            </p>
            <button type="button" className={styles.btnRed} onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <div className={styles.label}>Your Details</div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>First name</label>
                <input
                  className={styles.formInput}
                  value={memberFirstName}
                  onChange={(e) => setMemberFirstName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone</label>
                <input
                  type="tel"
                  className={styles.formInput}
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
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
                  value={guestFirstName}
                  onChange={(e) => setGuestFirstName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Friend's phone</label>
                <input
                  type="tel"
                  className={styles.formInput}
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="416 555 0100"
                  required
                />
              </div>
            </div>

            {error && <div className={styles.formError}>{error}</div>}

            <button type="submit" className={styles.btnRed} disabled={submitting}>
              {submitting ? "Sending…" : "Send Guest Pass"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
