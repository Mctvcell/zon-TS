#!/usr/bin/env node
/**
 * Regression Checker
 * 
 * Compares current eval results with baseline
 */

const fs = require('fs');
const path = require('path');
const { ZonEvaluator, registerBuiltinMetrics, FileEvalStorage } = require('../../dist/evals');

async function checkRegressions() {
  console.log('🔍 Checking for regressions...\n');
  
  const storage = new FileEvalStorage('./benchmarks/results');
  
  try {
    // Load latest results
    const latest = await storage.getLatest('smoke-test');
    if (!latest) {
      console.log('⚠️  No recent eval results found');
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
