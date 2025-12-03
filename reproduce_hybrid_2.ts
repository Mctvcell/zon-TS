import { encodeAdaptive } from './src/core/adaptive';
import { decode } from './src/core/decoder';
// Force recompile

const nastyStrings = {
  control_chars: [
    'Null: \x00',
    'Backspace: \b'
  ],
  json_injection: [
    '{"key": "value"}',
    '[1, 2, 3]'
  ],
  script_injection: [
    "'; DROP TABLE users; --"
  ]
};

const modes = ['readable'];

for (const mode of modes) {
  console.log(`\n--- Mode: ${mode} ---`);
  const options = { mode: mode as any };
  
  console.log('\n=== Nasty Strings ===');
  const encodedNasty = typeof encodeAdaptive(nastyStrings, options) === 'string' 
    ? encodeAdaptive(nastyStrings, options) as string 
    : (encodeAdaptive(nastyStrings, options) as any).output;

  console.log('Encoded:');
  console.log(encodedNasty);

  try {
    const decodedNasty = decode(encodedNasty);
    console.log('Decoded:');
    console.log(JSON.stringify(decodedNasty, null, 2));
  } catch (e) {
    console.error('Decode Error:', e);
  }
}
