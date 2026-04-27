"use client";

// Landing page for the email-based password reset flow.
// User arrives here from the email link with ?token=…, types a new password,
// submits, and is bounced back to /login to sign in normally.

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function ResetPasswordPage() {
  // useSearchParams() needs a Suspense boundary for Next.js prerender.
  return (
    <Suspense fallback={null}>
      <ResetInner />
    </Suspense>
  );
}

function ResetInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";
  const resetPassword = useMutation(api.passwordReset.resetPasswordWithToken);

  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPass.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPass !== confirmPass) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("This link is missing its token. Request a new one.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await resetPassword({ token, newPassword: newPass });
      if (result.success) {
        setDone(true);
        setTimeout(() => router.replace("/login"), 2000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--bg-beige, #F5F1EA)",
        color: "var(--text-main, #1E1812)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          background: "#fff",
          borderRadius: 16,
          padding: "40px 32px",
          boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
        }}
      >
        {done ? (
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 12px" }}>
              Password updated
            </h1>
            <p style={{ fontSize: 14, color: "#666", margin: 0 }}>
              Redirecting you to sign in…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 8px", textAlign: "center" }}>
              Choose a new password
            </h1>
            <p style={{ fontSize: 14, color: "#666", margin: "0 0 24px", textAlign: "center" }}>
              Enter a new password for your account.
            </p>
            <div style={{ marginBottom: 14 }}>
              <label
                htmlFor="new-pass"
                style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}
              >
                New Password
              </label>
              <input
                id="new-pass"
                type="password"
                autoComplete="new-password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Min 6 characters"
                required
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="confirm-pass"
                style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}
              >
                Confirm Password
              </label>
              <input
                id="confirm-pass"
                type="password"
                autoComplete="new-password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Re-enter password"
                required
                style={inputStyle}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !newPass || !confirmPass}
              style={{
                width: "100%",
                padding: "12px 20px",
                background: "#1E1812",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                fontSize: 15,
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? "Saving…" : "Save new password"}
            </button>
            {error && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  background: "rgba(200, 50, 50, 0.07)",
                  border: "1px solid rgba(200, 50, 50, 0.18)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#b83232",
                }}
              >
                {error}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  fontSize: 15,
  color: "#2C2820",
  background: "#FAF7F3",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "rgba(0,0,0,0.12)",
  borderRadius: 8,
  boxSizing: "border-box",
  fontFamily: "inherit",
};
