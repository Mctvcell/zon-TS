import * as fs from 'fs';
import * as path from 'path';
import { encode } from '../src/index';
const { unifiedDataset } = require('../benchmarks/datasets');

const BENCHMARKS_DIR = path.join(process.cwd(), 'benchmarks');
const jsonPath = path.join(BENCHMARKS_DIR, 'unified_dataset.json');
const zonPath = path.join(BENCHMARKS_DIR, 'unified_dataset.zon');

const jsonContent = JSON.stringify(unifiedDataset, null, 2);
const zonContent = encode(unifiedDataset);

fs.writeFileSync(jsonPath, jsonContent);
fs.writeFileSync(zonPath, zonContent);

console.log(`✅ Saved benchmark dataset to:`);
console.log(`   ${jsonPath} (${jsonContent.length} bytes)`);
console.log(`   ${zonPath} (${zonContent.length} bytes)`);
