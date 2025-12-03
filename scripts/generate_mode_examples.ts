import fs from 'fs';
import path from 'path';
import { encodeAdaptive } from '../src/index';

// Try to import unifiedDataset, handle if not available (e.g. during build)
let unifiedDataset: any = {};
try {
  // @ts-ignore
  const datasets = require('../benchmarks/datasets/datasets');
  unifiedDataset = datasets.unifiedDataset;
} catch (e) {
  console.warn('Warning: Could not load unifiedDataset from benchmarks');
}

const EXAMPLES_DIR = path.join(__dirname, '../examples/modes');

// Ensure directory exists
if (!fs.existsSync(EXAMPLES_DIR)) {
  fs.mkdirSync(EXAMPLES_DIR, { recursive: true });
}

// --- Dataset Definitions ---

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

// Dataset 2: Irregular/Nested (Best for Readable/LLM) - Kept for backward compatibility
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

// --- Generation Logic ---

const allDatasets = [
  { name: '01_simple_key_value', data: simpleKeyValue },
  { name: '02_array_of_primitives', data: arrayOfPrimitives },
  { name: '03_simple_table', data: simpleTable },
  { name: '04_uniform_table', data: uniformData.employees }, // Use array directly for table
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
  // Keep original names for backward compatibility with README
  { name: 'uniform', data: uniformData },
  { name: 'irregular', data: irregularData },
  { name: 'nested', data: irregularData } // Same data as irregular
];

function getOutput(result: any): string {
  return typeof result === 'string' ? result : result.output;
}

console.log(`Generating examples in ${EXAMPLES_DIR}...\n`);

allDatasets.forEach(ds => {
  if (!ds.data) {
    console.warn(`Skipping ${ds.name} (no data)`);
    return;
  }

  console.log(`Generating ${ds.name}...`);
  
  // 1. Source JSON
  fs.writeFileSync(path.join(EXAMPLES_DIR, `${ds.name}_source.json`), JSON.stringify(ds.data, null, 2));
  
  // 3. Compact Mode
  fs.writeFileSync(path.join(EXAMPLES_DIR, `${ds.name}_compact.zonf`), getOutput(encodeAdaptive(ds.data, { mode: 'compact' })));
  
  // 4. Readable Mode
  // Special case for 'nested' to demonstrate indentation
  const readableOptions = ds.name === 'nested' ? { mode: 'readable' as const, indent: 4 } : { mode: 'readable' as const };
  fs.writeFileSync(path.join(EXAMPLES_DIR, `${ds.name}_readable.zonf`), getOutput(encodeAdaptive(ds.data, readableOptions)));
  
  // 5. LLM Mode
  fs.writeFileSync(path.join(EXAMPLES_DIR, `${ds.name}_llm.zonf`), getOutput(encodeAdaptive(ds.data, { mode: 'llm-optimized' })));
});

console.log('\nGenerated all examples!');
