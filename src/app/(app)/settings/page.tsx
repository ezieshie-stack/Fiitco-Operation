export default function SettingsPage() {
  return (
    <div style={{ width: "100%" }}>
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">System preferences, tiers, and gym configuration.</p>
      <div style={{ background: "var(--bg-panel)", borderRadius: "var(--radius-card)", padding: "80px 40px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>⚙️</p>
        <p className="font-serif" style={{ fontSize: 22, fontWeight: 500, color: "var(--text-main)", marginBottom: 8 }}>Settings</p>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>Tier management, buffer rule config, gym details — coming next</p>
      </div>
    </div>
  );
}
