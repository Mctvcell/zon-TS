import { decode } from './src/index';

const testCases = [
  {
    name: "Unquoted List",
    input: "[apple,banana,cherry]",
    expected: ["apple", "banana", "cherry"]
  },
  {
    name: "Mixed List",
    input: "[a,1,T,null]",
    expected: ["a", 1, true, null]
  },
  {
    name: "List with Colons",
    input: "[url:http://example.com,date:2025]",
    expected: ["url:http://example.com", "date:2025"]
  }
];

console.log("--- ZON Bracket Optimization Analysis ---");
testCases.forEach(tc => {
  console.log(`\n[${tc.name}]`);
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
