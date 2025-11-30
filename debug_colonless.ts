import { decode, encode } from './src/index';

const testCases = [
  {
    name: "Colon-less Object",
    input: "user{name:Alice}",
    expected: { user: { name: "Alice" } }
  },
  {
    name: "Colon-less Array",
    input: "tags[a,b]",
    expected: { tags: ["a", "b"] }
  },
  {
    name: "Mixed Syntax",
    input: "id:1,user{name:Alice,roles[admin,dev]}",
    expected: { id: 1, user: { name: "Alice", roles: ["admin", "dev"] } }
  }
];

console.log("--- ZON Colon-less Syntax Analysis ---");

// Test Decoding
console.log("\n[Decoding Tests]");
testCases.forEach(tc => {
  console.log(`\nTest: ${tc.name}`);
  console.log(`Input: ${tc.input}`);
  try {
    const decoded = decode(tc.input);
    const success = JSON.stringify(decoded) === JSON.stringify(tc.expected);
    console.log(`Result: ${success ? "✅ Success" : "❌ FAILED"}`);
    if (!success) {
      console.log(`Expected: ${JSON.stringify(tc.expected)}`);
      console.log(`Got:      ${JSON.stringify(decoded)}`);
    }
  } catch (e: any) {
    console.log(`Decode Error: ${e.message}`);
  }
});

// Test Encoding
console.log("\n[Encoding Tests]");
const data = {
  user: {
    name: "Alice",
    address: {
      city: "Wonderland"
    },
    tags: ["a", "b"]
  }
};
console.log("Input Data:", JSON.stringify(data));
const encoded = encode(data);
console.log("Encoded ZON:", encoded);
const expectedZon = "user{name:Alice,address{city:Wonderland},tags[a,b]}"; // Rough expectation
console.log(`Contains Colon-less? ${!encoded.includes("user:") && !encoded.includes("address:") && !encoded.includes("tags:") ? "✅ Yes" : "❌ No"}`);
