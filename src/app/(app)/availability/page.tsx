"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";

const DAYS_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type DayOfWeek = (typeof DAYS_ORDER)[number];

interface AvailabilityDoc {
  _id: Id<"availability">;
  instructorId: string;
  instructorName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  available: boolean;
  notes?: string;
}

interface AvailabilityExceptionDoc {
  _id: Id<"availabilityExceptions">;
  instructorId: string;
  instructorName: string;
  date: string;
  type: string;                 // "unavailable" | "available"
  startTime?: string;
  endTime?: string;
  reason?: string;
  createdAt: string;
}

interface InstructorDoc {
  _id: Id<"instructors">;
  instructorId: string;
  fullName: string;
  displayName: string;
  status: string;
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function AvailabilityModal({
  entry,
  instructors,
  onClose,
  onSave,
}: {
  entry: AvailabilityDoc | null;
  instructors: InstructorDoc[];
  onClose: () => void;
  onSave: (data: {
    instructorId: string;
    instructorName: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    available: boolean;
    notes?: string;
  }) => void;
}) {
  const firstInstructor = instructors[0];

  const defaultInstructorId = entry?.instructorId ?? firstInstructor?.instructorId ?? "";
  const defaultInstructorName = entry?.instructorName ?? firstInstructor?.fullName ?? "";

  const [selectedInstructorId, setSelectedInstructorId] = useState(defaultInstructorId);
  const [dayOfWeek, setDayOfWeek]   = useState<string>(entry?.dayOfWeek ?? "Mon");
  const [startTime, setStartTime]   = useState(entry?.startTime ?? "");
  const [endTime, setEndTime]       = useState(entry?.endTime ?? "");
  const [available, setAvailable]   = useState(entry?.available ?? true);
  const [notes, setNotes]           = useState(entry?.notes ?? "");

  function handleInstructorChange(id: string) {
    setSelectedInstructorId(id);
  }

  function resolveInstructorName(): string {
    const found = instructors.find((i) => i.instructorId === selectedInstructorId);
    return found?.fullName ?? defaultInstructorName;
  }

  const isValid = selectedInstructorId && dayOfWeek && startTime && endTime;

  function handleSave() {
    if (!isValid) return;
    onSave({
      instructorId: selectedInstructorId,
      instructorName: resolveInstructorName(),
      dayOfWeek,
      startTime,
      endTime,
      available,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <div className="modal-overlay">
      <div className="modal-panel" style={{ maxWidth: 520 }}>
        {/* Modal header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 500 }}>
            {entry ? "Edit Availability" : "Add Availability Entry"}
          </h2>
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

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Instructor */}
          <div>
            <label className="field-label">Instructor</label>
            <select
              className="field-input"
              value={selectedInstructorId}
              onChange={(e) => handleInstructorChange(e.target.value)}
            >
              {instructors.map((ins) => (
                <option key={ins.instructorId} value={ins.instructorId}>
                  {ins.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Day of Week */}
          <div>
            <label className="field-label">Day of Week</label>
            <select
              className="field-input"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
            >
              {DAYS_ORDER.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Start / End time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="field-label">Start Time</label>
              <input
                type="time"
                className="field-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">End Time</label>
              <input
                type="time"
                className="field-input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Available checkbox */}
          <div>
            <label
              style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                style={{ width: 16, height: 16, cursor: "pointer" }}
              />
              <span className="field-label" style={{ marginBottom: 0 }}>
                Mark as Available
              </span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="field-label">Notes (optional)</label>
            <input
              className="field-input"
              placeholder="e.g. Can cover Hybrid classes only"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            style={{ flex: 1 }}
            disabled={!isValid}
          >
            {entry ? "Save Changes" : "Add Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────

function DeleteModal({
  title = "Remove this availability entry?",
  onClose,
  onConfirm,
}: {
  title?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-panel" style={{ maxWidth: 400 }}>
        <h2
          className="font-serif"
          style={{ fontSize: 20, fontWeight: 500, marginBottom: 12 }}
        >
          {title}
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 28 }}>
          This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              background: "var(--tag-red-bg)",
              color: "var(--tag-red-txt)",
              border: "none",
              padding: "12px 20px",
              borderRadius: "var(--radius-pill)",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Available pill ────────────────────────────────────────────────────────────

function AvailPill({ available }: { available: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: available ? "var(--tag-green-bg)" : "var(--tag-red-bg)",
        color: available ? "var(--tag-green-txt)" : "var(--tag-red-txt)",
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: "var(--radius-pill)",
        whiteSpace: "nowrap",
      }}
    >
      {available ? "✓ Available" : "✗ Unavailable"}
    </span>
  );
}

// ── Shared table for availability rows ───────────────────────────────────────

function AvailabilityTable({
  entries,
  showInstructor,
  onEdit,
  onDelete,
}: {
  entries: AvailabilityDoc[];
  showInstructor: boolean;
  onEdit: (entry: AvailabilityDoc) => void;
  onDelete: (entry: AvailabilityDoc) => void;
}) {
  const headers = showInstructor
    ? ["Instructor", "Day", "Start", "End", "Available", "Notes", ""]
    : ["Day", "Start", "End", "Available", "Notes", ""];

  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "var(--ui-dark)" }}>
          {headers.map((h) => (
            <th
              key={h}
              style={{
                textAlign: "left",
                padding: "14px 20px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.65)",
                whiteSpace: "nowrap",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, idx) => (
          <tr
            key={entry._id}
            style={{
              borderBottom: "1px solid var(--border-soft)",
              background: idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)",
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLTableRowElement).style.background =
                "var(--bg-app)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLTableRowElement).style.background =
                idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)")
            }
          >
            {showInstructor && (
              <td style={{ padding: "16px 20px" }}>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--text-main)",
                  }}
                >
                  {entry.instructorName}
                </p>
              </td>
            )}
            <td style={{ padding: "16px 20px", fontSize: 14, color: "var(--text-main)", fontWeight: 500 }}>
              {entry.dayOfWeek}
            </td>
            <td style={{ padding: "16px 20px", fontSize: 14, color: "var(--text-muted)", fontFamily: "monospace" }}>
              {entry.startTime}
            </td>
            <td style={{ padding: "16px 20px", fontSize: 14, color: "var(--text-muted)", fontFamily: "monospace" }}>
              {entry.endTime}
            </td>
            <td style={{ padding: "16px 20px" }}>
              <AvailPill available={entry.available} />
            </td>
            <td style={{ padding: "16px 20px", fontSize: 14, color: "var(--text-muted)" }}>
              {entry.notes ?? "—"}
            </td>
            <td style={{ padding: "16px 20px", textAlign: "right" }}>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => onEdit(entry)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--tag-blue-txt)",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: 8,
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(entry)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--tag-red-txt)",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: 8,
                  }}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}

// ── Exception modal ───────────────────────────────────────────────────────────

function ExceptionModal({
  instructors,
  lockedInstructorId,
  onClose,
  onSave,
}: {
  instructors: InstructorDoc[];
  lockedInstructorId?: string;        // instructors can only add their own
  onClose: () => void;
  onSave: (data: {
    instructorId: string;
    instructorName: string;
    date: string;
    type: "unavailable" | "available";
    startTime?: string;
    endTime?: string;
    reason?: string;
  }) => void;
}) {
  const defaultInstructorId = lockedInstructorId ?? instructors[0]?.instructorId ?? "";
  const [instructorId, setInstructorId] = useState(defaultInstructorId);
  const [date, setDate]                 = useState("");
  const [type, setType]                 = useState<"unavailable" | "available">("unavailable");
  const [wholeDay, setWholeDay]         = useState(true);
  const [startTime, setStartTime]       = useState("");
  const [endTime, setEndTime]           = useState("");
  const [reason, setReason]             = useState("");

  // "Available" exceptions MUST have a time window — they don't make sense whole-day.
  const effectiveWholeDay = type === "unavailable" ? wholeDay : false;

  const instructorName =
    instructors.find((i) => i.instructorId === instructorId)?.fullName ?? "";

  const hasValidWindow = effectiveWholeDay
    ? true
    : startTime.length > 0 && endTime.length > 0 && startTime < endTime;
  const isValid = instructorId && date && hasValidWindow;

  function handleSave() {
    if (!isValid) return;
    onSave({
      instructorId,
      instructorName,
      date,
      type,
      startTime: effectiveWholeDay ? undefined : startTime,
      endTime: effectiveWholeDay ? undefined : endTime,
      reason: reason.trim() || undefined,
    });
  }

  return (
    <div className="modal-overlay">
      <div className="modal-panel" style={{ maxWidth: 520 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 500 }}>
            Add Exception
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--text-muted)", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Instructor */}
          <div>
            <label className="field-label">Instructor</label>
            <select
              className="field-input"
              value={instructorId}
              disabled={!!lockedInstructorId}
              onChange={(e) => setInstructorId(e.target.value)}
            >
              {instructors.map((ins) => (
                <option key={ins.instructorId} value={ins.instructorId}>
                  {ins.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="field-label">Date</label>
            <input
              type="date"
              className="field-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Type */}
          <div>
            <label className="field-label">Type</label>
            <div style={{ display: "flex", gap: 10 }}>
              <label
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `1px solid ${type === "unavailable" ? "var(--tag-red-txt)" : "var(--border-soft)"}`,
                  background: type === "unavailable" ? "var(--tag-red-bg)" : "transparent",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="exception-type"
                  checked={type === "unavailable"}
                  onChange={() => setType("unavailable")}
                />
                <span style={{ fontSize: 14, fontWeight: 500 }}>Unavailable</span>
              </label>
              <label
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `1px solid ${type === "available" ? "var(--tag-green-txt)" : "var(--border-soft)"}`,
                  background: type === "available" ? "var(--tag-green-bg)" : "transparent",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="exception-type"
                  checked={type === "available"}
                  onChange={() => setType("available")}
                />
                <span style={{ fontSize: 14, fontWeight: 500 }}>Available (pick-up)</span>
              </label>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              {type === "unavailable"
                ? "Overrides your standing default — you won&rsquo;t be scheduled."
                : "Adds a one-off window on top of your standing default."}
            </p>
          </div>

          {/* Whole day toggle — only for Unavailable */}
          {type === "unavailable" && (
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={wholeDay}
                  onChange={(e) => setWholeDay(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: "pointer" }}
                />
                <span className="field-label" style={{ marginBottom: 0 }}>Whole day</span>
              </label>
            </div>
          )}

          {/* Start / End times */}
          {!effectiveWholeDay && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="field-label">Start Time</label>
                <input
                  type="time"
                  className="field-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">End Time</label>
                <input
                  type="time"
                  className="field-input"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="field-label">Reason (optional)</label>
            <input
              className="field-input"
              placeholder="e.g. Out of town, covering sub, PT appt"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            style={{ flex: 1 }}
            disabled={!isValid}
          >
            Add Exception
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AvailabilityPage() {
  const { currentUser } = useAuth();

  const availability  = (useQuery(api.queries.getAvailability) ?? []) as AvailabilityDoc[];
  const exceptionsRaw = (useQuery(api.queries.getAvailabilityExceptions) ?? []) as AvailabilityExceptionDoc[];
  const instructors   = (useQuery(api.queries.getInstructors)  ?? []) as InstructorDoc[];

  const addAvailability    = useMutation(api.mutations.addAvailability);
  const updateAvailability = useMutation(api.mutations.updateAvailability);
  const deleteAvailability = useMutation(api.mutations.deleteAvailability);
  const addException       = useMutation(api.mutations.addAvailabilityException);
  const deleteException    = useMutation(api.mutations.deleteAvailabilityException);
  const submitChange       = useMutation(api.mutations.submitPendingChange);

  const [view, setView]             = useState<"instructor" | "day">("instructor");
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState<AvailabilityDoc | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AvailabilityDoc | null>(null);
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [deleteExceptionTarget, setDeleteExceptionTarget] = useState<AvailabilityExceptionDoc | null>(null);
  const [statusMsg, setStatusMsg]   = useState<{ type: "success" | "pending" | "error"; text: string } | null>(null);

  // Exceptions sorted by date ascending (soonest first), then by instructor.
  const exceptions = [...exceptionsRaw].sort(
    (a, b) => a.date.localeCompare(b.date) || a.instructorName.localeCompare(b.instructorName),
  );

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalEntries      = availability.length;
  const availableSlots    = availability.filter((a) => a.available).length;
  const instructorsCovered = new Set(availability.map((a) => a.instructorId)).size;

  // ── Grouping ──────────────────────────────────────────────────────────────
  const byInstructor = instructors
    .map((ins) => ({
      ins,
      entries: availability.filter((a) => a.instructorId === ins.instructorId),
    }))
    .filter(({ entries }) => entries.length > 0);

  const byDay = DAYS_ORDER.map((day) => ({
    day,
    entries: availability.filter((a) => a.dayOfWeek === day),
  })).filter(({ entries }) => entries.length > 0);

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleSave(data: {
    instructorId: string;
    instructorName: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    available: boolean;
    notes?: string;
  }) {
    const entityInstructorId = editTarget?.instructorId;
    const isOwnAvailability =
      currentUser?.role === "instructor" &&
      (data.instructorId === currentUser.instructorId ||
        entityInstructorId === currentUser.instructorId);

    if (currentUser?.role === "admin" || isOwnAvailability) {
      if (editTarget) {
        await updateAvailability({ id: editTarget._id, ...data });
      } else {
        await addAvailability(data);
      }
      setStatusMsg({ type: "success", text: "Saved successfully" });
    } else {
      await submitChange({
        tableName: "availability",
        action: editTarget ? "update" : "add",
        entityId: editTarget ? String(editTarget._id) : undefined,
        payload: editTarget ? { id: editTarget._id, ...data } : data,
        submittedBy: currentUser!.id,
        submittedByName: currentUser!.displayName,
        description: editTarget
          ? `Update availability: ${data.instructorName} ${data.dayOfWeek}`
          : `Add availability: ${data.instructorName} ${data.dayOfWeek}`,
      });
      setStatusMsg({ type: "pending", text: "Submitted for admin review ✓" });
    }

    if (editTarget) {
      setEditTarget(null);
    } else {
      setShowModal(false);
    }
    setTimeout(() => setStatusMsg(null), 3000);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const isOwnAvailability =
      currentUser?.role === "instructor" &&
      deleteTarget.instructorId === currentUser.instructorId;

    if (currentUser?.role === "admin" || isOwnAvailability) {
      await deleteAvailability({ id: deleteTarget._id });
      setStatusMsg({ type: "success", text: "Saved successfully" });
    } else {
      await submitChange({
        tableName: "availability",
        action: "delete",
        entityId: String(deleteTarget._id),
        payload: { id: deleteTarget._id },
        submittedBy: currentUser!.id,
        submittedByName: currentUser!.displayName,
        description: `Delete availability: ${deleteTarget.instructorName} ${deleteTarget.dayOfWeek}`,
      });
      setStatusMsg({ type: "pending", text: "Submitted for admin review ✓" });
    }
    setDeleteTarget(null);
    setTimeout(() => setStatusMsg(null), 3000);
  }

  // ── Exception handlers ────────────────────────────────────────────────────
  async function handleExceptionSave(data: {
    instructorId: string;
    instructorName: string;
    date: string;
    type: "unavailable" | "available";
    startTime?: string;
    endTime?: string;
    reason?: string;
  }) {
    const isOwnException =
      currentUser?.role === "instructor" &&
      data.instructorId === currentUser.instructorId;

    const description =
      data.type === "unavailable"
        ? `${data.instructorName} unavailable ${data.date}${data.startTime ? ` ${data.startTime}–${data.endTime}` : ""}${data.reason ? ` (${data.reason})` : ""}`
        : `${data.instructorName} pick-up ${data.date} ${data.startTime}–${data.endTime}${data.reason ? ` (${data.reason})` : ""}`;

    if (currentUser?.role === "admin" || isOwnException) {
      await addException(data);
      setStatusMsg({ type: "success", text: "Exception saved" });
    } else {
      await submitChange({
        tableName: "availabilityExceptions",
        action: "add",
        payload: data,
        submittedBy: currentUser!.id,
        submittedByName: currentUser!.displayName,
        description: `Add exception — ${description}`,
      });
      setStatusMsg({ type: "pending", text: "Submitted for admin review ✓" });
    }
    setShowExceptionModal(false);
    setTimeout(() => setStatusMsg(null), 3000);
  }

  async function handleExceptionDelete() {
    if (!deleteExceptionTarget) return;
    const isOwnException =
      currentUser?.role === "instructor" &&
      deleteExceptionTarget.instructorId === currentUser.instructorId;

    if (currentUser?.role === "admin" || isOwnException) {
      await deleteException({ id: deleteExceptionTarget._id });
      setStatusMsg({ type: "success", text: "Exception removed" });
    } else {
      await submitChange({
        tableName: "availabilityExceptions",
        action: "delete",
        entityId: String(deleteExceptionTarget._id),
        payload: { id: deleteExceptionTarget._id },
        submittedBy: currentUser!.id,
        submittedByName: currentUser!.displayName,
        description: `Delete exception — ${deleteExceptionTarget.instructorName} ${deleteExceptionTarget.date}`,
      });
      setStatusMsg({ type: "pending", text: "Submitted for admin review ✓" });
    }
    setDeleteExceptionTarget(null);
    setTimeout(() => setStatusMsg(null), 3000);
  }

  // ── Pill toggle style helper ───────────────────────────────────────────────
  function pillStyle(active: boolean) {
    return {
      padding: "8px 20px",
      borderRadius: "var(--radius-pill)",
      fontSize: 14,
      fontWeight: 500,
      cursor: "pointer",
      border: "none",
      background: active ? "var(--ui-dark)" : "transparent",
      color: active ? "#fff" : "var(--text-muted)",
      transition: "all 0.15s ease",
    } as React.CSSProperties;
  }

  return (
    <div style={{ width: "100%" }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 32,
        }}
      >
        <div>
          <h1
            className="font-serif"
            style={{
              fontSize: 40,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            Availability &amp; Subs
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
            Instructor availability windows and substitution coverage by day.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Add Entry
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

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 40,
        }}
      >
        {[
          { label: "Total Entries",       value: totalEntries,       color: "var(--text-main)" },
          { label: "Available Slots",     value: availableSlots,     color: "var(--tag-green-txt)" },
          { label: "Instructors Covered", value: instructorsCovered, color: "var(--tag-blue-txt)" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── View toggle ────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "inline-flex",
          background: "var(--bg-panel)",
          borderRadius: "var(--radius-pill)",
          padding: 4,
          marginBottom: 32,
          gap: 4,
          border: "1px solid var(--border-soft)",
        }}
      >
        <button style={pillStyle(view === "instructor")} onClick={() => setView("instructor")}>
          By Instructor
        </button>
        <button style={pillStyle(view === "day")} onClick={() => setView("day")}>
          By Day
        </button>
      </div>

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {availability.length === 0 && (
        <div
          style={{
            background: "var(--bg-panel)",
            borderRadius: "var(--radius-card)",
            padding: "80px 40px",
            textAlign: "center",
          }}
        >
          <p className="font-serif" style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>
            No availability entries yet
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Start adding instructor availability windows using the button above.
          </p>
        </div>
      )}

      {/* ── By Instructor view ─────────────────────────────────────────────── */}
      {view === "instructor" && availability.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {byInstructor.map(({ ins, entries }) => (
            <div
              key={ins.instructorId}
              style={{
                background: "var(--bg-panel)",
                borderRadius: "var(--radius-card)",
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              }}
            >
              {/* Card header */}
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid var(--border-soft)",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                }}
              >
                <p
                  className="font-serif"
                  style={{ fontSize: 18, fontWeight: 500, color: "var(--text-main)" }}
                >
                  {ins.fullName}
                </p>
                {ins.displayName && ins.displayName !== ins.fullName && (
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {ins.displayName}
                  </span>
                )}
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 12,
                    color: "var(--text-muted)",
                    fontWeight: 500,
                  }}
                >
                  {entries.length} window{entries.length !== 1 ? "s" : ""}
                </span>
              </div>

              <AvailabilityTable
                entries={entries}
                showInstructor={false}
                onEdit={(e) => setEditTarget(e)}
                onDelete={(e) => setDeleteTarget(e)}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── By Day view ────────────────────────────────────────────────────── */}
      {view === "day" && availability.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {byDay.map(({ day, entries }) => (
            <div
              key={day}
              style={{
                background: "var(--bg-panel)",
                borderRadius: "var(--radius-card)",
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              }}
            >
              {/* Card header */}
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid var(--border-soft)",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                }}
              >
                <p
                  className="font-serif"
                  style={{ fontSize: 18, fontWeight: 500, color: "var(--text-main)" }}
                >
                  {day}
                </p>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 12,
                    color: "var(--text-muted)",
                    fontWeight: 500,
                  }}
                >
                  {entries.length} entr{entries.length !== 1 ? "ies" : "y"}
                </span>
              </div>

              <AvailabilityTable
                entries={entries}
                showInstructor={true}
                onEdit={(e) => setEditTarget(e)}
                onDelete={(e) => setDeleteTarget(e)}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Exceptions section ─────────────────────────────────────────────── */}
      <div style={{ marginTop: 48 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 12,
          }}
        >
          <div>
            <h2
              className="font-serif"
              style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.01em", marginBottom: 4 }}
            >
              Exceptions
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              One-off overrides on specific dates. Use this to flag unavailable days or extra pick-up windows.
            </p>
          </div>
          <button onClick={() => setShowExceptionModal(true)} className="btn-primary">
            + Add Exception
          </button>
        </div>

        {exceptions.length === 0 ? (
          <div
            style={{
              background: "var(--bg-panel)",
              borderRadius: "var(--radius-card)",
              padding: "48px 32px",
              textAlign: "center",
              border: "1px dashed var(--border-soft)",
            }}
          >
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              No exceptions on file. Instructors flag unavailable or pick-up days here before Arden builds the week.
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "var(--bg-panel)",
              borderRadius: "var(--radius-card)",
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--ui-dark)" }}>
                    {["Date", "Instructor", "Type", "Window", "Reason", ""].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "14px 20px",
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,0.65)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exceptions.map((ex, idx) => {
                    const isUnavailable = ex.type === "unavailable";
                    return (
                      <tr
                        key={ex._id}
                        style={{
                          borderBottom: "1px solid var(--border-soft)",
                          background: idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)",
                        }}
                      >
                        <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 500, color: "var(--text-main)", fontFamily: "monospace" }}>
                          {ex.date}
                        </td>
                        <td style={{ padding: "16px 20px", fontSize: 14, color: "var(--text-main)" }}>
                          {ex.instructorName}
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              background: isUnavailable ? "var(--tag-red-bg)" : "var(--tag-green-bg)",
                              color: isUnavailable ? "var(--tag-red-txt)" : "var(--tag-green-txt)",
                              fontSize: 12,
                              fontWeight: 600,
                              padding: "3px 10px",
                              borderRadius: "var(--radius-pill)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {isUnavailable ? "✗ Unavailable" : "✓ Pick-up"}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px", fontSize: 14, color: "var(--text-muted)", fontFamily: "monospace" }}>
                          {ex.startTime && ex.endTime ? `${ex.startTime}–${ex.endTime}` : "Whole day"}
                        </td>
                        <td style={{ padding: "16px 20px", fontSize: 14, color: "var(--text-muted)" }}>
                          {ex.reason ?? "—"}
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "right" }}>
                          <button
                            onClick={() => setDeleteExceptionTarget(ex)}
                            style={{
                              background: "none",
                              border: "none",
                              fontSize: 13,
                              fontWeight: 500,
                              color: "var(--tag-red-txt)",
                              cursor: "pointer",
                              padding: "4px 8px",
                              borderRadius: 8,
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {(showModal || editTarget) && (
        <AvailabilityModal
          entry={editTarget}
          instructors={instructors}
          onClose={() => {
            setShowModal(false);
            setEditTarget(null);
          }}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {showExceptionModal && (
        <ExceptionModal
          instructors={instructors}
          lockedInstructorId={
            currentUser?.role === "instructor" ? currentUser.instructorId : undefined
          }
          onClose={() => setShowExceptionModal(false)}
          onSave={handleExceptionSave}
        />
      )}

      {deleteExceptionTarget && (
        <DeleteModal
          title="Remove this exception?"
          onClose={() => setDeleteExceptionTarget(null)}
          onConfirm={handleExceptionDelete}
        />
      )}
    </div>
  );
}
