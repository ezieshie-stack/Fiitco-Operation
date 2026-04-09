"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { Id } from "../../../../convex/_generated/dataModel";

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(ts: number | string) {
  try {
    const d = typeof ts === "number" ? new Date(ts) : new Date(ts);
    return d.toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return String(ts);
  }
}

type FilterTab = "all" | "active" | "inactive";

// ── Role badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "admin";
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        padding: "2px 8px",
        borderRadius: 4,
        background: isAdmin ? "var(--ui-dark)" : "var(--bg-beige)",
        color: isAdmin ? "white" : "var(--text-main)",
        textTransform: "uppercase",
      }}
    >
      {role}
    </span>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    active:   { bg: "#E8F5E9", color: "#2E7D32" },
    pending:  { bg: "#FFF8E1", color: "#F9A825" },
    inactive: { bg: "#F5F5F5", color: "#9E9E9E" },
  };
  const s = styles[status] ?? styles.inactive;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.06em",
        padding: "2px 8px",
        borderRadius: 4,
        background: s.bg,
        color: s.color,
        textTransform: "uppercase",
      }}
    >
      {status}
    </span>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ManageUsersPage() {
  const { currentUser } = useAuth();
  const allUsers = useQuery(api.auth.getAllUsers) ?? [];
  const pendingUserCount = useQuery(api.auth.getPendingUserCount) ?? 0;

  const approveUser = useMutation(api.auth.approveUser);
  const deactivateUser = useMutation(api.auth.deactivateUser);
  const reactivateUser = useMutation(api.auth.reactivateUser);
  const changeUserRole = useMutation(api.auth.changeUserRole);
  const adminResetPassword = useMutation(api.auth.adminResetPassword);

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirmRoleId, setConfirmRoleId] = useState<string | null>(null);
  const [resetPwId, setResetPwId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Auto-clear status message
  useEffect(() => {
    if (!statusMsg) return;
    const t = setTimeout(() => setStatusMsg(null), 3000);
    return () => clearTimeout(t);
  }, [statusMsg]);

  // ── Access guard ─────────────────────────────────────────────────────────
  if (currentUser?.role !== "admin") {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: 40,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 4 }}>🔒</div>
        <h2
          style={{
            fontFamily: "var(--font-serif, serif)",
            fontSize: 24,
            margin: 0,
            color: "var(--text-main)",
          }}
        >
          Access Denied
        </h2>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: 14,
            margin: 0,
            maxWidth: 320,
          }}
        >
          This page is restricted to administrators. Contact your gym manager if
          you need access.
        </p>
      </div>
    );
  }

  // ── Derived data ─────────────────────────────────────────────────────────
  const pendingUsers = allUsers.filter((u) => u.status === "pending");
  const filteredUsers =
    activeTab === "all"
      ? allUsers
      : allUsers.filter((u) =>
          activeTab === "active" ? u.status === "active" : u.status === "inactive"
        );

  // ── Action helpers ───────────────────────────────────────────────────────
  async function handleApprove(id: Id<"users">) {
    try {
      await approveUser({ id });
      setStatusMsg({ type: "success", text: "User approved successfully." });
    } catch (e: any) {
      setStatusMsg({ type: "error", text: e?.message ?? "Failed to approve user." });
    }
  }

  async function handleReject(id: Id<"users">) {
    try {
      await deactivateUser({ id });
      setStatusMsg({ type: "success", text: "User rejected (deactivated)." });
    } catch (e: any) {
      setStatusMsg({ type: "error", text: e?.message ?? "Failed to reject user." });
    }
  }

  async function handleDeactivate(id: Id<"users">) {
    try {
      await deactivateUser({ id });
      setStatusMsg({ type: "success", text: "User deactivated." });
    } catch (e: any) {
      setStatusMsg({ type: "error", text: e?.message ?? "Failed to deactivate user." });
    }
  }

  async function handleReactivate(id: Id<"users">) {
    try {
      await reactivateUser({ id });
      setStatusMsg({ type: "success", text: "User reactivated." });
    } catch (e: any) {
      setStatusMsg({ type: "error", text: e?.message ?? "Failed to reactivate user." });
    }
  }

  async function handleRoleChange(id: Id<"users">, currentRole: string) {
    const newRole = currentRole === "admin" ? "instructor" : "admin";
    try {
      await changeUserRole({ id, newRole });
      setStatusMsg({ type: "success", text: `Role changed to ${newRole}.` });
      setConfirmRoleId(null);
    } catch (e: any) {
      setStatusMsg({ type: "error", text: e?.message ?? "Failed to change role." });
    }
  }

  async function handleResetPassword(id: Id<"users">) {
    if (!newPassword.trim()) {
      setStatusMsg({ type: "error", text: "Password cannot be empty." });
      return;
    }
    try {
      await adminResetPassword({ id, newPassword: newPassword.trim() });
      setStatusMsg({ type: "success", text: "Password reset successfully." });
      setResetPwId(null);
      setNewPassword("");
    } catch (e: any) {
      setStatusMsg({ type: "error", text: e?.message ?? "Failed to reset password." });
    }
  }

  // ── Small-button base style ──────────────────────────────────────────────
  const btnBase: React.CSSProperties = {
    fontSize: 12,
    padding: "4px 12px",
    borderRadius: "var(--radius-pill)",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 600,
    transition: "opacity 0.15s",
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    ...btnBase,
    background: isActive ? "var(--ui-dark)" : "transparent",
    color: isActive ? "#FFFFFF" : "var(--text-muted)",
    border: isActive ? "none" : "1px solid var(--border-soft)",
  });

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <h1
        className="font-serif page-title"
        style={{ margin: 0, marginBottom: 4 }}
      >
        Manage Users
      </h1>
      <p
        className="page-subtitle"
        style={{ margin: 0, marginBottom: 24, color: "var(--text-muted)" }}
      >
        Approve new accounts, manage roles, and reset passwords.
      </p>

      {/* Status banner */}
      {statusMsg && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: "var(--radius-card)",
            marginBottom: 20,
            fontSize: 14,
            fontWeight: 500,
            background: statusMsg.type === "success" ? "#E8F5E9" : "#FFEBEE",
            color: statusMsg.type === "success" ? "#2E7D32" : "#C62828",
          }}
        >
          {statusMsg.text}
        </div>
      )}

      {/* ── Pending Approvals ─────────────────────────────────────────────── */}
      {pendingUsers.length > 0 && (
        <div
          style={{
            background: "#FFF8E1",
            border: "1px solid #F9A825",
            borderRadius: "var(--radius-card)",
            padding: "20px 24px",
            marginBottom: 28,
          }}
        >
          <h2
            className="font-serif"
            style={{ margin: 0, marginBottom: 16, fontSize: 18, color: "var(--text-main)" }}
          >
            Pending Approvals ({pendingUsers.length})
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pendingUsers.map((user) => (
              <div
                key={user._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "white",
                  borderRadius: "var(--radius-card)",
                  padding: "12px 16px",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-main)" }}>
                    {user.fullName}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {user.email} &middot; Registered{" "}
                    {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleApprove(user._id as Id<"users">)}
                    style={{
                      ...btnBase,
                      background: "var(--ui-dark)",
                      color: "white",
                      border: "none",
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(user._id as Id<"users">)}
                    style={{
                      ...btnBase,
                      background: "transparent",
                      border: "1px solid #EF5350",
                      color: "#EF5350",
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── All Users ─────────────────────────────────────────────────────── */}
      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["all", "active", "inactive"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={tabStyle(activeTab === tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {allUsers.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "var(--text-muted)",
            fontSize: 14,
          }}
        >
          No users found &mdash; click Reload Data on the dashboard to seed.
        </div>
      ) : (
        <div
          style={{
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--border-soft)",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
            }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--bg-panel)",
                  borderBottom: "1px solid var(--border-soft)",
                }}
              >
                {["Name", "Email", "Role", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 14px",
                      fontWeight: 600,
                      fontSize: 12,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isSelf = user._id === currentUser?.id;
                const userId = user._id as Id<"users">;

                return (
                  <tr
                    key={user._id}
                    style={{ borderBottom: "1px solid var(--border-soft)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background =
                        "var(--bg-beige)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background =
                        "transparent";
                    }}
                  >
                    {/* Name */}
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                        {user.fullName}
                      </div>
                      {user.displayName && (
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {user.displayName}
                        </div>
                      )}
                    </td>

                    {/* Email */}
                    <td style={{ padding: "10px 14px", color: "var(--text-muted)" }}>
                      {user.email}
                    </td>

                    {/* Role */}
                    <td style={{ padding: "10px 14px" }}>
                      <RoleBadge role={user.role} />
                    </td>

                    {/* Status */}
                    <td style={{ padding: "10px 14px" }}>
                      <StatusBadge status={user.status} />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                        {/* Toggle Role */}
                        {confirmRoleId === user._id ? (
                          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                              Confirm?
                            </span>
                            <button
                              onClick={() => handleRoleChange(userId, user.role)}
                              style={{
                                ...btnBase,
                                background: "var(--ui-dark)",
                                color: "white",
                                border: "none",
                              }}
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmRoleId(null)}
                              style={{
                                ...btnBase,
                                background: "transparent",
                                border: "1px solid var(--border-soft)",
                                color: "var(--text-muted)",
                              }}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmRoleId(user._id)}
                            disabled={isSelf}
                            title={isSelf ? "Cannot change your own role" : undefined}
                            style={{
                              ...btnBase,
                              background: "transparent",
                              border: "1px solid var(--border-soft)",
                              color: isSelf ? "var(--text-muted)" : "var(--text-main)",
                              opacity: isSelf ? 0.4 : 1,
                              cursor: isSelf ? "not-allowed" : "pointer",
                            }}
                          >
                            {user.role === "instructor" ? "Make Admin" : "Make Instructor"}
                          </button>
                        )}

                        {/* Deactivate / Reactivate */}
                        {user.status === "active" ? (
                          <button
                            onClick={() => handleDeactivate(userId)}
                            disabled={isSelf}
                            title={isSelf ? "Cannot deactivate yourself" : undefined}
                            style={{
                              ...btnBase,
                              background: "transparent",
                              border: "1px solid #EF5350",
                              color: "#EF5350",
                              opacity: isSelf ? 0.4 : 1,
                              cursor: isSelf ? "not-allowed" : "pointer",
                            }}
                          >
                            Deactivate
                          </button>
                        ) : user.status === "inactive" ? (
                          <button
                            onClick={() => handleReactivate(userId)}
                            style={{
                              ...btnBase,
                              background: "transparent",
                              border: "1px solid var(--tag-green-txt)",
                              color: "var(--tag-green-txt)",
                            }}
                          >
                            Reactivate
                          </button>
                        ) : null}

                        {/* Reset Password */}
                        {resetPwId !== user._id && (
                          <button
                            onClick={() => {
                              setResetPwId(user._id);
                              setNewPassword("");
                            }}
                            style={{
                              ...btnBase,
                              background: "transparent",
                              border: "1px solid var(--border-soft)",
                              color: "var(--text-muted)",
                            }}
                          >
                            Reset Password
                          </button>
                        )}
                      </div>

                      {/* Reset password inline form */}
                      {resetPwId === user._id && (
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            alignItems: "center",
                            marginTop: 8,
                          }}
                        >
                          <input
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="field-input"
                            style={{
                              fontSize: 12,
                              padding: "4px 10px",
                              width: 160,
                            }}
                          />
                          <button
                            onClick={() => handleResetPassword(userId)}
                            style={{
                              ...btnBase,
                              background: "var(--ui-dark)",
                              color: "white",
                              border: "none",
                            }}
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => {
                              setResetPwId(null);
                              setNewPassword("");
                            }}
                            style={{
                              ...btnBase,
                              background: "transparent",
                              border: "1px solid var(--border-soft)",
                              color: "var(--text-muted)",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
