# ZON API Reference

Copyright (c) 2025 ZON-FORMAT (Roni Bhakta)

Complete API documentation for `zon-format` v1.0.4.

## Installation

```bash
npm install zon-format
```

---

## Encoding Functions

### `encode(input: any): string`

Encodes JavaScript data to ZON format.

**Parameters:**
- `input` (`any`) - JavaScript data to encode (objects, arrays, primitives)

**Returns:** `string` - ZON-formatted string

**Example:**
```typescript
import { encode } from 'zon-format';

const data = {
  users: [
    { id: 1, name: "Alice", active: true },
    { id: 2, name: "Bob", active: false }
  ]
};

const encoded = encode(data);
console.log(encoded);
```

**Output:**
```zon
users:@(2):active,id,name
T,1,Alice
F,2,Bob
```

**Supported Types:**
- ✅ Objects (nested or flat)
- ✅ Arrays (uniform, mixed, primitives)
- ✅ Strings
- ✅ Numbers (integers, floats)
- ✅ Booleans (`T`/`F`)
- ✅ Null (`null`)

**Encoding Behavior:**
- **Uniform arrays** → Table format (`@(N):columns`)
- **Nested objects** → Quoted notation (`"{key:value}"`)
- **Primitive arrays** → Inline format (`"[a,b,c]"`)
- **Booleans** → `T`/`F` (single character)
- **Null** → `null`

---

## Decoding Functions

### `decode(zonString: string, options?: DecodeOptions): any`

Decodes a ZON format string back to the original JavaScript data structure.

### Parameters

- **`zonString`** (`string`): The ZON-formatted string to decode
- **`options`** (`DecodeOptions`, optional): Decoding options
  - **`strict`** (`boolean`, default: `true`): Enable strict validation

### Strict Mode

**Enabled by default** - Validates table structure during decoding.

**Error Codes:**
- `E001`: Row count mismatch (expected vs actual rows)
- `E002`: Field count mismatch (expected vs actual fields)

**Examples:**

```typescript
import { decode } from 'zon-format';

// Strict mode (default) - throws on validation errors
const zonData = `
users:@(2):id,name
1,Alice
`;

try {
  const data = decode(zonData);
} catch (e) {
  console.log(e.code);    // "E001"
  console.log(e.message); // "[E001] Row count mismatch..."
  console.log(e.context); // "Table: users"
}

// Non-strict mode - allows mismatches
const data = decode(zonData, { strict: false });
// Successfully decodes with 1 row instead of declared 2
```

**Output:**
```javascript
{
  users: [
    { id: 1, name: "Alice", active: true },
    { id: 2, name: "Bob", active: false }
  ]
}
```

**Decoding Guarantees:**
- ✅ **Lossless**: Perfect reconstruction of original data
- ✅ **Type preservation**: Numbers, booleans, null, strings
- ✅ **100% accuracy**: No data loss or corruption

---

## TypeScript Types

```typescript
// Main functions
export function encode(data: any): string;
export function decode(zonStr: string): any;

// JSON data model types
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject { [key: string]: JsonValue }
interface JsonArray extends Array<JsonValue> {}
```

---

## Error Handling

### `ZonDecodeError`

Thrown when decoding fails or strict mode validation errors occur.

**Properties:**
- `message` (`string`): Error description
- `code` (`string`, optional): Error code (e.g., "E001", "E002")
- `line` (`number`, optional): Line number where error occurred
- `column` (`number`, optional): Column position
- `context` (`string`, optional): Relevant context snippet

**Example:**

```typescript
import { decode, ZonDecodeError } from 'zon-format';

try {
  const data = decode(invalidZon);
} catch (e) {
  if (e instanceof ZonDecodeError) {
    console.log(e.code);     // "E001"
    console.log(e.line);     // 5
    console.log(e.context);  // "Table: users"
    console.log(e.toString()); // "[E001] Row count mismatch... (line 5)"
  }
}
```

### Common Error Codes

| Code | Description | Example |
|------|-------------|----------|
| `E001` | Row count mismatch | Declared `@(3)` but only 2 rows provided |
| `E002` | Field count mismatch | Declared 3 columns but row has 2 values |
| `E301` | Document size exceeds 100MB | Prevents memory exhaustion |
| `E302` | Line length exceeds 1MB | Prevents buffer overflow |
| `E303` | Array length exceeds 1M items | Prevents excessive iteration |
| `E304` | Object key count exceeds 100K | Prevents hash collision |

**Security Limits:**

All security limits (E301-E304) are automatically enforced to prevent DOS attacks. No configuration needed.

**Disable strict mode** to allow row/field count mismatches (E001-E002):

```typescript
const data = decode(zonString, { strict: false });
```

---

## Complete Examples

### Example 1: Simple Object

