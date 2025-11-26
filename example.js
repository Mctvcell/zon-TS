/**
 * ZON Format Example
 * Simple demonstration of encoding and decoding
 */

const { encode, decode } = require('./dist/index');

// Example 1: Simple object
console.log('=== Example 1: Simple Object ===');
const user = { name: 'Alice', age: 30, active: true };
const encodedUser = encode(user);
console.log('Original:', user);
console.log('Encoded:\n', encodedUser);
console.log('Decoded:', decode(encodedUser));
console.log();

// Example 2: Array of objects (table)
console.log('=== Example 2: Array of Objects ===');
const products = [
  { id: 1, name: 'Laptop', price: 999, inStock: true },
  { id: 2, name: 'Mouse', price: 29, inStock: true },
  { id: 3, name: 'Keyboard', price: 79, inStock: false }
];
const encodedProducts = encode(products);
console.log('Original:', products);
console.log('Encoded:\n', encodedProducts);
console.log('Decoded:', decode(encodedProducts));
console.log();

// Example 3: Hikes example from README
console.log('=== Example 3: Hikes (Mixed Data) ===');
const hikes = {
  context: {
    task: 'Our favorite hikes together',
    location: 'Boulder',
    season: 'spring_2025'
  },
  friends: ['ana', 'luis', 'sam'],
  hikes: [
    {
      id: 1,
      name: 'Blue Lake Trail',
      distanceKm: 7.5,
      elevationGain: 320,
      companion: 'ana',
      wasSunny: true
    },
    {
      id: 2,
      name: 'Ridge Overlook',
      distanceKm: 9.2,
      elevationGain: 540,
      companion: 'luis',
      wasSunny: false
    },
    {
      id: 3,
      name: 'Wildflower Loop',
      distanceKm: 5.1,
      elevationGain: 180,
      companion: 'sam',
      wasSunny: true
    }
  ]
};
const encodedHikes = encode(hikes);
console.log('Encoded:\n', encodedHikes);
console.log();
console.log('Decoded:', JSON.stringify(decode(encodedHikes), null, 2));
console.log();

// Example 4: Compression comparison
console.log('=== Example 4: Compression Stats ===');
const jsonStr = JSON.stringify(hikes);
const zonStr = encodedHikes;
console.log(`JSON size: ${jsonStr.length} bytes`);
console.log(`ZON size: ${zonStr.length} bytes`);
console.log(`Compression: ${((1 - zonStr.length / jsonStr.length) * 100).toFixed(1)}%`);
console.log();

// Example 5: Heavily Nested Data (5 items)
console.log('=== Example 5: Heavily Nested Data (5 items) ===');
const nestedData = [
  {
    id: 'sys-001',
    config: {
      network: {
        ipv4: { address: '192.168.1.10', mask: '255.255.255.0', gateway: '192.168.1.1' },
        ipv6: { enabled: true, address: 'fe80::1' },
        dns: { primary: '8.8.8.8', secondary: '8.8.4.4' }
      },
      services: {
        http: { port: 80, active: true },
        ssh: { port: 22, active: true, keys: ['rsa-key-1', 'ed25519-key-1'] }
      }
    },
    metrics: {
      cpu: { cores: 4, load: [0.1, 0.2, 0.1, 0.0] },
      memory: { total: 16384, free: 8192, cached: 4096 }
    }
  },
  {
    id: 'sys-002',
    config: {
      network: {
        ipv4: { address: '192.168.1.11', mask: '255.255.255.0', gateway: '192.168.1.1' },
        ipv6: { enabled: false, address: null },
        dns: { primary: '1.1.1.1', secondary: '1.0.0.1' }
      },
      services: {
        http: { port: 8080, active: true },
        ssh: { port: 2222, active: true, keys: ['rsa-key-2'] }
      }
    },
    metrics: {
      cpu: { cores: 8, load: [0.5, 0.6, 0.4, 0.5, 0.3, 0.2, 0.1, 0.1] },
      memory: { total: 32768, free: 12000, cached: 8000 }
    }
  },
  {
    id: 'sys-003',
    config: {
      network: {
        ipv4: { address: '10.0.0.5', mask: '255.0.0.0', gateway: '10.0.0.1' },
        ipv6: { enabled: true, address: 'fe80::3' },
        dns: { primary: '8.8.8.8', secondary: null }
      },
      services: {
        http: { port: 80, active: false },
        ssh: { port: 22, active: true, keys: [] }
      }
    },
    metrics: {
      cpu: { cores: 2, load: [0.9, 0.8] },
      memory: { total: 4096, free: 512, cached: 1024 }
    }
  },
  {
    id: 'sys-004',
    config: {
      network: {
        ipv4: { address: '172.16.0.20', mask: '255.240.0.0', gateway: '172.16.0.1' },
        ipv6: { enabled: true, address: 'fe80::4' },
        dns: { primary: '9.9.9.9', secondary: '149.112.112.112' }
      },
      services: {
        http: { port: 443, active: true },
        ssh: { port: 22, active: false, keys: ['rsa-key-admin'] }
      }
    },
    metrics: {
      cpu: { cores: 16, load: [0.1, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0] },
      memory: { total: 65536, free: 60000, cached: 2048 }
    }
  },
  {
    id: 'sys-005',
    config: {
      network: {
        ipv4: { address: '192.168.100.50', mask: '255.255.255.0', gateway: '192.168.100.1' },
        ipv6: { enabled: false, address: null },
        dns: { primary: '8.8.8.8', secondary: '8.8.4.4' }
      },
      services: {
        http: { port: 80, active: true },
        ssh: { port: 22, active: true, keys: ['ed25519-key-5', 'rsa-key-backup'] }
      }
    },
    metrics: {
      cpu: { cores: 4, load: [0.4, 0.4, 0.3, 0.3] },
      memory: { total: 8192, free: 2048, cached: 1024 }
    }
  }
];

const encodedNested = encode(nestedData);
console.log('Encoded (Preview first 500 chars):\n', encodedNested.slice(0, 500) + (encodedNested.length > 500 ? '...' : ''));
console.log();

const decodedNested = decode(encodedNested);
// Verify integrity
const assert = require('assert');
let isMatch = false;
try {
  assert.deepStrictEqual(decodedNested, nestedData);
  isMatch = true;
} catch (e) {
  isMatch = false;
}
console.log('Decoded matches original:', isMatch ? '✅ Yes' : '❌ No');

const jsonNestedStr = JSON.stringify(nestedData);
console.log(`JSON size: ${jsonNestedStr.length} bytes`);
console.log(`ZON size: ${encodedNested.length} bytes`);
console.log(`Compression: ${((1 - encodedNested.length / jsonNestedStr.length) * 100).toFixed(1)}%`);
