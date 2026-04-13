"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

// ── Types ─────────────────────────────────────────────────────────────────────

type GuestPass = {
  _id: Id<"guestPasses">;
  memberFirstName: string;
  memberPhone: string;
  guestFirstName: string;
  guestPhone: string;
  status: string;
  createdAt: number;
  redeemedAt?: number;
  monthKey: string;
  createdBy: string;
  redeemedBy?: string;
};

type Referral = {
  _id: Id<"referrals">;
  referrerFirstName: string;
  referrerPhone: string;
  friendFirstName: string;
  friendPhone: string;
  status: string;
  createdAt: number;
  completedAt?: number;
  rewardedAt?: number;
  notes?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-CA", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    pending:   { bg: "#FFF3CD", color: "#856404" },
    redeemed:  { bg: "#D1ECE1", color: "#155724" },
    completed: { bg: "#D1ECE1", color: "#155724" },
    expired:   { bg: "#F8D7DA", color: "#721C24" },
    rewarded:  { bg: "#CCE5FF", color: "#004085" },
  };
  const style = colors[status] ?? { bg: "#eee", color: "#333" };
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
      textTransform: "uppercase", background: style.bg, color: style.color,
    }}>
      {status}
    </span>
  );
}

// ── Walk-In Form ──────────────────────────────────────────────────────────────

function WalkInForm({ onSuccess }: { onSuccess: () => void }) {
  const createWalkIn = useMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (api as any).guestPasses.createWalkIn
  );
  const [form, setForm] = useState({
    memberFirstName: "", memberPhone: "",
    guestFirstName: "", guestPhone: "", staffName: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const field = (key: keyof typeof form) => (
    <input
      value={form[key]}
      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      style={{
        width: "100%", padding: "8px 12px", border: "1px solid var(--border)",
        borderRadius: 6, background: "var(--bg-app)", fontSize: 14,
        color: "var(--text-main)", fontFamily: "inherit",
      }}
    />
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const vals = Object.values(form);
    if (vals.some((v) => !v.trim())) { setMessage("All fields are required."); setStatus("error"); return; }
    setStatus("loading");
    try {
      await createWalkIn(form);
      setStatus("success");
      setMessage("Walk-in guest pass created.");
      setForm({ memberFirstName: "", memberPhone: "", guestFirstName: "", guestPhone: "", staffName: "" });
      onSuccess();
    } catch (err) {
      setStatus("error");
      setMessage("Failed to create walk-in pass.");
      console.error(err);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Member First Name</label>
        {field("memberFirstName")}
      </div>
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Member Phone</label>
        {field("memberPhone")}
      </div>
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Guest First Name</label>
        {field("guestFirstName")}
      </div>
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Guest Phone</label>
        {field("guestPhone")}
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Staff Name</label>
        {field("staffName")}
      </div>
      {message && (
        <p style={{ gridColumn: "1 / -1", fontSize: 13, color: status === "error" ? "#c0392b" : "#27ae60" }}>{message}</p>
      )}
      <div style={{ gridColumn: "1 / -1" }}>
        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            padding: "9px 20px", background: "var(--ui-dark)", color: "#fff",
            border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600,
            cursor: status === "loading" ? "not-allowed" : "pointer", fontFamily: "inherit",
          }}
        >
          {status === "loading" ? "Creating..." : "Create Walk-In Pass"}
        </button>
      </div>
    </form>
  );
}

// ── Guest Passes Tab ──────────────────────────────────────────────────────────

