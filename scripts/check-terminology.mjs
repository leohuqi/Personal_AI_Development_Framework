#!/usr/bin/env node
import fs from 'node:fs';
import {compareProtectedText, terminologyHints} from '../lib/terminology.mjs';
// Explicit files only; never enumerate directories or rewrite inputs.
const args = process.argv.slice(2);
if (args.length < 2 || args[0].startsWith('--')) throw new Error('Usage: node scripts/check-terminology.mjs Domain[,Domain] file.md [file.md ...] OR Domain --compare before.md after.md');
const domains = args.shift().split(',');
const glossary = JSON.parse(fs.readFileSync(new URL('../standards/terminology/GLOSSARY.yaml', import.meta.url), 'utf8'));
if (args[0] === '--compare') {
  if (args.length !== 3) throw new Error('--compare requires exactly two explicit files');
  const before = fs.readFileSync(args[1], 'utf8'), after = fs.readFileSync(args[2], 'utf8');
  const result = {...compareProtectedText(before, after), ...{review: terminologyHints(after, glossary, domains)}};
  console.log(JSON.stringify(result, null, 2));
  if (result.protection_status === 'CHANGED') process.exitCode = 1;
} else {
  if (args.some(arg => arg.startsWith('--'))) throw new Error('Unsupported option');
  for (const file of args) console.log(JSON.stringify({file, ...terminologyHints(fs.readFileSync(file, 'utf8'), glossary, domains)}, null, 2));
}
