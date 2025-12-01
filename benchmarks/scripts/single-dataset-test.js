require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { encode: encodeZon } = require('../../dist/index');
const { encode: encodeTOON } = require('@toon-format/toon');
const { unifiedDataset } = require('../datasets/datasets');
const { generateUnifiedQuestions } = require('../datasets/questions');
const { AzureAIClient } = require('../core/llm-client');
const { validateAnswer, extractAnswer } = require('../core/validators');

const OUTPUT_FILE = path.join(__dirname, '../results/single-dataset-results.json');
const CACHE_DIR = path.join(__dirname, '.cache');
const CONCURRENCY = 3;

console.log('🧹 Clearing cache...');
if (fs.existsSync(CACHE_DIR)) {
  fs.rmSync(CACHE_DIR, { recursive: true, force: true });
}
fs.mkdirSync(CACHE_DIR, { recursive: true });
console.log('✅ Cache cleared\\n');

/**
 * Encodes data into specified format.
 * 
 * @param {Object} data - Data to encode
 * @param {string} format - Format name
 * @returns {string|null} Encoded data or null
 */
function encodeData(data, format) {
  try {
    switch (format) {
      case 'ZON':
        return encodeZon(data);
      case 'TOON':
        return encodeTOON(data);
      case 'JSON':
        return JSON.stringify(data, null, 2);
      default:
        throw new Error(`Unknown format: ${format}`);
    }
  } catch (e) {
    console.error(`Encoding error for ${format}:`, e.message);
    return null;
  }
}

/**
 * Builds prompt for LLM.
 * 
 * @param {string} data - Encoded data
 * @param {string} format - Format name
 * @param {string} question - Question text
 * @returns {string} Formatted prompt
 */
function buildPrompt(data, format, question) {
  const header = `Data format: ${format}`;

  return `${header}
Data:
${data}

Question: ${question}

Provide ONLY the direct answer value. Do not include full sentences, explanations, or units unless requested.
Example: for "What is the salary?", answer "95000" not "The salary is 95000".
Answer:`;
}

/**
 * Runs single dataset test.
 * 
 * @returns {Promise<Object>} Test results
 */
async function runSingleDatasetTest() {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║           SINGLE DATASET LLM RETRIEVAL ACCURACY TEST                       ║');
  console.log('║                  Unified Dataset × 3 Formats × 24 Questions                ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\\n');
  
  const client = new AzureAIClient();
  const model = 'gpt-5-nano';
  
  const data = unifiedDataset;
  const questions = generateUnifiedQuestions().unifiedDataset;
  
  const formats = ['ZON', 'TOON', 'JSON'];
  
  const results = {
    timestamp: new Date().toISOString(),
    model: model,
    dataset: 'unifiedDataset',
    formats: {},
    summary: {}
  };
  
  console.log(`Dataset: Unified Dataset (5 users, config, logs, metadata)`);
  console.log(`Questions: ${questions.length} total\\n`);
  
  const encodedData = {};
  formats.forEach(format => {
    encodedData[format] = encodeData(data, format);
    if (encodedData[format]) {
      console.log(`${format} encoded: ${encodedData[format].length} bytes`);
    }
  });
  console.log('');
  
  for (const format of formats) {
    if (!encodedData[format]) {
      console.log(`⚠️  ${format}: Skipped (encoding failed)\\n`);
      continue;
    }
    
    console.log(`Testing ${format}:`);
    process.stdout.write('  Progress: ');
    
    let correctCount = 0;
    let totalTokens = 0;
    const failures = [];
    
    for (let i = 0; i < questions.length; i += CONCURRENCY) {
      const batch = questions.slice(i, i + CONCURRENCY);
      const promises = batch.map(async (q) => {
        const prompt = buildPrompt(encodedData[format], format, q.q);
        
        try {
          const result = await client.query(model, prompt, 1000);
          const extracted = extractAnswer(result.answer);
          const isCorrect = validateAnswer(extracted, q.a, q.type);
          
          return {
            isCorrect,
            tokens: result.tokensUsed,
            answer: result.answer,
            expected: q.a,
            question: q.q,
            extracted: extracted,
            type: q.type
          };
        } catch (e) {
          return { error: e.message, question: q.q };
        }
      });
      
      const batchResults = await Promise.all(promises);
      
      batchResults.forEach(res => {
        if (res.error) {
          process.stdout.write('E');
          failures.push({ question: res.question, error: res.error });
        } else {
          totalTokens += res.tokens;
          
          if (res.isCorrect) {
            correctCount++;
            process.stdout.write('.');
          } else {
            process.stdout.write('x');
            failures.push({
              question: res.question,
              expected: res.expected,
              actual: res.answer,
              extracted: res.extracted,
              type: res.type
            });
          }
        }
      });
    }
    
    const accuracy = ((correctCount / questions.length) * 100).toFixed(1);
    console.log(` ${correctCount}/${questions.length} (${accuracy}%)`);
    
    results.formats[format] = {
      correct: correctCount,
      total: questions.length,
      accuracy: parseFloat(accuracy),
      tokens: totalTokens,
      failures: failures
    };
    
    if (failures.length > 0) {
      console.log(`  Failures (${failures.length}):`);
      failures.slice(0, 5).forEach(f => {
        if (f.error) {
          console.log(`    [ERROR] ${f.question}: ${f.error}`);
        } else {
          console.log(`    [${f.type}] "${f.question}"`);
          console.log(`       Expected: "${f.expected}"`);
          console.log(`       Got:      "${f.actual}"`);
        }
      });
      if (failures.length > 5) {
        console.log(`    ... and ${failures.length - 5} more`);
      }
    }
    console.log('');
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                              RESULTS SUMMARY                               ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\\n');
  
  console.log('Accuracy by Format:');
  formats.forEach(format => {
    if (results.formats[format]) {
      const r = results.formats[format];
      const icon = r.accuracy >= 95 ? '✅' : r.accuracy >= 90 ? '⚠️' : '❌';
      console.log(`  ${icon} ${format.padEnd(6)}: ${r.accuracy.toFixed(1).padStart(5)}% (${r.correct}/${r.total}) | ${r.tokens} tokens`);
    }
  });
  
  console.log(`\\n💾 Detailed results: ${OUTPUT_FILE}`);
  console.log('\\n' + '='.repeat(80));
  console.log('✨ Test complete!\\n');
  
  return results;
}

if (require.main === module) {
  runSingleDatasetTest().catch(console.error);
}

module.exports = { runSingleDatasetTest };
