import { encodeAdaptive } from './src/core/adaptive';
import { decode } from './src/core/decoder';

const nested = {
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
      deprecated: ['v1', 'v2']
    }
  }
};

console.log('=== Testing Nested Without Braces ===');
const encoded = encodeAdaptive(nested, { mode: 'readable' }) as string;
console.log('Encoded:');
console.log(encoded);
console.log('\nDecoded:');
const decoded = decode(encoded);
console.log(JSON.stringify(decoded, null, 2));
console.log('\nMatch:', JSON.stringify(nested) === JSON.stringify(decoded) ? '✓' : '✗');
