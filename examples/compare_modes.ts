
import { encodeAdaptive } from '../src/core/adaptive';

const data = {
  users: [
    { id: 1, active: true, role: "admin" },
    { id: 2, active: false, role: "user" },
    { id: 3, active: true, role: "editor" }
  ],
  config: {
    enabled: true,
    threshold: 0.5
  }
};

console.log("--- Compact Mode ---");
console.log(encodeAdaptive(data, { mode: 'compact' }));
console.log("\n--- LLM Mode ---");
console.log(encodeAdaptive(data, { mode: 'llm-optimized' }));
