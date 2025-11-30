/**
 * LLM Retrieval Accuracy Benchmark Runner
 * 
 * Tests how well different LLMs understand ZON vs other formats
 * by asking 200+ questions across 8 datasets.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parseArgs } = require('util');
const { encode: encodeZon, decode: decodeZon, validate } = require('../dist/index');
const { encode: encodeTOON } = require('@toon-format/toon');
const { encode: encodeTokens } = require('gpt-tokenizer');
const yaml = require('js-yaml');
const { XMLBuilder } = require('fast-xml-parser');
const { encodeToCSV, encodeToTSV } = require('./csv-encoder');
const datasets = require('./datasets');
const { generateUnifiedQuestions } = require('./questions');
const { AzureAIClient } = require('./llm-client');
const { validateAnswer, extractAnswer } = require('./validators');
const { UnifiedSchema } = require('./schema-def');

// TSON (using CSON as proxy)
const tson = require('cson');

// Configuration
const OUTPUT_FILE = path.join(__dirname, 'accuracy-results.json');
const CONCURRENCY = 5; // Parallel requests per model

// Initialize XML builder
const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  format: true
});

/**
 * Encode data into specified format
 */
function encodeData(data, format) {
  try {
    switch (format) {
      case 'ZON':
        return encodeZon(data);
      case 'TOON':
        return encodeTOON(data);
      case 'CSV':
        return encodeToCSV(data);
      case 'TSV':
        return encodeToTSV(data);
      case 'TSON':
        return tson.stringify(data);
      case 'JSON':
        return JSON.stringify(data, null, 2);
      case 'YAML':
        return yaml.dump(data);
      case 'XML':
        // XML requires a root element
        return xmlBuilder.build({ root: data });
      default:
        throw new Error(`Unknown format: ${format}`);
    }
  } catch (e) {
    return null; // Format failed for this data (e.g. CSV on nested)
  }
}

/**
 * Build prompt for LLM
 */
function buildPrompt(data, format, question) {
  let header = `Data format: ${format}`;
  
  // ZON-specific hint for implicit columns
  if (format === 'ZON') {
    header += `\nIMPORTANT: Columns in brackets like [id] indicate sequential values. These [id] items ARE valid fields and MUST be included when listing available fields. Top-level sections starting with @ (e.g. @users) are also keys.`;
  }

  return `${header}
Data:
${data}

Question: ${question}

Provide ONLY the direct answer value. Do not include full sentences, explanations, or units unless requested.
Example: for "What is the salary?", answer "95000" not "The salary is 95000".
Answer:`;
}

/**
 * Run the benchmark
 */
