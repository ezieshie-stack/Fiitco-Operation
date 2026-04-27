"use client";

/**
 * Website Pricing admin — manages all pricing plans on the Programs page
 * (sections A / A.2 / A.3 / B / C / D). Each plan has a `section` that
 * groups it, plus a `style` (pricing vs pack) that determines card layout.
 *
 * Section-level copy (label, title, description) is stored per-record but
 * rendered once at the top of each section on the website. Editing on any
 * record in a section propagates the new label/title to the whole section.
 */

import { useState, useMemo } from "react";
import { useAuthedQuery as useQuery, useAuthedMutation as useMutation } from "@/hooks/useAuthedConvex";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

type PricingPlan = {
  _id: Id<"pricingPlans">;
  slug: string;
  section: string;
  sectionLabel: string;
  sectionTitle: string;
  sectionDescription?: string;
  price: string;
  name: string;
  note?: string;
  features: string[];
  featured: boolean;
  badge?: string;
  style: string;
  displayOrder: number;
  active: boolean;
};

const SECTION_OPTIONS = [
  { value: "group-memberships", label: "A · Group Memberships" },
  { value: "class-packs",       label: "A.2 · Class Packs" },
  { value: "kids",              label: "A.3 · Kids Program" },
  { value: "small-group",       label: "B · Small Group" },
  { value: "personal-training", label: "C · Personal Training" },
  { value: "academy-adult",     label: "D.1 · Academy Adult" },
  { value: "academy-teens",     label: "D.2 · Academy Teens" },
];

type FormState = {
  slug: string; section: string;
  sectionLabel: string; sectionTitle: string; sectionDescription: string;
  price: string; name: string; note: string;
  featuresText: string; featured: boolean; badge: string;
  style: string; displayOrder: string;
};

const emptyForm = (): FormState => ({
  slug: "", section: "group-memberships",
  sectionLabel: "", sectionTitle: "", sectionDescription: "",
  price: "", name: "", note: "",
  featuresText: "", featured: false, badge: "",
  style: "pricing", displayOrder: "99",
});

