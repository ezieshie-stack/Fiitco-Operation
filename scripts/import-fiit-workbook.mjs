#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ConvexHttpClient } from "convex/browser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const DEFAULT_WORKBOOK = path.resolve(
  repoRoot,
  "../FIIT_Co_Class_Management_Tool_v4_FINAL.xlsx",
);
const DEFAULT_CONVEX_URL =
  process.env.CONVEX_IMPORT_URL ?? "https://posh-coyote-465.convex.cloud";

function parseArgs(argv) {
  const args = {
    workbook: DEFAULT_WORKBOOK,
    url: DEFAULT_CONVEX_URL,
    dryRun: false,
    clearPendingChanges: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--keep-pending-changes") {
      args.clearPendingChanges = false;
    } else if (arg === "--workbook") {
      args.workbook = path.resolve(argv[index + 1]);
      index += 1;
    } else if (arg === "--url") {
      args.url = argv[index + 1];
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function summarizeDataset(dataset) {
  return Object.fromEntries(
    Object.entries(dataset).map(([key, rows]) => [key, Array.isArray(rows) ? rows.length : 0]),
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const parserPath = path.resolve(__dirname, "parse_fiit_workbook.py");

  const parseResult = spawnSync("python3", [parserPath, args.workbook], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });

  if (parseResult.status !== 0) {
    throw new Error(parseResult.stderr || "Workbook parser failed");
  }

  const dataset = JSON.parse(parseResult.stdout);
  const counts = summarizeDataset(dataset);

  console.log("Workbook parsed successfully.");
  console.table(counts);
  console.log(`Workbook: ${args.workbook}`);

  if (args.dryRun) {
    console.log("Dry run complete. No Convex data was changed.");
    return;
  }

  console.log(`Importing into Convex: ${args.url}`);
  const client = new ConvexHttpClient(args.url);
  const result = await client.mutation("mutations:importWorkbookData", {
    dataset,
    clearPendingChanges: args.clearPendingChanges,
  });

  console.log("Import finished.");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
