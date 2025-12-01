require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { encode: encodeZon } = require('../dist/index');
const { encode: encodeTOON } = require('@toon-format/toon');
const comprehensiveDatasets = require('./comprehensive-datasets');
const { generatePilotQuestions } = require('./pilot-questions');
const { AzureAIClient } = require('./llm-client');
const { validateAnswer, extractAnswer } = require('./validators');

const OUTPUT_FILE = path.join(__dirname, 'pilot-accuracy-results.json');
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
 * Runs pilot benchmark.
 * 
 * @returns {Promise<Object>} Benchmark results
 */
async function runPilotBenchmark() {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║              PILOT LLM RETRIEVAL ACCURACY BENCHMARK                        ║');
  console.log('║                  3 Datasets × 3 Formats × 10 Questions                     ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\\n');
  
  const client = new AzureAIClient();
  const model = 'gpt-5-nano';
  
  const datasetNames = [
    'smallSimpleUniformFlat',
    'mediumComplexNonUniformFlat',
    'largeComplexNonuniformNestedNonuniform'
  ];
  const allQuestions = generatePilotQuestions();
  
  const formats = ['ZON', 'TOON', 'JSON'];
  
  const results = {
    timestamp: new Date().toISOString(),
    model: model,
    datasets: {},
    summary: {}
  };
  
  for (const datasetName of datasetNames) {
    console.log(`\\n${'='.repeat(80)}`);
    console.log(`📊 ${datasetName}`);
    console.log(`${'─'.repeat(80)}`);
    
    const data = comprehensiveDatasets[datasetName];
    const questions = allQuestions[datasetName];
    
    results.datasets[datasetName] = {};
    
    const encodedData = {};
    formats.forEach(format => {
      encodedData[format] = encodeData(data, format);
    });
    
    for (const format of formats) {
      if (!encodedData[format]) {
        console.log(`   ⚠️  ${format}: Skipped (encoding failed)`);
        continue;
      }
      
      process.stdout.write(`   ${format.padEnd(6)}: `);
      
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
              extracted: extracted
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
                extracted: res.extracted
              });
            }
          }
        });
      }
      
      const accuracy = ((correctCount / questions.length) * 100).toFixed(1);
      console.log(` ${correctCount}/${questions.length} (${accuracy}%)`);
      
      results.datasets[datasetName][format] = {
        correct: correctCount,
        total: questions.length,
        accuracy: parseFloat(accuracy),
        tokens: totalTokens,
        failures: failures
      };
      
      if (failures.length > 0 && failures.length <= 3) {
        failures.forEach(f => {
          if (f.error) {
            console.log(`      [ERROR] ${f.question}: ${f.error}`);
          } else {
            console.log(`      [FAIL] Q: "${f.question}"`);
            console.log(`             Expected: "${f.expected}"`);
            console.log(`             Got:      "${f.actual}"`);
          }
        });
      }
    }
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\\n💾 Results saved to ${OUTPUT_FILE}`);
  
  console.log('\\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                          PILOT RESULTS SUMMARY                             ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\\n');
  
  for (const datasetName of datasetNames) {
    console.log(`\\n📊 ${datasetName}:`);
    const datasetResults = results.datasets[datasetName];
    
    for (const format of formats) {
      if (!datasetResults[format]) continue;
      const r = datasetResults[format];
      console.log(`  ${format.padEnd(6)}: ${r.accuracy.toFixed(1).padStart(5)}% accuracy (${r.correct}/${r.total}) | ${r.tokens} tokens`);
    }
  }
  
  console.log('\\n\\n📈 OVERALL PERFORMANCE:');
  const overallStats = {};
  formats.forEach(format => {
    let totalCorrect = 0;
    let totalQuestions = 0;
    let totalTokens = 0;
    
    datasetNames.forEach(dataset => {
      if (results.datasets[dataset][format]) {
        totalCorrect += results.datasets[dataset][format].correct;
        totalQuestions += results.datasets[dataset][format].total;
        totalTokens += results.datasets[dataset][format].tokens;
      }
    });
    
    overallStats[format] = {
      accuracy: (totalCorrect / totalQuestions * 100).toFixed(1),
      correct: totalCorrect,
      total: totalQuestions,
      tokens: totalTokens
    };
  });
  
  for (const format of formats) {
    const stats = overallStats[format];
    console.log(`  ${format.padEnd(6)}: ${stats.accuracy.padStart(5)}% accuracy (${stats.correct}/${stats.total}) | ${stats.tokens.toLocaleString()} tokens total`);
  }
  
  console.log('\\n' + '='.repeat(80));
  console.log('✨ Pilot benchmark complete!\\n');
  
  return results;
}

if (require.main === module) {
  runPilotBenchmark().catch(console.error);
}

module.exports = { runPilotBenchmark };
