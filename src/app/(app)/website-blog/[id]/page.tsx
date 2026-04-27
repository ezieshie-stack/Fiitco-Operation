"use client";

/**
 * Blog post editor — LinkedIn-style full-page editor with cover image,
 * title, rich-text body, and a "Next →" publish flow that prompts for
 * slug / excerpt / category / author / read time / publish settings.
 *
 * Route param:
 *   [id] === "new"          → create a new post
 *   [id] === <Convex id>    → edit an existing post
 */

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuthedQuery as useQuery, useAuthedMutation as useMutation } from "@/hooks/useAuthedConvex";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import TipTapEditor from "@/components/TipTapEditor";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/**
 * Resolve an image URL for display in the admin. Legacy posts reference
 * `/blog/*.jpg` paths that only exist in the fiit-website /public/ folder.
 * The admin is served from a different domain, so we prepend the website
 * origin for display. Absolute URLs (Convex storage, blob:, data:, http)
 * pass through unchanged.
 */
const FIIT_WEBSITE_ORIGIN = "https://fiit-website-liart.vercel.app";
function resolveImageUrl(url: string): string {
  if (!url) return url;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  if (url.startsWith("/")) return `${FIIT_WEBSITE_ORIGIN}${url}`;
  return url;
}

// Word count from TipTap JSON — best-effort for estimating read time
function estimateWords(json: string): number {
  try {
    const doc = JSON.parse(json);
    let count = 0;
    const walk = (node: { text?: string; content?: unknown[] }) => {
      if (node.text) count += node.text.split(/\s+/).filter(Boolean).length;
      if (node.content) node.content.forEach((c) => walk(c as never));
    };
    walk(doc);
    return count;
  } catch {
    return 0;
  }
}

const EMPTY_DOC_JSON = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph" }],
});

