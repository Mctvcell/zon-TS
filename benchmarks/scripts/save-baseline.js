#!/usr/bin/env node
/**
 * Baseline Manager
 * 
 * Saves current eval results as the new baseline
 */

const fs = require('fs');
const path = require('path');
const { FileEvalStorage } = require('../../dist/evals');

const { parseArgs } = require('util');

async function saveBaseline() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      type: { type: 'string', default: 'smoke' }
    }
  });

  console.log(`💾 Saving baseline for ${values.type}...\n`);
  
  if (values.type === 'full') {
    const resultsPath = path.join(__dirname, '../results/accuracy-results.json');
    const baselinePath = path.join(__dirname, '../results/accuracy-baseline.json');
    
    if (!fs.existsSync(resultsPath)) {
      console.error('❌ No full evaluation results found');
      process.exit(1);
    }
    
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
    fs.writeFileSync(baselinePath, JSON.stringify(results, null, 2));
    
    console.log('✅ Full baseline saved successfully!');
    console.log(`   Timestamp: ${results.timestamp}`);
    process.exit(0);
  }

  const storage = new FileEvalStorage('./benchmarks/results');
  
  try {
    // Load latest results
    const latest = await storage.getLatest('smoke-test');
    if (!latest) {
      console.error('❌ No recent smoke test results to save as baseline');
      console.error('   Run "npm run eval:smoke" first');
      process.exit(1);
    }
    
    // Save as baseline
    const baselineResult = {
      ...latest,
      testId: 'smoke-test-baseline',
      timestamp: Date.now()
    };
    
    await storage.save(baselineResult);
    
    console.log('✅ Smoke test baseline saved successfully!');
    console.log(`   Test ID: ${baselineResult.testId}`);
    console.log(`   Timestamp: ${new Date(baselineResult.timestamp).toISOString()}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error saving baseline:', error.message);
    process.exit(1);
  }
}

saveBaseline();
