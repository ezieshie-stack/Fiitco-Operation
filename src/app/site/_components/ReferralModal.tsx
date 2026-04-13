"use client";
import { useState } from "react";
import styles from "../site.module.css";

type Props = { onClose: () => void };

export default function ReferralModal({ onClose }: Props) {
  const [form, setForm] = useState({ refFirst: "", refPhone: "", friendFirst: "", friendPhone: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { refFirst, refPhone, friendFirst, friendPhone } = form;
    if (!refFirst || !refPhone || !friendFirst || !friendPhone) {
      setMessage("All fields are required."); setStatus("error"); return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrerFirstName: refFirst, referrerPhone: refPhone, friendFirstName: friendFirst, friendPhone }),
      });
      const data = await res.json();
      if (data.success) { setStatus("success"); }
      else { setStatus("error"); setMessage(data.message || "Something went wrong."); }
    } catch {
      setStatus("error"); setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        <p className={styles.modalTitle}>Refer a Contender</p>
        <p className={styles.modalSubtitle}>50% off your next month when they sign up</p>

        {status === "success" ? (
          <div className={styles.formSuccess}>
            <span className={styles.formSuccessIcon}>✓</span>
            <p className={styles.headlineSm} style={{ marginBottom: "0.75rem" }}>Referral Submitted</p>
            <p className={styles.bodySm}>
              We&apos;ll follow up with {form.friendFirst} when they come in. Thank you.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className={styles.formSection}>Your Info</p>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>First Name</label>
              <input className={styles.formInput} value={form.refFirst} onChange={set("refFirst")} placeholder="Jason" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phone Number</label>
              <input className={styles.formInput} type="tel" value={form.refPhone} onChange={set("refPhone")} placeholder="(416) 555-0100" />
            </div>

            <p className={styles.formSection}>Friend&apos;s Info</p>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Friend&apos;s First Name</label>
              <input className={styles.formInput} value={form.friendFirst} onChange={set("friendFirst")} placeholder="Mike" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Friend&apos;s Phone Number</label>
              <input className={styles.formInput} type="tel" value={form.friendPhone} onChange={set("friendPhone")} placeholder="(416) 555-0200" />
            </div>

            {status === "error" && <p className={styles.formError}>{message}</p>}

            <button type="submit" className={styles.btnRed} disabled={status === "loading"} style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem", opacity: status === "loading" ? 0.6 : 1 }}>
              {status === "loading" ? "Submitting…" : "Submit Referral"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
