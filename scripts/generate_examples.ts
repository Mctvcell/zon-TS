
import * as fs from 'fs';
import * as path from 'path';
import { encode } from '../src/index';
const datasets = require('../benchmarks/datasets');

const EXAMPLES_DIR = path.join(process.cwd(), 'examples');

// Ensure examples directory exists
if (!fs.existsSync(EXAMPLES_DIR)) {
  fs.mkdirSync(EXAMPLES_DIR);
}

// Additional simple datasets
const simpleKeyValue = {
  name: "ZON Format",
  version: "1.0.0",
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

// List of examples to generate (Low to High complexity)
const employees = [
  { id: 101, name: "John Doe", department: "Engineering", salary: 85000, active: true },
  { id: 102, name: "Jane Smith", department: "Marketing", salary: 72000, active: true },
  { id: 103, name: "Sam Brown", department: "Engineering", salary: 90000, active: false },
  { id: 104, name: "Emily Davis", department: "HR", salary: 65000, active: true }
];

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

// List of examples to generate (Low to High complexity)
const examples = [
  { name: '01_simple_key_value', data: simpleKeyValue, desc: 'Simple Key-Value Object' },
  { name: '02_array_of_primitives', data: arrayOfPrimitives, desc: 'Array of Strings' },
  { name: '03_simple_table', data: simpleTable, desc: 'Simple Array of Objects (Table)' },
  { name: '04_uniform_table', data: employees, desc: 'Uniform Tabular Data (Employees)' },
  { name: '05_mixed_structure', data: mixedStructure, desc: 'Mixed Structure (Metadata + Table)' },
  { name: '06_nested_objects', data: nestedObjects, desc: 'Nested Objects & Arrays' },
  { name: '07_deep_config', data: deepConfig, desc: 'Deeply Nested Configuration' },
  { name: '08_complex_nested', data: heavilyNested, desc: 'Heavily Nested Complex Data' },
  { name: '09_unified_dataset', data: datasets.unifiedDataset, desc: 'Unified Benchmark Dataset' }
];

console.log(`Generating examples in ${EXAMPLES_DIR}...\n`);

examples.forEach((ex, index) => {
  const jsonPath = path.join(EXAMPLES_DIR, `${ex.name}.json`);
  const zonPath = path.join(EXAMPLES_DIR, `${ex.name}.zonf`);

  const jsonContent = JSON.stringify(ex.data, null, 2);
  const zonContent = encode(ex.data);

  fs.writeFileSync(jsonPath, jsonContent);
  fs.writeFileSync(zonPath, zonContent);

  console.log(`✅ Generated ${ex.name}`);
  console.log(`   Description: ${ex.desc}`);
  console.log(`   JSON: ${jsonContent.length} bytes`);
  console.log(`   ZON:  ${zonContent.length} bytes`);
  console.log('---');
});

console.log('\nDone! View the examples in the "examples/" folder.');
