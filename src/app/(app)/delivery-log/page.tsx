"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CAT_TAG: Record<string, { bg: string; color: string }> = {
  "Strength & Conditioning": { bg: "var(--tag-red-bg)",    color: "var(--tag-red-txt)" },
  Boxing:                    { bg: "var(--tag-blue-bg)",   color: "var(--tag-blue-txt)" },
  Hybrid:                    { bg: "var(--tag-purple-bg)", color: "var(--tag-purple-txt)" },
  Pilates:                   { bg: "var(--tag-yellow-bg)", color: "var(--tag-yellow-txt)" },
  Yoga:                      { bg: "var(--tag-green-bg)",  color: "var(--tag-green-txt)" },
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface LogFormData {
  date: string;
  classId: string;
  instructorId: string;
  actualAttendance: number;
  maxCapacity: number;
  wasPlanned: boolean;
  programFollowed: boolean;
  variationsMade: string;
  notes: string;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  log?: {
    _id: Id<"deliveryLog">;
    date: string;
    classId: string;
    instructorId: string;
    actualAttendance: number;
    maxCapacity: number;
    wasPlanned: boolean;
    programFollowed: boolean;
    variationsMade?: string;
    notes?: string;
  } | null;
  prefill?: Partial<LogFormData> | null;
  classes: { _id: Id<"classes">; name: string; categoryName?: string }[];
  instructors: { _id: Id<"instructors">; name: string }[];
  onClose: () => void;
  onSave: (data: {
    date: string;
    classId: string;
    className: string;
    categoryName: string;
    instructorId: string;
    instructorName: string;
    actualAttendance: number;
    maxCapacity: number;
    wasPlanned: boolean;
    programFollowed: boolean;
    variationsMade?: string;
    notes?: string;
  }) => Promise<void>;
}

