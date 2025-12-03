#!/usr/bin/env node
/**
 * Baseline Manager
 * 
 * Saves current eval results as the new baseline
 */

const fs = require('fs');
const path = require('path');
const { FileEvalStorage } = require('../../dist/evals');

async function saveBaseline() {
  console.log('💾 Saving baseline...\n');
  
  const storage = new FileEvalStorage('./benchmarks/results');
  
  try {
    // Load latest results
    const latest = await storage.getLatest('smoke-test');
    if (!latest) {
      console.error('❌ No recent eval results to save as baseline');
      process.exit(1);
    }
    
    // Save as baseline
    const baselineResult = {
      ...latest,
      testId: 'smoke-test-baseline',
      timestamp: Date.now()
    };
    
    await storage.save(baselineResult);
    
    console.log('✅ Baseline saved successfully!');
    console.log(`   Test ID: ${baselineResult.testId}`);
    console.log(`   Timestamp: ${new Date(baselineResult.timestamp).toISOString()}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error saving baseline:', error.message);
    process.exit(1);
  }
}

saveBaseline();
