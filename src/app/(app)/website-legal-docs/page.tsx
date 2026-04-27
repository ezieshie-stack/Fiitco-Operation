"use client";

/**
 * Website Legal Docs admin — edits the three legal pages on the
 * customer site (privacy policy, terms, accessibility) without needing
 * a developer. Saves to the legalDocs Convex table; the customer site
 * reads from there and falls back to its hardcoded copy when a row is
 * missing or the body is blank.
 *
 * UX is intentionally close to the blog editor (same TipTap-based
 * full-page editing experience) so admins don't have to learn two
 * different editors.
 */

import { useState, useEffect } from "react";
import {
  useAuthedQuery as useQuery,
  useAuthedMutation as useMutation,
} from "@/hooks/useAuthedConvex";
import { api } from "../../../../convex/_generated/api";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import TipTapEditor from "@/components/TipTapEditor";

// ── The three legal docs we ship out of the box. Every entry here gets
// a row in the admin list; clicking opens the editor. To add a new doc,
// drop a new entry here AND a matching Next.js page on the customer
// site that calls websiteContent.getLegalDocBySlug({ slug }). ────────────
const LEGAL_DOC_SLUGS = [
  {
    slug: "privacy-policy",
    label: "Privacy Policy",
    description:
      "How FIIT Co. collects, uses, and protects member personal data. PIPEDA-aligned.",
    publicUrl: "https://fiitco.ca/privacy-policy",
  },
  {
    slug: "terms",
    label: "Terms & Conditions",
    description:
      "Membership terms, cancellation, liability waiver, and house rules.",
    publicUrl: "https://fiitco.ca/terms",
  },
  {
    slug: "accessibility",
    label: "Accessibility Statement",
    description:
      "Commitment to AODA-aligned accessibility and our current state.",
    publicUrl: "https://fiitco.ca/accessibility",
  },
] as const;

// Empty TipTap doc — used as the starting point for a doc that has
// never been edited.
const EMPTY_DOC = JSON.stringify({
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "" }] },
  ],
});

type LegalDoc = {
  _id: string;
  slug: string;
  title: string;
  bodyJson: string;
  effectiveDate?: string;
  lastEditedAt: string;
  lastEditedBy: string;
};

