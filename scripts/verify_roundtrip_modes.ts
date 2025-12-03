import { encodeAdaptive, decode } from '../src/index';
import { deepStrictEqual } from 'assert';

// --- Dataset Definitions (Copied from generate_mode_examples.ts) ---

let unifiedDataset: any = {};
try {
  // @ts-ignore
  const datasets = require('../benchmarks/datasets/datasets');
  unifiedDataset = datasets.unifiedDataset;
} catch (e) {
  console.warn('Warning: Could not load unifiedDataset from benchmarks');
}

const simpleKeyValue = {
  name: "ZON Format",
  version: "1.1.0",
  active: true,
  score: 98.5,
  description: null
};

const arrayOfPrimitives = [
  "apple", "banana", "cherry", "date", "elderberry"
];

const simpleTable = [
  { id: 1, name: "Alice", role: "Admin" },
  { id: 2, name: "Bob", role: "User" },
  { id: 3, name: "Charlie", role: "Guest" }
];

const uniformData = {
  employees: Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    role: i % 2 === 0 ? "admin" : "user",
    active: true,
    department: "Engineering"
  }))
};

const mixedStructure = {
  metadata: {
    generated: "2025-01-01T12:00:00Z",
    source: "System A"
  },
  items: [
    { id: 1, value: 100 },
    { id: 2, value: 200 }
  ]
};

const nestedObjects = {
  orderId: "ORD-123",
  customer: {
    name: "Alice",
    address: {
      street: "123 Main St",
      city: "Wonderland"
    }
  },
  items: [
    { productId: "P1", qty: 2, price: 10.5 },
    { productId: "P2", qty: 1, price: 20.0 }
  ]
};

const deepConfig = {
  app: {
    server: {
      host: "localhost",
      port: 8080,
      options: {
        timeout: 5000,
        retry: 3
      }
    },
    database: {
      primary: { connection: "db://primary" },
      replica: { connection: "db://replica" }
    }
  }
};

const heavilyNested = {
  level1: {
    level2: {
      level3: {
        level4: {
          data: [1, 2, 3],
          info: "Deep"
        }
      }
    }
  }
};

const dirtyData = {
  primitives: {
    integers: [0, 1, -1, 42, -42, 9007199254740991, -9007199254740991],
    floats: [0.0, 1.1, -1.1, 3.14159, -2.71828, 1.5e10, 1.5e-10],
    booleans: [true, false],
    nulls: [null],
    strings: [
      "", " ", "simple", "with spaces", "with, comma", "with: colon",
      "with \"quotes\"", "with 'single quotes'", "with \\n newline",
      "https://example.com/path?query=1&param=2",
      "special: !@#$%^&*()_+{}[]|\\\\:;\"'<>,.?/~`"
    ]
  },
  edge_cases: {
    empty_obj: {},
    empty_arr: [],
    nested_empty: { a: {}, b: [] },
    mixed_arr: [1, "two", true, null, { a: 1 }, [2]]
  }
};

const complexNested = {
  level1: {
    id: "L1",
    meta: { created: "2025-01-01", active: true },
    children: [
      {
        id: "L2-A",
        type: "group",
        items: [
          { id: "L3-A1", val: 10, tags: ["a", "b"] },
          { id: "L3-A2", val: 20, tags: ["c"] }
        ],
        config: {
          settings: {
            deep: {
              deeper: {
                deepest: "value"
              }
            }
          }
        }
      },
      {
        id: "L2-B",
        type: "leaf",
        data: [
          { x: 1, y: 2 },
          { x: 3, y: 4, z: 5 },
          { x: 6 }
        ]
      }
    ]
  }
};

const nastyStrings = {
  unicode: [
    "Emoji: 🚀🔥🎉💀👽",
    "Chinese: 你好世界",
    "Arabic: مرحبا بالعالم",
    "Russian: Привет мир",
    "Zalgo: H̴e̴l̴l̴o̴ ̴W̴o̴r̴l̴d̴"
  ],
  control_chars: [
    "Null: \u0000",
    "Backspace: \b",
    "Form Feed: \f",
    "Newline: \n",
    "Carriage Return: \r",
    "Tab: \t",
    "Vertical Tab: \v"
  ],
  json_injection: [
    "{\"key\": \"value\"}",
    "[1, 2, 3]",
    "null",
    "true",
    "false",
    "// comment",
    "/* comment */"
  ],
  script_injection: [
    "<script>alert('xss')</script>",
    "javascript:void(0)",
    "'; DROP TABLE users; --"
  ],
  path_traversal: [
    "../../etc/passwd",
    "..\\..\\windows\\system32\\config\\sam"
  ]
};

const deepRecursion = (function() {
  let obj: any = { end: "bottom" };
  for (let i = 0; i < 50; i++) {
    obj = { level: i, next: obj };
  }
  return obj;
})();

