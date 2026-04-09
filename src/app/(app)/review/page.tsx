"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { Id } from "../../../../convex/_generated/dataModel";

// ── Table name → readable label ──────────────────────────────────────────────
const TABLE_LABELS: Record<string, string> = {
  weeklySchedule: "Weekly Schedule",
  classes: "Class Library",
  exercises: "Exercise Library",
  instructors: "Instructor Library",
  equipment: "Equipment",
  pathways: "Training Pathways",
  classPrograms: "Lesson Plans",
  deliveryLog: "Delivery Logs",
  availability: "Availability",
  categories: "Category Library",
  clientJourneys: "Client Journey",
};

// ── Action badge styles ───────────────────────────────────────────────────────
const ACTION_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  add:    { bg: "#E8F5E9", color: "#2E7D32", label: "Add" },
  update: { bg: "#E3F2FD", color: "#1565C0", label: "Update" },
  delete: { bg: "#FFEBEE", color: "#C62828", label: "Delete" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function PayloadPreview({ payload }: { payload: unknown }) {
  if (!payload || typeof payload !== "object") return null;
  const entries = Object.entries(payload as Record<string, unknown>)
    .filter(([, v]) => v !== undefined && v !== null && !Array.isArray(v) && typeof v !== "object")
    .slice(0, 8);

  return (
    <div style={{
      background: "var(--bg-beige)",
      borderRadius: 8,
      padding: "10px 12px",
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 10,
    }}>
      {entries.map(([key, val]) => (
        <span key={key} style={{
          fontSize: 11,
          background: "white",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 4,
          padding: "2px 8px",
          color: "var(--text-muted)",
          fontFamily: "monospace",
          whiteSpace: "nowrap",
        }}>
          <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{key}</span>
          {": "}
          <span>{String(val)}</span>
        </span>
      ))}
      {Object.entries(payload as Record<string, unknown>).length > 8 && (
        <span style={{ fontSize: 11, color: "var(--text-muted)", padding: "2px 4px" }}>
          +{Object.entries(payload as Record<string, unknown>).length - 8} more
        </span>
      )}
    </div>
  );
}

// ── Deny inline form ──────────────────────────────────────────────────────────
function DenyForm({
  onConfirm,
  onCancel,
}: {
  onConfirm: (note: string) => void;
  onCancel: () => void;
}) {
  const [note, setNote] = useState("");
  return (
    <div style={{
      marginTop: 12,
      padding: "12px 14px",
      background: "#FFF8F8",
      border: "1px solid #FFCDD2",
      borderRadius: 8,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#C62828" }}>
        Denial reason (optional)
      </label>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Incorrect timing, please revise and resubmit"
        style={{
          border: "1px solid #FFCDD2",
          borderRadius: 6,
          padding: "7px 10px",
          fontSize: 13,
          background: "white",
          color: "var(--text-main)",
          outline: "none",
          fontFamily: "inherit",
        }}
        onKeyDown={(e) => { if (e.key === "Enter") onConfirm(note); }}
        autoFocus
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => onConfirm(note)}
          style={{
            background: "#C62828",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "6px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Confirm Denial
        </button>
        <button
          onClick={onCancel}
          style={{
            background: "transparent",
            color: "var(--text-muted)",
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 6,
            padding: "6px 14px",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    pending:  { bg: "#FFF8E1", color: "#F57F17" },
    approved: { bg: "#E8F5E9", color: "#2E7D32" },
    denied:   { bg: "#FFEBEE", color: "#C62828" },
  };
  const s = styles[status] ?? { bg: "#F5F5F5", color: "#555" };
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      borderRadius: "var(--radius-pill)",
      padding: "3px 10px",
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    }}>
      {status}
    </span>
  );
}

// ── Change card ───────────────────────────────────────────────────────────────
function ChangeCard({
  change,
  currentUserName,
}: {
  change: {
    _id: Id<"pendingChanges">;
    tableName: string;
    action: string;
    payload: unknown;
    submittedBy: string;
    submittedByName: string;
    submittedAt: string;
    status: string;
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNote?: string;
    description: string;
  };
  currentUserName: string;
}) {
  const [showDenyForm, setShowDenyForm] = useState(false);
  const [loading, setLoading] = useState<"approve" | "deny" | null>(null);

  const approve = useMutation(api.mutations.approvePendingChange);
  const deny = useMutation(api.mutations.denyPendingChange);

  const actionStyle = ACTION_STYLES[change.action] ?? { bg: "#F5F5F5", color: "#555", label: change.action };
  const tableLabel = TABLE_LABELS[change.tableName] ?? change.tableName;

  const handleApprove = async () => {
    setLoading("approve");
    try {
      await approve({ id: change._id, reviewedBy: currentUserName });
    } finally {
      setLoading(null);
    }
  };

  const handleDeny = async (note: string) => {
    setLoading("deny");
    try {
      await deny({ id: change._id, reviewedBy: currentUserName, reviewNote: note || undefined });
      setShowDenyForm(false);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{
      background: "white",
      border: "1px solid rgba(0,0,0,0.07)",
      borderRadius: 12,
      padding: "18px 20px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      transition: "box-shadow 0.15s",
    }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* Action badge */}
          <span style={{
            background: actionStyle.bg,
            color: actionStyle.color,
            borderRadius: 4,
            padding: "2px 9px",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            {actionStyle.label}
          </span>
          {/* Table label */}
          <span style={{
            background: "var(--bg-beige)",
            color: "var(--text-main)",
            borderRadius: 4,
            padding: "2px 9px",
            fontSize: 12,
            fontWeight: 600,
          }}>
            {tableLabel}
          </span>
        </div>

        {/* Status badge (non-pending) */}
        {change.status !== "pending" && <StatusBadge status={change.status} />}
      </div>

      {/* Description */}
      <p style={{
        margin: "10px 0 0",
        fontSize: 14,
        color: "var(--text-main)",
        lineHeight: 1.5,
        fontWeight: 500,
      }}>
        {change.description}
      </p>

      {/* Payload preview */}
      <PayloadPreview payload={change.payload} />

      {/* Meta */}
      <div style={{
        display: "flex",
        gap: 20,
        marginTop: 12,
        fontSize: 12,
        color: "var(--text-muted)",
        flexWrap: "wrap",
      }}>
        <span>
          <span style={{ fontWeight: 600 }}>Submitted by</span>{" "}
          {change.submittedByName}
        </span>
        <span>
          <span style={{ fontWeight: 600 }}>At</span>{" "}
          {formatDate(change.submittedAt)}
        </span>
      </div>

      {/* Review info (approved / denied) */}
      {change.status !== "pending" && change.reviewedBy && (
        <div style={{
          marginTop: 10,
          padding: "8px 12px",
          background: change.status === "approved" ? "#F1F8F1" : "#FFF5F5",
          borderRadius: 7,
          fontSize: 12,
          color: "var(--text-muted)",
        }}>
          <span style={{ fontWeight: 600 }}>
            {change.status === "approved" ? "Approved" : "Denied"}
          </span>
          {" by "}
          {change.reviewedBy}
          {change.reviewedAt && (
            <> on {formatDate(change.reviewedAt)}</>
          )}
          {change.reviewNote && (
            <div style={{ marginTop: 4, color: "#C62828", fontStyle: "italic" }}>
              Note: {change.reviewNote}
            </div>
          )}
        </div>
      )}

      {/* Action buttons (pending only) */}
      {change.status === "pending" && !showDenyForm && (
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            onClick={handleApprove}
            disabled={loading !== null}
            style={{
              background: "var(--ui-dark)",
              color: "white",
              border: "none",
              borderRadius: 7,
              padding: "8px 20px",
              fontSize: 13,
              fontWeight: 600,
              cursor: loading !== null ? "not-allowed" : "pointer",
              opacity: loading !== null ? 0.6 : 1,
              fontFamily: "inherit",
            }}
          >
            {loading === "approve" ? "Approving…" : "Approve"}
          </button>
          <button
            onClick={() => setShowDenyForm(true)}
            disabled={loading !== null}
            style={{
              background: "#C62828",
              color: "white",
              border: "none",
              borderRadius: 7,
              padding: "8px 20px",
              fontSize: 13,
              fontWeight: 600,
              cursor: loading !== null ? "not-allowed" : "pointer",
              opacity: loading !== null ? 0.6 : 1,
              fontFamily: "inherit",
            }}
          >
            Deny
          </button>
        </div>
      )}

      {/* Deny form */}
      {change.status === "pending" && showDenyForm && (
        <DenyForm
          onConfirm={handleDeny}
          onCancel={() => setShowDenyForm(false)}
        />
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
type FilterStatus = "pending" | "approved" | "denied";

export default function ReviewQueuePage() {
  const { currentUser } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("pending");

  const allChanges = useQuery(api.queries.getPendingChanges, {});

  // Access denied guard
  if (currentUser?.role !== "admin") {
    return (
      <div style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 40,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 40, marginBottom: 4 }}>🔒</div>
        <h2 style={{ fontFamily: "var(--font-serif, serif)", fontSize: 24, margin: 0, color: "var(--text-main)" }}>
          Access Denied
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0, maxWidth: 320 }}>
          This page is restricted to administrators. Contact your gym manager if you need access.
        </p>
      </div>
    );
  }

  // Count by status
  const counts = {
    pending:  (allChanges ?? []).filter((c) => c.status === "pending").length,
    approved: (allChanges ?? []).filter((c) => c.status === "approved").length,
    denied:   (allChanges ?? []).filter((c) => c.status === "denied").length,
  };

  const filtered = (allChanges ?? []).filter((c) => c.status === activeFilter);

  const tabStyles = (tab: FilterStatus): React.CSSProperties => ({
    padding: "8px 18px",
    borderRadius: "var(--radius-pill)",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "inherit",
    transition: "all 0.15s",
    background: activeFilter === tab ? "var(--ui-dark)" : "transparent",
    color: activeFilter === tab ? "white" : "var(--text-muted)",
    outline: "none",
  });

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px" }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: "var(--font-serif, serif)",
          fontSize: 28,
          fontWeight: 700,
          margin: "0 0 6px",
          color: "var(--text-main)",
        }}>
          Review Queue
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
          Pending instructor changes awaiting approval
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: "flex",
        gap: 4,
        background: "var(--bg-beige)",
        borderRadius: "var(--radius-pill)",
        padding: 4,
        marginBottom: 24,
        width: "fit-content",
      }}>
        {(["pending", "approved", "denied"] as FilterStatus[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            style={tabStyles(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {counts[tab] > 0 && (
              <span style={{
                marginLeft: 6,
                background: activeFilter === tab ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.1)",
                borderRadius: 10,
                padding: "1px 7px",
                fontSize: 11,
              }}>
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {allChanges === undefined && (
        <div style={{ color: "var(--text-muted)", fontSize: 14, padding: "24px 0" }}>
          Loading changes…
        </div>
      )}

      {/* Empty state */}
      {allChanges !== undefined && filtered.length === 0 && (
        <div style={{
          padding: "48px 24px",
          textAlign: "center",
          background: "white",
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.06)",
        }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>
            {activeFilter === "pending" ? "✓" : activeFilter === "approved" ? "📋" : "🚫"}
          </div>
          <p style={{
            color: "var(--text-muted)",
            fontSize: 14,
            margin: 0,
            fontWeight: 500,
          }}>
            No {activeFilter} changes
          </p>
          {activeFilter === "pending" && (
            <p style={{ color: "var(--text-muted)", fontSize: 12, margin: "6px 0 0" }}>
              All caught up — nothing needs your review right now.
            </p>
          )}
        </div>
      )}

      {/* Change cards */}
      {filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((change) => (
            <ChangeCard
              key={change._id}
              change={change}
              currentUserName={currentUser.displayName ?? currentUser.email ?? "Admin"}
            />
          ))}
        </div>
      )}

    </div>
  );
}
