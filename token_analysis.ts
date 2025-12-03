// Precise token count comparison for different formats
import * as fs from 'fs';

// Rough tokenizer (4 chars ≈ 1 token for estimation)
// For more accurate counts, we'd use tiktoken or similar
function estimateTokens(text: string): number {
  // Simple estimation: ~4 chars per token
  return Math.round(text.length / 4);
}

function countChars(text: string, char: string): number {
  return (text.match(new RegExp(`\\${char}`, 'g')) || []).length;
}

// Read the hiking example (simpler, more realistic)
const hiking = JSON.parse(fs.readFileSync('examples/modes/14_hiking_example_source.json', 'utf-8'));

console.log('=== Token Analysis: Hiking Example ===\n');

// JSON
const jsonStr = JSON.stringify(hiking);
const jsonTokens = estimateTokens(jsonStr);
const jsonBraces = countChars(jsonStr, '{') + countChars(jsonStr, '}');
const jsonQuotes = countChars(jsonStr, '"');
const jsonCommas = countChars(jsonStr, ',');

console.log('JSON:');
console.log(`  Size: ${jsonStr.length} chars`);
console.log(`  Tokens: ~${jsonTokens}`);
console.log(`  Braces: ${jsonBraces}`);
console.log(`  Quotes: ${jsonQuotes}`);
console.log(`  Commas: ${jsonCommas}`);

// ZON Readable (with braces)
const zonStr = fs.readFileSync('examples/modes/14_hiking_example_readable.zonf', 'utf-8');
const zonTokens = estimateTokens(zonStr);
const zonBraces = countChars(zonStr, '{') + countChars(zonStr, '}');
const zonColons = countChars(zonStr, ':');

console.log('\nZON (with braces):');
console.log(`  Size: ${zonStr.length} chars`);
console.log(`  Tokens: ~${zonTokens}`);
console.log(`  Braces: ${zonBraces}`);
console.log(`  Colons: ${zonColons}`);
console.log(`  Quotes: 0 (on keys)`);
console.log(`  Commas: 0`);

// TOON
const toonStr = fs.readFileSync('examples/modes/13_deep_recursion_toon.toon', 'utf-8').split('\n').slice(0, 11).join('\n');
const toonTokens = estimateTokens(toonStr);
const toonSpaces = (toonStr.match(/  /g) || []).length * 2; // Count indent spaces

console.log('\nTOON (first 11 lines):');
console.log(`  Size: ${toonStr.length} chars`);
console.log(`  Tokens: ~${toonTokens}`);
console.log(`  Braces: 0`);
console.log(`  Indent spaces: ${toonSpaces}`);

// Calculate savings
const jsonVsZon = ((jsonTokens - zonTokens) / jsonTokens * 100).toFixed(1);
const zonBraceCost = zonBraces;

console.log('\n=== Analysis ===');
console.log(`\nZON saves ${jsonVsZon}% tokens vs JSON`);
console.log(`\nBrace "cost" in ZON: ${zonBraceCost} characters (${Math.round(zonBraceCost / 4)} tokens)`);
console.log(`But ZON saves:`);
console.log(`  - ${jsonQuotes} quotes (${Math.round(jsonQuotes / 4)} tokens)`);
console.log(`  - ${jsonCommas} commas (${Math.round(jsonCommas / 4)} tokens)`);
console.log(`\nNet savings: ~${Math.round((jsonQuotes + jsonCommas - zonBraces) / 4)} tokens vs JSON`);

console.log('\n=== Recommendation ===');
console.log('For LLM token optimization:');
console.log('1. Use ZON compact/llm-optimized modes (no braces, tabular format)');
console.log('2. Readable mode is for HUMANS, not LLMs');
console.log('3. Braces in readable mode prioritize clarity over tokens');