function GuestPassesTab() {
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState<"member" | "guest">("member");
  const [filter, setFilter] = useState("all");
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [redeemingId, setRedeemingId] = useState<Id<"guestPasses"> | null>(null);
  const [staffName, setStaffName] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allPasses = useQuery((api as any).guestPasses.list, filter !== "all" ? { status: filter } : {}) as GuestPass[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const byMember = useQuery((api as any).guestPasses.searchByMember, search.trim() && searchType === "member" ? { phone: search.trim() } : "skip") as GuestPass[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const byGuest = useQuery((api as any).guestPasses.searchByGuest, search.trim() && searchType === "guest" ? { phone: search.trim() } : "skip") as GuestPass[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const redeemPass = useMutation((api as any).guestPasses.redeem);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expirePass = useMutation((api as any).guestPasses.expire);

  const passes: GuestPass[] = search.trim()
    ? (searchType === "member" ? byMember : byGuest) ?? []
    : allPasses ?? [];

  async function handleRedeem(id: Id<"guestPasses">, name: string) {
    if (!name.trim()) return;
    try {
      await redeemPass({ id, staffName: name.trim() });
      setRedeemingId(null);
      setStaffName("");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleExpire(id: Id<"guestPasses">) {
    if (!confirm("Mark this pass as expired?")) return;
    try { await expirePass({ id }); } catch (err) { console.error(err); }
  }

  return (
    <div>
      {/* Search + filters */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem", alignItems: "center" }}>
        <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
          <button onClick={() => setSearchType("member")} style={{ padding: "7px 14px", fontSize: 13, background: searchType === "member" ? "var(--ui-dark)" : "transparent", color: searchType === "member" ? "#fff" : "var(--text-muted)", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Member</button>
          <button onClick={() => setSearchType("guest")} style={{ padding: "7px 14px", fontSize: 13, background: searchType === "guest" ? "var(--ui-dark)" : "transparent", color: searchType === "guest" ? "#fff" : "var(--text-muted)", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Guest</button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search by ${searchType} phone…`}
          style={{ flex: 1, minWidth: 200, padding: "7px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 14, color: "var(--text-main)", background: "var(--bg-app)", fontFamily: "inherit" }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "7px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 13, color: "var(--text-main)", background: "var(--bg-app)", fontFamily: "inherit" }}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="redeemed">Redeemed</option>
          <option value="expired">Expired</option>
        </select>
        <button
          onClick={() => setShowWalkIn((v) => !v)}
          style={{ padding: "7px 16px", background: "#D92B2B", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
        >
          {showWalkIn ? "Cancel" : "+ Walk-In Pass"}
        </button>
      </div>

      {/* Walk-in form */}
      {showWalkIn && (
        <div style={{ background: "var(--bg-beige, #F9F5F0)", borderRadius: 8, padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: "1rem", color: "var(--text-main)" }}>Create Walk-In Guest Pass</h3>
          <WalkInForm onSuccess={() => setShowWalkIn(false)} />
        </div>
      )}

      {/* Table */}
      {passes.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: "2rem", textAlign: "center" }}>
          {search.trim() ? "No passes found for that phone number." : "No guest passes yet."}
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border, rgba(0,0,0,0.08))" }}>
                {["Member", "Member Phone", "Guest", "Guest Phone", "Month", "Source", "Created", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {passes.map((p) => (
                <tr key={p._id} style={{ borderBottom: "1px solid var(--border, rgba(0,0,0,0.06))" }}>
                  <td style={{ padding: "10px 12px", color: "var(--text-main)", fontWeight: 500 }}>{p.memberFirstName}</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-muted)", fontFamily: "monospace", fontSize: 12 }}>{p.memberPhone}</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-main)", fontWeight: 500 }}>{p.guestFirstName}</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-muted)", fontFamily: "monospace", fontSize: 12 }}>{p.guestPhone}</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-muted)" }}>{p.monthKey}</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-muted)", fontSize: 12 }}>{p.createdBy}</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{formatDate(p.createdAt)}</td>
                  <td style={{ padding: "10px 12px" }}><StatusPill status={p.status} /></td>
                  <td style={{ padding: "10px 12px" }}>
                    {p.status === "pending" && (
                      redeemingId === p._id ? (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <input
                            value={staffName}
                            onChange={(e) => setStaffName(e.target.value)}
                            placeholder="Your name"
                            style={{ padding: "4px 8px", border: "1px solid var(--border)", borderRadius: 4, fontSize: 12, width: 100, fontFamily: "inherit" }}
                          />
                          <button onClick={() => handleRedeem(p._id, staffName)} style={{ padding: "4px 10px", background: "#27ae60", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>✓</button>
                          <button onClick={() => { setRedeemingId(null); setStaffName(""); }} style={{ padding: "4px 10px", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 4, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>✕</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setRedeemingId(p._id)} style={{ padding: "4px 12px", background: "var(--ui-dark)", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Redeem</button>
                          <button onClick={() => handleExpire(p._id)} style={{ padding: "4px 10px", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 4, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Expire</button>
                        </div>
                      )
                    )}
                    {p.status === "redeemed" && p.redeemedBy && (
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>by {p.redeemedBy}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Referrals Tab ─────────────────────────────────────────────────────────────

function ReferralsTab() {
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState<"referrer" | "friend">("referrer");
  const [filter, setFilter] = useState("all");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allReferrals = useQuery((api as any).referrals.list, filter !== "all" ? { status: filter } : {}) as Referral[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const byReferrer = useQuery((api as any).referrals.searchByReferrer, search.trim() && searchType === "referrer" ? { phone: search.trim() } : "skip") as Referral[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const byFriend = useQuery((api as any).referrals.searchByFriend, search.trim() && searchType === "friend" ? { phone: search.trim() } : "skip") as Referral[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markCompleted = useMutation((api as any).referrals.markCompleted);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markRewarded = useMutation((api as any).referrals.markRewarded);

  const referrals: Referral[] = search.trim()
    ? (searchType === "referrer" ? byReferrer : byFriend) ?? []
    : allReferrals ?? [];

  async function handleComplete(id: Id<"referrals">) {
    const notes = window.prompt("Optional notes about this completion:");
    try { await markCompleted({ id, ...(notes ? { notes } : {}) }); } catch (err) { console.error(err); }
  }

  async function handleReward(id: Id<"referrals">) {
    if (!confirm("Mark this referral as rewarded?")) return;
    try { await markRewarded({ id }); } catch (err) { console.error(err); }
  }

  return (
    <div>
      {/* Search + filters */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem", alignItems: "center" }}>
        <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
          <button onClick={() => setSearchType("referrer")} style={{ padding: "7px 14px", fontSize: 13, background: searchType === "referrer" ? "var(--ui-dark)" : "transparent", color: searchType === "referrer" ? "#fff" : "var(--text-muted)", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Referrer</button>
          <button onClick={() => setSearchType("friend")} style={{ padding: "7px 14px", fontSize: 13, background: searchType === "friend" ? "var(--ui-dark)" : "transparent", color: searchType === "friend" ? "#fff" : "var(--text-muted)", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Friend</button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search by ${searchType} phone…`}
          style={{ flex: 1, minWidth: 200, padding: "7px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 14, color: "var(--text-main)", background: "var(--bg-app)", fontFamily: "inherit" }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "7px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 13, color: "var(--text-main)", background: "var(--bg-app)", fontFamily: "inherit" }}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="rewarded">Rewarded</option>
        </select>
      </div>

      {/* Table */}
      {referrals.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: "2rem", textAlign: "center" }}>
          {search.trim() ? "No referrals found for that phone number." : "No referrals yet."}
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border, rgba(0,0,0,0.08))" }}>
                {["Referrer", "Referrer Phone", "Friend", "Friend Phone", "Created", "Status", "Notes", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {referrals.map((r) => (
                <tr key={r._id} style={{ borderBottom: "1px solid var(--border, rgba(0,0,0,0.06))" }}>
                  <td style={{ padding: "10px 12px", color: "var(--text-main)", fontWeight: 500 }}>{r.referrerFirstName}</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-muted)", fontFamily: "monospace", fontSize: 12 }}>{r.referrerPhone}</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-main)", fontWeight: 500 }}>{r.friendFirstName}</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-muted)", fontFamily: "monospace", fontSize: 12 }}>{r.friendPhone}</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{formatDate(r.createdAt)}</td>
                  <td style={{ padding: "10px 12px" }}><StatusPill status={r.status} /></td>
                  <td style={{ padding: "10px 12px", color: "var(--text-muted)", fontSize: 12, maxWidth: 160 }}>{r.notes ?? "—"}</td>
                  <td style={{ padding: "10px 12px" }}>
                    {r.status === "pending" && (
                      <button onClick={() => handleComplete(r._id)} style={{ padding: "4px 12px", background: "var(--ui-dark)", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Mark Completed</button>
                    )}
                    {r.status === "completed" && (
                      <button onClick={() => handleReward(r._id)} style={{ padding: "4px 12px", background: "#27ae60", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Mark Rewarded</button>
                    )}
                    {r.status === "rewarded" && (
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {r.rewardedAt ? formatDate(r.rewardedAt) : "Done"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FrontDeskPage() {
  const [tab, setTab] = useState<"passes" | "referrals">("passes");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingPasses = useQuery((api as any).guestPasses.list, { status: "pending" }) as GuestPass[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingReferrals = useQuery((api as any).referrals.list, { status: "pending" }) as Referral[] | undefined;

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem" }}>
        Front Desk
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: "2rem" }}>
        Manage guest passes and referrals
      </p>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
        {[
          { label: "Pending Passes",    value: pendingPasses?.length ?? "—",    accent: "#D92B2B" },
          { label: "Pending Referrals", value: pendingReferrals?.length ?? "—", accent: "#2b7cd9" },
        ].map(({ label, value, accent }) => (
          <div key={label} style={{ background: "var(--bg-beige, #F9F5F0)", borderRadius: 8, padding: "1.25rem 1.5rem", borderTop: `3px solid ${accent}` }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: "var(--text-main)", lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--border, rgba(0,0,0,0.08))", marginBottom: "1.5rem" }}>
        {([
          { id: "passes", label: "Guest Passes", count: pendingPasses?.length },
          { id: "referrals", label: "Referrals", count: pendingReferrals?.length },
        ] as { id: "passes" | "referrals"; label: string; count?: number }[]).map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: "10px 20px", background: "none", border: "none",
              borderBottom: tab === id ? "2px solid var(--ui-dark)" : "2px solid transparent",
              marginBottom: -2, cursor: "pointer", fontFamily: "inherit",
              fontSize: 14, fontWeight: tab === id ? 700 : 500,
              color: tab === id ? "var(--text-main)" : "var(--text-muted)",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {label}
            {(count ?? 0) > 0 && (
              <span style={{ background: "#D92B2B", color: "#fff", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "passes" && <GuestPassesTab />}
      {tab === "referrals" && <ReferralsTab />}
    </div>
  );
}
