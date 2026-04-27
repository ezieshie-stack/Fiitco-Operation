"use client";

/**
 * TipTap rich-text editor for blog post bodies — LinkedIn-style toolbar
 * above a plain editing area. Outputs JSON that gets stored in Convex
 * (bodyJson field on blogPosts). The website renders that JSON to HTML
 * at display time.
 *
 * Supports: paragraphs, H1-H3, bold, italic, bullet/numbered lists,
 * blockquote, horizontal rule, links, inline images (uploaded to Convex).
 *
 * Kept intentionally simple — no code blocks, no @mentions, no tables.
 * Can extend later if the team requests something.
 */

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useAuthedMutation as useMutation } from "@/hooks/useAuthedConvex";
import { api } from "../../convex/_generated/api";
import { useRef, useEffect } from "react";
import type { Id } from "../../convex/_generated/dataModel";

type Props = {
  /** Initial content — TipTap JSON. Leave undefined for an empty editor. */
  initialJson?: string;
  /** Called on every edit with the current JSON serialization. */
  onChange: (json: string) => void;
  /** Placeholder text shown when the editor is empty. */
  placeholder?: string;
};

export default function TipTapEditor({ initialJson, onChange, placeholder }: Props) {
  const generateUploadUrl = useMutation(api.websiteContent.generateUploadUrl);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Drop heading level 4+ — gym blog rarely needs deeper hierarchy.
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({
        HTMLAttributes: {
          style: "max-width: 100%; height: auto; border-radius: 6px; margin: 1rem 0;",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Write here.",
      }),
    ],
    content: initialJson ? safeParseJson(initialJson) : undefined,
    immediatelyRender: false, // avoid hydration mismatch in Next.js
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
  });

  // TipTap's useEditor only reads `content` on initial mount — if the parent
  // is loading the post async (e.g. Convex useQuery), the initialJson prop
  // arrives a beat after the editor initializes. Sync it over.
  useEffect(() => {
    if (!editor || !initialJson) return;
    const parsed = safeParseJson(initialJson);
    if (!parsed) return;
    // Only update if the editor's current doc differs from what we want,
    // to avoid re-setting on every keystroke (which would nuke the cursor).
    const currentJson = JSON.stringify(editor.getJSON());
    if (currentJson !== initialJson) {
      // `false` = don't fire onUpdate, avoids a feedback loop with the
      // parent component's state setter.
      editor.commands.setContent(parsed, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialJson, editor]);

  async function handleImageUpload(file: File) {
    if (!editor) return;
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const { storageId } = await res.json();
      // Resolve the storageId to a permanent URL via a follow-up mutation.
      // Easiest path: embed with a marker URL + let server replace on save.
      // For now we just grab the public URL Convex returns on upload.
      // Convex storageId → public URL resolution happens server-side in
      // mutations, so we need another call. Simpler: fetch the resolved
      // URL immediately by asking the backend to resolve it.
      const resolvedRes = await fetch(`/api/convex-storage/${storageId}`).catch(() => null);
      // Fallback: use Convex's storage URL endpoint directly
      const convexUrl =
        process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://dutiful-ferret-681.convex.cloud";
      // Convex serves uploaded files at <deployment>.convex.cloud/api/storage/<id>
      const imageUrl = resolvedRes?.ok
        ? (await resolvedRes.json()).url
        : `${convexUrl.replace("convex.cloud", "convex.cloud")}/api/storage/${storageId}`;
      editor.chain().focus().setImage({ src: imageUrl }).run();
    } catch (err) {
      console.error("Image upload failed:", err);
      alert(err instanceof Error ? err.message : "Image upload failed");
    }
  }

  function promptForLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href ?? "";
    const url = window.prompt("Enter URL", previousUrl);
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const normalized = /^https?:\/\//.test(url) ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: normalized }).run();
  }

  if (!editor) return null;

  return (
    <div style={{ border: "1px solid rgba(0,0,0,0.15)", borderRadius: 8, overflow: "hidden" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          padding: 8,
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          background: "#F9F5F0",
        }}
      >
        <StyleDropdown editor={editor} />
        <Divider />
        <ToolBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (⌘B)">
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (⌘I)">
          <em>I</em>
        </ToolBtn>
        <Divider />
        <ToolBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bulleted list">
          <Icon viewBox="0 0 24 24"><circle cx="5" cy="6" r="1.5" /><circle cx="5" cy="12" r="1.5" /><circle cx="5" cy="18" r="1.5" /><path d="M10 6h10M10 12h10M10 18h10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></Icon>
        </ToolBtn>
        <ToolBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
          <Icon viewBox="0 0 24 24"><text x="3" y="8" fontSize="7" fill="currentColor" fontWeight="700">1.</text><text x="3" y="14" fontSize="7" fill="currentColor" fontWeight="700">2.</text><text x="3" y="20" fontSize="7" fill="currentColor" fontWeight="700">3.</text><path d="M10 6h10M10 12h10M10 18h10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></Icon>
        </ToolBtn>
        <Divider />
        <ToolBtn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote">
          <Icon viewBox="0 0 24 24"><text x="3" y="16" fontSize="18" fill="currentColor" fontWeight="700">&ldquo;</text></Icon>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
          <Icon viewBox="0 0 24 24"><path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></Icon>
        </ToolBtn>
        <Divider />
        <ToolBtn active={editor.isActive("link")} onClick={promptForLink} title="Insert link">
          <Icon viewBox="0 0 24 24">
            <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1 1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Icon>
        </ToolBtn>
        <ToolBtn onClick={() => imageInputRef.current?.click()} title="Insert image">
          <Icon viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="8.5" cy="10" r="1.5" fill="currentColor" />
            <path d="M21 15l-5-5L5 19" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Icon>
        </ToolBtn>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImageUpload(f);
            e.target.value = ""; // allow re-uploading the same file
          }}
        />
      </div>

      {/* Editor surface */}
      <div
        style={{
          padding: "24px 32px",
          minHeight: 360,
          background: "#fff",
          fontFamily: "inherit",
          fontSize: 15,
          lineHeight: 1.7,
          color: "var(--text-main)",
        }}
      >
        <style>{`
          .ProseMirror { outline: none; min-height: 300px; }
          .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: rgba(0,0,0,0.35);
            pointer-events: none;
            height: 0;
          }
          .ProseMirror h1 { font-size: 28px; font-weight: 700; margin: 16px 0 8px; line-height: 1.2; }
          .ProseMirror h2 { font-size: 22px; font-weight: 700; margin: 14px 0 8px; line-height: 1.25; }
          .ProseMirror h3 { font-size: 18px; font-weight: 600; margin: 12px 0 6px; line-height: 1.3; }
          .ProseMirror p  { margin: 0 0 12px; }
          .ProseMirror ul, .ProseMirror ol { padding-left: 24px; margin: 0 0 12px; }
          .ProseMirror li { margin: 4px 0; }
          .ProseMirror blockquote {
            border-left: 3px solid #D92B2B;
            padding: 8px 16px;
            margin: 16px 0;
            color: rgba(0,0,0,0.7);
            font-style: italic;
          }
          .ProseMirror hr { border: none; border-top: 2px solid rgba(0,0,0,0.08); margin: 24px 0; }
          .ProseMirror a { color: #D92B2B; text-decoration: underline; }
          .ProseMirror img { max-width: 100%; border-radius: 6px; margin: 12px 0; }
        `}</style>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// ── Toolbar helpers ──────────────────────────────────────────────────────

