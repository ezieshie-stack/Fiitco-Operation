"use client";

/**
 * Website Locations admin — manages studio locations shown in the footer
 * and on the /studio page of the customer website. Today there's one
 * location (Leslieville), but the table is built for multi-location
 * expansion when FIIT opens their second space.
 *
 * `isPrimary`: exactly one location is the "primary" — that's what the
 * footer and single-location views read. Setting a new primary
 * automatically un-primaries the previous one.
 */

import { useState } from "react";
import { useAuthedQuery as useQuery, useAuthedMutation as useMutation } from "@/hooks/useAuthedConvex";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

type Location = {
  _id: Id<"locations">;
  slug: string;
  name: string;
  address1: string;
  address2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  hoursMonFri: string;
  hoursSatSun: string;
  isPrimary: boolean;
  displayOrder: number;
  active: boolean;
};

type FormState = {
  slug: string;
  name: string;
  address1: string;
  address2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  latitude: string;
  longitude: string;
  hoursMonFri: string;
  hoursSatSun: string;
  isPrimary: boolean;
  displayOrder: string;
};

const emptyForm = (): FormState => ({
  slug: "",
  name: "",
  address1: "",
  address2: "",
  city: "Toronto",
  region: "ON",
  postalCode: "",
  country: "CA",
  phone: "",
  email: "",
  latitude: "",
  longitude: "",
  hoursMonFri: "6:00 AM – 8:30 PM",
  hoursSatSun: "8:00 AM – 8:30 PM",
  isPrimary: false,
  displayOrder: "99",
});

