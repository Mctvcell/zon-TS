// Generate full TOON encoding for deep recursion example
import * as fs from 'fs';

// Read the source JSON
const source = JSON.parse(fs.readFileSync('examples/modes/13_deep_recursion_source.json', 'utf-8'));

// Generate TOON format manually following TOON spec
// TOON rules:
// - 2 space indentation (strict)
// - key: value format
// - No braces, pure indentation
// - Nested objects: key: followed by indented fields

function generateTOON(obj: any, depth: number = 0): string {
  const indent = '  '.repeat(depth);
  let result = '';
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Nested object - key: on its own line
      result += `${indent}${key}:\n`;
      result += generateTOON(value, depth + 1);
    } else if (typeof value === 'string') {
      // String value
      result += `${indent}${key}: ${value}\n`;
    } else if (typeof value === 'number') {
      // Number value
      result += `${indent}${key}: ${value}\n`;
    } else if (typeof value === 'boolean') {
      // Boolean value
      result += `${indent}${key}: ${value}\n`;
    }
  }
  
  return result;
}

const toonOutput = generateTOON(source).trimEnd();

// Save to file
fs.writeFileSync('examples/modes/13_deep_recursion_toon.toon', toonOutput);

console.log('✅ Generated TOON format');
console.log(`📄 File: examples/modes/13_deep_recursion_toon.toon`);
console.log(`📊 Size: ${toonOutput.length} bytes`);
console.log(`📏 Lines: ${toonOutput.split('\n').length}`);

// Show first 20 lines
console.log('\n=== First 20 lines ===');
console.log(toonOutput.split('\n').slice(0, 20).join('\n'));

// Show last 20 lines
console.log('\n=== Last 20 lines ===');
const lines = toonOutput.split('\n');
console.log(lines.slice(-20).join('\n'));

// Show the deepest indentation
const maxIndent = Math.max(...toonOutput.split('\n').map(line => line.search(/\S/)));
console.log(`\n📐 Maximum indentation: ${maxIndent} spaces (${maxIndent / 2} levels)`);

// Find the longest line
const longestLine = toonOutput.split('\n').reduce((a, b) => a.length > b.length ? a : b);
console.log(`📏 Longest line: ${longestLine.length} characters`);
console.log(`   Content: "${longestLine}"`);
