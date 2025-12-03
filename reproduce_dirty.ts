import { encodeAdaptive } from './src/core/adaptive';
import { decode } from './src/core/decoder';

const dirtyData = {
  primitives: {
    strings: [
      "special: !@#$%^&*()_+{}[]|\\\\:;\"'<>,.?/~`"
    ]
  }
};

const unifiedSubset = {
  logs: [
    {
      id: 101,
      timestamp: "2025-02-01T10:00:00Z"
    }
  ]
};

console.log('--- Dirty Data Original ---');
console.log(JSON.stringify(dirtyData, null, 2));

console.log('\n--- Unified Subset Original ---');
console.log(JSON.stringify(unifiedSubset, null, 2));

const modes = ['default', 'auto', 'compact', 'readable', 'llm-optimized'];

console.log('\n=== Testing Dirty Data ===');
for (const mode of modes) {
  console.log(`\n--- Mode: ${mode} ---`);
  const options = { mode: mode as any };
  const encoded = typeof encodeAdaptive(dirtyData, options) === 'string' 
    ? encodeAdaptive(dirtyData, options) as string 
    : (encodeAdaptive(dirtyData, options) as any).output;
  
  console.log('Encoded:');
  console.log(encoded);
  
  try {
    const decoded = decode(encoded);
    console.log('Decoded:');
    console.log(JSON.stringify(decoded, null, 2));
  } catch (e) {
    console.error('Decode Error:', e);
  }
}

console.log('\n=== Testing Unified Subset ===');
for (const mode of modes) {
  console.log(`\n--- Mode: ${mode} ---`);
  const options = { mode: mode as any };
  const encoded = typeof encodeAdaptive(unifiedSubset, options) === 'string' 
    ? encodeAdaptive(unifiedSubset, options) as string 
    : (encodeAdaptive(unifiedSubset, options) as any).output;
  
  console.log('Encoded:');
  console.log(encoded);
  
  try {
    const decoded = decode(encoded);
    console.log('Decoded:');
    console.log(JSON.stringify(decoded, null, 2));
  } catch (e) {
    console.error('Decode Error:', e);
  }
}
