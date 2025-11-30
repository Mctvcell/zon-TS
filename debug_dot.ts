import { decode } from './src/index';

const testCases = [
  {
    name: "Simple Dot Notation",
    input: "a.b.c:1",
    expected: { a: { b: { c: 1 } } }
  },
  {
    name: "Mixed Dot and Standard",
    input: "user.name:Alice\nuser.address:{city:Wonderland}",
    expected: { user: { name: "Alice", address: { city: "Wonderland" } } }
  },
  {
    name: "Deep Dot Notation",
    input: "config.db.host:localhost\nconfig.db.port:5432",
    expected: { config: { db: { host: "localhost", port: 5432 } } }
  }
];

console.log("--- ZON Dot Notation Analysis ---");
testCases.forEach(tc => {
  console.log(`\n[${tc.name}]`);
  console.log(`Input:\n${tc.input}`);
  
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
