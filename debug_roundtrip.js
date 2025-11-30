const { encode, decode } = require('./dist/index');
const { unifiedDataset } = require('./benchmarks/datasets');
const assert = require('assert');

console.log('🔍 Debugging Roundtrip Mismatch...');

// 1. Encode Original
const encoded1 = encode(unifiedDataset);
console.log(`\n📄 Encoded (Length: ${encoded1.length})`);
// console.log(encoded1);

// 2. Decode
const decoded = decode(encoded1);

// 3. Re-encode
const encoded2 = encode(decoded);
console.log(`\n📄 Re-encoded (Length: ${encoded2.length})`);

// 4. Compare Strings
if (encoded1 === encoded2) {
  console.log('✅ Strings Match!');
} else {
  console.log('❌ Strings Do Not Match!');
  
  // Find first difference
  let diffIndex = -1;
  for (let i = 0; i < Math.max(encoded1.length, encoded2.length); i++) {
    if (encoded1[i] !== encoded2[i]) {
      diffIndex = i;
      break;
    }
  }
  
  if (diffIndex !== -1) {
    console.log(`\nFirst difference at index ${diffIndex}:`);
    const start = Math.max(0, diffIndex - 20);
    const end = Math.min(encoded1.length, diffIndex + 20);
    
    console.log('Original:', encoded1.substring(start, end).replace(/\n/g, '\\n'));
    console.log('Re-encod:', encoded2.substring(start, end).replace(/\n/g, '\\n'));
    console.log('          ' + ' '.repeat(diffIndex - start) + '^');
  }
}

// 5. Compare Objects (Deep Equality)
try {
  assert.deepStrictEqual(decoded, unifiedDataset);
  console.log('\n✅ Objects are Deeply Equal (Data Integrity is OK)');
} catch (e) {
  console.log('\n❌ Objects are NOT Deeply Equal (Data Loss/Corruption!)');
  console.log(e.message);
}
