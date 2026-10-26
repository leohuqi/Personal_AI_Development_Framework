#!/usr/bin/env node
/**
 * PADF V0.2 CACF + V0.3 specialized agent structural validator. No external dependencies.
 * Verifies required framework artifacts, local Markdown links, required
 * schema markers, and role integration. Does not run agent runtime/CI/Linear.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "contracts/progress-reconciliation.md",
  "lib/progress-reconciliation.mjs",
  "tests/v0.3/progress-fixture.mjs",
  "tests/v0.3/run-progress-tests.mjs",
  "standards/architecture/README.md",
  "standards/architecture/sources.md",
  "standards/terminology/README.md",
  "standards/terminology/GLOSSARY.yaml",
  "standards/terminology/GLOSSARY.md",
  "standards/terminology/SOURCES.md",
  "standards/terminology/BEFORE-AFTER.md",
  ".agents/skills/terminology-governance/SKILL.md",
  "lib/architecture-profile.mjs",
  "lib/terminology.mjs",
  "scripts/recommend-architecture.mjs",
  "scripts/check-terminology.mjs",
  "scripts/build-glossary.mjs",
  "tests/vnext/run-profile-tests.mjs",
  "tests/vnext/run-terminology-tests.mjs",
  "templates/architecture-overview.md",
  "templates/architecture-view.md",
  "templates/module-design.md",
  "templates/adr.md",
  "examples/architecture-method/README.md",
  "examples/architecture-method/model.json",
  "docs/upgrades/architecture-terminology-vnext/README.md",
  "integrations/impeccable.md",
  "workflow/small-team-collaboration.md",
  "tests/v0.3/run-concept-mockup-tests.mjs",
  "tests/v0.3/ui-fixture.mjs",
  "tests/v0.3/run-review-integrity-tests.mjs",
  ".agents/skills/product-analyst/SKILL.md",
  "contracts/product-definition.md",
  "contracts/role-deliverables.md",
  "workflow/role-work-method.md",
  "workflow/agent-protocol.md",
  "templates/feature-spec.md",
  "templates/product-spec.md",
  "templates/feature-catalog.md",
  "templates/implementation-plan.md",
  "templates/qa-test-cases.md",
  "templates/qa-test-results.md",
  "tests/v0.3/run-feedback-tests.mjs",
  "templates/stage-delivery.md",
  "templates/agent-message.yaml",
  "templates/agent-message-input.json",
  "scripts/create-agent-message.mjs",
  "tests/v0.3/run-product-tests.mjs",
  "contracts/action-preflight.md",
  "workflow/action-preflight.md",
  "docs/governance/G-01-design.md",
  "docs/governance/PQA-PR7-process-exception.md",
  "templates/action-preflight.md",
  "lib/action-preflight.mjs",
  "tests/v0.3/run-preflight-tests.mjs",
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
  "workflow/design-collaboration.md",
  "workflow/master-orchestration-validation.md",
  "contracts/agent-dependency.md",
  "contracts/architecture-design.md",
  "contracts/solution-architecture.md",
  "contracts/module-design.md",
  "contracts/agent-dispatch.md",
  "contracts/skill-delivery-evaluation.md",
  "contracts/ui-design.md",
  "contracts/project-ui-profile.md",
  "contracts/design-gate.md",
  "integrations/diagram-design.md",
  "integrations/diagram-design.lock.json",
  ".agents/skills/solution-architect/SKILL.md",
  ".agents/skills/module-architect/SKILL.md",
  ".agents/skills/ui-ux-designer/SKILL.md",
  "lib/design-gate.mjs",
  "lib/orchestration-evidence.mjs",
  "lib/skill-delivery-quality.mjs",
  "templates/agent-dispatch.md",
  "tests/v0.3/run-orchestration-tests.mjs",
  "tests/v0.3/run-skill-quality-tests.mjs",
  "tests/v0.3/run-tests.mjs",
];

const schemaChecks = new Map([
  ["contracts/progress-reconciliation.md", "padf.progress-sync-receipt/v1"],
  ["contracts/product-definition.md", "padf.product-definition/v1"],
  ["templates/agent-message.yaml", "padf.agent-message/v1"],
  ["contracts/action-preflight.md", "padf.action-preflight/v1"],
  ["contracts/shared-task-context.md", "padf.shared-task-context/v1"],
  ["contracts/agent-message.md", "padf.agent-message/v1"],
  ["contracts/context-checkpoint.md", "padf.context-checkpoint/v1"],
  ["contracts/agent-handoff.md", "padf.agent-handoff/v1"],
  ["contracts/agent-dependency.md", "padf.agent-dependency/v1"],
  ["contracts/design-gate.md", "padf.design-gate/v1"],
  ["contracts/architecture-design.md", "padf.architecture-design/v1"],
  ["contracts/solution-architecture.md", "padf.solution-architecture/v1"],
  ["contracts/module-design.md", "padf.module-design/v1"],
  ["contracts/agent-dispatch.md", "padf.agent-dispatch/v1"],
  ["contracts/skill-delivery-evaluation.md", "padf.skill-delivery-evaluation/v1"],
  ["contracts/ui-design.md", "padf.ui-design/v1"],
  ["contracts/project-ui-profile.md", "padf.ui-profile/v1"],
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
  // Source-code string templates are not Markdown documents; generated output is checked separately.
  if (!rel.endsWith('.md')) continue;
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
  ["README.md", "solution-architect"],
  ["README.md", "module-architect"],
  ["README.md", "master-orchestration-validation"],
  [".agents/skills/master-orchestrator/SKILL.md", "DISPATCH"],
  ["workflow/master-orchestration-validation.md", "HUMAN_RELAY"],
  ["workflow/agent-routing.md", "architecture_scope"],
  ["contracts/task-contract.md", "system_baseline_ref"],
  [".agents/skills/module-architect/SKILL.md", "system_baseline_ref"],
  ["workflow/design-collaboration.md", "Independent Reviewer"],
  [".agents/skills/master-orchestrator/SKILL.md", "Design Gate"],
  [".agents/skills/ui-ux-designer/SKILL.md", "UI Design Profile"],
  [".agents/skills/solution-architect/SKILL.md", "diagram-design"],
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
// Skills share one protocol source; every installed core role must resolve it.
for (const entry of fs.readdirSync(path.join(root, ".agents/skills"), {withFileTypes: true})) {
  if (!entry.isDirectory()) continue;
  const rel = ".agents/skills/" + entry.name + "/SKILL.md";
  const source = fs.readFileSync(path.join(root, rel), "utf8");
  for (const target of ["../../../workflow/role-work-method.md", "../../../workflow/agent-protocol.md"])
    if (!source.includes(target)) errors.push("Missing shared workflow reference in " + rel);
}
if (errors.length) {
  errors.forEach(e => console.error("FAIL " + e));
  console.error(errors.length + " CACF validation problem(s)");
  process.exitCode = 1;
} else {
  console.log("PASS PADF CACF V0.2 + V0.3 design structural validation (" + required.length + " framework files and local links)");
}
