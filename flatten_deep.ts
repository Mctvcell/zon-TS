// Flatten deep recursion using path notation
import * as fs from 'fs';

const source = JSON.parse(fs.readFileSync('examples/modes/13_deep_recursion_source.json', 'utf-8'));

// Instead of deeply nested objects, use dotted paths
// level.49.next.level.48.next... etc.

// Flatten into a single-level object with dot notation
function flattenRecursive(obj: any, prefix: string = ''): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively flatten
      Object.assign(result, flattenRecursive(value, path));
    } else {
      result[path] = value;
    }
  }
  
  return result;
}

const flattened = flattenRecursive(source);

// Generate flattened ZON
let flatOutput = '';
for (const [key, value] of Object.entries(flattened)) {
  flatOutput += `${key}:${value}\n`;
}

console.log('=== Original (Nested) ===');
console.log(`Size: ${JSON.stringify(source).length} bytes`);
console.log(`Depth: 50 levels`);
console.log(`Structure: Deeply nested objects`);

console.log('\n=== Flattened (Paths) ===');
console.log(`Size: ${flatOutput.length} bytes`);
console.log(`Depth: 1 level (flat)`);
console.log(`Structure: Dot-notation paths`);

console.log('\n=== Sample Output ===');
console.log(flatOutput.split('\n').slice(0, 10).join('\n'));
console.log('...');
console.log(flatOutput.split('\n').slice(-5).join('\n'));

// Save to file
fs.writeFileSync('examples/modes/13_deep_recursion_flattened.zonf', flatOutput);

console.log('\n✅ Saved to: examples/modes/13_deep_recursion_flattened.zonf');

const savings = ((JSON.stringify(source).length - flatOutput.length) / JSON.stringify(source).length * 100).toFixed(1);
console.log(`📊 Savings: ${savings}% vs JSON`);
