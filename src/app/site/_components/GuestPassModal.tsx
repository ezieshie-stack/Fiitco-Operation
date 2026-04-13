"use client";
import { useState } from "react";
import styles from "../site.module.css";

type Props = { onClose: () => void };

export default function GuestPassModal({ onClose }: Props) {
  const [form, setForm] = useState({ memberFirst: "", memberPhone: "", guestFirst: "", guestPhone: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { memberFirst, memberPhone, guestFirst, guestPhone } = form;
    if (!memberFirst || !memberPhone || !guestFirst || !guestPhone) {
      setMessage("All fields are required."); setStatus("error"); return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/guest-passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberFirstName: memberFirst, memberPhone, guestFirstName: guestFirst, guestPhone }),
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
        <p className={styles.modalTitle}>Guest Pass</p>
        <p className={styles.modalSubtitle}>Members · 2 passes per month</p>

        {status === "success" ? (
          <div className={styles.formSuccess}>
            <span className={styles.formSuccessIcon}>✓</span>
            <p className={styles.headlineSm} style={{ marginBottom: "0.75rem" }}>Pass Submitted</p>
            <p className={styles.bodySm}>
              Have {form.guestFirst} give their name at the front desk on arrival.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className={styles.formSection}>Your Info</p>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>First Name</label>
              <input className={styles.formInput} value={form.memberFirst} onChange={set("memberFirst")} placeholder="Jason" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phone Number</label>
              <input className={styles.formInput} type="tel" value={form.memberPhone} onChange={set("memberPhone")} placeholder="(416) 555-0100" />
            </div>

            <p className={styles.formSection}>Guest Info</p>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Guest&apos;s First Name</label>
              <input className={styles.formInput} value={form.guestFirst} onChange={set("guestFirst")} placeholder="Mike" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Guest&apos;s Phone Number</label>
              <input className={styles.formInput} type="tel" value={form.guestPhone} onChange={set("guestPhone")} placeholder="(416) 555-0200" />
            </div>

            {status === "error" && <p className={styles.formError}>{message}</p>}

            <button type="submit" className={styles.btnRed} disabled={status === "loading"} style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem", opacity: status === "loading" ? 0.6 : 1 }}>
              {status === "loading" ? "Submitting…" : "Submit Guest Pass"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
