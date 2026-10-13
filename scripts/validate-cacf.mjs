#!/usr/bin/env node
/**
 * PADF V0.2 CACF structural validator. No external dependencies.
 * Verifies required framework artifacts, local Markdown links, required
 * schema markers, and role integration. Does not run agent runtime/CI/Linear.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "README.md",
  "AGENTS.md",
  "workflow/WORKFLOW.md",
  "workflow/agent-routing.md",
  "workflow/context-communication.md",
  "contracts/task-contract.md",
  "contracts/delivery-report.md",
  "contracts/shared-task-context.md",
  "contracts/agent-message.md",
  "contracts/context-checkpoint.md",
  "contracts/agent-handoff.md",
  "governance/approval-policy.md",
  "governance/context-loading.md",
  "governance/context-governance.md",
  ".agents/skills/master-orchestrator/SKILL.md",
  ".agents/skills/context-coordinator/SKILL.md",
  ".agents/skills/feature-coder/SKILL.md",
  ".agents/skills/qa-tester/SKILL.md",
  ".agents/skills/independent-reviewer/SKILL.md",
  "examples/pqa/ADOPTION.md",
  "examples/pqa/CONTEXT-COLLABORATION.md",
];

const schemaChecks = new Map([
  ["contracts/shared-task-context.md", "padf.shared-task-context/v1"],
  ["contracts/agent-message.md", "padf.agent-message/v1"],
  ["contracts/context-checkpoint.md", "padf.context-checkpoint/v1"],
  ["contracts/agent-handoff.md", "padf.agent-handoff/v1"],
]);

const errors = [];
for (const rel of required) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    errors.push("Missing " + rel);
    continue;
  }
  const markdown = fs.readFileSync(file, "utf8");
  if (schemaChecks.has(rel) && !markdown.includes(schemaChecks.get(rel))) {
    errors.push("Missing schema marker in " + rel);
  }
  // Check Markdown inline links. Ignore external URLs, anchors and non-file schemes.
  for (const match of markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const raw = match[1].trim().replace(/^<|>$/g, "");
    const dest = raw.split("#", 1)[0];
    if (!dest || /^(https?:|mailto:|\w+:\/\/)/i.test(dest)) continue;
    if (/\s/.test(dest)) continue; // optional title field / non-simple link
    const resolved = path.resolve(path.dirname(file), decodeURIComponent(dest));
    if (!resolved.startsWith(root + path.sep) || !fs.existsSync(resolved)) {
      errors.push("Broken local link: " + rel + " -> " + raw);
    }
  }
}
for (const [rel, needle] of [
  ["README.md", "context-coordinator"],
  ["workflow/WORKFLOW.md", "Context Readiness"],
  ["contracts/task-contract.md", "context_id"],
  ["contracts/delivery-report.md", "context_id"],
  ["governance/context-loading.md", "resume"],
  [".agents/skills/master-orchestrator/SKILL.md", "Shared Task Context"],
  [".agents/skills/feature-coder/SKILL.md", "Context Checkpoint"],
  [".agents/skills/qa-tester/SKILL.md", "Handoff"],
  [".agents/skills/independent-reviewer/SKILL.md", "fresh"],
]) {
  const file = path.join(root, rel);
  if (fs.existsSync(file) && !fs.readFileSync(file, "utf8").toLowerCase().includes(needle.toLowerCase())) {
    errors.push("Missing V0.2 integration marker in " + rel + ": " + needle);
  }
}
if (errors.length) {
  errors.forEach(e => console.error("FAIL " + e));
  console.error(errors.length + " CACF validation problem(s)");
  process.exitCode = 1;
} else {
  console.log("PASS PADF V0.2 CACF structural validation (" + required.length + " framework files and local links)");
}
