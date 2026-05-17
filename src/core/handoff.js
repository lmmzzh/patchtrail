import fs from "node:fs";
import path from "node:path";
import { timestampForFile } from "./baseline.js";
import { exists, ensureDir, readJson } from "./fs-utils.js";
import { guardPath, HANDOFFS_DIR, LATEST_CHECK, LATEST_HANDOFF } from "./paths.js";

export function runHandoff(root) {
  const latestCheckPath = guardPath(root, LATEST_CHECK);
  if (!exists(latestCheckPath)) {
    throw new Error("还没有检查结果，请先运行：zmg check");
  }

  const result = readJson(latestCheckPath);
  const timestamp = timestampForFile();
  const handoffsDir = guardPath(root, HANDOFFS_DIR);
  const handoffPath = guardPath(root, HANDOFFS_DIR, `${timestamp}-handoff.md`);
  const latestHandoffPath = guardPath(root, LATEST_HANDOFF);
  const content = renderMarkdownHandoff(result);

  ensureDir(handoffsDir);
  fs.writeFileSync(handoffPath, content, "utf8");
  fs.writeFileSync(latestHandoffPath, content, "utf8");

  console.log("已生成交接文档。");
  console.log("");
  console.log(`交接文档：${relativePath(root, handoffPath)}`);
  console.log(`最近交接：${relativePath(root, latestHandoffPath)}`);
}

export function renderMarkdownHandoff(result) {
  const lines = [];

  lines.push("# ZZH Mobile AI Guard Handoff");
  lines.push("");
  lines.push("## 1. Session Conclusion");
  lines.push("");
  lines.push(result.summary || "No summary was recorded.");
  lines.push("");
  lines.push("> This handoff is generated from zmg check.");
  lines.push("> It does not prove the project builds or the business behavior is correct.");
  lines.push("");
  lines.push("## 2. Changed Scope");
  lines.push("");
  lines.push(`- Changed files: ${result.stats?.changed_files ?? 0}`);
  lines.push(`- Added lines: ${result.stats?.added_lines ?? 0}`);
  lines.push(`- Deleted lines: ${result.stats?.deleted_lines ?? 0}`);
  lines.push("");
  lines.push("### Files");
  lines.push("");
  appendList(lines, result.changed_files, "No changed files were recorded.");
  lines.push("");
  lines.push("## 3. Risks To Review");
  lines.push("");
  appendRisks(lines, result.risks ?? []);
  lines.push("");
  lines.push("## 4. Manual Verification");
  lines.push("");
  appendList(lines, result.manual_verification, "No manual verification item was recorded.");
  lines.push("");
  lines.push("## 5. Next Agent Should Read");
  lines.push("");
  if (result.report_path) {
    lines.push(`- Latest check report: ${result.report_path}`);
  } else {
    lines.push("- Latest check report path was not recorded.");
  }
  lines.push("- Review the risk files above before making more changes.");
  lines.push("- Compile, test, or manually verify the affected mobile flow before trusting this change.");
  lines.push("");
  lines.push("## 6. Open Questions");
  lines.push("");
  lines.push("- Confirm whether high or medium risks belong to the current task.");
  lines.push("- Confirm manual verification results before trusting this change.");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function appendRisks(lines, risks) {
  if (risks.length === 0) {
    lines.push("- No obvious structural risk was found.");
    lines.push("- Still compile, test, and manually verify the affected feature before trusting the change.");
    return;
  }

  for (const item of risks) {
    const file = item.file || "global";
    lines.push(`- [${item.severity}] ${file}: ${item.message}`);
    appendRiskDetail(lines, "Why it matters", item.explanation);
    appendRiskDetail(lines, "Acceptable when", item.acceptable_when);
    appendRiskDetail(lines, "If unexpected", item.action_if_unexpected);
    appendRiskDetail(lines, "Suggested verification", item.verification);
  }
}

function appendRiskDetail(lines, label, value) {
  if (value) {
    lines.push(`  - ${label}: ${value}`);
  }
}

function appendList(lines, items, emptyText) {
  if (!items || items.length === 0) {
    lines.push(`- ${emptyText}`);
    return;
  }

  for (const item of items) {
    lines.push(`- ${item}`);
  }
}

function relativePath(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join("/");
}
