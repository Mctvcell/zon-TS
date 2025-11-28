/**
 * Benchmark: ZON vs TOON vs JSON
 * Compares token efficiency using GPT-5 o200k_base tokenizer
 */

const { encode: encodeZON } = require('../dist/index');
const { encode: encodeTOON } = require('@toon-format/toon');
const { encode: encodeTokens } = require('gpt-tokenizer');

const { unifiedDataset } = require('./datasets');
const { largeComplexNonuniformNestedNonuniform } = require('./comprehensive-datasets');

// Tokenizers
const tokenizers = {
  'GPT-4o (o200k)': {
    count: (text) => encodeTokens(text).length,
    color: 'cyan'
  },
  'Claude 3.5 (Anthropic)': {
    count: (text) => require('@anthropic-ai/tokenizer').countTokens(text),
    color: 'magenta'
  },
  'Llama 3 (Meta)': {
    count: (text) => require('llama-tokenizer-js').default.encode(text).length,
    color: 'yellow'
  }
};

// CSV Encoder
const { encodeToCSV } = require('./csv-encoder');

// XML Builder
const { XMLBuilder } = require('fast-xml-parser');
const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  format: true,
  indentBy: '  '
});

// YAML Dumper
const yaml = require('js-yaml');

// Helper to format numbers with commas
function formatNumber(num) {
  return num.toLocaleString();
}

// Helper to calculate percentage difference
function percentDiff(baseline, comparison) {
  const diff = ((comparison - baseline) / baseline) * 100;
  return diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
}