async function runBenchmark() {
  // No CLI args needed for now - parseArgs was unused
  
  // Clear cache to ensure fresh results
  const CACHE_DIR = path.join(__dirname, '.cache');
  console.log('🧹 Clearing cache...');
  if (fs.existsSync(CACHE_DIR)) {
    fs.rmSync(CACHE_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  console.log('✅ Cache cleared\n');
  
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('🚀 Starting LLM Retrieval Accuracy Benchmark');
  console.log('════════════════════════════════════════════════════════════');
  
  // Initialize client
  const client = new AzureAIClient();
  const models = ['gpt-5-nano', 'deepseek-v3.1', 'grok-3', 'Llama-3.3-70B-Instruct'];
  
  // Get questions
  const allQuestions = require('./questions-309');
  const datasetName = 'unifiedDataset';
  
  // Formats to test
  const formats = ['ZON', 'TOON', 'JSON', 'YAML', 'CSV', 'TSV', 'TSON', 'XML'];
  
  // Results storage
  const results = {
    timestamp: new Date().toISOString(),
    models: {},
    summary: {}
  };
  
  // Initialize results structure
  models.forEach(model => {
    results.models[model] = {};
    formats.forEach(format => {
      results.models[model][format] = {
        correct: 0,
        total: 0,
        tokens: 0,
        errors: 0
      };
    });
  });
  
  console.log(`\n📂 Dataset: ${datasetName.toUpperCase()}`);
  
  // Get data and questions
  const data = datasets[datasetName];
  const questions = allQuestions[datasetName];
    
    // Pre-encode data in all formats
    const encodedData = {};
    const dataTokens = {};
    
    formats.forEach(format => {
      encodedData[format] = encodeData(data, format);
      if (encodedData[format]) {
        dataTokens[format] = encodeTokens(encodedData[format]).length;
      }

      // --- ZON Eval Integration ---
      if (format === 'ZON' && datasetName === 'unifiedDataset') {
        console.log('   🛡️  Validating ZON data with Schema...');
        const validation = validate(encodedData[format], UnifiedSchema);
        if (validation.success) {
          console.log('      ✅ ZON Data is Schema-Valid');
        } else {
          console.error('      ❌ ZON Data Validation Failed:', validation.error);
          console.error('      Issues:', validation.issues);
        }

        // --- Roundtrip Check ---
        console.log('   🔄 Verifying Roundtrip Integrity...');
        try {
          const decoded = decodeZon(encodedData[format]);
          const reEncoded = encodeZon(decoded);
          if (reEncoded === encodedData[format]) {
             console.log('      ✅ Roundtrip Successful (Lossless)');
          } else {
             console.error('      ❌ Roundtrip Mismatch!');
             // console.log('Original:', encodedData[format]);
             // console.log('Re-encoded:', reEncoded);
          }
        } catch (e) {
          console.error('      ❌ Roundtrip Failed (Decode Error):', e.message);
        }
      }
    });
    
    // Process each model
    for (const model of models) {
      console.log(`   🤖 Model: ${model}`);
      
      // Process each format
      for (const format of formats) {
        if (!encodedData[format]) {
          console.log(`      ⚠️  ${format}: Skipped (encoding failed)`);
          continue;
        }
        
        process.stdout.write(`      ${format.padEnd(6)}: `);
        
        let correctCount = 0;
        let totalTokens = 0;
        
        // Process questions in batches
        for (let i = 0; i < questions.length; i += CONCURRENCY) {
          const batch = questions.slice(i, i + CONCURRENCY);
          const promises = batch.map(async (q) => {
            const prompt = buildPrompt(encodedData[format], format, q.q);
            
            try {
              const result = await client.query(model, prompt, 2000);
              const extracted = extractAnswer(result.answer);
              const isCorrect = validateAnswer(extracted, q.a, q.type);
              
              return {
                isCorrect,
                tokens: result.tokensUsed,
                answer: result.answer,
                expected: q.a,
                question: q.q
              };
            } catch (e) {
              return { error: e.message };
            }
          });
          
          const batchResults = await Promise.all(promises);
          
          batchResults.forEach(res => {
            if (res.error) {
              results.models[model][format].errors++;
              process.stdout.write('E');
            } else {
              results.models[model][format].total++;
              results.models[model][format].tokens += res.tokens;
              totalTokens += res.tokens;
              
              if (res.isCorrect) {
                results.models[model][format].correct++;
                correctCount++;
                process.stdout.write('.');
              } else {
                process.stdout.write('x');
                // Debug all failures
                console.log(`\n[DEBUG] Q: "${res.question}"`);
                console.log(`        Expected: "${res.expected}"`);
                console.log(`        Actual:   "${res.answer}"`);
                console.log(`        Extracted: "${extractAnswer(res.answer)}"`);
              }
            }
          });
        }
        
        const accuracy = ((correctCount / questions.length) * 100).toFixed(1);
        console.log(` ${correctCount}/${questions.length} (${accuracy}%)`);
      }
    }
  
  // Save results
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to ${OUTPUT_FILE}`);
  
  // Print Summary
  console.log('\n📊 FINAL RESULTS SUMMARY');
  console.log('════════════════════════════════════════════════════════════');
  
  models.forEach(model => {
    console.log(`\n🤖 ${model}`);
    const modelResults = results.models[model];
    
    // Sort formats by efficiency (accuracy per 1000 tokens)
    const sortedFormats = Object.keys(modelResults)
      .map(fmt => {
        const r = modelResults[fmt];
        const accuracy = r.total > 0 ? (r.correct / r.total) * 100 : 0;
        // Efficiency = (Accuracy % / Data Tokens) * 1000
        // Use the data tokens calculated earlier, not the cumulative API tokens
        const tokens = dataTokens[fmt] || 0;
        const efficiency = tokens > 0 ? (accuracy / tokens) * 1000 : 0;
        
        return {
          format: fmt,
          ...r,
          accuracy,
          efficiency,
          dataTokens: tokens
        };
      })
      .sort((a, b) => b.efficiency - a.efficiency);
      
    console.log('\nEfficiency Ranking (Accuracy per 1K Tokens):');
    sortedFormats.forEach(r => {
      const bar = '█'.repeat(Math.round(r.efficiency)).padEnd(20, '░');
      console.log(`  ${r.format.padEnd(6)} ${bar} ${r.efficiency.toFixed(1)} acc%/1K tok | ${r.accuracy.toFixed(1)}% acc | ${r.dataTokens.toLocaleString()} tokens`);
    });
  });
}

// Run if called directly
if (require.main === module) {
  runBenchmark().catch(console.error);
}

module.exports = { runBenchmark };
