const { encode: encodeZon } = require('../dist/index');
const { encode: encodeTOON } = require('@toon-format/toon');
const { encode: encodeTokens } = require('gpt-tokenizer');
const { encodeToCSV } = require('./csv-encoder');
const { unifiedDataset } = require('./datasets');

/**
 * Counts tokens for data in specified format.
 * 
 * @param {any} data - Data to encode
 * @param {string} format - Format name (ZON, TOON, JSON, CSV)
 * @returns {number|string} Token count or 'N/A'
 */
function countTokens(data, format) {
  let encoded;
  if (format === 'ZON') encoded = encodeZon(data);
  else if (format === 'TOON') encoded = encodeTOON(data);
  else if (format === 'JSON') encoded = JSON.stringify(data, null, 2);
  else if (format === 'JSON (Minified)') encoded = JSON.stringify(data);
  else if (format === 'CSV') encoded = encodeToCSV(data);
  
  if (!encoded) return 'N/A';
  return encodeTokens(encoded).length;
}

console.log('--- Token Counts for Unified Dataset ---');
console.log('ZON:', countTokens(unifiedDataset, 'ZON'));
console.log('TOON:', countTokens(unifiedDataset, 'TOON'));
console.log('JSON:', countTokens(unifiedDataset, 'JSON'));
console.log('JSON (Minified):', countTokens(unifiedDataset, 'JSON (Minified)'));
console.log('CSV:', countTokens(unifiedDataset, 'CSV'));