function slugify(n: string): string {
  return n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function WebsiteLocationsPage() {
  const { ready } = useRequireAdmin();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const locations = useQuery(api.websiteContent.listLocations);
  const createLocation = useMutation(api.websiteContent.createLocation);
  const updateLocation = useMutation(api.websiteContent.updateLocation);
  const deleteLocation = useMutation(api.websiteContent.deleteLocation);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Location | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const activeCount = locations?.filter((l) => l.active).length ?? 0;
  const primaryLocation = locations?.find((l) => l.isPrimary && l.active);

  function openAdd() {
    setEditTarget(null);
    setForm(emptyForm());
    setShowModal(true);
  }

  function openEdit(l: Location) {
    setEditTarget(l);
    setForm({
      slug: l.slug,
      name: l.name,
      address1: l.address1,
      address2: l.address2 ?? "",
      city: l.city,
      region: l.region,
      postalCode: l.postalCode,
      country: l.country,
      phone: l.phone,
      email: l.email,
      latitude: String(l.latitude),
      longitude: String(l.longitude),
      hoursMonFri: l.hoursMonFri,
      hoursSatSun: l.hoursSatSun,
      isPrimary: l.isPrimary,
      displayOrder: String(l.displayOrder),
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditTarget(null);
    setForm(emptyForm());
  }

  async function handleSave() {
    if (!form.name.trim() || !form.address1.trim() || !form.city.trim() || !form.phone.trim() || !form.email.trim()) {
      setStatusMsg({ type: "err", text: "Name, address, city, phone, and email are required" });
      return;
    }
    if (!isAdmin) return;
    setSaving(true);
    try {
      const slug = form.slug.trim() || slugify(form.name);
      const lat = parseFloat(form.latitude);
      const lng = parseFloat(form.longitude);
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Latitude and longitude must be numbers");
      }
      const base = {
        slug,
        name: form.name.trim(),
        address1: form.address1.trim(),
        ...(form.address2.trim() ? { address2: form.address2.trim() } : {}),
        city: form.city.trim(),
        region: form.region.trim(),
        postalCode: form.postalCode.trim(),
        country: form.country.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        latitude: lat,
        longitude: lng,
        hoursMonFri: form.hoursMonFri.trim(),
        hoursSatSun: form.hoursSatSun.trim(),
        isPrimary: form.isPrimary,
        displayOrder: Number(form.displayOrder) || 99,
      };

      if (editTarget) {
        await updateLocation({ id: editTarget._id, ...base });
      } else {
        await createLocation(base);
      }
      setStatusMsg({ type: "ok", text: "Saved ✓" });
      closeModal();
      setTimeout(() => setStatusMsg(null), 2500);
    } catch (err) {
      setStatusMsg({ type: "err", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(l: Location) {
    if (!isAdmin) return;
    if (l.isPrimary) {
      setStatusMsg({
        type: "err",
        text: "Can't hide the primary location — make another location primary first.",
      });
      setTimeout(() => setStatusMsg(null), 4000);
      return;
    }
    if (!window.confirm(`Hide "${l.name}" from the website?`)) return;
    await deleteLocation({ id: l._id });
    setStatusMsg({ type: "ok", text: `Hidden: ${l.name}` });
    setTimeout(() => setStatusMsg(null), 2500);
  }

  // Admin-only — redirect instructors away from this page.
  if (!ready) return null;

  return (
    <div style={{ padding: "40px", maxWidth: 1200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: 36, fontWeight: 500, margin: 0, color: "var(--text-main)" }}>
            Website Locations
          </h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 14 }}>
            Studio addresses shown in the footer and on the /studio page of the customer website.
          </p>
        </div>
        {isAdmin && (
          <button onClick={openAdd} style={{ padding: "10px 20px", background: "var(--ui-dark, #1E1812)", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            + Add Location
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
        <StatCard label="Active" value={activeCount} />
        <StatCard label="Primary" value={primaryLocation ? primaryLocation.name : "—"} />
      </div>

      {statusMsg && <StatusBanner msg={statusMsg} />}

      {locations === undefined ? (
        <p>Loading…</p>
      ) : locations.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No locations yet.</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ background: "#F9F5F0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <th style={th}>Name</th>
                <th style={th}>Address</th>
                <th style={th}>Contact</th>
                <th style={th}>Hours</th>
                <th style={th}>Primary</th>
                <th style={th}>Active</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...locations].sort((a, b) => a.displayOrder - b.displayOrder).map((l) => (
                <tr key={l._id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", opacity: l.active ? 1 : 0.5 }}>
                  <td style={td}>
                    <div style={{ fontWeight: 500 }}>{l.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{l.slug}</div>
                  </td>
                  <td style={td}>
                    <div>{l.address1}</div>
                    {l.address2 && <div>{l.address2}</div>}
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{l.city}, {l.region} {l.postalCode}</div>
                  </td>
                  <td style={td}>
                    <div>{l.phone}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{l.email}</div>
                  </td>
                  <td style={td}>
                    <div>Mon-Fri: {l.hoursMonFri}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Sat-Sun: {l.hoursSatSun}</div>
                  </td>
                  <td style={td}>
                    {l.isPrimary && <span style={chipStyle("#FFE4E4", "#B71C1C")}>Primary</span>}
                  </td>
                  <td style={td}>
                    <input type="checkbox" checked={l.active} onChange={() => updateLocation({ id: l._id, active: !l.active })} disabled={!isAdmin} />
                  </td>
                  <td style={td}>
                    {isAdmin && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => openEdit(l)} style={actionBtnStyle}>Edit</button>
                        <button onClick={() => handleDelete(l)} style={{ ...actionBtnStyle, color: "#B71C1C" }}>Hide</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div onClick={closeModal} style={modalOverlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={modalInnerStyle}>
            <h2 className="font-serif" style={{ fontSize: 24, margin: "0 0 24px", fontWeight: 500 }}>
              {editTarget ? "Edit Location" : "Add Location"}
            </h2>

            <div style={{ display: "grid", gap: 16 }}>
              <Field label="Name" required>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="FIIT Co. Leslieville" />
              </Field>

              <Field label="Address Line 1" required>
                <input type="text" value={form.address1} onChange={(e) => setForm({ ...form, address1: e.target.value })} style={inputStyle} placeholder="1047 Gerrard St E" />
              </Field>

              <Field label="Address Line 2 (optional)">
                <input type="text" value={form.address2} onChange={(e) => setForm({ ...form, address2: e.target.value })} style={inputStyle} placeholder="Suite, unit, floor" />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12 }}>
                <Field label="City" required><input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={inputStyle} /></Field>
                <Field label="Province"><input type="text" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} style={inputStyle} /></Field>
                <Field label="Postal Code"><input type="text" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} style={inputStyle} /></Field>
                <Field label="Country"><input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} style={inputStyle} /></Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Phone" required>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="(416) 565-9300" />
                </Field>
                <Field label="Email" required>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} placeholder="info@fiitco.ca" />
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Latitude" hint="From Google Maps or geocoding service">
                  <input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} style={inputStyle} placeholder="43.6689575" />
                </Field>
                <Field label="Longitude">
                  <input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} style={inputStyle} placeholder="-79.3362194" />
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Hours Mon–Fri" hint="Free text (e.g. '6:00 AM – 8:30 PM')">
                  <input type="text" value={form.hoursMonFri} onChange={(e) => setForm({ ...form, hoursMonFri: e.target.value })} style={inputStyle} />
                </Field>
                <Field label="Hours Sat–Sun">
                  <input type="text" value={form.hoursSatSun} onChange={(e) => setForm({ ...form, hoursSatSun: e.target.value })} style={inputStyle} />
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                <Field label="Slug" hint="URL-safe identifier. Auto-generated from name if blank.">
                  <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={inputStyle} placeholder={form.name ? slugify(form.name) : "leslieville"} />
                </Field>
                <Field label="Display Order">
                  <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} style={inputStyle} />
                </Field>
              </div>

              <Field label="Primary Location" hint="Footer + single-location views use this one. Setting this un-primaries any other location.">
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                  <input type="checkbox" checked={form.isPrimary} onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })} />
                  Mark as primary
                </label>
              </Field>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
              <button onClick={closeModal} style={{ ...actionBtnStyle, padding: "10px 20px" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={primaryBtnStyle(saving)}>
                {saving ? "Saving…" : editTarget ? "Save Changes" : "Add Location"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Same helpers as other CMS pages — kept local to reduce cross-file imports.
function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ padding: "16px 20px", background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", minWidth: 180 }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: "var(--text-main)" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function StatusBanner({ msg }: { msg: { type: "ok" | "err"; text: string } }) {
  return (
    <div style={{ padding: "10px 14px", borderRadius: 6, marginBottom: 16, fontSize: 14, background: msg.type === "ok" ? "#E8F5E9" : "#FFEBEE", color: msg.type === "ok" ? "#1B5E20" : "#B71C1C", border: `1px solid ${msg.type === "ok" ? "#A5D6A7" : "#EF9A9A"}` }}>
      {msg.text}
    </div>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-main)", marginBottom: 6 }}>
        {label}{required && <span style={{ color: "#D92B2B", marginLeft: 4 }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 12px", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 6, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff" };
const actionBtnStyle: React.CSSProperties = { padding: "6px 12px", border: "1px solid rgba(0,0,0,0.12)", background: "#fff", borderRadius: 6, fontSize: 13, cursor: "pointer", color: "var(--text-main)" };
function primaryBtnStyle(saving: boolean): React.CSSProperties { return { padding: "10px 20px", background: "var(--ui-dark, #1E1812)", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }; }
function chipStyle(bg: string, fg: string): React.CSSProperties { return { fontSize: 11, padding: "3px 8px", borderRadius: 10, background: bg, color: fg, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }; }
const th: React.CSSProperties = { textAlign: "left", padding: "14px 16px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", fontWeight: 600 };
const td: React.CSSProperties = { padding: "14px 16px", fontSize: 14, color: "var(--text-main)", verticalAlign: "top" };
const modalOverlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 };
const modalInnerStyle: React.CSSProperties = { background: "#fff", borderRadius: 12, padding: 32, maxWidth: 780, width: "100%", maxHeight: "90vh", overflow: "auto" };
