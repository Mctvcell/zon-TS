import { encode } from '../index';

/**
 * Conformance tests based on FORMAL_SPEC.md §11.1 Encoder Checklist
 */
describe('Encoder Conformance (§11.1)', () => {
  test('should emit UTF-8 with LF line endings', () => {
    const data = { a: 1, b: 2 };
    const encoded = encode(data);
    
    // Should use LF, not CRLF
    expect(encoded).not.toContain('\r\n');
    // Should be a string (UTF-8 compatible)
    expect(typeof encoded).toBe('string');
  });

  test('should encode booleans as T/F', () => {
    const data = { active: true, archived: false };
    const encoded = encode(data);
    
    expect(encoded).toContain('active:T');
    expect(encoded).toContain('archived:F');
    expect(encoded).not.toContain('true');
    expect(encoded).not.toContain('false');
  });

  test('should encode null as "null"', () => {
    const data = { value: null };
    const encoded = encode(data);
    
    expect(encoded).toContain('value:null');
  });

  test('should emit canonical numbers', () => {
    const data = { int: 42, float: 3.14, big: 1000000 };
    const encoded = encode(data);
    
    // No scientific notation
    expect(encoded).toContain('1000000');
    expect(encoded).not.toContain('1e6');
    expect(encoded).not.toContain('1e+6');
    
    // Has decimal for floats
    expect(encoded).toContain('3.14');
  });

  test('should normalize NaN/Infinity to null', () => {
    const data = { nan: NaN, inf: Infinity, negInf: -Infinity };
    const encoded = encode(data);
    
    expect(encoded).toContain('nan:null');
    expect(encoded).toContain('inf:null');
    expect(encoded).toContain('negInf:null');
  });

  test('should detect uniform arrays → table format', () => {
    const data = {
      users: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ]
    };
    const encoded = encode(data);
    
    // Should have table marker
    expect(encoded).toMatch(/users:@\(\d+\)/);
    expect(encoded).toContain('id,name');
  });

  test('should emit table headers with count and columns', () => {
    const data = {
      items: [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 5, y: 6 }
      ]
    };
    const encoded = encode(data);
    
    expect(encoded).toContain('items:@(3):');
  });

  test('should sort columns alphabetically', () => {
    const data = {
      records: [
        { z: 1, a: 2, m: 3 }
      ]
    };
    const encoded = encode(data);
    
    // Columns should be sorted: a, m, z
    expect(encoded).toMatch(/records:@\(1\):a,m,z/);
  });

  test('should quote strings with special characters', () => {
    const data = { 
      comma: 'a,b',
      colon: 'x:y',
      quote: 'say "hi"'
    };
    const encoded = encode(data);
    
    expect(encoded).toContain('"a,b"');
    // v2.0.5: Colons are allowed unquoted
    // expect(encoded).toContain('"x:y"'); 
    expect(encoded).toContain('x:y');
    // Uses quote doubling: " becomes ""
    expect(encoded).toContain('"say ""hi"""');
  });

  test('should escape quotes in strings', () => {
    const data = { text: 'he said "hello"' };
    const encoded = encode(data);
    
    // Uses quote doubling 
    expect(encoded).toContain('""hello""');
  });

  test('should produce deterministic output', () => {
    const data = { b: 2, a: 1, c: 3 };
    
    const encoded1 = encode(data);
    const encoded2 = encode(data);
    
    expect(encoded1).toBe(encoded2);
  });

  test('should handle empty objects', () => {
    const data = {};
    const encoded = encode(data);
    
    // Empty object is empty string in ZON
    expect(encoded).toBe('');
  });

  test('should handle empty arrays', () => {
    const data = { items: [] };
    const encoded = encode(data);
    
    expect(encoded).toBeTruthy();
  });
});