const hikingExample = {
  "context": {
    "task": "Our favorite hikes together",
    "location": "Boulder",
    "season": "spring_2025"
  },
  "friends": [
    "ana",
    "luis",
    "sam"
  ],
  "hikes": [
    {
      "id": 1,
      "name": "Blue Lake Trail",
      "distanceKm": 7.5,
      "elevationGain": 320,
      "companion": "ana",
      "wasSunny": true
    },
    {
      "id": 2,
      "name": "Ridge Overlook",
      "distanceKm": 9.2,
      "elevationGain": 540,
      "companion": "luis",
      "wasSunny": false
    },
    {
      "id": 3,
      "name": "Wildflower Loop",
      "distanceKm": 5.1,
      "elevationGain": 180,
      "companion": "sam",
      "wasSunny": true
    }
  ]
};

const irregularData = {
  config: {
    database: {
      primary: { host: "db-01", port: 5432, ssl: true },
      replica: { host: "db-02", port: 5432, ssl: true }
    },
    features: {
      beta: true,
      deprecated: ["v1", "v2"]
    }
  }
};

const allDatasets = [
  { name: '01_simple_key_value', data: simpleKeyValue },
  { name: '02_array_of_primitives', data: arrayOfPrimitives },
  { name: '03_simple_table', data: simpleTable },
  { name: '04_uniform_table', data: uniformData.employees },
  { name: '05_mixed_structure', data: mixedStructure },
  { name: '06_nested_objects', data: nestedObjects },
  { name: '07_deep_config', data: deepConfig },
  { name: '08_complex_nested', data: heavilyNested },
  { name: '09_unified_dataset', data: unifiedDataset },
  { name: '10_dirty_data', data: dirtyData },
  { name: '11_complex_nested_struct', data: complexNested },
  { name: '12_nasty_strings', data: nastyStrings },
  { name: '13_deep_recursion', data: deepRecursion },
  { name: '14_hiking_example', data: hikingExample },
  { name: 'uniform', data: uniformData },
  { name: 'irregular', data: irregularData },
  { name: 'nested', data: irregularData }
];

// --- Verification Logic ---

// Only test production modes (compact, llm-optimized)
// Readable mode is for humans only - no round-trip guarantee
const MODES = ['compact', 'llm-optimized'] as const;

console.log('Starting Round-Trip Verification for Production Modes...\n');
console.log('Note: Testing compact and llm-optimized modes only');
console.log('Readable mode is for human debugging - not tested for round-trip\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

allDatasets.forEach(ds => {
  if (!ds.data) {
    console.warn(`Skipping ${ds.name} (no data)`);
    return;
  }

  console.log(`Testing dataset: ${ds.name}`);

  // Test Explicit Modes (compact, llm-optimized)
  MODES.forEach(mode => {
    verifyRoundTrip(ds.name, mode, ds.data, { mode });
  });

  console.log(''); // Newline between datasets
});

function verifyRoundTrip(datasetName: string, modeName: string, originalData: any, options: any) {
  totalTests++;
  try {
    const encoded = typeof encodeAdaptive(originalData, options) === 'string' 
      ? encodeAdaptive(originalData, options) as string 
      : (encodeAdaptive(originalData, options) as any).output;
      
    const decoded = decode(encoded);

    // Special handling for deep recursion or specific types if needed, 
    // but deepStrictEqual handles most JSON-compatible structures.
    // Note: ZON might convert undefined to null or omit it, so we might need loose comparison if data has undefined.
    // But our examples seem clean.
    
    deepStrictEqual(decoded, JSON.parse(JSON.stringify(originalData))); // Compare against JSON-cycle-safe version if needed, or just original
    // Actually, ZON handles circular refs by flattening or erroring? 
    // The deepRecursion example is circular. JSON.stringify throws on circular.
    // encodeAdaptive handles circular refs? Let's check.
    // If originalData has circular refs, JSON.stringify will fail.
    // But deepRecursion example:
    // const deepRecursion = (function() {
    //   let obj: any = { end: "bottom" };
    //   for (let i = 0; i < 50; i++) {
    //     obj = { level: i, next: obj };
    //   }
    //   return obj;
    // })();
    // This is NOT circular, just deep.
    
    // However, if there are undefineds in originalData, they become null or missing in JSON/ZON.
    // So comparing against JSON.parse(JSON.stringify(originalData)) is safer for "JSON-compatible" roundtrip.
    
    process.stdout.write(`  ✓ ${modeName}\n`);
    passedTests++;
  } catch (e: any) {
    process.stdout.write(`  ✗ ${modeName}: ${e.message}\n`);
    failedTests++;
    // console.error(e); // Optional: print stack trace
  }
}

console.log('Verification Complete!');
console.log(`Total: ${totalTests}, Passed: ${passedTests}, Failed: ${failedTests}`);

if (failedTests > 0) {
  process.exit(1);
}