// Helper to create visual bar
function createBar(percentage, width = 20) {
  const filled = Math.round((percentage / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

// Run benchmark for a single dataset
function benchmarkDataset(name, data, description) {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`📊 ${name}`);
  if (description) {
    console.log(`   ${description}`);
  }
  console.log('─'.repeat(80));

  // Encode in different formats
  const jsonFormatted = JSON.stringify(data, null, 2);
  const jsonCompact = JSON.stringify(data);
  const zonEncoded = encodeZON(data);
  const toonEncoded = encodeTOON(data);
  const csvEncoded = encodeToCSV(data);
  
  // XML Encoding (wrap in root element if array)
  let xmlEncoded = '';
  try {
    const xmlData = Array.isArray(data) ? { root: { item: data } } : { root: data };
    xmlEncoded = xmlBuilder.build(xmlData);
  } catch (e) {
    xmlEncoded = '<error>XML Encoding Failed</error>';
  }

  // YAML Encoding
  const yamlEncoded = yaml.dump(data);

  // Calculate byte sizes
  const jsonFormattedBytes = Buffer.byteLength(jsonFormatted, 'utf8');
  const jsonCompactBytes = Buffer.byteLength(jsonCompact, 'utf8');
  const zonBytes = Buffer.byteLength(zonEncoded, 'utf8');
  const toonBytes = Buffer.byteLength(toonEncoded, 'utf8');
  const csvBytes = Buffer.byteLength(csvEncoded, 'utf8');
  const xmlBytes = Buffer.byteLength(xmlEncoded, 'utf8');
  const yamlBytes = Buffer.byteLength(yamlEncoded, 'utf8');

  console.log('📦 BYTE SIZES:');
  console.log(`  ZON:              ${formatNumber(zonBytes)} bytes`);
  console.log(`  TOON:             ${formatNumber(toonBytes)} bytes`);
  console.log(`  CSV:              ${formatNumber(csvBytes)} bytes`);
  console.log(`  YAML:             ${formatNumber(yamlBytes)} bytes`);
  console.log(`  XML:              ${formatNumber(xmlBytes)} bytes`);
  console.log(`  JSON (formatted): ${formatNumber(jsonFormattedBytes)} bytes`);
  console.log(`  JSON (compact):   ${formatNumber(jsonCompactBytes)} bytes`);

  const results = {};

  // Iterate over tokenizers
  for (const [tokenizerName, tokenizer] of Object.entries(tokenizers)) {
    console.log(`\n🔹 Tokenizer: ${tokenizerName}`);
    
    const jsonFormattedTokens = tokenizer.count(jsonFormatted);
    const jsonCompactTokens = tokenizer.count(jsonCompact);
    const zonTokens = tokenizer.count(zonEncoded);
    const toonTokens = tokenizer.count(toonEncoded);
    const csvTokens = tokenizer.count(csvEncoded);
    const xmlTokens = tokenizer.count(xmlEncoded);
    const yamlTokens = tokenizer.count(yamlEncoded);

    const tokenCounts = { 
      ZON: zonTokens, 
      TOON: toonTokens, 
      CSV: csvTokens, 
      YAML: yamlTokens,
      XML: xmlTokens,
      JSON: jsonFormattedTokens, 
      'JSON (compact)': jsonCompactTokens 
    };
    
    const winner = Object.keys(tokenCounts).reduce((a, b) => tokenCounts[a] <= tokenCounts[b] ? a : b);
    const maxTokens = Math.max(...Object.values(tokenCounts));

    // ZON
    const zonBar = createBar((zonTokens / maxTokens) * 100);
    console.log(`  ZON          ${zonBar} ${formatNumber(zonTokens)} tokens ${winner === 'ZON' ? '👑' : ''}`);
    console.log(`               ├─ vs JSON formatted:  ${percentDiff(jsonFormattedTokens, zonTokens)}`);
    console.log(`               ├─ vs JSON compact:    ${percentDiff(jsonCompactTokens, zonTokens)}`);
    console.log(`               ├─ vs TOON:            ${percentDiff(toonTokens, zonTokens)}`);
    console.log(`               ├─ vs CSV:             ${percentDiff(csvTokens, zonTokens)}`);
    console.log(`               ├─ vs YAML:            ${percentDiff(yamlTokens, zonTokens)}`);
    console.log(`               └─ vs XML:             ${percentDiff(xmlTokens, zonTokens)}`);
    console.log('');

    // TOON
    const toonBar = createBar((toonTokens / maxTokens) * 100);
    console.log(`  TOON         ${toonBar} ${formatNumber(toonTokens)} tokens ${winner === 'TOON' ? '👑' : ''}`);
    console.log(`               vs ZON: ${percentDiff(zonTokens, toonTokens)}`);
    console.log('');

    // CSV
    const csvBar = createBar((csvTokens / maxTokens) * 100);
    console.log(`  CSV          ${csvBar} ${formatNumber(csvTokens)} tokens ${winner === 'CSV' ? '👑' : ''}`);
    console.log(`               vs ZON: ${percentDiff(zonTokens, csvTokens)}`);
    console.log('');

    // YAML
    const yamlBar = createBar((yamlTokens / maxTokens) * 100);
    console.log(`  YAML         ${yamlBar} ${formatNumber(yamlTokens)} tokens ${winner === 'YAML' ? '👑' : ''}`);
    console.log(`               vs ZON: ${percentDiff(zonTokens, yamlTokens)}`);
    console.log('');

    // XML
    const xmlBar = createBar((xmlTokens / maxTokens) * 100);
    console.log(`  XML          ${xmlBar} ${formatNumber(xmlTokens)} tokens ${winner === 'XML' ? '👑' : ''}`);
    console.log(`               vs ZON: ${percentDiff(zonTokens, xmlTokens)}`);
    console.log('');

    // JSON
    const jsonCompactBar = createBar((jsonCompactTokens / maxTokens) * 100);
    console.log(`  JSON (cmp)   ${jsonCompactBar} ${formatNumber(jsonCompactTokens)} tokens ${winner === 'JSON (compact)' ? '👑' : ''}`);
    console.log('');

    results[tokenizerName] = {
      winner,
      tokens: tokenCounts
    };
  }

  return {
    name,
    results,
    bytes: { 
      ZON: zonBytes, 
      TOON: toonBytes, 
      CSV: csvBytes, 
      YAML: yamlBytes, 
      XML: xmlBytes, 
      JSON: jsonFormattedBytes, 
      JSONCompact: jsonCompactBytes 
    }
  };
}

// Main benchmark runner
console.log('╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║                 ZON vs TOON vs CSV vs JSON BENCHMARK                       ║');
console.log('║                   Token Efficiency Comparison                              ║');
console.log('║                   Using GPT-5 o200k_base,Claude 3.5 (Anthropic),           ║');
console.log('║                   Llama 3 (Meta) tokenizer                                 ║');
console.log('╚════════════════════════════════════════════════════════════════════════════╝');

const results = [];

// Run benchmark for unified dataset
results.push(benchmarkDataset(
  'Unified Dataset',
  unifiedDataset,
  'Combined dataset with tabular, nested, and time-series data'
));

// Run benchmark for large complex dataset
results.push(benchmarkDataset(
  'Large Complex Nested Dataset',
  largeComplexNonuniformNestedNonuniform,
  'Deeply nested, non-uniform structure with mixed types'
));

// Summary
console.log(`\n${'═'.repeat(80)}`);
console.log('📈 OVERALL SUMMARY');
console.log('═'.repeat(80));

const tokenizerNames = Object.keys(results[0].results);

tokenizerNames.forEach(tokenizerName => {
  console.log(`\n🔹 ${tokenizerName} Summary:`);
  
  const totalZON = results.reduce((sum, r) => sum + r.results[tokenizerName].tokens.ZON, 0);
  const totalTOON = results.reduce((sum, r) => sum + r.results[tokenizerName].tokens.TOON, 0);
  const totalCSV = results.reduce((sum, r) => sum + r.results[tokenizerName].tokens.CSV, 0);
  const totalYAML = results.reduce((sum, r) => sum + r.results[tokenizerName].tokens.YAML, 0);
  const totalXML = results.reduce((sum, r) => sum + r.results[tokenizerName].tokens.XML, 0);
  const totalJSON = results.reduce((sum, r) => sum + r.results[tokenizerName].tokens.JSON, 0);
  const totalJSONCompact = results.reduce((sum, r) => sum + r.results[tokenizerName].tokens['JSON (compact)'], 0);
  
  const zonWins = results.filter(r => r.results[tokenizerName].winner === 'ZON').length;
  
  console.log(`  ZON Wins: ${zonWins}/${results.length} datasets`);
  
  const maxTotal = Math.max(totalZON, totalTOON, totalCSV, totalYAML, totalXML, totalJSON, totalJSONCompact);
  const zonTotalBar = createBar((totalZON / maxTotal) * 100, 30);
  
  console.log(`  Total Tokens:`);
  console.log(`  ZON: ${zonTotalBar} ${formatNumber(totalZON)} tokens`);
  console.log(`       vs JSON (cmp): ${percentDiff(totalJSONCompact, totalZON)}`);
  console.log(`       vs TOON:       ${percentDiff(totalTOON, totalZON)}`);
  console.log(`       vs CSV:        ${percentDiff(totalCSV, totalZON)}`);
  console.log(`       vs YAML:       ${percentDiff(totalYAML, totalZON)}`);
  console.log(`       vs XML:        ${percentDiff(totalXML, totalZON)}`);
});

console.log('\n' + '═'.repeat(80));
console.log('✨ Benchmark complete!');
console.log('═'.repeat(80) + '\n');
