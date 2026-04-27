"use client";

/**
 * Monthly report download — admin-only widget that lets Arden grab a
 * complete Excel snapshot of the month's referrals and guest passes
 * for record-keeping and reconciliation against Mindbody.
 *
 * Design notes:
 *   - Month picker defaults to the current month and year.
 *   - File generation is fully client-side via the xlsx library, so we
 *     don't need a Convex action or extra server round-trip.
 *   - Output has three sheets: Referrals, Guest Passes, Summary.
 *     Each sheet is filtered to the chosen month based on the source
 *     row's `createdAt` (or, for guest passes, `monthKey`) so the
 *     numbers match what Arden would expect to reconcile.
 *   - Phone numbers are forced to text format so Excel doesn't strip
 *     leading zeros or convert long numbers to scientific notation.
 */

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useAuthedQuery as useQuery } from "@/hooks/useAuthedConvex";
import { api } from "../../convex/_generated/api";

type MonthKey = string; // "YYYY-MM"

function currentMonthKey(): MonthKey {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function previousMonthKey(): MonthKey {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: MonthKey): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function isoDate(epochMs: number | undefined): string {
  if (!epochMs) return "";
  return new Date(epochMs).toISOString().split("T")[0];
}

function isoDatetime(epochMs: number | undefined): string {
  if (!epochMs) return "";
  return new Date(epochMs).toLocaleString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function rowsInMonth<T extends { createdAt: number }>(
  rows: T[] | undefined,
  monthKey: MonthKey
): T[] {
  if (!rows) return [];
  const [y, m] = monthKey.split("-").map(Number);
  const start = new Date(y, m - 1, 1).getTime();
  const end = new Date(y, m, 1).getTime();
  return rows.filter((r) => r.createdAt >= start && r.createdAt < end);
}

// Last 24 months as picker options (covers any historical month Arden
// might need to re-pull, plus the current month).
function buildMonthOptions(): MonthKey[] {
  const out: MonthKey[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < 24; i++) {
    out.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}

export default function MonthlyReportDownload() {
  const [monthKey, setMonthKey] = useState<MonthKey>(currentMonthKey());
  const [generating, setGenerating] = useState(false);

  // Both queries are admin-gated (authedQuery). Since this widget is
  // only shown to admins by the parent page, the auth path is correct.
  const allReferrals = useQuery(api.referrals.list, {}) as
    | Array<{
        _id: string;
        referrerFirstName: string;
        referrerPhone: string;
        friendFirstName: string;
        friendPhone: string;
        status: string;
        createdAt: number;
        completedAt?: number;
        rewardedAt?: number;
        createdBy?: string;
        notes?: string;
      }>
    | undefined;

  const allGuestPasses = useQuery(api.guestPasses.list, {}) as
    | Array<{
        _id: string;
        memberFirstName: string;
        memberPhone: string;
        guestFirstName: string;
        guestPhone: string;
        status: string;
        createdAt: number;
        monthKey: string;
        redeemedAt?: number;
        redeemedBy?: string;
        createdBy?: string;
        notes?: string;
      }>
    | undefined;

  const referralsThisMonth = useMemo(
    () => rowsInMonth(allReferrals, monthKey),
    [allReferrals, monthKey]
  );

  // Guest passes are pre-tagged with a monthKey field by the create
  // mutation, so use that directly — it's authoritative.
  const passesThisMonth = useMemo(() => {
    if (!allGuestPasses) return [];
    return allGuestPasses.filter((p) => p.monthKey === monthKey);
  }, [allGuestPasses, monthKey]);

  const isLoading = allReferrals === undefined || allGuestPasses === undefined;
  const monthOptions = useMemo(buildMonthOptions, []);

  function handleDownload() {
    if (isLoading) return;
    setGenerating(true);
    try {
      const wb = XLSX.utils.book_new();

      // ── Sheet 1: Referrals ──────────────────────────────────────
      const referralRows = referralsThisMonth.map((r) => ({
        "Referrer First Name": r.referrerFirstName,
        "Referrer Phone": r.referrerPhone,
        "Friend First Name": r.friendFirstName,
        "Friend Phone": r.friendPhone,
        Status: r.status,
        Submitted: isoDatetime(r.createdAt),
        Completed: isoDate(r.completedAt),
        Rewarded: isoDate(r.rewardedAt),
        Source: r.createdBy ?? "website",
        Notes: r.notes ?? "",
      }));
      const referralSheet = XLSX.utils.json_to_sheet(
        referralRows.length > 0
          ? referralRows
          : [
              {
                "Referrer First Name": "(no referrals this month)",
                "Referrer Phone": "",
                "Friend First Name": "",
                "Friend Phone": "",
                Status: "",
                Submitted: "",
                Completed: "",
                Rewarded: "",
                Source: "",
                Notes: "",
              },
            ]
      );
      // Force phone columns to text so Excel doesn't mangle them.
      forcePhoneText(referralSheet, ["B", "D"], referralRows.length + 1);
      XLSX.utils.book_append_sheet(wb, referralSheet, "Referrals");

      // ── Sheet 2: Guest Passes ───────────────────────────────────
      const passRows = passesThisMonth.map((p) => ({
        "Member First Name": p.memberFirstName,
        "Member Phone": p.memberPhone,
        "Guest First Name": p.guestFirstName,
        "Guest Phone": p.guestPhone,
        Status: p.status,
        Submitted: isoDatetime(p.createdAt),
        Redeemed: isoDate(p.redeemedAt),
        "Redeemed By": p.redeemedBy ?? "",
        Source: p.createdBy ?? "website",
        Notes: p.notes ?? "",
      }));
      const passSheet = XLSX.utils.json_to_sheet(
        passRows.length > 0
          ? passRows
          : [
              {
                "Member First Name": "(no guest passes this month)",
                "Member Phone": "",
                "Guest First Name": "",
                "Guest Phone": "",
                Status: "",
                Submitted: "",
                Redeemed: "",
                "Redeemed By": "",
                Source: "",
                Notes: "",
              },
            ]
      );
      forcePhoneText(passSheet, ["B", "D"], passRows.length + 1);
      XLSX.utils.book_append_sheet(wb, passSheet, "Guest Passes");

      // ── Sheet 3: Summary ────────────────────────────────────────
      const referralStatus = countByStatus(referralsThisMonth);
      const passStatus = countByStatus(passesThisMonth);
      const summaryRows = [
        { Metric: "Month", Value: monthLabel(monthKey) },
        { Metric: "Generated", Value: isoDatetime(Date.now()) },
        { Metric: "", Value: "" },
        { Metric: "REFERRALS", Value: "" },
        { Metric: "Total submitted", Value: referralsThisMonth.length },
        { Metric: "  Pending", Value: referralStatus.pending ?? 0 },
        { Metric: "  Completed (friend signed up)", Value: referralStatus.completed ?? 0 },
        { Metric: "  Rewarded (credit applied)", Value: referralStatus.rewarded ?? 0 },
        { Metric: "", Value: "" },
        { Metric: "GUEST PASSES", Value: "" },
        { Metric: "Total issued", Value: passesThisMonth.length },
        { Metric: "  Pending (not redeemed)", Value: passStatus.pending ?? 0 },
        { Metric: "  Redeemed", Value: passStatus.redeemed ?? 0 },
        { Metric: "  Expired", Value: passStatus.expired ?? 0 },
        { Metric: "", Value: "" },
        {
          Metric: "Conversion rate (referrals)",
          Value:
            referralsThisMonth.length > 0
              ? `${Math.round(
                  ((referralStatus.completed ?? 0) +
                    (referralStatus.rewarded ?? 0)) /
                    referralsThisMonth.length *
                    100
                )}%`
              : "n/a",
        },
        {
          Metric: "Redemption rate (guest passes)",
          Value:
            passesThisMonth.length > 0
              ? `${Math.round(
                  ((passStatus.redeemed ?? 0) / passesThisMonth.length) * 100
                )}%`
              : "n/a",
        },
      ];
      const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
      // Make column A wider so labels read cleanly.
      summarySheet["!cols"] = [{ wch: 38 }, { wch: 26 }];
      XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

      // ── Filename + download ─────────────────────────────────────
      const filename = `FIIT-Co_Front-Desk-Report_${monthKey}.xlsx`;
      XLSX.writeFile(wb, filename);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div
      style={{
        background: "var(--bg-panel, #fff)",
        borderRadius: "var(--radius-card, 16px)",
        border: "1px solid rgba(0,0,0,0.06)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div>
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            margin: 0,
            marginBottom: 4,
          }}
        >
          Monthly Report
        </p>
        <h3
          className="font-serif"
          style={{ fontSize: 20, fontWeight: 500, margin: 0, color: "var(--text-main)" }}
        >
          Front Desk Activity Export
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            marginTop: 6,
            lineHeight: 1.5,
            maxWidth: 480,
          }}
        >
          Download a complete Excel snapshot of every referral and guest pass
          for a chosen month. Includes referrer + friend details, status,
          dates, and a summary tab with conversion rates.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <label
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Month:
          <select
            value={monthKey}
            onChange={(e) => setMonthKey(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.12)",
              fontSize: 14,
              fontFamily: "inherit",
              background: "var(--bg-beige, #FAF7F3)",
              color: "var(--text-main)",
              cursor: "pointer",
            }}
          >
            {monthOptions.map((k) => (
              <option key={k} value={k}>
                {monthLabel(k)}
                {k === currentMonthKey() ? " (current)" : ""}
                {k === previousMonthKey() ? " (last)" : ""}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isLoading || generating}
          style={{
            padding: "10px 20px",
            background: isLoading || generating ? "rgba(0,0,0,0.1)" : "var(--ui-dark, #1E1812)",
            color: isLoading || generating ? "var(--text-muted)" : "#fff",
            border: "none",
            borderRadius: "var(--radius-pill, 999px)",
            fontSize: 14,
            fontWeight: 500,
            cursor: isLoading || generating ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            transition: "opacity 0.15s",
          }}
        >
          {isLoading
            ? "Loading data…"
            : generating
            ? "Generating…"
            : "Download Excel"}
        </button>

        {!isLoading && (
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {referralsThisMonth.length} referral
            {referralsThisMonth.length === 1 ? "" : "s"} ·{" "}
            {passesThisMonth.length} guest pass
            {passesThisMonth.length === 1 ? "" : "es"} this month
          </span>
        )}
      </div>
    </div>
  );
}

function forcePhoneText(
  sheet: XLSX.WorkSheet,
  cols: string[],
  totalRows: number
): void {
  // Skip the header row (1) and walk every data row.
  for (let row = 2; row <= totalRows; row++) {
    for (const c of cols) {
      const ref = `${c}${row}`;
      const cell = sheet[ref];
      if (cell && cell.v !== undefined && cell.v !== "") {
        cell.t = "s"; // string
        cell.v = String(cell.v);
      }
    }
  }
}

function countByStatus<T extends { status: string }>(
  rows: T[]
): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
}