export default function BlogEditorPage() {
  const { ready } = useRequireAdmin();
  const router = useRouter();
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const isNew = rawId === "new";

  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  // Only query the existing post if we're editing
  const existing = useQuery(
    api.websiteContent.getBlogPost,
    isNew ? "skip" : { id: rawId as Id<"blogPosts"> }
  );

  const createBlogPost = useMutation(api.websiteContent.createBlogPost);
  const updateBlogPost = useMutation(api.websiteContent.updateBlogPost);
  const generateUploadUrl = useMutation(api.websiteContent.generateUploadUrl);

  const [title, setTitle] = useState("");
  const [bodyJson, setBodyJson] = useState(EMPTY_DOC_JSON);
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [readTime, setReadTime] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [featured, setFeatured] = useState(false);
  const [showPublishPanel, setShowPublishPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const pendingCoverStorageIdRef = useRef<Id<"_storage"> | null>(null);

  // Initialize form when the existing post loads
  useEffect(() => {
    if (existing && !isNew) {
      setTitle(existing.title);
      setBodyJson(existing.bodyJson ?? EMPTY_DOC_JSON);
      setSlug(existing.slug);
      setExcerpt(existing.excerpt);
      setCategory(existing.category);
      setAuthor(existing.author);
      setReadTime(existing.readTime ?? "");
      setCoverImageUrl(existing.coverImageUrl ?? "");
      setStatus(existing.status === "published" ? "published" : "draft");
      setFeatured(existing.featured ?? false);
    }
  }, [existing, isNew]);

  // Default author to the logged-in user's display name on new posts
  useEffect(() => {
    if (isNew && !author && currentUser?.displayName) {
      setAuthor(currentUser.displayName);
    }
  }, [isNew, author, currentUser]);

  // Auto-estimate read time based on body word count (~200 wpm)
  const estimatedWords = estimateWords(bodyJson);
  const estimatedMinutes = Math.max(1, Math.round(estimatedWords / 200));
  const autoReadTime = `${estimatedMinutes} min read`;

  async function handleCoverUpload(file: File) {
    if (!isAdmin) return;
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const { storageId } = await res.json();

      if (!isNew && existing) {
        await updateBlogPost({ id: existing._id, coverImageStorageId: storageId as Id<"_storage"> });
        // The mutation's URL resolution is in the existing update; re-fetch via cache
        setCoverImageUrl(URL.createObjectURL(file));
      } else {
        pendingCoverStorageIdRef.current = storageId as Id<"_storage">;
        setCoverImageUrl(URL.createObjectURL(file));
      }
      setStatusMsg({ type: "ok", text: "Cover uploaded" });
      setTimeout(() => setStatusMsg(null), 2000);
    } catch (err) {
      setStatusMsg({ type: "err", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(publishNow = false) {
    if (!title.trim()) {
      setStatusMsg({ type: "err", text: "Title is required" });
      return;
    }
    if (!isAdmin) return;
    setSaving(true);
    try {
      const finalSlug = slug.trim() || slugify(title);
      const finalStatus = publishNow ? "published" : status;
      const finalReadTime = readTime.trim() || autoReadTime;

      if (isNew || !existing) {
        const id = await createBlogPost({
          slug: finalSlug,
          title: title.trim(),
          excerpt: excerpt.trim() || title.slice(0, 160),
          category: category.trim() || "Journal",
          author: author.trim() || currentUser?.displayName || "FIIT Co.",
          readTime: finalReadTime,
          ...(pendingCoverStorageIdRef.current
            ? { coverImageStorageId: pendingCoverStorageIdRef.current }
            : coverImageUrl && !coverImageUrl.startsWith("blob:")
            ? { coverImageUrl }
            : {}),
          bodyJson,
          status: finalStatus,
          featured,
        });
        // Redirect to the edit URL so future saves use the update path
        router.replace(`/website-blog/${id}`);
      } else {
        await updateBlogPost({
          id: existing._id,
          slug: finalSlug,
          title: title.trim(),
          excerpt: excerpt.trim() || title.slice(0, 160),
          category: category.trim() || "Journal",
          author: author.trim(),
          readTime: finalReadTime,
          bodyJson,
          status: finalStatus,
          featured,
          ...(coverImageUrl && !coverImageUrl.startsWith("blob:")
            ? { coverImageUrl }
            : {}),
        });
      }
      setStatus(finalStatus);
      setShowPublishPanel(false);
      setStatusMsg({ type: "ok", text: publishNow ? "Published ✓" : "Draft saved ✓" });
      setTimeout(() => setStatusMsg(null), 2500);
    } catch (err) {
      setStatusMsg({ type: "err", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  // Admin-only — redirect instructors away from this page.
  if (!ready) return null;

  return (
    <div style={{ padding: "32px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/website-blog" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: 14 }}>← Back</Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "#EAE4DB", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 600, color: "#8B7F72",
            }}>
              {(currentUser?.displayName ?? "?").split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{currentUser?.displayName}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{isNew ? "New post" : status === "published" ? "Published post" : "Draft"}</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving || !isAdmin}
            style={{ ...actionBtnStyle, padding: "8px 16px" }}
          >
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={() => setShowPublishPanel(true)}
            disabled={saving || !isAdmin}
            style={{
              padding: "8px 20px",
              background: "#0A66C2",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            Next →
          </button>
        </div>
      </div>

      {statusMsg && (
        <div style={{ padding: "10px 14px", borderRadius: 6, marginBottom: 16, fontSize: 14, background: statusMsg.type === "ok" ? "#E8F5E9" : "#FFEBEE", color: statusMsg.type === "ok" ? "#1B5E20" : "#B71C1C", border: `1px solid ${statusMsg.type === "ok" ? "#A5D6A7" : "#EF9A9A"}` }}>
          {statusMsg.text}
        </div>
      )}

      {/* Cover image upload area */}
      <div style={{ marginBottom: 24 }}>
        {coverImageUrl ? (
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolveImageUrl(coverImageUrl)} alt="" style={{ width: "100%", maxHeight: 360, objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 8 }}>
              <button type="button" onClick={() => coverFileRef.current?.click()} style={{ ...actionBtnStyle, padding: "6px 12px", background: "rgba(255,255,255,0.92)" }}>
                Replace
              </button>
              <button type="button" onClick={() => { pendingCoverStorageIdRef.current = null; setCoverImageUrl(""); }} style={{ ...actionBtnStyle, padding: "6px 12px", background: "rgba(255,255,255,0.92)", color: "#B71C1C" }}>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverFileRef.current?.click()}
            disabled={uploading}
            style={{
              width: "100%",
              padding: "48px 24px",
              border: "2px dashed rgba(0,0,0,0.15)",
              borderRadius: 12,
              background: "#FAF7F3",
              cursor: uploading ? "not-allowed" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              color: "var(--text-muted)",
              fontSize: 14,
              fontFamily: "inherit",
            }}
          >
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="8.5" cy="10" r="1.5" fill="currentColor" />
              <path d="M21 15l-5-5L5 19" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{uploading ? "Uploading…" : "Add a cover image to your article."}</span>
            <span style={{ fontSize: 12, opacity: 0.7 }}>Upload from computer</span>
          </button>
        )}
        <input
          ref={coverFileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleCoverUpload(f);
          }}
        />
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        style={{
          width: "100%",
          padding: "12px 0",
          fontSize: 36,
          fontFamily: "var(--font-serif, Georgia, serif)",
          fontWeight: 500,
          border: "none",
          outline: "none",
          background: "transparent",
          marginBottom: 16,
          color: "var(--text-main)",
        }}
      />

      {/* Body editor */}
      <TipTapEditor
        initialJson={bodyJson === EMPTY_DOC_JSON ? undefined : bodyJson}
        onChange={setBodyJson}
        placeholder="Write here."
      />

      {/* Publish settings panel — shown when user clicks "Next →" */}
      {showPublishPanel && (
        <div
          onClick={() => setShowPublishPanel(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: 20,
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 12, padding: 32, maxWidth: 560, width: "100%" }}>
            <h2 className="font-serif" style={{ fontSize: 22, margin: "0 0 20px", fontWeight: 500 }}>Publish Settings</h2>

            <div style={{ display: "grid", gap: 16 }}>
              <Field label="Slug" hint="URL path, e.g. 'new-years-wishes'">
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} style={inputStyle} placeholder={title ? slugify(title) : ""} />
              </Field>
              <Field label="Excerpt" hint="One-paragraph summary shown on the blog listing + social previews.">
                <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Category">
                  <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle} placeholder="Reflection, Habits, Nutrition…" />
                </Field>
                <Field label="Author">
                  <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} style={inputStyle} />
                </Field>
              </div>
              <Field label="Read time" hint={`Auto-estimate: ${autoReadTime}. Leave blank to use the estimate.`}>
                <input type="text" value={readTime} onChange={(e) => setReadTime(e.target.value)} style={inputStyle} placeholder={autoReadTime} />
              </Field>
              <Field label="Featured">
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                  Pin to top of /blog (only one featured post renders as the hero)
                </label>
              </Field>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
              <button onClick={() => setShowPublishPanel(false)} style={{ ...actionBtnStyle, padding: "10px 20px" }}>Cancel</button>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handleSave(false)} disabled={saving} style={{ ...actionBtnStyle, padding: "10px 20px" }}>
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  style={{ padding: "10px 24px", background: "#0A66C2", color: "#fff", border: "none", borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}
                >
                  {saving ? "Publishing…" : "Publish"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom status pill */}
      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)" }}>
        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: status === "published" ? "#4CAF50" : "#999" }} />
        {status === "published" ? "Published" : "Draft"}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-main)", marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 12px", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 6, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff" };
const actionBtnStyle: React.CSSProperties = { padding: "6px 12px", border: "1px solid rgba(0,0,0,0.12)", background: "#fff", borderRadius: 6, fontSize: 13, cursor: "pointer", color: "var(--text-main)" };