function StyleDropdown({ editor }: { editor: Editor }) {
  const current = editor.isActive("heading", { level: 1 })
    ? "h1"
    : editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
    ? "h3"
    : "p";

  return (
    <select
      value={current}
      onChange={(e) => {
        const val = e.target.value;
        if (val === "p") editor.chain().focus().setParagraph().run();
        else if (val === "h1") editor.chain().focus().toggleHeading({ level: 1 }).run();
        else if (val === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
        else if (val === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
      }}
      style={{
        height: 32,
        padding: "0 8px",
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 6,
        background: "#fff",
        fontSize: 13,
        fontFamily: "inherit",
        cursor: "pointer",
      }}
    >
      <option value="p">Paragraph</option>
      <option value="h1">Heading 1</option>
      <option value="h2">Heading 2</option>
      <option value="h3">Heading 3</option>
    </select>
  );
}

function ToolBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        minWidth: 32,
        height: 32,
        padding: "0 8px",
        border: "1px solid rgba(0,0,0,0.08)",
        background: active ? "var(--ui-dark)" : "#fff",
        color: active ? "#fff" : "var(--text-main)",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 14,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 20, background: "rgba(0,0,0,0.12)", alignSelf: "center", margin: "0 4px" }} />;
}

function Icon({ viewBox, children }: { viewBox: string; children: React.ReactNode }) {
  return (
    <svg viewBox={viewBox} width="16" height="16" aria-hidden="true">
      {children}
    </svg>
  );
}

function safeParseJson(s: string): object | undefined {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}
