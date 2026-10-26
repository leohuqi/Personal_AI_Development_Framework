#!/usr/bin/env node
import fs from 'node:fs';
import {selectArchitectureProfile} from '../lib/architecture-profile.mjs';
if (process.argv.length !== 3) throw new Error('Usage: node scripts/recommend-architecture.mjs assessment.json');
const result = selectArchitectureProfile(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
console.log(JSON.stringify(result, null, 2));
if (!result.valid) process.exitCode = 1;
