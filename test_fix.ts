import { encodeAdaptive } from './src/core/adaptive';
import { decode } from './src/core/decoder';

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

const irregular = {
  config: {
    database: {
      primary: {
        host: 'db-01',
        port: 5432,
        ssl: true
      },
      replica: {
        host: 'db-02',
        port: 5432,
        ssl: true
      }
    },
    features: {
      beta: true,
      deprecated: [
        'v1',
        'v2'
      ]
    }
  }
};

console.log('=== Testing Nasty Strings ===');
const encodedNasty = encodeAdaptive(nastyStrings, { mode: 'readable' }) as string;
console.log('Encoded:\n' + encodedNasty);
const decodedNasty = decode(encodedNasty);
console.log('\nDecoded:');
console.log(JSON.stringify(decodedNasty, null, 2));
console.log('\nMatch:', JSON.stringify(nastyStrings) === JSON.stringify(decodedNasty) ? '✓' : '✗');

console.log('\n=== Testing Irregular ===');
const encodedIrregular = encodeAdaptive(irregular, { mode: 'readable' }) as string;
console.log('Encoded:\n' + encodedIrregular);
const decodedIrregular = decode(encodedIrregular);
console.log('\nDecoded:');
console.log(JSON.stringify(decodedIrregular, null, 2));
console.log('\nMatch:', JSON.stringify(irregular) === JSON.stringify(decodedIrregular) ? '✓' : '✗');
