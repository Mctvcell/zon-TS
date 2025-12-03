
import { encodeAdaptive } from '../src/core/adaptive';

const data = {
  config: {
    settings: {
      theme: "dark",
      notifications: true
    },
    items: [
      { id: 1, name: "Item A" },
      { id: 2, name: "Item B" }
    ]
  }
};

console.log("--- Default Indent (2) ---");
console.log(encodeAdaptive(data, { mode: 'readable' }));

console.log("\n--- Indent 4 ---");
console.log(encodeAdaptive(data, { mode: 'readable', indent: 4 }));

console.log("\n--- Indent 0 ---");
console.log(encodeAdaptive(data, { mode: 'readable', indent: 0 }));
