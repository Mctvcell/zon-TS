import { encodeAdaptive } from './src/core/adaptive';
import { decode } from './src/core/decoder';

const data = {
  script_injection: [
    "'; DROP TABLE users; --"
  ],
  unicode: [
    'Emoji: 🚀'
  ]
};

console.log('--- Original ---');
console.log(JSON.stringify(data, null, 2));

const modes = ['default', 'auto', 'compact', 'readable', 'llm-optimized'];

for (const mode of modes) {
  console.log(`\n--- Mode: ${mode} ---`);
  const options = { mode: mode as any };
  const encoded = typeof encodeAdaptive(data, options) === 'string' 
    ? encodeAdaptive(data, options) as string 
    : (encodeAdaptive(data, options) as any).output;
  
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
