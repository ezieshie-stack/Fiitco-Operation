"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConvex } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";

type View = "login" | "signup" | "forgot";
type ForgotStep = 1 | 2 | 3;

const SECURITY_QUESTIONS = [
  "What city were you born in?",
  "What is your pet's name?",
  "What was your first school?",
  "What is your favourite fitness exercise?",
];

/* ── shared inline styles ── */
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--text-main, #2C2820)",
  marginBottom: 6,
  letterSpacing: "0.01em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  fontSize: 15,
  color: "var(--text-main, #2C2820)",
  background: "var(--bg-beige, #FAF7F3)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "rgba(0,0,0,0.12)",
  borderRadius: 8,
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
  fontFamily: "inherit",
};

const primaryBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 24px",
  fontSize: 15,
  fontWeight: 600,
  color: "#ffffff",
  background: "var(--ui-dark, #1E1812)",
  border: "none",
  borderRadius: "var(--radius-pill, 999px)",
  cursor: "pointer",
  letterSpacing: "0.01em",
  transition: "opacity 0.15s, transform 0.1s",
  fontFamily: "inherit",
};

const linkStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  color: "var(--ui-dark, #1E1812)",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  textDecoration: "underline",
  fontFamily: "inherit",
};

const errorBoxStyle: React.CSSProperties = {
  marginTop: 12,
  padding: "10px 14px",
  background: "rgba(200, 50, 50, 0.07)",
  border: "1px solid rgba(200, 50, 50, 0.18)",
  borderRadius: 8,
  fontSize: 13,
  color: "#b83232",
  lineHeight: 1.45,
};

const successBoxStyle: React.CSSProperties = {
  marginTop: 12,
  padding: "10px 14px",
  background: "#E8F5E9",
  border: "1px solid #A5D6A7",
  borderRadius: 8,
  fontSize: 13,
  color: "#2E7D32",
  lineHeight: 1.45,
};

const inlineErrorStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#b83232",
  marginTop: 4,
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const convex = useConvex();
  const signupUser = useMutation(api.auth.signupUser);
  const resetPassword = useMutation(api.auth.resetPassword);

  const [view, setView] = useState<View>("login");

  /* ── Login state ── */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Signup state ── */
  const [signupFullName, setSignupFullName] = useState("");
  const [signupDisplayName, setSignupDisplayName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupSpecialisations, setSignupSpecialisations] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupSecurityQ, setSignupSecurityQ] = useState("");
  const [signupSecurityA, setSignupSecurityA] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const [signupEmailTouched, setSignupEmailTouched] = useState(false);

  /* ── Forgot password state ── */
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState<ForgotStep>(1);
  const [forgotSecurityQ, setForgotSecurityQ] = useState("");
  const [forgotAnswer, setForgotAnswer] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  /* ── Helpers ── */
  function switchView(v: View) {
    setView(v);
    setLoginError("");
    setSignupError("");
    setSignupSuccess(false);
    setForgotError("");
    setForgotSuccess(false);
    setForgotStep(1);
  }

  const emailValid = (e: string) => e.toLowerCase().trim().endsWith("@fiitco.ca");

  /* ── Login handler ── */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setIsSubmitting(true);
    const result = await login(email.trim(), password);
    if (result.success) {
      router.replace("/dashboard");
    } else {
      setLoginError(result.message ?? "Invalid credentials. Please try again.");
      setIsSubmitting(false);
    }
  }

  /* ── Signup handler ── */
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSignupError("");

    if (!emailValid(signupEmail)) {
      setSignupError("Email must end with @fiitco.ca");
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError("Password must be at least 6 characters.");
      return;
    }
    if (signupPassword !== signupConfirm) {
      setSignupError("Passwords do not match.");
      return;
    }
    if (!signupSecurityQ) {
      setSignupError("Please select a security question.");
      return;
    }
    if (!signupSecurityA.trim()) {
      setSignupError("Please provide a security answer.");
      return;
    }

    setSignupSubmitting(true);
    try {
      await signupUser({
        email: signupEmail.toLowerCase().trim(),
        password: signupPassword,
        fullName: signupFullName.trim(),
        displayName: (signupDisplayName.trim() || signupFullName.trim()),
        phone: signupPhone.trim(),
        specialisations: signupSpecialisations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        securityQuestion: signupSecurityQ,
        securityAnswer: signupSecurityA.trim(),
      });
      setSignupSuccess(true);
    } catch (err: any) {
      setSignupError(err?.message ?? "Signup failed. Please try again.");
    } finally {
      setSignupSubmitting(false);
    }
  }

  /* ── Forgot password handlers ── */
  async function handleForgotStep1(e: React.FormEvent) {
    e.preventDefault();
    setForgotError("");
    setForgotSubmitting(true);
    try {
      const result = await convex.query(api.auth.getUserByEmail, {
        email: forgotEmail.toLowerCase().trim(),
      });
      if (result && result.securityQuestion) {
        setForgotSecurityQ(result.securityQuestion);
        setForgotStep(2);
      } else {
        setForgotError("No account found with that email.");
      }
    } catch (err: any) {
      setForgotError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setForgotSubmitting(false);
    }
  }

  async function handleForgotStep2(e: React.FormEvent) {
    e.preventDefault();
    setForgotError("");
    setForgotSubmitting(true);
    try {
      const result = await convex.query(api.auth.verifySecurityAnswer, {
        email: forgotEmail.toLowerCase().trim(),
        answer: forgotAnswer.trim(),
      });
      if (result.success) {
        setForgotStep(3);
      } else {
        setForgotError(
          "Incorrect answer. If you\u2019ve also forgotten your security answer, please contact your admin to reset your password."
        );
      }
    } catch (err: any) {
      setForgotError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setForgotSubmitting(false);
    }
  }

  async function handleForgotStep3(e: React.FormEvent) {
    e.preventDefault();
    setForgotError("");

    if (forgotNewPass.length < 6) {
      setForgotError("Password must be at least 6 characters.");
      return;
    }
    if (forgotNewPass !== forgotConfirm) {
      setForgotError("Passwords do not match.");
      return;
    }

    setForgotSubmitting(true);
    try {
      await resetPassword({
        email: forgotEmail.toLowerCase().trim(),
        newPassword: forgotNewPass,
      });
      setForgotSuccess(true);
    } catch (err: any) {
      setForgotError(err?.message ?? "Password reset failed. Please try again.");
    } finally {
      setForgotSubmitting(false);
    }
  }

  /* ═══════════════════════════════════════════ RENDER ═══════════════════════════════════════════ */

  const showSignupEmailError =
    signupEmailTouched && signupEmail.length > 0 && !emailValid(signupEmail);

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .login-card {
          animation: fadeIn 0.4s ease both;
        }
        .login-input:focus {
          outline: none;
          border-color: var(--ui-dark) !important;
          box-shadow: 0 0 0 3px rgba(30, 24, 18, 0.08);
        }
        .login-btn:hover:not(:disabled) {
          opacity: 0.88;
        }
        .login-btn:active:not(:disabled) {
          opacity: 0.75;
          transform: scale(0.99);
        }
        .login-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-app, #F9F5F0)",
          padding: "24px",
          fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
        }}
      >
        <div
          className="login-card"
          key={view}
          style={{
            width: "100%",
            maxWidth: 420,
            maxHeight: view === "signup" ? "90vh" : undefined,
            overflowY: view === "signup" ? "auto" : undefined,
            background: "#ffffff",
            borderRadius: 16,
            boxShadow:
              "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
            padding: "48px 40px 40px",
          }}
        >
          {/* ── Brand header ── */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 52,
                height: 52,
                background: "var(--ui-dark, #1E1812)",
                borderRadius: "var(--radius-pill, 999px)",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: "-0.5px",
                }}
              >
                F
              </span>
            </div>
            <h1
              style={{
                fontFamily:
                  "var(--font-playfair, 'Playfair Display', serif)",
                fontSize: 32,
                fontWeight: 600,
                color: "var(--ui-dark, #1E1812)",
                margin: "0 0 6px",
                lineHeight: 1.15,
                letterSpacing: "-0.5px",
              }}
            >
              FIIT Co.
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-muted, #888278)",
                margin: 0,
                letterSpacing: "0.02em",
              }}
            >
              {view === "login" && "Class Management \u2014 Staff Portal"}
              {view === "signup" && "Create Your Account"}
              {view === "forgot" && "Reset Your Password"}
            </p>
          </div>

          {/* ═══════════════ LOGIN VIEW ═══════════════ */}
          {view === "login" && (
            <form onSubmit={handleLogin} noValidate>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="email" style={labelStyle}>
                  Email
                </label>
                <input
                  id="email"
                  className="login-input"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@fiitco.ca"
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label htmlFor="password" style={labelStyle}>
                  Password
                </label>
                <input
                  id="password"
                  className="login-input"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                  required
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={isSubmitting || !email || !password}
                style={primaryBtnStyle}
              >
                {isSubmitting ? "Signing in\u2026" : "Sign In"}
              </button>

              {loginError && <div style={errorBoxStyle}>{loginError}</div>}

              <div
                style={{
                  marginTop: 24,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  style={linkStyle}
                  onClick={() => switchView("signup")}
                >
                  Create an account
                </button>
                <button
                  type="button"
                  style={linkStyle}
                  onClick={() => switchView("forgot")}
                >
                  Forgot password?
                </button>
              </div>
            </form>
          )}

          {/* ═══════════════ SIGNUP VIEW ═══════════════ */}
          {view === "signup" && (
            <>
              <div style={{ marginBottom: 20 }}>
                <button
                  type="button"
                  style={linkStyle}
                  onClick={() => switchView("login")}
                >
                  &larr; Back to Sign In
                </button>
              </div>

              {signupSuccess ? (
                <div style={successBoxStyle}>
                  Account created! An admin will approve your access shortly.
                  <br />
                  <button
                    type="button"
                    style={{ ...linkStyle, marginTop: 8, display: "inline-block", color: "#2E7D32" }}
                    onClick={() => switchView("login")}
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSignup} noValidate>
                  {/* Full Name */}
                  <div style={{ marginBottom: 14 }}>
                    <label htmlFor="signup-fullname" style={labelStyle}>
                      Full Name
                    </label>
                    <input
                      id="signup-fullname"
                      className="login-input"
                      type="text"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      placeholder="Jane Smith"
                      required
                      style={inputStyle}
                    />
                  </div>

                  {/* Display Name */}
                  <div style={{ marginBottom: 14 }}>
                    <label htmlFor="signup-displayname" style={labelStyle}>
                      Display Name
                    </label>
                    <input
                      id="signup-displayname"
                      className="login-input"
                      type="text"
                      value={signupDisplayName}
                      onChange={(e) => setSignupDisplayName(e.target.value)}
                      onBlur={() => {
                        if (!signupDisplayName.trim() && signupFullName.trim()) {
                          setSignupDisplayName(signupFullName.trim());
                        }
                      }}
                      placeholder="Jane S."
                      style={inputStyle}
                    />
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom: 14 }}>
                    <label htmlFor="signup-email" style={labelStyle}>
                      Email
                    </label>
                    <input
                      id="signup-email"
                      className="login-input"
                      type="email"
                      autoCapitalize="none"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      onBlur={() => setSignupEmailTouched(true)}
                      placeholder="you@fiitco.ca"
                      required
                      style={{
                        ...inputStyle,
                        ...(showSignupEmailError
                          ? { borderColor: "#b83232" }
                          : {}),
                      }}
                    />
                    {showSignupEmailError && (
                      <div style={inlineErrorStyle}>
                        Email must end with @fiitco.ca
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div style={{ marginBottom: 14 }}>
                    <label htmlFor="signup-phone" style={labelStyle}>
                      Phone
                    </label>
                    <input
                      id="signup-phone"
                      className="login-input"
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="(416) 555-0123"
                      style={inputStyle}
                    />
                  </div>

                  {/* Specialisations */}
                  <div style={{ marginBottom: 14 }}>
                    <label htmlFor="signup-specialisations" style={labelStyle}>
                      Specialisations
                    </label>
                    <input
                      id="signup-specialisations"
                      className="login-input"
                      type="text"
                      value={signupSpecialisations}
                      onChange={(e) => setSignupSpecialisations(e.target.value)}
                      placeholder="Boxing, Strength, Yoga"
                      style={inputStyle}
                    />
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: 14 }}>
                    <label htmlFor="signup-password" style={labelStyle}>
                      Password
                    </label>
                    <input
                      id="signup-password"
                      className="login-input"
                      type="password"
                      autoComplete="new-password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                      style={inputStyle}
                    />
                  </div>

                  {/* Confirm Password */}
                  <div style={{ marginBottom: 14 }}>
                    <label htmlFor="signup-confirm" style={labelStyle}>
                      Confirm Password
                    </label>
                    <input
                      id="signup-confirm"
                      className="login-input"
                      type="password"
                      autoComplete="new-password"
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      style={inputStyle}
                    />
                  </div>

                  {/* Security Question */}
                  <div style={{ marginBottom: 14 }}>
                    <label htmlFor="signup-secq" style={labelStyle}>
                      Security Question
                    </label>
                    <select
                      id="signup-secq"
                      className="login-input"
                      value={signupSecurityQ}
                      onChange={(e) => setSignupSecurityQ(e.target.value)}
                      required
                      style={{
                        ...inputStyle,
                        appearance: "none",
                        WebkitAppearance: "none",
                        backgroundImage:
                          'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23888\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")',
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 14px center",
                        paddingRight: 36,
                      }}
                    >
                      <option value="">Select a question...</option>
                      {SECURITY_QUESTIONS.map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Security Answer */}
                  <div style={{ marginBottom: 20 }}>
                    <label htmlFor="signup-seca" style={labelStyle}>
                      Security Answer
                    </label>
                    <input
                      id="signup-seca"
                      className="login-input"
                      type="text"
                      value={signupSecurityA}
                      onChange={(e) => setSignupSecurityA(e.target.value)}
                      placeholder="Your answer"
                      required
                      style={inputStyle}
                    />
                  </div>

                  <button
                    type="submit"
                    className="login-btn"
                    disabled={
                      signupSubmitting ||
                      !signupFullName ||
                      !signupEmail ||
                      !signupPassword ||
                      !signupConfirm
                    }
                    style={primaryBtnStyle}
                  >
                    {signupSubmitting ? "Creating account\u2026" : "Create Account"}
                  </button>

                  {signupError && (
                    <div style={errorBoxStyle}>{signupError}</div>
                  )}
                </form>
              )}
            </>
          )}

          {/* ═══════════════ FORGOT PASSWORD VIEW ═══════════════ */}
          {view === "forgot" && (
            <>
              <div style={{ marginBottom: 20 }}>
                <button
                  type="button"
                  style={linkStyle}
                  onClick={() => switchView("login")}
                >
                  &larr; Back to Sign In
                </button>
              </div>

              {forgotSuccess ? (
                <div style={successBoxStyle}>
                  Password updated! You can now sign in.
                  <br />
                  <button
                    type="button"
                    style={{ ...linkStyle, marginTop: 8, display: "inline-block", color: "#2E7D32" }}
                    onClick={() => switchView("login")}
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  {/* Step 1: Enter email */}
                  {forgotStep === 1 && (
                    <form onSubmit={handleForgotStep1} noValidate>
                      <p
                        style={{
                          fontSize: 14,
                          color: "var(--text-muted, #888278)",
                          margin: "0 0 16px",
                          lineHeight: 1.5,
                        }}
                      >
                        Enter the email address associated with your account and
                        we will verify your identity with a security question.
                      </p>
                      <div style={{ marginBottom: 20 }}>
                        <label htmlFor="forgot-email" style={labelStyle}>
                          Email
                        </label>
                        <input
                          id="forgot-email"
                          className="login-input"
                          type="email"
                          autoCapitalize="none"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="you@fiitco.ca"
                          required
                          style={inputStyle}
                        />
                      </div>
                      <button
                        type="submit"
                        className="login-btn"
                        disabled={forgotSubmitting || !forgotEmail}
                        style={primaryBtnStyle}
                      >
                        {forgotSubmitting ? "Looking up\u2026" : "Continue"}
                      </button>
                      {forgotError && (
                        <div style={errorBoxStyle}>{forgotError}</div>
                      )}
                    </form>
                  )}

                  {/* Step 2: Answer security question */}
                  {forgotStep === 2 && (
                    <form onSubmit={handleForgotStep2} noValidate>
                      <p
                        style={{
                          fontSize: 14,
                          color: "var(--text-muted, #888278)",
                          margin: "0 0 8px",
                          lineHeight: 1.5,
                        }}
                      >
                        Please answer your security question:
                      </p>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "var(--text-main, #2C2820)",
                          margin: "0 0 16px",
                          lineHeight: 1.4,
                        }}
                      >
                        {forgotSecurityQ}
                      </p>
                      <div style={{ marginBottom: 20 }}>
                        <label htmlFor="forgot-answer" style={labelStyle}>
                          Your Answer
                        </label>
                        <input
                          id="forgot-answer"
                          className="login-input"
                          type="text"
                          value={forgotAnswer}
                          onChange={(e) => setForgotAnswer(e.target.value)}
                          placeholder="Enter your answer"
                          required
                          style={inputStyle}
                        />
                      </div>
                      <button
                        type="submit"
                        className="login-btn"
                        disabled={forgotSubmitting || !forgotAnswer.trim()}
                        style={primaryBtnStyle}
                      >
                        {forgotSubmitting ? "Verifying\u2026" : "Verify Answer"}
                      </button>
                      {forgotError && (
                        <div style={errorBoxStyle}>{forgotError}</div>
                      )}
                    </form>
                  )}

                  {/* Step 3: Set new password */}
                  {forgotStep === 3 && (
                    <form onSubmit={handleForgotStep3} noValidate>
                      <p
                        style={{
                          fontSize: 14,
                          color: "var(--text-muted, #888278)",
                          margin: "0 0 16px",
                          lineHeight: 1.5,
                        }}
                      >
                        Identity verified. Choose a new password.
                      </p>
                      <div style={{ marginBottom: 14 }}>
                        <label htmlFor="forgot-newpass" style={labelStyle}>
                          New Password
                        </label>
                        <input
                          id="forgot-newpass"
                          className="login-input"
                          type="password"
                          autoComplete="new-password"
                          value={forgotNewPass}
                          onChange={(e) => setForgotNewPass(e.target.value)}
                          placeholder="Min 6 characters"
                          required
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <label htmlFor="forgot-confirm" style={labelStyle}>
                          Confirm Password
                        </label>
                        <input
                          id="forgot-confirm"
                          className="login-input"
                          type="password"
                          autoComplete="new-password"
                          value={forgotConfirm}
                          onChange={(e) => setForgotConfirm(e.target.value)}
                          placeholder="Re-enter password"
                          required
                          style={inputStyle}
                        />
                      </div>
                      <button
                        type="submit"
                        className="login-btn"
                        disabled={
                          forgotSubmitting || !forgotNewPass || !forgotConfirm
                        }
                        style={primaryBtnStyle}
                      >
                        {forgotSubmitting
                          ? "Resetting\u2026"
                          : "Reset Password"}
                      </button>
                      {forgotError && (
                        <div style={errorBoxStyle}>{forgotError}</div>
                      )}
                    </form>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
