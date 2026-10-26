#!/usr/bin/env node
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {renderGlossary} from '../lib/terminology.mjs';
const source = new URL('../standards/terminology/GLOSSARY.yaml', import.meta.url);
const output = new URL('../standards/terminology/GLOSSARY.md', import.meta.url);
const generated = renderGlossary(JSON.parse(fs.readFileSync(source, 'utf8')));
if (process.argv.slice(2).some(arg => arg !== '--check')) throw new Error('Usage: node scripts/build-glossary.mjs [--check]');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== generated) {
    console.error('Generated glossary differs; run node scripts/build-glossary.mjs'); process.exitCode = 1;
  } else console.log('PASS generated glossary matches its single source');
} else { fs.writeFileSync(output, generated); console.log(`Generated ${fileURLToPath(output)}`); }
