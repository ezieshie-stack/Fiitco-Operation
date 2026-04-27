"use client";

/**
 * Blog admin — list view. Editing happens on /website-blog/[id] where
 * `id` is either the Convex post id or the literal string "new".
 */

import Link from "next/link";
import { useAuthedQuery as useQuery, useAuthedMutation as useMutation } from "@/hooks/useAuthedConvex";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

type BlogPost = {
  _id: Id<"blogPosts">;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  status: string;
  featured: boolean;
  publishedAt?: string;
  updatedAt: string;
  createdAt: string;
};

export default function WebsiteBlogPage() {
  const { ready } = useRequireAdmin();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const posts = useQuery(api.websiteContent.listBlogPosts);
  const updatePost = useMutation(api.websiteContent.updateBlogPost);
  const deletePost = useMutation(api.websiteContent.hardDeleteBlogPost);

  const publishedCount = posts?.filter((p) => p.status === "published").length ?? 0;
  const draftCount = posts?.filter((p) => p.status === "draft").length ?? 0;
  const featuredCount = posts?.filter((p) => p.featured && p.status === "published").length ?? 0;

  async function handleToggleFeatured(p: BlogPost) {
    if (!isAdmin) return;
    await updatePost({ id: p._id, featured: !p.featured });
  }

  async function handleDelete(p: BlogPost) {
    if (!isAdmin) return;
    if (!window.confirm(`Delete "${p.title}" permanently? This can't be undone.`)) return;
    await deletePost({ id: p._id });
  }

  // Admin-only — redirect instructors away from this page.
  if (!ready) return null;

  return (
    <div style={{ padding: "40px", maxWidth: 1400 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: 36, fontWeight: 500, margin: 0, color: "var(--text-main)" }}>
            Website Blog
          </h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 14 }}>
            Journal posts shown at /blog on the customer website. Only <strong>Published</strong> posts appear publicly.
          </p>
        </div>
        {isAdmin && (
          <Link href="/website-blog/new" style={{ textDecoration: "none" }}>
            <button style={primaryBtnStyle()}>+ New Post</button>
          </Link>
        )}
      </div>

      <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
        <StatCard label="Published" value={publishedCount} />
        <StatCard label="Drafts" value={draftCount} />
        <StatCard label="Featured" value={featuredCount} />
      </div>

      {posts === undefined ? (
        <p>Loading…</p>
      ) : posts.length === 0 ? (
        <div style={{ background: "#fff", padding: 40, borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", textAlign: "center" }}>
          <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 16 }}>
            No blog posts yet. Write the first one.
          </p>
          {isAdmin && (
            <Link href="/website-blog/new" style={{ textDecoration: "none" }}>
              <button style={primaryBtnStyle()}>+ Write First Post</button>
            </Link>
          )}
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9F5F0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <th style={th}>Title</th>
                <th style={th}>Category</th>
                <th style={th}>Author</th>
                <th style={th}>Status</th>
                <th style={th}>Featured</th>
                <th style={th}>Updated</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p._id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                  <td style={{ ...td, maxWidth: 420 }}>
                    <div style={{ fontWeight: 500 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      /{p.slug}
                    </div>
                  </td>
                  <td style={td}>{p.category}</td>
                  <td style={td}>
                    <span style={{ fontSize: 13 }}>{p.author}</span>
                  </td>
                  <td style={td}>
                    <span style={chipStyle(
                      p.status === "published" ? "#E8F5E9" : "#FFF3E0",
                      p.status === "published" ? "#1B5E20" : "#E65100"
                    )}>
                      {p.status}
                    </span>
                  </td>
                  <td style={td}>
                    <input type="checkbox" checked={p.featured} onChange={() => handleToggleFeatured(p)} disabled={!isAdmin} />
                  </td>
                  <td style={td}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={td}>
                    {isAdmin && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link href={`/website-blog/${p._id}`} style={{ textDecoration: "none" }}>
                          <button style={actionBtnStyle}>Edit</button>
                        </Link>
                        <button onClick={() => handleDelete(p)} style={{ ...actionBtnStyle, color: "#B71C1C" }}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (<div style={{ padding: "16px 20px", background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", minWidth: 140 }}>
    <div style={{ fontSize: 28, fontWeight: 600, color: "var(--text-main)" }}>{value}</div>
    <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 4 }}>{label}</div>
  </div>);
}
function chipStyle(bg: string, fg: string): React.CSSProperties { return { fontSize: 11, padding: "3px 8px", borderRadius: 10, background: bg, color: fg, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }; }
function primaryBtnStyle(): React.CSSProperties { return { padding: "10px 20px", background: "var(--ui-dark, #1E1812)", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }; }
const actionBtnStyle: React.CSSProperties = { padding: "6px 12px", border: "1px solid rgba(0,0,0,0.12)", background: "#fff", borderRadius: 6, fontSize: 13, cursor: "pointer", color: "var(--text-main)" };
const th: React.CSSProperties = { textAlign: "left", padding: "14px 16px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", fontWeight: 600 };
const td: React.CSSProperties = { padding: "14px 16px", fontSize: 14, color: "var(--text-main)", verticalAlign: "middle" };
