"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace("/login");
    }
  }, [isLoading, currentUser, router]);

  if (isLoading) {
    return (
      <>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-app, #F9F5F0)",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: "3px solid rgba(0,0,0,0.08)",
              borderTopColor: "var(--ui-dark, #1E1812)",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }}
          />
        </div>
      </>
    );
  }

  if (!currentUser) {
    // Redirect is already fired in useEffect; render nothing while navigating
    return null;
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-app)",
      }}
    >
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${sidebarOpen ? " visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile header with hamburger */}
      <div className="mobile-header">
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            background: "none",
            border: "none",
            fontSize: 24,
            color: "var(--text-main)",
            cursor: "pointer",
            padding: "4px 8px",
            lineHeight: 1,
          }}
          aria-label="Open menu"
        >
          &#9776;
        </button>
        <p
          className="font-serif"
          style={{ fontSize: 20, fontWeight: 500, color: "var(--text-main)" }}
        >
          FIIT Co.
        </p>
      </div>

      <main
        className="app-main"
        style={{
          flex: 1,
          marginLeft: 260,
          padding: "48px 64px",
          minHeight: "100vh",
          overflowY: "auto",
        }}
      >
        {children}
      </main>
    </div>
  );
}