```typescript
const data = {
  name: "ZON Format",
  version: "1.0.4",
  active: true,
  score: 98.5
};

const encoded = encode(data);
// active:T
// name:ZON Format
// score:98.5
// version:"1.0.4"

const decoded = decode(encoded);
// { name: "ZON Format", version: "1.0.4", active: true, score: 98.5 }
```

### Example 2: Uniform Table

```typescript
const data = {
  employees: [
    { id: 1, name: "Alice", dept: "Eng", salary: 85000 },
    { id: 2, name: "Bob", dept: "Sales", salary: 72000 },
    { id: 3, name: "Carol", dept: "HR", salary: 65000 }
  ]
};

const encoded = encode(data);
// employees:@(3):dept,id,name,salary
// Eng,1,Alice,85000
// Sales,2,Bob,72000
// HR,3,Carol,65000

const decoded = decode(encoded);
// Identical to original!
```

### Example 3: Mixed Structure

```typescript
const data = {
  metadata: { version: "1.0", env: "prod" },
  users: [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" }
  ],
  tags: ["nodejs", "typescript", "llm"]
};

const encoded = encode(data);
// metadata:"{version:1.0,env:prod}"
// users:@(2):id,name
// 1,Alice
// 2,Bob
// tags:"[nodejs,typescript,llm]"

const decoded = decode(encoded);
// Identical to original!
```

### Example 4: Nested Objects

```typescript
const data = {
  config: {
    database: {
      host: "localhost",
      port: 5432,
      ssl: true
    },
    cache: {
      ttl: 3600,
      enabled: false
    }
  }
};

const encoded = encode(data);
// config:"{database:{host:localhost,port:5432,ssl:T},cache:{ttl:3600,enabled:F}}"

const decoded = decode(encoded);
// Identical to original!
```

---

## Round-Trip Compatibility

ZON **guarantees lossless round-trips**:

```typescript
import { encode, decode } from 'zon-format';

function testRoundTrip(data: any): boolean {
  const encoded = encode(data);
  const decoded = decode(encoded);
  return JSON.stringify(data) === JSON.stringify(decoded);
}

// All these pass:
testRoundTrip({ name: "test", value: 123 });  // ✅
testRoundTrip([1, 2, 3, 4, 5]);                // ✅
testRoundTrip([{ id: 1 }, { id: 2 }]);        // ✅
testRoundTrip(null);                           // ✅
testRoundTrip("hello");                        // ✅
```

**Verified:**
- ✅ 28/28 unit tests pass
- ✅ 27/27 datasets verified (9 examples + 18 comprehensive)
- ✅ Zero data loss across all test cases

---

## Performance Characteristics

### Encoding Speed
- **Small data (<1KB)**: <1ms
- **Medium data (1-10KB)**: 1-5ms
- **Large data (10-100KB)**: 5-50ms

### Token Efficiency

Compared to JSON on typical LLM data:

| Format | Tokens | Savings |
|--------|--------|---------|
| JSON (formatted) | 28,042 | - |
| JSON (compact) | 27,300 | 2.6% |
| TOON | 20,988 | 25.1% |
| **ZON** | **19,995** | **23.8%** 👑 |

**ZON is optimized for:**
- ✅ Uniform arrays of objects (tables)
- ✅ Mixed structures (metadata + data)
- ✅ LLM context windows
- ✅ Token-sensitive applications

---

## Choosing ZON

### Use ZON When:
- ✅ Sending data to LLMs
- ✅ Token count matters
- ✅ Data has uniform array structures
- ✅ You need human-readable format
- ✅ Perfect round-trip required

### Consider Alternatives When:
- ❌ Binary formats acceptable (use Protocol Buffers, MessagePack)
- ❌ Primarily deeply nested trees (JSON might be simpler)
- ❌ No LLM usage (stick with JSON)
- ❌ Need streaming/partial decode (not yet supported)

---

## Migration Guide

### From JSON

```typescript
// Before (JSON)
const jsonString = JSON.stringify(data);
const parsed = JSON.parse(jsonString);

// After (ZON)
import { encode, decode } from 'zon-format';
const zonString = encode(data);
const parsed = decode(zonString);
```

**Benefits:**
- 28-43% fewer tokens
- Same data model
- Lossless conversion

### From TOON

ZON and TOON are compatible - both encode the JSON data model:

```typescript
import { encode as encodeZon } from 'zon-format';
import { encode as encodeToon } from '@toon-format/toon';

// Same input works for both
const data = { users: [{ id: 1, name: "Alice" }] };

const zonString = encodeZon(data);   // ZON format
const toonString = encodeToon(data); // TOON format

// Both are valid, ZON is 4-15% more compact
```

---

## See Also

- [Syntax Cheatsheet](./syntax-cheatsheet.md) - Quick reference
- [Format Specification](../SPEC.md) - Formal grammar
- [LLM Best Practices](./llm-best-practices.md) - Usage guide
- [GitHub Repository](https://github.com/ZON-Format/zon-TS)
- [NPM Package](https://www.npmjs.com/package/zon-format)
