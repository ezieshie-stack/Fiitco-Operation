"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";

type Tab = "guest-passes" | "referrals";

const formatPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits.startsWith("1"))
    return `1-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  return raw;
};

const formatDateTime = (ms: number) => {
  const d = new Date(ms);
  return d.toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

// ────────────────────────────────────────────────────────────────────────────
// Guest Pass Walk-In Modal
// ────────────────────────────────────────────────────────────────────────────
function WalkInModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: {
    memberFirstName: string;
    memberPhone: string;
    guestFirstName: string;
    guestPhone: string;
  }) => void;
}) {
  const [memberFirstName, setMemberFirstName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const valid =
    memberFirstName.trim() &&
    memberPhone.trim() &&
    guestFirstName.trim() &&
    guestPhone.trim();

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 500 }}>
              Walk-In Guest Pass
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
              Counts against the member&apos;s monthly limit (2/mo).
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "var(--text-muted)",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Member
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="field-label">First name</label>
              <input
                className="field-input"
                value={memberFirstName}
                onChange={(e) => setMemberFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input
                className="field-input"
                placeholder="416 555 0100"
                value={memberPhone}
                onChange={(e) => setMemberPhone(e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginTop: 8,
            }}
          >
            Guest
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="field-label">First name</label>
              <input
                className="field-input"
                value={guestFirstName}
                onChange={(e) => setGuestFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input
                className="field-input"
                placeholder="416 555 0100"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            className="btn-primary"
            style={{ flex: 1 }}
            disabled={!valid}
            onClick={() =>
              onSave({ memberFirstName, memberPhone, guestFirstName, guestPhone })
            }
          >
            Create Pass
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Referral Manual Entry Modal
// ────────────────────────────────────────────────────────────────────────────
function ManualReferralModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: {
    referrerFirstName: string;
    referrerPhone: string;
    friendFirstName: string;
    friendPhone: string;
  }) => void;
}) {
  const [referrerFirstName, setReferrerFirstName] = useState("");
  const [referrerPhone, setReferrerPhone] = useState("");
  const [friendFirstName, setFriendFirstName] = useState("");
  const [friendPhone, setFriendPhone] = useState("");

  const valid =
    referrerFirstName.trim() &&
    referrerPhone.trim() &&
    friendFirstName.trim() &&
    friendPhone.trim();

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 500 }}>
              Add Referral
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
              Log a referral that came in by phone or in person.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "var(--text-muted)",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Referrer (existing member)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="field-label">First name</label>
              <input
                className="field-input"
                value={referrerFirstName}
                onChange={(e) => setReferrerFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input
                className="field-input"
                placeholder="416 555 0100"
                value={referrerPhone}
                onChange={(e) => setReferrerPhone(e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginTop: 8,
            }}
          >
            Friend (new lead)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="field-label">First name</label>
              <input
                className="field-input"
                value={friendFirstName}
                onChange={(e) => setFriendFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input
                className="field-input"
                placeholder="416 555 0100"
                value={friendPhone}
                onChange={(e) => setFriendPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            className="btn-primary"
            style={{ flex: 1 }}
            disabled={!valid}
            onClick={() =>
              onSave({
                referrerFirstName,
                referrerPhone,
                friendFirstName,
                friendPhone,
              })
            }
          >
            Save Referral
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Guest Pass Tab
// ────────────────────────────────────────────────────────────────────────────
function GuestPassTab({
  setStatusMsg,
}: {
  setStatusMsg: (m: { type: "success" | "error" | "pending"; text: string } | null) => void;
}) {
  const { currentUser } = useAuth();
  const passes = useQuery(api.guestPasses.list, {}) ?? [];
  const createWalkIn = useMutation(api.guestPasses.createWalkIn);
  const redeem = useMutation(api.guestPasses.redeem);
  const expire = useMutation(api.guestPasses.expire);
  const remove = useMutation(api.guestPasses.remove);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "redeemed" | "expired">(
    "pending",
  );
  const [showWalkIn, setShowWalkIn] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return passes.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.memberFirstName.toLowerCase().includes(q) ||
        p.guestFirstName.toLowerCase().includes(q) ||
        p.memberPhone.includes(q) ||
        p.guestPhone.includes(q)
      );
    });
  }, [passes, search, statusFilter]);

  const thisMonthKey = currentMonthKey();
  const stats = useMemo(() => {
    const thisMonth = passes.filter((p) => p.monthKey === thisMonthKey);
    return {
      pending: passes.filter((p) => p.status === "pending").length,
      thisMonth: thisMonth.length,
      redeemedThisMonth: thisMonth.filter((p) => p.status === "redeemed").length,
    };
  }, [passes, thisMonthKey]);

  const handleWalkIn = async (data: {
    memberFirstName: string;
    memberPhone: string;
    guestFirstName: string;
    guestPhone: string;
  }) => {
    try {
      await createWalkIn({ ...data, staffName: currentUser?.displayName ?? "Staff" });
      setShowWalkIn(false);
      setStatusMsg({ type: "success", text: "Walk-in pass created ✓" });
    } catch (e) {
      setStatusMsg({
        type: "error",
        text: e instanceof Error ? e.message : "Something went wrong",
      });
    }
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleRedeem = async (id: Id<"guestPasses">) => {
    try {
      await redeem({ id, staffName: currentUser?.displayName ?? "Staff" });
      setStatusMsg({ type: "success", text: "Pass redeemed ✓" });
    } catch (e) {
      setStatusMsg({
        type: "error",
        text: e instanceof Error ? e.message : "Something went wrong",
      });
    }
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
          Passes submitted from the website or logged as walk-ins. Members get 2 free passes per
          calendar month.
        </p>
        <button onClick={() => setShowWalkIn(true)} className="btn-primary">
          + Walk-In Pass
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div className="stat-card">
          <p className="stat-label">Pending Pickup</p>
          <p className="stat-value">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Issued This Month</p>
          <p className="stat-value" style={{ color: "var(--tag-blue-txt)" }}>
            {stats.thisMonth}
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Redeemed This Month</p>
          <p className="stat-value" style={{ color: "var(--tag-green-txt)" }}>
            {stats.redeemedThisMonth}
          </p>
        </div>
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input
          className="field-input"
          placeholder="Search by member or guest name / phone…"
          style={{ flex: 1 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="field-input"
          style={{ width: 200 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
        >
          <option value="pending">Pending</option>
          <option value="redeemed">Redeemed</option>
          <option value="expired">Expired</option>
          <option value="all">All</option>
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--bg-panel)",
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--ui-dark)" }}>
              {["Guest", "Member", "Submitted", "Source", "Status", ""].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "16px 24px",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.65)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, idx) => {
              const sourceLabel = p.createdBy === "website"
                ? "Website"
                : p.createdBy.startsWith("front-desk")
                  ? `Walk-In (${p.createdBy.replace("front-desk:", "")})`
                  : p.createdBy;
              return (
                <tr
                  key={p._id}
                  style={{
                    borderBottom: "1px solid var(--border-soft)",
                    background: idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)",
                  }}
                >
                  <td style={{ padding: "20px 24px" }}>
                    <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text-main)" }}>
                      {p.guestFirstName}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {formatPhone(p.guestPhone)}
                    </p>
                  </td>
                  <td style={{ padding: "20px 24px" }}>
                    <p style={{ fontSize: 14, color: "var(--text-main)" }}>{p.memberFirstName}</p>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {formatPhone(p.memberPhone)}
                    </p>
                  </td>
                  <td
                    style={{
                      padding: "20px 24px",
                      fontSize: 13,
                      color: "var(--text-muted)",
                    }}
                  >
                    {formatDateTime(p.createdAt)}
                  </td>
                  <td
                    style={{
                      padding: "20px 24px",
                      fontSize: 13,
                      color: "var(--text-muted)",
                    }}
                  >
                    {sourceLabel}
                  </td>
                  <td style={{ padding: "20px 24px" }}>
                    <span
                      style={{
                        background:
                          p.status === "redeemed"
                            ? "var(--tag-green-bg)"
                            : p.status === "expired"
                              ? "var(--tag-red-bg)"
                              : "var(--tag-blue-bg)",
                        color:
                          p.status === "redeemed"
                            ? "var(--tag-green-txt)"
                            : p.status === "expired"
                              ? "var(--tag-red-txt)"
                              : "var(--tag-blue-txt)",
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: "var(--radius-pill)",
                        textTransform: "capitalize",
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: "20px 24px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      {p.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleRedeem(p._id)}
                            className="btn-primary"
                            style={{ padding: "6px 12px", fontSize: 13 }}
                          >
                            Redeem
                          </button>
                          <button
                            onClick={() => expire({ id: p._id })}
                            className="btn-ghost"
                            style={{ padding: "6px 12px", fontSize: 13 }}
                          >
                            Expire
                          </button>
                        </>
                      )}
                      {currentUser?.role === "admin" && (
                        <button
                          onClick={() => remove({ id: p._id })}
                          style={{
                            background: "none",
                            border: "none",
                            fontSize: 13,
                            color: "var(--tag-red-txt)",
                            cursor: "pointer",
                            padding: "6px 8px",
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div
          style={{
            background: "var(--bg-panel)",
            borderRadius: "var(--radius-card)",
            padding: "60px 40px",
            textAlign: "center",
            marginTop: 16,
          }}
        >
          <p style={{ fontSize: 40, marginBottom: 12 }}>🎟️</p>
          <p className="font-serif" style={{ fontSize: 18, fontWeight: 500, marginBottom: 6 }}>
            No guest passes to show
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            {statusFilter === "pending"
              ? "Nothing pending pickup right now."
              : "Try a different filter or check back later."}
          </p>
        </div>
      )}

      {showWalkIn && <WalkInModal onClose={() => setShowWalkIn(false)} onSave={handleWalkIn} />}
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Referrals Tab
// ────────────────────────────────────────────────────────────────────────────
function ReferralsTab({
  setStatusMsg,
}: {
  setStatusMsg: (m: { type: "success" | "error" | "pending"; text: string } | null) => void;
}) {
  const { currentUser } = useAuth();
  const referrals = useQuery(api.referrals.list, {}) ?? [];
  const create = useMutation(api.referrals.create);
  const markCompleted = useMutation(api.referrals.markCompleted);
  const markRewarded = useMutation(api.referrals.markRewarded);
  const remove = useMutation(api.referrals.remove);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "completed" | "rewarded"
  >("pending");
  const [showManual, setShowManual] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return referrals.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.referrerFirstName.toLowerCase().includes(q) ||
        r.friendFirstName.toLowerCase().includes(q) ||
        r.referrerPhone.includes(q) ||
        r.friendPhone.includes(q)
      );
    });
  }, [referrals, search, statusFilter]);

  const stats = useMemo(
    () => ({
      pending: referrals.filter((r) => r.status === "pending").length,
      completed: referrals.filter((r) => r.status === "completed").length,
      rewarded: referrals.filter((r) => r.status === "rewarded").length,
    }),
    [referrals],
  );

  const handleManualAdd = async (data: {
    referrerFirstName: string;
    referrerPhone: string;
    friendFirstName: string;
    friendPhone: string;
  }) => {
    try {
      await create({ ...data, createdBy: "front-desk" });
      setShowManual(false);
      setStatusMsg({ type: "success", text: "Referral added ✓" });
    } catch (e) {
      setStatusMsg({
        type: "error",
        text: e instanceof Error ? e.message : "Something went wrong",
      });
    }
    setTimeout(() => setStatusMsg(null), 4000);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
          Once a referred friend signs up for a full membership, mark it completed. When the 50%
          reward is applied in Mindbody, mark it rewarded.
        </p>
        <button onClick={() => setShowManual(true)} className="btn-primary">
          + Add Referral
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div className="stat-card">
          <p className="stat-label">Pending</p>
          <p className="stat-value">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Signed Up</p>
          <p className="stat-value" style={{ color: "var(--tag-blue-txt)" }}>
            {stats.completed}
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Rewarded</p>
          <p className="stat-value" style={{ color: "var(--tag-green-txt)" }}>
            {stats.rewarded}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input
          className="field-input"
          placeholder="Search by referrer or friend name / phone…"
          style={{ flex: 1 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="field-input"
          style={{ width: 200 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
        >
          <option value="pending">Pending</option>
          <option value="completed">Signed Up</option>
          <option value="rewarded">Rewarded</option>
          <option value="all">All</option>
        </select>
      </div>

      <div
        style={{
          background: "var(--bg-panel)",
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--ui-dark)" }}>
              {["Friend", "Referrer", "Submitted", "Source", "Status", ""].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "16px 24px",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.65)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <tr
                key={r._id}
                style={{
                  borderBottom: "1px solid var(--border-soft)",
                  background: idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)",
                }}
              >
                <td style={{ padding: "20px 24px" }}>
                  <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text-main)" }}>
                    {r.friendFirstName}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {formatPhone(r.friendPhone)}
                  </p>
                </td>
                <td style={{ padding: "20px 24px" }}>
                  <p style={{ fontSize: 14, color: "var(--text-main)" }}>{r.referrerFirstName}</p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {formatPhone(r.referrerPhone)}
                  </p>
                </td>
                <td
                  style={{ padding: "20px 24px", fontSize: 13, color: "var(--text-muted)" }}
                >
                  {formatDateTime(r.createdAt)}
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    fontSize: 13,
                    color: "var(--text-muted)",
                    textTransform: "capitalize",
                  }}
                >
                  {r.createdBy.replace("-", " ")}
                </td>
                <td style={{ padding: "20px 24px" }}>
                  <span
                    style={{
                      background:
                        r.status === "rewarded"
                          ? "var(--tag-green-bg)"
                          : r.status === "completed"
                            ? "var(--tag-purple-bg)"
                            : "var(--tag-blue-bg)",
                      color:
                        r.status === "rewarded"
                          ? "var(--tag-green-txt)"
                          : r.status === "completed"
                            ? "var(--tag-purple-txt)"
                            : "var(--tag-blue-txt)",
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: "var(--radius-pill)",
                      textTransform: "capitalize",
                    }}
                  >
                    {r.status === "completed" ? "Signed Up" : r.status}
                  </span>
                </td>
                <td style={{ padding: "20px 24px", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    {r.status === "pending" && (
                      <button
                        onClick={() => markCompleted({ id: r._id })}
                        className="btn-primary"
                        style={{ padding: "6px 12px", fontSize: 13 }}
                      >
                        Mark Signed Up
                      </button>
                    )}
                    {r.status === "completed" && (
                      <button
                        onClick={() => markRewarded({ id: r._id })}
                        className="btn-primary"
                        style={{ padding: "6px 12px", fontSize: 13 }}
                      >
                        Mark Rewarded
                      </button>
                    )}
                    {currentUser?.role === "admin" && (
                      <button
                        onClick={() => remove({ id: r._id })}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: 13,
                          color: "var(--tag-red-txt)",
                          cursor: "pointer",
                          padding: "6px 8px",
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div
          style={{
            background: "var(--bg-panel)",
            borderRadius: "var(--radius-card)",
            padding: "60px 40px",
            textAlign: "center",
            marginTop: 16,
          }}
        >
          <p style={{ fontSize: 40, marginBottom: 12 }}>🤝</p>
          <p className="font-serif" style={{ fontSize: 18, fontWeight: 500, marginBottom: 6 }}>
            No referrals to show
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            {statusFilter === "pending"
              ? "No referrals awaiting sign-up right now."
              : "Try a different filter."}
          </p>
        </div>
      )}

      {showManual && (
        <ManualReferralModal onClose={() => setShowManual(false)} onSave={handleManualAdd} />
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────
export default function FrontDeskPage() {
  const [tab, setTab] = useState<Tab>("guest-passes");
  const [statusMsg, setStatusMsg] = useState<
    { type: "success" | "error" | "pending"; text: string } | null
  >(null);

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 32,
        }}
      >
        <div>
          <h1 className="page-title">Front Desk</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Manage guest passes and member referrals submitted from the website or logged in
            person.
          </p>
        </div>
      </div>

      {/* Status banner */}
      {statusMsg && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 14,
            background:
              statusMsg.type === "success"
                ? "#E8F5E9"
                : statusMsg.type === "pending"
                  ? "#E3F2FD"
                  : "#FFEBEE",
            color:
              statusMsg.type === "success"
                ? "#2E7D32"
                : statusMsg.type === "pending"
                  ? "#1565C0"
                  : "#C62828",
            border: `1px solid ${
              statusMsg.type === "success"
                ? "#A5D6A7"
                : statusMsg.type === "pending"
                  ? "#90CAF9"
                  : "#EF9A9A"
            }`,
          }}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 32,
          borderBottom: "1px solid var(--border-soft)",
        }}
      >
        {(
          [
            { key: "guest-passes", label: "Guest Passes" },
            { key: "referrals", label: "Referrals" },
          ] as const
        ).map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background: "none",
                border: "none",
                padding: "12px 20px",
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                color: active ? "var(--text-main)" : "var(--text-muted)",
                borderBottom: active
                  ? "2px solid var(--ui-dark)"
                  : "2px solid transparent",
                cursor: "pointer",
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "guest-passes" ? (
        <GuestPassTab setStatusMsg={setStatusMsg} />
      ) : (
        <ReferralsTab setStatusMsg={setStatusMsg} />
      )}
    </div>
  );
}
