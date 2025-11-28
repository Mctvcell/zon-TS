
import * as fs from 'fs';
import * as path from 'path';
import { encode, decode } from '../src/index';
import * as assert from 'assert';

const EXAMPLES_DIR = path.join(process.cwd(), 'examples');

console.log(`Verifying roundtrip for examples in ${EXAMPLES_DIR}...\n`);

const files = fs.readdirSync(EXAMPLES_DIR).filter(f => f.endsWith('.json'));

let passed = 0;
let failed = 0;

files.forEach(file => {
  const jsonPath = path.join(EXAMPLES_DIR, file);
  const zonPath = jsonPath.replace('.json', '.zonf');
  
  const originalJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  // 1. Encode original JSON -> ZON
  const encodedZon = encode(originalJson);
  
  // 2. Decode ZON -> JSON
  const decodedJson = decode(encodedZon);
  
  // 3. Compare
  try {
    assert.deepStrictEqual(decodedJson, originalJson);
    console.log(`✅ ${file}: Roundtrip successful`);
    passed++;
  } catch (e) {
    console.error(`❌ ${file}: Roundtrip FAILED`);
    console.error('Original:', JSON.stringify(originalJson).substring(0, 100) + '...');
    console.error('Decoded :', JSON.stringify(decodedJson).substring(0, 100) + '...');
    failed++;
  }
});

console.log(`\nResults: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
