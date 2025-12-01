const { encode, decode } = require('../dist/index');
const comprehensiveDatasets = require('./comprehensive-datasets');

console.log('╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║        COMPREHENSIVE DATASETS ROUNDTRIP VERIFICATION                       ║');
console.log('╚════════════════════════════════════════════════════════════════════════════╝\\n');

const datasetNames = Object.keys(comprehensiveDatasets);
let passed = 0;
let failed = 0;
const failures = [];

/**
 * Normalizes JSON for comparison.
 * 
 * @param {Object} obj - Object to normalize
 * @returns {string} Normalized JSON string
 */
const normalizeJSON = (obj) => JSON.stringify(obj, Object.keys(obj).sort());

for (const datasetName of datasetNames) {
  const original = comprehensiveDatasets[datasetName];
  
  try {
    const encoded = encode(original);
    const decoded = decode(encoded);
    
    const isEqual = normalizeJSON(original) === normalizeJSON(decoded);
    
    if (isEqual) {
      console.log(`✅ ${datasetName}: Roundtrip successful`);
      passed++;
    } else {
      console.log(`❌ ${datasetName}: Data mismatch detected`);
      failed++;
      failures.push({
        dataset: datasetName,
        original: original,
        decoded: decoded,
        encoded: encoded
      });
    }
  } catch (error) {
    console.log(`❌ ${datasetName}: Error - ${error.message}`);
    failed++;
    failures.push({
      dataset: datasetName,
      error: error.message,
      stack: error.stack
    });
  }
}

console.log(`\\n${'='.repeat(80)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.log('\\n⚠️  FAILURES DETECTED:\\n');
  failures.forEach((failure, index) => {
    console.log(`${index + 1}. ${failure.dataset}`);
    if (failure.error) {
      console.log(`   Error: ${failure.error}`);
    } else {
      console.log(`   Comparing first level keys:`);
      const origKeys = Object.keys(failure.original).sort();
      const decodedKeys = Object.keys(failure.decoded).sort();
      console.log(`   Original keys: ${origKeys.join(', ')}`);
      console.log(`   Decoded keys:  ${decodedKeys.join(', ')}`);
      
      const missingKeys = origKeys.filter(k => !decodedKeys.includes(k));
      const extraKeys = decodedKeys.filter(k => !origKeys.includes(k));
      
      if (missingKeys.length > 0) {
        console.log(`   Missing keys: ${missingKeys.join(', ')}`);
      }
      if (extraKeys.length > 0) {
        console.log(`   Extra keys: ${extraKeys.join(', ')}`);
      }
      
      console.log(`   Encoded (first 200 chars):`);
      console.log(`   ${failure.encoded.substring(0, 200)}...`);
    }
    console.log('');
  });
  
  process.exit(1);
} else {
  console.log('\\n✨ All datasets pass roundtrip verification!\\n');
  process.exit(0);
}
