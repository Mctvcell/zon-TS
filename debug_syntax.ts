import { encode, decode } from './src/index';

const testCases = [
  {
    name: "Nested Object",
    data: { config: { database: { host: "db", port: 5432 } } }
  },
  {
    name: "String with Colons (Date)",
    data: { timestamp: "2025-02-01T12:00:00Z" }
  },
  {
    name: "String with Colons (URL)",
    data: { url: "https://example.com" }
  },
  {
    name: "Ambiguous String (User Example)",
    data: { raw: "david:21:usa:22:02:2025" }
  },
  {
    name: "Deep Nesting",
    data: { a: { b: { c: { d: "value" } } } }
  },
  {
    name: "Mixed Array/Object",
    data: { 
      users: [
        { id: 1, meta: { active: true } },
        { id: 2, meta: { active: false } }
      ]
    }
  }
];

console.log("--- ZON Encoding Analysis ---");
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
