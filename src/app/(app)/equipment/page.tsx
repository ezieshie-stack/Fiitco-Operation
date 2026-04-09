"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";

interface EquipmentDoc {
  _id: Id<"equipment">;
  equipmentId: string; name: string; category: string;
  quantityAvailable: number; location: string;
  notes?: string; active: boolean;
}

const EQ_CATS = ["Boxing", "Weights", "Cardio", "Mats & Props", "Other"];
const EQ_ICONS: Record<string, string> = { Boxing: "🥊", Weights: "🏋️", Cardio: "🏃", "Mats & Props": "🧘", Other: "🔧" };

function AddEquipmentModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (data: { name: string; category: string; quantityAvailable: number; location: string; notes?: string }) => void;
}) {
  const [name, setName]         = useState("");
  const [category, setCategory] = useState("Boxing");
  const [qty, setQty]           = useState(1);
  const [location, setLocation] = useState("Main Floor");
  const [notes, setNotes]       = useState("");

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 500 }}>Add Equipment</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--text-muted)", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="field-label">Name</label>
            <input className="field-input" placeholder="e.g. Heavy Bag, Dumbbells 10kg"
              value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="field-label">Category</label>
              <select className="field-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {EQ_CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Quantity</label>
              <input type="number" min={1} className="field-input" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="field-label">Location</label>
            <input className="field-input" placeholder="e.g. Main Floor, Storage Room"
              value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Notes (optional)</label>
            <input className="field-input" placeholder="e.g. Needs replacement, shared with Pilates"
              value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button
            onClick={() => onSave({ name, category, quantityAvailable: qty, location, notes: notes || undefined })}
            className="btn-primary" style={{ flex: 1 }} disabled={!name.trim()}
          >
            Add Equipment
          </button>
        </div>
      </div>
    </div>
  );
}

