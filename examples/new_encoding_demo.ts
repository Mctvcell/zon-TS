import { encode, encodeAdaptive, encodeLLM, analyze } from '../src/index';

const data = {
  users: [
    { id: 1, name: "Alice", role: "admin", active: true, scores: [10, 20, 30] },
    { id: 2, name: "Bob", role: "user", active: false, scores: [15, 25, 35] },
    { id: 3, name: "Charlie", role: "user", active: true, scores: [5, 15, 25] }
  ],
  metadata: {
    version: "1.0.0",
    generated: "2023-10-27"
  }
};

console.log("--- Standard Encoding ---");
const standard = encode(data);
console.log(standard);
console.log(`Length: ${standard.length} chars\n`);

console.log("--- Adaptive Encoding (Auto) ---");
const adaptive = encodeAdaptive(data, { mode: 'compact', debug: true }) as any;
console.log(`Selected Mode: ${adaptive.modeUsed}`);
console.log(adaptive.output);
console.log(`Length: ${adaptive.output.length} chars\n`);

console.log("--- LLM Optimized (Retrieval) ---");
const llmRetrieval = encodeLLM(data, { task: 'retrieval', model: 'gpt-4' });
console.log(llmRetrieval);
console.log(`Length: ${llmRetrieval.length} chars\n`);

console.log("--- LLM Optimized (Generation) ---");
const llmGen = encodeLLM(data, { task: 'generation', model: 'claude' });
console.log(llmGen);
console.log(`Length: ${llmGen.length} chars\n`);

console.log("--- Analysis ---");
const analysis = analyze(data);
console.log("Complexity Metrics:", analysis);
