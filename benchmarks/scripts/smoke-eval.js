#!/usr/bin/env node
/**
 * Smoke Test Evaluations
 * 
 * Lightweight eval that runs quickly on PRs (< 1 minute)
 */

const { ZonEvaluator, registerBuiltinMetrics, FileEvalStorage, globalRegistry, createDataset } = require('../../dist/evals');
const { encode } = require('../../dist/index');

// Simple smoke test dataset
const smokeDataset = createDataset(
  'smoke-test',
  '1.0.0',
  'Quick Smoke Test',
  {
    users: [
      { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 },
      { id: 2, name: 'Bob', email: 'bob@example.com', age: 25 }
    ],
    count: 2
  },
  [
    {
      id: 'q1',
      question: 'How many users are there?',
      expectedAnswer: 2,
      answerType: 'number'
    },
    {
      id: 'q2',
      question: 'What is the name of the first user?',
      expectedAnswer: 'Alice',
      answerType: 'string'
    },
    {
      id: 'q3',
      question: 'What is Bob\'s age?',
      expectedAnswer: 25,
      answerType: 'number'
    }
  ],
  { tags: ['smoke', 'regression-test'] }
);

globalRegistry.register(smokeDataset);

async function runSmokeTest() {
  console.log('🔬 Running smoke test evaluations...\n');
  
  const evaluator = new ZonEvaluator();
  registerBuiltinMetrics(evaluator);
  
  const config = {
    name: 'smoke-test',
    version: '1.0.0',
    datasets: [smokeDataset],
    models: [
      { name: 'local-test', provider: 'custom' }
    ],
    metrics: ['exactMatch', 'tokenEfficiency', 'formatCorrectness'],
    thresholds: {
      exactMatch: 0.80,  // 80% accuracy for smoke test
      formatCorrectness: 1.0
    }
  };
  
  try {
    const result = await evaluator.run(config);
    
    // Save results
    const storage = new FileEvalStorage('./benchmarks/results');
    await storage.save(result);
    
    console.log('\n✅ Smoke test complete!');
    console.log(`   Duration: ${(result.duration / 1000).toFixed(1)}s`);
    console.log(`   Passed: ${result.passed ? 'Yes ✓' : 'No ✗'}`);
    
    process.exit(result.passed ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Smoke test failed:', error.message);
    process.exit(1);
  }
}

runSmokeTest();