function EditEquipmentModal({ item, onClose, onSave }: {
  item: EquipmentDoc;
  onClose: () => void;
  onSave: (data: { id: Id<"equipment">; name: string; category: string; quantityAvailable: number; location: string; notes?: string; active: boolean }) => void;
}) {
  const [name, setName]         = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [qty, setQty]           = useState(item.quantityAvailable);
  const [location, setLocation] = useState(item.location);
  const [notes, setNotes]       = useState(item.notes ?? "");
  const [active, setActive]     = useState(item.active);

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 500 }}>Edit Equipment</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>{item.equipmentId}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--text-muted)", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="field-label">Name</label>
            <input className="field-input" placeholder="e.g. Heavy Bag, Dumbbells 10kg"
              value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="field-label">Category</label>
              <select className="field-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {EQ_CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Quantity</label>
              <input type="number" min={1} className="field-input" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="field-label">Location</label>
            <input className="field-input" placeholder="e.g. Main Floor, Storage Room"
              value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Notes (optional)</label>
            <input className="field-input" placeholder="e.g. Needs replacement, shared with Pilates"
              value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                style={{ width: 16, height: 16, cursor: "pointer" }}
              />
              <span className="field-label" style={{ marginBottom: 0 }}>Active</span>
            </label>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              Inactive equipment is hidden from class programming selectors.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button
            onClick={() => onSave({ id: item._id, name, category, quantityAvailable: qty, location, notes: notes || undefined, active })}
            className="btn-primary" style={{ flex: 1 }} disabled={!name.trim()}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EquipmentPage() {
  const { currentUser } = useAuth();

  const equipment       = (useQuery(api.queries.getEquipment) ?? []) as EquipmentDoc[];
  const addEquipment    = useMutation(api.mutations.addEquipment);
  const deleteEquipment = useMutation(api.mutations.deleteEquipment);
  const updateEquipment = useMutation(api.mutations.updateEquipment);
  const submitChange    = useMutation(api.mutations.submitPendingChange);

  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState<EquipmentDoc | null>(null);
  const [search, setSearch]         = useState("");
  const [filterCat, setFilterCat]   = useState("All");
  const [statusMsg, setStatusMsg]   = useState<{ type: "success" | "pending" | "error"; text: string } | null>(null);

  const filtered = equipment.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterCat === "All" || e.category === filterCat)
  );

  const grouped = EQ_CATS.reduce<Record<string, EquipmentDoc[]>>((acc, cat) => {
    const items = filtered.filter((e) => e.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  async function handleAdd(data: { name: string; category: string; quantityAvailable: number; location: string; notes?: string }) {
    if (currentUser?.role === "admin") {
      await addEquipment({ equipmentId: `EQP-${String(equipment.length + 1).padStart(2, "0")}`, ...data });
      setStatusMsg({ type: "success", text: "Saved successfully" });
    } else {
      await submitChange({
        tableName: "equipment",
        action: "add",
        payload: { equipmentId: `EQP-${String(equipment.length + 1).padStart(2, "0")}`, ...data },
        submittedBy: currentUser!.id,
        submittedByName: currentUser!.displayName,
        description: `Add equipment: ${data.name}`,
      });
      setStatusMsg({ type: "pending", text: "Submitted for admin review ✓" });
    }
    setShowModal(false);
    setTimeout(() => setStatusMsg(null), 3000);
  }

  async function handleUpdate(data: { id: Id<"equipment">; name: string; category: string; quantityAvailable: number; location: string; notes?: string; active: boolean }) {
    if (currentUser?.role === "admin") {
      await updateEquipment(data);
      setStatusMsg({ type: "success", text: "Saved successfully" });
    } else {
      await submitChange({
        tableName: "equipment",
        action: "update",
        entityId: String(data.id),
        payload: data,
        submittedBy: currentUser!.id,
        submittedByName: currentUser!.displayName,
        description: `Update equipment: ${data.name}`,
      });
      setStatusMsg({ type: "pending", text: "Submitted for admin review ✓" });
    }
    setEditTarget(null);
    setTimeout(() => setStatusMsg(null), 3000);
  }

  async function handleDelete(item: EquipmentDoc) {
    if (currentUser?.role === "admin") {
      await deleteEquipment({ id: item._id });
      setStatusMsg({ type: "success", text: "Saved successfully" });
    } else {
      await submitChange({
        tableName: "equipment",
        action: "delete",
        entityId: String(item._id),
        payload: { id: item._id },
        submittedBy: currentUser!.id,
        submittedByName: currentUser!.displayName,
        description: `Delete equipment`,
      });
      setStatusMsg({ type: "pending", text: "Submitted for admin review ✓" });
    }
    setTimeout(() => setStatusMsg(null), 3000);
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
        <div>
          <h1 className="page-title">Equipment Library</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>All gym equipment available for class programming.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Equipment</button>
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

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
        {[
          { label: "Total Items",   value: equipment.length,                                        color: "var(--text-main)" },
          { label: "Total Pieces",  value: equipment.reduce((s, e) => s + e.quantityAvailable, 0),  color: "var(--tag-blue-txt)" },
          { label: "Categories",    value: new Set(equipment.map((e) => e.category)).size,           color: "var(--tag-purple-txt)" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <input className="field-input" placeholder="Search equipment..." style={{ flex: 1 }}
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="field-input" style={{ width: 200 }}
          value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="All">All Categories</option>
          {EQ_CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Tables by category */}
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 22 }}>{EQ_ICONS[cat] ?? "🔧"}</span>
            <p className="font-serif" style={{ fontSize: 18, fontWeight: 500 }}>{cat}</p>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>({items.length})</span>
          </div>
          <div style={{ background: "var(--bg-panel)", borderRadius: "var(--radius-card)", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--ui-dark)" }}>
                  {["Name", "Qty", "Location", "Notes", "Status", ""].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "16px 24px", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={item._id}
                    style={{ borderBottom: "1px solid var(--border-soft)", background: idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-app)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)")}
                    className="group"
                  >
                    <td style={{ padding: "20px 24px" }}>
                      <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text-main)", opacity: item.active ? 1 : 0.45 }}>{item.name}</p>
                    </td>
                    <td style={{ padding: "20px 24px" }}>
                      <span style={{ background: "var(--tag-blue-bg)", color: "var(--tag-blue-txt)", fontWeight: 700, fontSize: 13, padding: "4px 10px", borderRadius: "var(--radius-pill)" }}>×{item.quantityAvailable}</span>
                    </td>
                    <td style={{ padding: "20px 24px", fontSize: 14, color: "var(--text-muted)" }}>{item.location}</td>
                    <td style={{ padding: "20px 24px", fontSize: 14, color: "var(--text-muted)" }}>{item.notes ?? "—"}</td>
                    <td style={{ padding: "20px 24px" }}>
                      <span style={{
                        background: item.active ? "var(--tag-green-bg)" : "var(--tag-red-bg)",
                        color: item.active ? "var(--tag-green-txt)" : "var(--tag-red-txt)",
                        fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: "var(--radius-pill)"
                      }}>
                        {item.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "20px 24px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setEditTarget(item)}
                          style={{ background: "none", border: "none", fontSize: 13, fontWeight: 500, color: "var(--tag-blue-txt)", cursor: "pointer", opacity: 0, transition: "opacity 0.15s", padding: "4px 8px", borderRadius: 8 }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0")}
                        >Edit</button>
                        <button
                          onClick={() => handleDelete(item)}
                          style={{ background: "none", border: "none", fontSize: 13, fontWeight: 500, color: "var(--tag-red-txt)", cursor: "pointer", opacity: 0, transition: "opacity 0.15s", padding: "4px 8px", borderRadius: 8 }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0")}
                          className="del-btn"
                        >Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ background: "var(--bg-panel)", borderRadius: "var(--radius-card)", padding: "80px 40px", textAlign: "center" }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🔧</p>
          <p className="font-serif" style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>
            {equipment.length === 0 ? "No equipment added yet" : "No results"}
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            {equipment.length === 0 ? "Start building your equipment library" : "Try adjusting your search"}
          </p>
        </div>
      )}

      {showModal && <AddEquipmentModal onClose={() => setShowModal(false)} onSave={handleAdd} />}
      {editTarget && <EditEquipmentModal item={editTarget} onClose={() => setEditTarget(null)} onSave={handleUpdate} />}
    </div>
  );
}
