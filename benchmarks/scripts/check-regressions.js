#!/usr/bin/env node
/**
 * Regression Checker
 * 
 * Compares current eval results with baseline
 */

const fs = require('fs');
const path = require('path');
const { ZonEvaluator, registerBuiltinMetrics, FileEvalStorage } = require('../../dist/evals');

const { parseArgs } = require('util');

async function checkRegressions() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      type: { type: 'string', default: 'smoke' }
    }
  });

  console.log(`🔍 Checking for regressions for ${values.type}...\n`);
  
  if (values.type === 'full') {
    const resultsPath = path.join(__dirname, '../results/accuracy-results.json');
    const baselinePath = path.join(__dirname, '../results/accuracy-baseline.json');
    
    if (!fs.existsSync(resultsPath)) {
      console.log('⚠️  No full evaluation results found');
      process.exit(0);
    }
    
    if (!fs.existsSync(baselinePath)) {
      console.log('ℹ️  No baseline found - this will become the baseline');
      process.exit(0);
    }
    
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
    const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));
    
    // Compare accuracy and efficiency
    let hasCritical = false;
    const models = Object.keys(results.models);
    
    models.forEach(model => {
      const currentModel = results.models[model];
      const baselineModel = baseline.models[model];
      
      if (!baselineModel) return;
      
      Object.keys(currentModel).forEach(format => {
        const current = currentModel[format];
        const base = baselineModel[format];
        
        if (!base) return;
        
        // Check accuracy regression
        const currentAcc = current.total > 0 ? (current.correct / current.total) : 0;
        const baseAcc = base.total > 0 ? (base.correct / base.total) : 0;
        
        if (currentAcc < baseAcc - 0.05) { // 5% drop
           console.log(`🔴 ${model}/${format} Accuracy: ${baseAcc.toFixed(2)} -> ${currentAcc.toFixed(2)}`);
           hasCritical = true;
        }
      });
    });
    
    if (hasCritical) {
      console.error('❌ Critical regressions detected');
      process.exit(1);
    }
    
    console.log('✅ No regressions detected!\n');
    process.exit(0);
  }

  const storage = new FileEvalStorage('./benchmarks/results');
  
  try {
    // Load latest results
    const latest = await storage.getLatest('smoke-test');
    if (!latest) {
      console.log('⚠️  No recent smoke test results found');
      process.exit(0);
    }
    
    // Load baseline
    const baseline = await storage.load('smoke-test-baseline');
    if (!baseline) {
      console.log('ℹ️  No baseline found - this will become the baseline');
      process.exit(0);
    }
    
    // Compare
    const evaluator = new ZonEvaluator();
    registerBuiltinMetrics(evaluator);
    
    const regressions = await evaluator.compare(baseline, latest);
    
    if (regressions.length === 0) {
      console.log('✅ No regressions detected!\n');
      process.exit(0);
    }
    
    console.log(`⚠️  Found ${regressions.length} regression(s):\n`);
    
    let hasCritical = false;
    regressions.forEach(r => {
      const emoji = r.severity === 'critical' ? '🔴' : r.severity === 'major' ? '🟠' : '🟡';
      console.log(`${emoji} ${r.model}/${r.metric}:`);
      console.log(`   Baseline: ${r.baselineValue.toFixed(3)}`);
      console.log(`   Current:  ${r.currentValue.toFixed(3)}`);
      console.log(`   Change:   ${r.change.toFixed(1)}% (${r.severity})\n`);
      
      if (r.severity === 'critical') {
        hasCritical = true;
      }
    });
    
    // Fail CI on critical regressions
    if (hasCritical) {
      console.error('❌ Critical regressions detected - failing build');
      process.exit(1);
    } else {
      console.log('⚠️  Minor regressions detected - review recommended');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error checking regressions:', error.message);
    process.exit(1);
  }
}

checkRegressions();
