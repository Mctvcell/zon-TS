import { encodeAdaptive } from './src/core/adaptive';
import { decode } from './src/core/decoder';

const test1 = {
  json_injection: [
    '{"key": "value"}',
    '[1, 2, 3]'
  ]
};

console.log('=== Test 1: Simple dash list ===');
const encoded1 = encodeAdaptive(test1, { mode: 'readable' }) as string;
console.log('Encoded:');
console.log(encoded1);
console.log('\nDecoded:');
const decoded1 = decode(encoded1);
console.log(JSON.stringify(decoded1, null, 2));
console.log('\nMatch:', JSON.stringify(test1) === JSON.stringify(decoded1) ? '✓' : '✗');