function slugify(n: string): string {
  return n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function WebsitePricingPage() {
  const { ready } = useRequireAdmin();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const plans = useQuery(api.websiteContent.listPricingPlans);
  const createPricingPlan = useMutation(api.websiteContent.createPricingPlan);
  const updatePricingPlan = useMutation(api.websiteContent.updatePricingPlan);
  const deletePricingPlan = useMutation(api.websiteContent.deletePricingPlan);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<PricingPlan | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Group plans by section for display
  const grouped = useMemo(() => {
    if (!plans) return null;
    const byS: Record<string, PricingPlan[]> = {};
    for (const p of plans) {
      if (sectionFilter !== "all" && p.section !== sectionFilter) continue;
      if (!byS[p.section]) byS[p.section] = [];
      byS[p.section].push(p);
    }
    return byS;
  }, [plans, sectionFilter]);

  function openAdd() {
    setEditTarget(null);
    // Pre-fill section from current filter for convenience
    const presetSection = sectionFilter === "all" ? "group-memberships" : sectionFilter;
    const sectionPlan = plans?.find((p) => p.section === presetSection);
    setForm({
      ...emptyForm(),
      section: presetSection,
      sectionLabel: sectionPlan?.sectionLabel ?? "",
      sectionTitle: sectionPlan?.sectionTitle ?? "",
      sectionDescription: sectionPlan?.sectionDescription ?? "",
      style: presetSection === "class-packs" || presetSection === "small-group" || presetSection === "academy-adult" ? "pack" : "pricing",
    });
    setShowModal(true);
  }

  function openEdit(p: PricingPlan) {
    setEditTarget(p);
    setForm({
      slug: p.slug, section: p.section,
      sectionLabel: p.sectionLabel, sectionTitle: p.sectionTitle,
      sectionDescription: p.sectionDescription ?? "",
      price: p.price, name: p.name, note: p.note ?? "",
      featuresText: p.features.join("\n"),
      featured: p.featured, badge: p.badge ?? "",
      style: p.style, displayOrder: String(p.displayOrder),
    });
    setShowModal(true);
  }

  function closeModal() { setShowModal(false); setEditTarget(null); setForm(emptyForm()); }

  async function handleSave() {
    if (!form.price.trim() || !form.name.trim()) {
      setStatusMsg({ type: "err", text: "Price and name are required" });
      return;
    }
    if (!isAdmin) return;
    setSaving(true);
    try {
      const slug = form.slug.trim() || `${form.section}-${slugify(form.name)}`;
      const features = form.featuresText.split("\n").map((s) => s.trim()).filter(Boolean);
      const base = {
        slug, section: form.section,
        sectionLabel: form.sectionLabel.trim(),
        sectionTitle: form.sectionTitle.trim(),
        ...(form.sectionDescription.trim() ? { sectionDescription: form.sectionDescription.trim() } : {}),
        price: form.price.trim(), name: form.name.trim(),
        ...(form.note.trim() ? { note: form.note.trim() } : {}),
        features, featured: form.featured,
        ...(form.badge.trim() ? { badge: form.badge.trim() } : {}),
        style: form.style,
        displayOrder: Number(form.displayOrder) || 99,
      };
      if (editTarget) {
        await updatePricingPlan({ id: editTarget._id, ...base });
      } else {
        await createPricingPlan(base);
      }
      setStatusMsg({ type: "ok", text: "Saved ✓" });
      closeModal();
      setTimeout(() => setStatusMsg(null), 2500);
    } catch (err) {
      setStatusMsg({ type: "err", text: err instanceof Error ? err.message : "Save failed" });
    } finally { setSaving(false); }
  }

  async function handleDelete(p: PricingPlan) {
    if (!isAdmin) return;
    if (!window.confirm(`Hide "${p.name}" ($${p.price.replace(/[$]/g, "")}) from the website?`)) return;
    await deletePricingPlan({ id: p._id });
    setStatusMsg({ type: "ok", text: `Hidden: ${p.name}` });
    setTimeout(() => setStatusMsg(null), 2500);
  }

  // Admin-only — redirect instructors away from this page.
  if (!ready) return null;

  return (
    <div style={{ padding: "40px", maxWidth: 1400 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: 36, fontWeight: 500, margin: 0, color: "var(--text-main)" }}>
            Website Pricing
          </h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 14 }}>
            Pricing plans across all sections on the Programs page. Use the filter to focus on one section.
          </p>
        </div>
        {isAdmin && <button onClick={openAdd} style={primaryBtnStyle(false)}>+ Add Plan</button>}
      </div>

      {/* Section filter */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 13, color: "var(--text-muted)", marginRight: 12 }}>Filter by section:</label>
        <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} style={{ padding: "6px 10px", fontSize: 13, border: "1px solid rgba(0,0,0,0.15)", borderRadius: 6 }}>
          <option value="all">All sections</option>
          {SECTION_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {statusMsg && <StatusBanner msg={statusMsg} />}

      {grouped === null ? (<p>Loading…</p>)
       : Object.keys(grouped).length === 0 ? (<p style={{ color: "var(--text-muted)" }}>No pricing plans in this filter.</p>)
       : Object.entries(grouped).map(([section, sectionPlans]) => {
          const label = SECTION_OPTIONS.find((s) => s.value === section)?.label ?? section;
          return (
            <div key={section} style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-main)", margin: 0 }}>{label}</h3>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>· {sectionPlans.length} plan{sectionPlans.length !== 1 ? "s" : ""}</span>
              </div>
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F9F5F0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <th style={th}>Price</th>
                      <th style={th}>Name</th>
                      <th style={th}>Note</th>
                      <th style={th}>Style</th>
                      <th style={th}>Featured / Badge</th>
                      <th style={th}>Active</th>
                      <th style={th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...sectionPlans].sort((a, b) => a.displayOrder - b.displayOrder).map((p) => (
                      <tr key={p._id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", opacity: p.active ? 1 : 0.5 }}>
                        <td style={td}><span style={{ fontWeight: 600, fontSize: 16 }}>{p.price}</span></td>
                        <td style={td}>{p.name}</td>
                        <td style={td}><span style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.note ?? "—"}</span></td>
                        <td style={td}>
                          <span style={chipStyle(p.style === "pricing" ? "#E1F5FE" : "#FFF3E0", p.style === "pricing" ? "#01579B" : "#E65100")}>
                            {p.style}
                          </span>
                        </td>
                        <td style={td}>
                          {p.featured && <span style={{ ...chipStyle("#D92B2B", "#fff"), marginRight: 6 }}>Featured</span>}
                          {p.badge && <span style={chipStyle("#FFE4E4", "#B71C1C")}>{p.badge}</span>}
                        </td>
                        <td style={td}>
                          <input type="checkbox" checked={p.active} onChange={() => updatePricingPlan({ id: p._id, active: !p.active })} disabled={!isAdmin} />
                        </td>
                        <td style={td}>
                          {isAdmin && (
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => openEdit(p)} style={actionBtnStyle}>Edit</button>
                              <button onClick={() => handleDelete(p)} style={{ ...actionBtnStyle, color: "#B71C1C" }}>Hide</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

      {showModal && (
        <div onClick={closeModal} style={modalOverlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={modalInnerStyle}>
            <h2 className="font-serif" style={{ fontSize: 24, margin: "0 0 24px", fontWeight: 500 }}>
              {editTarget ? "Edit Pricing Plan" : "Add Pricing Plan"}
            </h2>

            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16 }}>
                <Field label="Section" required>
                  <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} style={inputStyle}>
                    {SECTION_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </Field>
                <Field label="Card Style">
                  <select value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} style={inputStyle}>
                    <option value="pricing">Pricing card (full)</option>
                    <option value="pack">Pack tile (compact)</option>
                  </select>
                </Field>
                <Field label="Display Order">
                  <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} style={inputStyle} />
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
                <Field label="Price" required>
                  <input type="text" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={inputStyle} placeholder="$49.99" />
                </Field>
                <Field label="Name" required>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="2-Week Trial" />
                </Field>
              </div>

              <Field label="Note" hint="Sub-line under the name (e.g. 'Auto-Renew · Monthly')">
                <input type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} style={inputStyle} />
              </Field>

              <Field label="Features / Bullet Points" hint="One per line. Only shown on 'pricing' style cards.">
                <textarea value={form.featuresText} onChange={(e) => setForm({ ...form, featuresText: e.target.value })} style={{ ...inputStyle, minHeight: 110, resize: "vertical", fontFamily: "monospace", fontSize: 13 }} placeholder="All classes, unlimited&#10;Monthly billing&#10;30-day cancel notice" />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Featured" hint="Only one per section should be featured. Appears highlighted.">
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                    Featured plan
                  </label>
                </Field>
                <Field label="Badge" hint='e.g. "Most Popular", "Best Value"'>
                  <input type="text" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} style={inputStyle} />
                </Field>
              </div>

              <details style={{ border: "1px dashed rgba(0,0,0,0.1)", padding: "12px 16px", borderRadius: 6 }}>
                <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>
                  Section-level copy (label, title, description) — click to edit
                </summary>
                <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                  <Field label="Section Label" hint="Small eyebrow on the section, e.g. 'A · FIIT Co Memberships'">
                    <input type="text" value={form.sectionLabel} onChange={(e) => setForm({ ...form, sectionLabel: e.target.value })} style={inputStyle} />
                  </Field>
                  <Field label="Section Title" hint="Big headline. Use line breaks (actual newlines) to force line wrapping.">
                    <textarea value={form.sectionTitle} onChange={(e) => setForm({ ...form, sectionTitle: e.target.value })} style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} />
                  </Field>
                  <Field label="Section Description" hint="Optional lead paragraph below the title.">
                    <textarea value={form.sectionDescription} onChange={(e) => setForm({ ...form, sectionDescription: e.target.value })} style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} />
                  </Field>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                    These are stored per-record but displayed once per section on the website. Editing any plan in a section updates the whole section&apos;s heading.
                  </p>
                </div>
              </details>

              <Field label="Slug" hint="URL slug. Auto-generated if blank.">
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={inputStyle} placeholder={form.name ? `${form.section}-${slugify(form.name)}` : "pricing-slug"} />
              </Field>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
              <button onClick={closeModal} style={{ ...actionBtnStyle, padding: "10px 20px" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={primaryBtnStyle(saving)}>
                {saving ? "Saving…" : editTarget ? "Save Changes" : "Add Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBanner({ msg }: { msg: { type: "ok" | "err"; text: string } }) {
  return <div style={{ padding: "10px 14px", borderRadius: 6, marginBottom: 16, fontSize: 14, background: msg.type === "ok" ? "#E8F5E9" : "#FFEBEE", color: msg.type === "ok" ? "#1B5E20" : "#B71C1C", border: `1px solid ${msg.type === "ok" ? "#A5D6A7" : "#EF9A9A"}` }}>{msg.text}</div>;
}
function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (<div>
    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-main)", marginBottom: 6 }}>{label}{required && <span style={{ color: "#D92B2B", marginLeft: 4 }}>*</span>}</label>
    {children}
    {hint && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{hint}</div>}
  </div>);
}
const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 12px", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 6, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff" };
const actionBtnStyle: React.CSSProperties = { padding: "6px 12px", border: "1px solid rgba(0,0,0,0.12)", background: "#fff", borderRadius: 6, fontSize: 13, cursor: "pointer", color: "var(--text-main)" };
function primaryBtnStyle(saving: boolean): React.CSSProperties { return { padding: "10px 20px", background: "var(--ui-dark, #1E1812)", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }; }
function chipStyle(bg: string, fg: string): React.CSSProperties { return { fontSize: 11, padding: "3px 8px", borderRadius: 10, background: bg, color: fg, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }; }
const th: React.CSSProperties = { textAlign: "left", padding: "14px 16px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", fontWeight: 600 };
const td: React.CSSProperties = { padding: "14px 16px", fontSize: 14, color: "var(--text-main)", verticalAlign: "middle" };
const modalOverlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 };
const modalInnerStyle: React.CSSProperties = { background: "#fff", borderRadius: 12, padding: 32, maxWidth: 820, width: "100%", maxHeight: "90vh", overflow: "auto" };