function LogModal({ log, prefill, classes, instructors, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState<LogFormData>({
    date: log?.date ?? prefill?.date ?? new Date().toISOString().slice(0, 10),
    classId: log?.classId ?? prefill?.classId ?? (classes[0]?._id ?? ""),
    instructorId: log?.instructorId ?? prefill?.instructorId ?? (instructors[0]?._id ?? ""),
    actualAttendance: log?.actualAttendance ?? prefill?.actualAttendance ?? 0,
    maxCapacity: log?.maxCapacity ?? prefill?.maxCapacity ?? 20,
    wasPlanned: log?.wasPlanned ?? prefill?.wasPlanned ?? false,
    programFollowed: log?.programFollowed ?? prefill?.programFollowed ?? false,
    variationsMade: log?.variationsMade ?? prefill?.variationsMade ?? "",
    notes: log?.notes ?? prefill?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof LogFormData>(key: K, value: LogFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.classId || !form.instructorId || !form.date) return;
    const selectedClass      = classes.find(c => c._id === form.classId);
    const selectedInstructor = instructors.find(i => i._id === form.instructorId);
    if (!selectedClass || !selectedInstructor) return;

    setSaving(true);
    await onSave({
      date: form.date,
      classId: form.classId,
      className: selectedClass.name,
      categoryName: selectedClass.categoryName ?? "",
      instructorId: form.instructorId,
      instructorName: selectedInstructor.name,
      actualAttendance: Number(form.actualAttendance),
      maxCapacity: Number(form.maxCapacity),
      wasPlanned: form.wasPlanned,
      programFollowed: form.programFollowed,
      variationsMade: form.variationsMade || undefined,
      notes: form.notes || undefined,
    });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 560, width: "100%" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 className="font-serif" style={{ fontSize: 24, fontWeight: 500, color: "var(--text-main)" }}>
            {log ? "Edit Delivery Log" : "Log Delivery"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "var(--text-muted)", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="field-label">Date</label>
            <input className="field-input" type="date" value={form.date} onChange={e => set("date", e.target.value)} />
          </div>
          <div>
            <label className="field-label">Class</label>
            <select className="field-input" value={form.classId} onChange={e => set("classId", e.target.value)}>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Instructor</label>
            <select className="field-input" value={form.instructorId} onChange={e => set("instructorId", e.target.value)}>
              {instructors.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Actual Attendance</label>
            <input
              className="field-input"
              type="number"
              min={0}
              value={form.actualAttendance}
              onChange={e => set("actualAttendance", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="field-label">Max Capacity</label>
            <input
              className="field-input"
              type="number"
              min={1}
              value={form.maxCapacity}
              onChange={e => set("maxCapacity", Number(e.target.value))}
            />
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: "flex", gap: 24, marginBottom: 14 }}>
          {(
            [
              { key: "wasPlanned" as const,     label: "Was Planned?" },
              { key: "programFollowed" as const, label: "Program Followed?" },
            ] as const
          ).map(({ key, label }) => (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: "var(--text-main)" }}>
              <input
                type="checkbox"
                checked={form[key]}
                onChange={e => set(key, e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "var(--ui-orange)", cursor: "pointer" }}
              />
              {label}
            </label>
          ))}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="field-label">Variations Made (optional)</label>
          <input
            className="field-input"
            value={form.variationsMade}
            onChange={e => set("variationsMade", e.target.value)}
            placeholder="Describe any variations from the plan…"
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label className="field-label">Notes (optional)</label>
          <textarea
            className="field-input"
            rows={3}
            value={form.notes}
            onChange={e => set("notes", e.target.value)}
            style={{ resize: "vertical" }}
            placeholder="Any additional notes…"
          />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || !form.classId || !form.instructorId || !form.date}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 400, width: "100%", padding: 32 }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-serif" style={{ fontSize: 20, marginBottom: 10, color: "var(--text-main)" }}>Delete this delivery log entry?</h3>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.6 }}>
          This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            onClick={onConfirm}
            style={{
              padding: "9px 22px", borderRadius: "var(--radius-pill)", fontSize: 14, fontWeight: 600,
              background: "var(--tag-red-bg)", color: "var(--tag-red-txt)", border: "none", cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DeliveryLogPage() {
  const { currentUser } = useAuth();

  const logs            = useQuery(api.queries.getDeliveryLog)  ?? [];
  const missingLogs     = useQuery(api.queries.getMissingDeliveryLogs) ?? [];
  const classes         = useQuery(api.queries.getClasses)      ?? [];
  const instructorsRaw  = useQuery(api.queries.getInstructors)  ?? [];
  const instructors     = instructorsRaw.map(i => ({ _id: i._id, name: i.fullName }));

  const addLog       = useMutation(api.mutations.addDeliveryLog);
  const updateLog    = useMutation(api.mutations.updateDeliveryLog);
  const deleteLog    = useMutation(api.mutations.deleteDeliveryLog);
  const submitChange = useMutation(api.mutations.submitPendingChange);

  const [logView, setLogView]             = useState<"logs" | "missing">("logs");
  const [filterPlanned, setFilterPlanned] = useState<"all" | "planned" | "unplanned">("all");
  const [hoveredId, setHoveredId]         = useState<string | null>(null);
  const [showModal, setShowModal]         = useState(false);
  const [editingLog, setEditingLog]       = useState<typeof logs[number] | null>(null);
  const [prefillData, setPrefillData]     = useState<Partial<LogFormData> | null>(null);
  const [deletingId, setDeletingId]       = useState<Id<"deliveryLog"> | null>(null);
  const [statusMsg, setStatusMsg]         = useState<{ type: "success" | "pending" | "error"; text: string } | null>(null);

  const sortedMissing = [...missingLogs].sort((a, b) => b.date.localeCompare(a.date));

  const filtered = logs
    .filter(l => {
      if (filterPlanned === "planned")   return l.wasPlanned;
      if (filterPlanned === "unplanned") return !l.wasPlanned;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalAttendance = logs.reduce((s, l) => s + l.actualAttendance, 0);
  const totalCapacity   = logs.reduce((s, l) => s + l.maxCapacity, 0);
  const avgFillRate     = totalCapacity > 0 ? Math.round((totalAttendance / totalCapacity) * 100) : 0;
  const plannedCount    = logs.filter(l => l.wasPlanned).length;
  const followedCount   = logs.filter(l => l.programFollowed).length;
  const prePlannedRate  = logs.length > 0 ? Math.round((plannedCount / logs.length) * 100) : 0;
  const followedRate    = logs.length > 0 ? Math.round((followedCount / logs.length) * 100) : 0;

  const handleSave = async (data: {
    date: string;
    classId: string;
    className: string;
    categoryName: string;
    instructorId: string;
    instructorName: string;
    actualAttendance: number;
    maxCapacity: number;
    wasPlanned: boolean;
    programFollowed: boolean;
    variationsMade?: string;
    notes?: string;
  }) => {
    if (currentUser?.role === "admin") {
      if (editingLog) {
        await updateLog({ id: editingLog._id, ...data });
      } else {
        await addLog(data);
      }
      setStatusMsg({ type: "success", text: "Saved successfully" });
    } else {
      await submitChange({
        tableName: "deliveryLog",
        action: editingLog ? "update" : "add",
        entityId: editingLog ? String(editingLog._id) : undefined,
        payload: editingLog ? { id: editingLog._id, ...data } : data,
        submittedBy: currentUser!.id,
        submittedByName: currentUser!.displayName,
        description: editingLog
          ? `Update delivery log`
          : `Log delivery: ${data.className} on ${data.date}`,
      });
      setStatusMsg({ type: "pending", text: "Submitted for admin review ✓" });
    }
    setShowModal(false);
    setEditingLog(null);
    setPrefillData(null);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    if (currentUser?.role === "admin") {
      await deleteLog({ id: deletingId });
      setStatusMsg({ type: "success", text: "Saved successfully" });
    } else {
      await submitChange({
        tableName: "deliveryLog",
        action: "delete",
        entityId: String(deletingId),
        payload: { id: deletingId },
        submittedBy: currentUser!.id,
        submittedByName: currentUser!.displayName,
        description: `Delete delivery log`,
      });
      setStatusMsg({ type: "pending", text: "Submitted for admin review ✓" });
    }
    setDeletingId(null);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <h1 className="font-serif page-title" style={{ fontSize: 40 }}>Delivery Logs</h1>
          <p className="page-subtitle">Post-class accountability — planned vs. delivered, attendance, and instructor notes.</p>
        </div>
        <button
          className="btn-primary"
          style={{ marginTop: 8, flexShrink: 0 }}
          onClick={() => { setEditingLog(null); setPrefillData(null); setShowModal(true); }}
        >
          + Log Delivery
        </button>
      </div>

      {/* Status banner */}
      {statusMsg && (
        <div style={{
          padding: "10px 16px",
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 14,
          background: statusMsg.type === "success" ? "#E8F5E9" : statusMsg.type === "pending" ? "#E3F2FD" : "#FFEBEE",
          color: statusMsg.type === "success" ? "#2E7D32" : statusMsg.type === "pending" ? "#1565C0" : "#C62828",
          border: `1px solid ${statusMsg.type === "success" ? "#A5D6A7" : statusMsg.type === "pending" ? "#90CAF9" : "#EF9A9A"}`,
        }}>
          {statusMsg.text}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Classes Logged",      value: logs.length,         sub: "Total entries",                    color: "var(--text-main)" },
          { label: "Avg Fill Rate",        value: `${avgFillRate}%`,   sub: `${totalAttendance} / ${totalCapacity} spots`, color: "var(--tag-blue-txt)" },
          { label: "Pre-Planned Rate",     value: `${prePlannedRate}%`, sub: `${plannedCount} of ${logs.length} planned`, color: "var(--tag-green-txt)" },
          { label: "Program Followed",     value: `${followedRate}%`,  sub: `${followedCount} of ${logs.length} sessions`, color: "var(--tag-purple-txt)" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value" style={{ color: s.color, fontSize: 30 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {([
          { key: "logs" as const, label: "Delivery Logs" },
          { key: "missing" as const, label: `Missing Logs${missingLogs.length > 0 ? ` (${missingLogs.length})` : ""}` },
        ]).map(v => (
          <button
            key={v.key}
            onClick={() => setLogView(v.key)}
            style={{
              padding: "8px 22px", borderRadius: "var(--radius-pill)", fontSize: 14, fontWeight: 600,
              border: "none", cursor: "pointer", transition: "all 0.15s",
              background: logView === v.key ? "var(--ui-dark)" : "var(--bg-beige)",
              color: logView === v.key ? "#fff" : "var(--text-muted)",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Filter pills (only for logs view) */}
      {logView === "logs" && (
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {(["all", "planned", "unplanned"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilterPlanned(f)}
            style={{
              padding: "7px 18px", borderRadius: "var(--radius-pill)", fontSize: 13, fontWeight: 500,
              border: "none", cursor: "pointer", transition: "all 0.15s",
              background: filterPlanned === f ? "var(--ui-dark)" : "var(--bg-beige)",
              color: filterPlanned === f ? "#fff" : "var(--text-muted)",
            }}
          >
            {f === "all" ? "All Logs" : f === "planned" ? "Pre-Planned" : "Improvised"}
          </button>
        ))}
      </div>
      )}

      {/* Missing Logs View */}
      {logView === "missing" && (
        sortedMissing.length === 0 ? (
          <div style={{
            padding: "20px 24px", borderRadius: 12, marginBottom: 16,
            background: "var(--tag-green-bg)", color: "var(--tag-green-txt)",
            fontSize: 15, fontWeight: 500, textAlign: "center",
          }}>
            All caught up — every past class has a delivery log ✓
          </div>
        ) : (
          <div style={{ background: "var(--bg-panel)", borderRadius: "var(--radius-card)", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
            {/* Missing logs header */}
            <div style={{ display: "grid", gridTemplateColumns: "110px 80px 130px 180px 130px 130px 100px", padding: "12px 28px", background: "var(--ui-dark)", gap: 0 }}>
              {["Date", "Day", "Time", "Class", "Category", "Instructor", ""].map(h => (
                <p key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.55)" }}>{h}</p>
              ))}
            </div>

            {sortedMissing.map((slot, i) => {
              const cat = CAT_TAG[slot.categoryName] ?? { bg: "var(--bg-beige)", color: "var(--text-muted)" };
              return (
                <div
                  key={`${slot.date}-${slot.classId}-${slot.instructorId}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "110px 80px 130px 180px 130px 130px 100px",
                    padding: "14px 28px", alignItems: "center", gap: 0,
                    borderBottom: i < sortedMissing.length - 1 ? "1px solid var(--border-soft)" : "none",
                  }}
                >
                  <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{formatDate(slot.date)}</p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{slot.dayOfWeek}</p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{slot.startTime} – {slot.endTime}</p>
                  <p className="font-serif" style={{ fontSize: 15, fontWeight: 500, color: "var(--text-main)" }}>{slot.className}</p>
                  <span style={{ fontSize: 10, fontWeight: 700, background: cat.bg, color: cat.color, padding: "2px 8px", borderRadius: 4, width: "fit-content" }}>{slot.categoryName}</span>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{slot.instructorName}</p>
                  <button
                    onClick={() => {
                      setPrefillData({
                        date: slot.date,
                        classId: slot.classId,
                        instructorId: slot.instructorId,
                        maxCapacity: slot.capacity,
                        wasPlanned: true,
                        programFollowed: true,
                        actualAttendance: 0,
                        variationsMade: "",
                        notes: "",
                      });
                      setEditingLog(null);
                      setShowModal(true);
                    }}
                    style={{
                      padding: "6px 16px", borderRadius: "var(--radius-pill)", fontSize: 12, fontWeight: 600,
                      border: "none", cursor: "pointer",
                      background: "var(--ui-dark)", color: "#fff",
                    }}
                  >
                    Log Now
                  </button>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Table */}
      {logView === "logs" && (filtered.length === 0 ? (
        <div className="hatch" style={{ borderRadius: 16, minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: 15 }}>No logs found — add a delivery log or change the filter.</p>
        </div>
      ) : (
        <div style={{ background: "var(--bg-panel)", borderRadius: "var(--radius-card)", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "110px 180px 130px 90px 80px 90px 1fr 80px", padding: "12px 28px", background: "var(--ui-dark)", gap: 0 }}>
            {["Date", "Class", "Instructor", "Attendance", "Planned?", "Followed?", "Notes / Variations", ""].map(h => (
              <p key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.55)" }}>{h}</p>
            ))}
          </div>

          {filtered.map((log, i) => {
            const cat     = CAT_TAG[log.categoryName] ?? { bg: "var(--bg-beige)", color: "var(--text-muted)" };
            const fillPct = log.maxCapacity > 0 ? Math.round((log.actualAttendance / log.maxCapacity) * 100) : 0;
            const isHovered = hoveredId === log._id;

            return (
              <div
                key={log._id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "110px 180px 130px 90px 80px 90px 1fr 80px",
                  padding: "16px 28px", alignItems: "center", gap: 0,
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--border-soft)" : "none",
                  transition: "background 0.1s",
                  background: isHovered ? "var(--bg-beige)" : "transparent",
                }}
                onMouseEnter={() => setHoveredId(log._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{formatDate(log.date)}</p>

                <div>
                  <p className="font-serif" style={{ fontSize: 15, fontWeight: 500, color: "var(--text-main)", marginBottom: 3 }}>{log.className}</p>
                  <span style={{ fontSize: 10, fontWeight: 700, background: cat.bg, color: cat.color, padding: "2px 8px", borderRadius: 4 }}>{log.categoryName}</span>
                </div>

                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{log.instructorName}</p>

                <div>
                  <p style={{
                    fontSize: 14, fontWeight: 600,
                    color: fillPct >= 90 ? "var(--tag-green-txt)" : fillPct >= 70 ? "var(--text-main)" : "var(--tag-yellow-txt)",
                  }}>
                    {log.actualAttendance}/{log.maxCapacity}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{fillPct}% full</p>
                </div>

                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: "var(--radius-pill)",
                  background: log.wasPlanned ? "var(--tag-green-bg)" : "var(--tag-yellow-bg)",
                  color: log.wasPlanned ? "var(--tag-green-txt)" : "var(--tag-yellow-txt)",
                }}>
                  {log.wasPlanned ? "Yes" : "No"}
                </span>

                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: "var(--radius-pill)",
                  background: log.programFollowed ? "var(--tag-green-bg)" : "var(--tag-red-bg)",
                  color: log.programFollowed ? "var(--tag-green-txt)" : "var(--tag-red-txt)",
                }}>
                  {log.programFollowed ? "Yes" : "No"}
                </span>

                <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {log.variationsMade
                    ? <span style={{ color: "var(--tag-yellow-txt)", fontWeight: 500 }}>{log.variationsMade}</span>
                    : null}
                  {log.notes
                    ? <span>{log.variationsMade ? " · " : ""}{log.notes}</span>
                    : null}
                  {!log.variationsMade && !log.notes
                    ? <span style={{ fontStyle: "italic" }}>—</span>
                    : null}
                </p>

                {/* Edit / Delete — visible on hover */}
                <div
                  style={{
                    display: "flex", gap: 6, alignItems: "center", justifyContent: "flex-end",
                    opacity: isHovered ? 1 : 0, transition: "opacity 0.15s",
                    pointerEvents: isHovered ? "auto" : "none",
                  }}
                >
                  <button
                    onClick={() => { setEditingLog(log); setShowModal(true); }}
                    title="Edit"
                    style={{
                      width: 28, height: 28, borderRadius: "50%", background: "var(--bg-beige)",
                      border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, color: "var(--text-muted)",
                    }}
                  >
                    ✏
                  </button>
                  <button
                    onClick={() => setDeletingId(log._id)}
                    title="Delete"
                    style={{
                      width: 28, height: 28, borderRadius: "50%", background: "var(--tag-red-bg)",
                      border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 15, color: "var(--tag-red-txt)",
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Add / Edit Modal */}
      {showModal && (
        <LogModal
          log={editingLog}
          prefill={prefillData}
          classes={classes}
          instructors={instructors}
          onClose={() => { setShowModal(false); setEditingLog(null); setPrefillData(null); }}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm Modal */}
      {deletingId && (
        <DeleteModal
          onConfirm={handleDelete}
          onClose={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
