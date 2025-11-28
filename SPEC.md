# ZON Format Specification

**Version:** 1.0.3  
**Status:** Production-ready

ZON (Zero Overhead Notation) is a compact, human-readable encoding of the JSON data model optimized for LLM contexts.

In practice: 100% retrieval accuracy, 4-15% fewer tokens than TOON (varies by tokenizer).

---

## Syntax Overview

### Types

| JSON | ZON | Notes |
|------|-----|-------|
| `true` | `T` | Single character |
| `false` | `F` | Single character |
| `null` | `~` | Tilde |
| `42` | `42` | Numbers unchanged |
| `"text"` | `text` or `"text"` | Quotes when necessary |

### Objects

Simple key-value pairs:

```zon
name:Alice
age:30
active:T
```

Nested structures stay quoted:

```zon
config:"{database:{host:localhost,port:5432}}"
```

### Arrays

Primitives inline:

```zon
tags:"[nodejs,typescript]"
```

Uniform tables (where ZON shines):

```zon
users:@(3):active,id,name,role
T,1,Alice,admin
T,2,Bob,user
F,3,Carol,guest
```

Table syntax: `@(N)` for row count, then column names, then data rows.

---

## Complete Example

**JSON input:**
```json
{
  "metadata": { "version": "1.0.3", "env": "prod" },
  "users": [
    { "id": 1, "name": "Alice", "active": true },
    { "id": 2, "name": "Bob", "active": false }
  ]
}
```

**ZON output:**
```zon
metadata:"{version:1.0.3,env:prod}"
users:@(2):active,id,name
T,1,Alice
F,2,Bob
```

JSON: 151 tokens. ZON: 87 tokens. That's 42% savings.

---

## Format Selection

The encoder picks the optimal representation automatically:

- Uniform arrays of objects → table format
- Primitive arrays → inline notation
- Flat objects → key-value pairs
- Nested objects → quoted compound

"Uniform" means all elements have the same structure and primitive values.

---

## Grammar

```
document     ::= object-lines | root-array
object-lines ::= (key-value | table-header | data-row)*
root-array   ::= table-header data-row+

key-value    ::= key ":" value
table-header ::= key ":@(" count? "):" columns
data-row     ::= value ("," value)*

value        ::= "T" | "F" | "~" | number | string | quoted-compound
```

---

## Guarantees

Lossless encoding. `decode(encode(data))` returns the original data structure, types preserved.

Deterministic output. Same input always produces same output (keys sorted alphabetically).

Tested on 28 unit tests and 27 roundtrip datasets. Zero data loss.

---

## Competitive Advantages

### Why ZON beats CSV
- **Nested Data Support**: CSV is flat. ZON handles deep nesting naturally.
- **Type Preservation**: CSV is all strings. ZON preserves numbers, booleans, nulls.
- **Schema Awareness**: CSV headers are just strings. ZON headers define structure (`@(N)`).
- **Ambiguity Free**: No more "is this comma a separator or part of the data?".

### Why ZON beats TOON
- **Explicit Structure**: TOON relies on implicit structure. ZON declares it (`@(N)`).
- **No Hints Needed**: LLMs understand ZON's table format immediately.
- **Simpler Syntax**: No complex indentation rules or special markers.
- **Better Efficiency**: 4-15% fewer tokens on average.

### Why ZON beats JSON
- **Token Efficiency**: 29% fewer tokens on average.
- **LLM Readability**: Tables are easier for LLMs to scan than nested braces.
- **Accuracy**: 100% retrieval vs 91.7% for JSON.

---

## When to Use ZON

| Scenario | Use ZON? | Why? |
|----------|----------|------|
| **LLM Context** | ✅ **YES** | Maximizes context window, improves accuracy. |
| **Log Storage** | ✅ **YES** | Compact, readable, structured. |
| **Config Files** | ✅ **YES** | Human-readable, supports nesting. |
| **Public APIs** | ❌ NO | Use JSON for universal compatibility. |
| **Browser Storage** | ✅ **YES** | Saves space in localStorage/IndexedDB. |

---

## Technical Trade-offs

**1. Readability vs. Compactness**
ZON prioritizes token efficiency. While readable, it's denser than pretty-printed JSON.
*Mitigation:* The structure is regular and predictable.

**2. Parsing Complexity**
ZON requires a specialized parser (unlike JSON.parse).
*Mitigation:* The parser is lightweight (<2KB) and dependency-free.

**3. Ecosystem Support**
JSON is universal. ZON is new.
*Mitigation:* Lossless conversion means you can use ZON for transport/storage and JSON for processing.

---

## Documentation

- **[README](./README.md)** - Overview and benchmarks
- **[Syntax Cheatsheet](./docs/syntax-cheatsheet.md)** - Quick reference
- **[API Reference](./docs/api-reference.md)** - encode/decode
- **[Format Spec](./docs/format-specification.md)** - Formal grammar
- **[LLM Guide](./docs/llm-best-practices.md)** - Usage patterns

---

## Links

- [npm](https://www.npmjs.com/package/zon-format)
- [Changelog](./CHANGELOG.md)

---

**License:** MIT

