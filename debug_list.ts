import { encode, decode } from './src/index';

const testCases = [
  {
    name: "Root Array of Strings",
    data: ["apple", "banana", "cherry"]
  },
  {
    name: "Root Array of Numbers",
    data: [1, 2, 3, 4.5]
  },
  {
    name: "Root Array of Mixed Primitives",
    data: ["a", 1, true, null]
  },
  {
    name: "Empty Array",
    data: []
  }
];

console.log("--- ZON List Optimization Analysis ---");
testCases.forEach(tc => {
  console.log(`\n[${tc.name}]`);
  const encoded = encode(tc.data);
  console.log(`Encoded: ${encoded}`);
  
  try {
    const decoded = decode(encoded);
    const roundtrip = JSON.stringify(decoded) === JSON.stringify(tc.data);
    console.log(`Roundtrip: ${roundtrip ? "✅ Success" : "❌ FAILED"}`);
    if (!roundtrip) {
      console.log(`Expected: ${JSON.stringify(tc.data)}`);
      console.log(`Got:      ${JSON.stringify(decoded)}`);
    }
  } catch (e: any) {
    console.log(`Decode Error: ${e.message}`);
  }
});
