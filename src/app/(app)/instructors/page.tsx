"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";

const AVATAR_COLORS = ["#4A7FD4", "#D16250", "#8E62CD", "#66B685", "#D89F3C"];
const initials = (name: string) => name.split(" ").map((n) => n[0]).join("");

type Instructor = {
  _id: Id<"instructors">;
  instructorId: string;
  fullName: string;
  displayName: string;
  specialisations: string[];
  certifications: string[];
  email: string;
  phone: string;
  status: string;
  joinDate: string;
  notes?: string;
};

type FormState = {
  fullName: string;
  displayName: string;
  email: string;
  phone: string;
  joinDate: string;
  status: string;
  specialisations: string;
  certifications: string;
  notes: string;
};

const emptyForm = (): FormState => ({
  fullName: "",
  displayName: "",
  email: "",
  phone: "",
  joinDate: "",
  status: "Active",
  specialisations: "",
  certifications: "",
  notes: "",
});

export default function InstructorsPage() {
  const { currentUser } = useAuth();

  const instructors = useQuery(api.queries.getInstructors);
  const addInstructor    = useMutation(api.mutations.addInstructor);
  const updateInstructor = useMutation(api.mutations.updateInstructor);
  const deleteInstructor = useMutation(api.mutations.deleteInstructor);
  const submitChange     = useMutation(api.mutations.submitPendingChange);

  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState<Instructor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Instructor | null>(null);
  const [form, setForm]                 = useState<FormState>(emptyForm());
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [statusMsg, setStatusMsg]       = useState<{ type: "success" | "pending" | "error"; text: string } | null>(null);

  const activeCount = instructors?.filter((i) => i.status === "Active").length ?? 0;
  const totalCount = instructors?.length ?? 0;
  const uniqueSpecialisations = new Set(
    (instructors ?? []).flatMap((i) => i.specialisations)
  ).size;

  function openAdd() {
    setEditTarget(null);
    setForm(emptyForm());
    setShowModal(true);
  }

  function openEdit(ins: Instructor) {
    setEditTarget(ins);
    setForm({
      fullName: ins.fullName,
      displayName: ins.displayName,
      email: ins.email,
      phone: ins.phone,
      joinDate: ins.joinDate,
      status: ins.status,
      specialisations: ins.specialisations.join(", "),
      certifications: ins.certifications.join(", "),
      notes: ins.notes ?? "",
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditTarget(null);
    setForm(emptyForm());
  }

  async function handleSave() {
    if (!form.fullName.trim() || !form.displayName.trim()) return;
    setSaving(true);
    try {
      const specialisations = form.specialisations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const certifications = form.certifications
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (currentUser?.role === "admin") {
        if (editTarget) {
          await updateInstructor({
            id: editTarget._id,
            fullName: form.fullName.trim(),
            displayName: form.displayName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            status: form.status,
            joinDate: form.joinDate,
            specialisations,
            certifications,
            notes: form.notes.trim() || undefined,
          });
        } else {
          const instructorId = `INS-${String((instructors?.length ?? 0) + 1).padStart(2, "0")}`;
          await addInstructor({
            instructorId,
            fullName: form.fullName.trim(),
            displayName: form.displayName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            joinDate: form.joinDate,
            specialisations,
            certifications,
            notes: form.notes.trim() || undefined,
          });
        }
        setStatusMsg({ type: "success", text: "Saved successfully" });
      } else {
        const instructorId = editTarget
          ? undefined
          : `INS-${String((instructors?.length ?? 0) + 1).padStart(2, "0")}`;
        const payload = editTarget
          ? {
              id: editTarget._id,
              fullName: form.fullName.trim(),
              displayName: form.displayName.trim(),
              email: form.email.trim(),
              phone: form.phone.trim(),
              status: form.status,
              joinDate: form.joinDate,
              specialisations,
              certifications,
              notes: form.notes.trim() || undefined,
            }
          : {
              instructorId,
              fullName: form.fullName.trim(),
              displayName: form.displayName.trim(),
              email: form.email.trim(),
              phone: form.phone.trim(),
              joinDate: form.joinDate,
              specialisations,
              certifications,
              notes: form.notes.trim() || undefined,
            };
        await submitChange({
          tableName: "instructors",
          action: editTarget ? "update" : "add",
          entityId: editTarget ? String(editTarget._id) : undefined,
          payload,
          submittedBy: currentUser!.id,
          submittedByName: currentUser!.displayName,
          description: editTarget
            ? `Update instructor: ${form.fullName.trim()}`
            : `Add instructor: ${form.fullName.trim()}`,
        });
        setStatusMsg({ type: "pending", text: "Submitted for admin review ✓" });
      }
      closeModal();
      setTimeout(() => setStatusMsg(null), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (currentUser?.role === "admin") {
        await deleteInstructor({ id: deleteTarget._id });
        setStatusMsg({ type: "success", text: "Saved successfully" });
      } else {
        await submitChange({
          tableName: "instructors",
          action: "delete",
          entityId: String(deleteTarget._id),
          payload: { id: deleteTarget._id },
          submittedBy: currentUser!.id,
          submittedByName: currentUser!.displayName,
          description: `Delete instructor: ${deleteTarget.fullName}`,
        });
        setStatusMsg({ type: "pending", text: "Submitted for admin review ✓" });
      }
      setDeleteTarget(null);
      setTimeout(() => setStatusMsg(null), 3000);
    } finally {
      setDeleting(false);
    }
  }

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
          <h1
            className="font-serif"
            style={{ fontSize: 40, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 8 }}
          >
            Instructor Library
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
            Active coaching roster — {activeCount} active instructor{activeCount !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          + Add Instructor
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

      {/* Stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
        <div className="stat-card">
          <p className="stat-label">Total Instructors</p>
          <p className="stat-value">{totalCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Active</p>
          <p className="stat-value">{activeCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Specialisations Covered</p>
          <p className="stat-value">{uniqueSpecialisations}</p>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--bg-panel)",
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--ui-dark)" }}>
              {["Instructor", "Specialisations", "Certifications", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "18px 28px",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.75)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!instructors ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "64px 28px",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: 15,
                  }}
                >
                  Loading instructors...
                </td>
              </tr>
            ) : instructors.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "64px 28px",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: 15,
                  }}
                >
                  No instructors yet. Add your first instructor to get started.
                </td>
              </tr>
            ) : (
              instructors.map((ins, i) => (
                <tr
                  key={ins._id}
                  style={{
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-app)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")
                  }
                >
                  {/* Instructor name + avatar */}
                  <td style={{ padding: "24px 28px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          fontWeight: 700,
                          flexShrink: 0,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {initials(ins.fullName)}
                      </div>
                      <div>
                        <p
                          className="font-serif"
                          style={{ fontSize: 18, fontWeight: 500, color: "var(--text-main)", marginBottom: 3 }}
                        >
                          {ins.fullName}
                        </p>
                        <p
                          style={{
                            fontSize: 13,
                            color: "var(--text-muted)",
                            fontFamily: "monospace",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {ins.instructorId}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Specialisations */}
                  <td style={{ padding: "24px 28px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {ins.specialisations.map((s) => (
                        <span
                          key={s}
                          style={{
                            fontSize: 14,
                            color: "var(--tag-blue-txt)",
                            fontWeight: 500,
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Certifications */}
                  <td style={{ padding: "24px 28px" }}>
                    <p style={{ fontSize: 14, color: "var(--text-main)", lineHeight: 1.6 }}>
                      {ins.certifications.join("  ")}
                    </p>
                  </td>

                  {/* Status */}
                  <td style={{ padding: "24px 28px" }}>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color:
                          ins.status === "Active"
                            ? "var(--tag-green-txt)"
                            : "var(--text-muted)",
                      }}
                    >
                      {ins.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "24px 28px" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button
                        onClick={() => openEdit(ins)}
                        style={{
                          padding: "6px 14px",
                          fontSize: 13,
                          fontWeight: 500,
                          border: "1px solid #4A7FD4",
                          borderRadius: "var(--radius-pill)",
                          background: "transparent",
                          color: "#4A7FD4",
                          cursor: "pointer",
                          transition: "background 0.12s, color 0.12s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "#4A7FD4";
                          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color = "#4A7FD4";
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(ins)}
                        style={{
                          padding: "6px 14px",
                          fontSize: 13,
                          fontWeight: 500,
                          border: "1px solid #D16250",
                          borderRadius: "var(--radius-pill)",
                          background: "transparent",
                          color: "#D16250",
                          cursor: "pointer",
                          transition: "background 0.12s, color 0.12s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "#D16250";
                          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color = "#D16250";
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-panel"
            style={{ maxWidth: 560, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="font-serif"
              style={{ fontSize: 26, fontWeight: 500, marginBottom: 24 }}
            >
              {editTarget ? "Edit Instructor" : "Add Instructor"}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Full Name */}
              <div>
                <label className="field-label">Full Name *</label>
                <input
                  className="field-input"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Jason Valenti"
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="field-label">Display Name *</label>
                <input
                  className="field-input"
                  type="text"
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  placeholder="e.g. Jason B."
                />
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  e.g. Jason B.
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="field-label">Email</label>
                <input
                  className="field-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="instructor@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="field-label">Phone</label>
                <input
                  className="field-input"
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 416-555-0100"
                />
              </div>

              {/* Join Date */}
              <div>
                <label className="field-label">Join Date</label>
                <input
                  className="field-input"
                  type="date"
                  value={form.joinDate}
                  onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
                />
              </div>

              {/* Status — edit only */}
              {editTarget && (
                <div>
                  <label className="field-label">Status</label>
                  <select
                    className="field-input"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}

              {/* Specialisations */}
              <div>
                <label className="field-label">Specialisations</label>
                <input
                  className="field-input"
                  type="text"
                  value={form.specialisations}
                  onChange={(e) => setForm({ ...form, specialisations: e.target.value })}
                  placeholder="e.g. Boxing, Strength & Conditioning"
                />
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  e.g. Boxing, Strength &amp; Conditioning
                </p>
              </div>

              {/* Certifications */}
              <div>
                <label className="field-label">Certifications</label>
                <input
                  className="field-input"
                  type="text"
                  value={form.certifications}
                  onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                  placeholder="e.g. CPT, Boxing Coach Level 2"
                />
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  e.g. CPT, Boxing Coach Level 2
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="field-label">Notes (optional)</label>
                <textarea
                  className="field-input"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>

            {/* Modal actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 28,
              }}
            >
              <button className="btn-ghost" onClick={closeModal} disabled={saving}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={saving || !form.fullName.trim() || !form.displayName.trim()}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div
            className="modal-panel"
            style={{ maxWidth: 420, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="font-serif"
              style={{ fontSize: 24, fontWeight: 500, marginBottom: 12 }}
            >
              Delete {deleteTarget.fullName}?
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 28 }}>
              This action cannot be undone. The instructor record will be permanently removed.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                className="btn-ghost"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: "10px 22px",
                  fontSize: 15,
                  fontWeight: 600,
                  border: "none",
                  borderRadius: "var(--radius-pill)",
                  background: "#D16250",
                  color: "#fff",
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.6 : 1,
                  transition: "opacity 0.12s",
                }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