export default function WebsiteLegalDocsPage() {
  const { ready } = useRequireAdmin();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const allDocs = useQuery(api.websiteContent.listLegalDocs, {}) as
    | LegalDoc[]
    | undefined;

  if (!ready) return null;

  return (
    <div style={{ padding: "0 0 80px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <header style={{ marginBottom: 32 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 8,
            }}
          >
            Website UI/UX
          </p>
          <h1
            className="font-serif"
            style={{
              fontSize: 36,
              fontWeight: 500,
              margin: 0,
              color: "var(--text-main)",
            }}
          >
            Legal Documents
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-muted)",
              marginTop: 12,
              maxWidth: 640,
              lineHeight: 1.6,
            }}
          >
            Edit the privacy policy, terms, and accessibility statement that
            appear on the customer website. Changes go live within seconds of
            saving — no separate publish step. If a doc has never been edited,
            the website shows the original hardcoded copy as a fallback.
          </p>
        </header>

        {!activeSlug && (
          <DocList
            docs={allDocs}
            onPick={(slug) => setActiveSlug(slug)}
          />
        )}

        {activeSlug && (
          <DocEditor
            slug={activeSlug}
            existing={allDocs?.find((d) => d.slug === activeSlug) ?? null}
            onClose={() => setActiveSlug(null)}
          />
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────

function DocList({
  docs,
  onPick,
}: {
  docs: LegalDoc[] | undefined;
  onPick: (slug: string) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 16,
      }}
    >
      {LEGAL_DOC_SLUGS.map((meta) => {
        const existing = docs?.find((d) => d.slug === meta.slug);
        const hasCustomCopy = !!existing;
        return (
          <button
            key={meta.slug}
            type="button"
            onClick={() => onPick(meta.slug)}
            style={{
              display: "block",
              textAlign: "left",
              padding: "20px 24px",
              borderRadius: "var(--radius-card, 16px)",
              background: "var(--bg-panel, #fff)",
              border: "1px solid rgba(0,0,0,0.06)",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              transition: "transform 0.12s, box-shadow 0.12s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 4px 18px rgba(0,0,0,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 2px 12px rgba(0,0,0,0.03)";
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
              <div style={{ flex: 1 }}>
                <h3
                  className="font-serif"
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    margin: 0,
                    color: "var(--text-main)",
                  }}
                >
                  {meta.label}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    marginTop: 6,
                    lineHeight: 1.5,
                  }}
                >
                  {meta.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    marginTop: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: hasCustomCopy
                        ? "rgba(46, 125, 50, 0.1)"
                        : "rgba(0, 0, 0, 0.05)",
                      color: hasCustomCopy ? "#2E7D32" : "var(--text-muted)",
                    }}
                  >
                    {hasCustomCopy ? "Custom copy live" : "Using default"}
                  </span>
                  {hasCustomCopy && existing.lastEditedAt && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Last edited{" "}
                      {new Date(existing.lastEditedAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                      {existing.lastEditedBy
                        ? ` by ${existing.lastEditedBy}`
                        : ""}
                    </span>
                  )}
                  <a
                    href={meta.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      textDecoration: "underline",
                    }}
                  >
                    View on website ↗
                  </a>
                </div>
              </div>
              <div
                style={{
                  fontSize: 22,
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
                aria-hidden="true"
              >
                →
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────

function DocEditor({
  slug,
  existing,
  onClose,
}: {
  slug: string;
  existing: LegalDoc | null;
  onClose: () => void;
}) {
  const meta = LEGAL_DOC_SLUGS.find((m) => m.slug === slug)!;
  const updateDoc = useMutation(api.websiteContent.updateLegalDoc);
  const deleteDoc = useMutation(api.websiteContent.deleteLegalDoc);

  const [title, setTitle] = useState(existing?.title ?? meta.label);
  const [effectiveDate, setEffectiveDate] = useState(
    existing?.effectiveDate ?? ""
  );
  const [bodyJson, setBodyJson] = useState(existing?.bodyJson ?? EMPTY_DOC);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Re-sync state when the user picks a different doc.
  useEffect(() => {
    setTitle(existing?.title ?? meta.label);
    setEffectiveDate(existing?.effectiveDate ?? "");
    setBodyJson(existing?.bodyJson ?? EMPTY_DOC);
  }, [existing, meta.label]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateDoc({
        slug,
        title,
        bodyJson,
        effectiveDate: effectiveDate || undefined,
      });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      alert(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleRevertToDefault() {
    if (
      !confirm(
        `Reset ${meta.label} to the default hardcoded copy? Your custom edits will be deleted.`
      )
    ) {
      return;
    }
    try {
      await deleteDoc({ slug });
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Reset failed";
      alert(msg);
    }
  }

  return (
    <div
      style={{
        background: "var(--bg-panel, #fff)",
        borderRadius: "var(--radius-card, 16px)",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "20px 28px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            fontSize: 14,
            cursor: "pointer",
            padding: 0,
            fontFamily: "inherit",
          }}
        >
          ← Back to legal docs
        </button>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {savedFlash && (
            <span
              style={{
                fontSize: 13,
                color: "#2E7D32",
                fontWeight: 500,
              }}
            >
              ✓ Saved — live on fiitco.ca
            </span>
          )}
          {existing && (
            <button
              type="button"
              onClick={handleRevertToDefault}
              style={{
                background: "none",
                border: "1px solid rgba(0,0,0,0.12)",
                color: "var(--text-muted)",
                padding: "8px 14px",
                fontSize: 13,
                borderRadius: "var(--radius-pill, 999px)",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Revert to default
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saving ? "rgba(0,0,0,0.1)" : "var(--ui-dark, #1E1812)",
              color: saving ? "var(--text-muted)" : "#fff",
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 500,
              border: "none",
              borderRadius: "var(--radius-pill, 999px)",
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {saving ? "Saving…" : "Save & publish"}
          </button>
        </div>
      </div>

      <div style={{ padding: "28px 32px" }}>
        <label style={fieldLabel}>Page title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={fieldInput}
          placeholder={meta.label}
        />

        <label style={{ ...fieldLabel, marginTop: 20 }}>
          Effective date (optional)
        </label>
        <input
          type="text"
          value={effectiveDate}
          onChange={(e) => setEffectiveDate(e.target.value)}
          style={fieldInput}
          placeholder="e.g. April 13, 2026"
        />
        <p
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            marginTop: 6,
          }}
        >
          Shown under the page title on the customer website. Leave blank to
          omit.
        </p>

        <label style={{ ...fieldLabel, marginTop: 24 }}>Body</label>
        <p
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            marginTop: 6,
            marginBottom: 12,
          }}
        >
          Use headings (H1, H2, H3), bullet lists, links, and bold/italic.
          Customer site renders this exactly as you type it.
        </p>
        <div
          style={{
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 12,
            background: "var(--bg-app, #FAF7F3)",
          }}
        >
          <TipTapEditor
            initialJson={bodyJson}
            onChange={(json) => setBodyJson(json)}
            placeholder="Write the legal text here…"
          />
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────

const fieldLabel: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--text-main)",
  marginBottom: 6,
};

const fieldInput: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  fontSize: 15,
  color: "var(--text-main)",
  background: "var(--bg-beige, #FAF7F3)",
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: 8,
  fontFamily: "inherit",
  boxSizing: "border-box",
};
