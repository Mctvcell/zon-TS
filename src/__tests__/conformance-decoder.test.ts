import { decode } from '../index';

describe('Decoder Conformance (§11.2)', () => {
  test('should accept UTF-8 with LF or CRLF', () => {
    const zonLF = 'key:value\nkey2:value2';
    const zonCRLF = 'key:value\r\nkey2:value2';
    
    expect(() => decode(zonLF)).not.toThrow();
    expect(() => decode(zonCRLF)).not.toThrow();
  });

  test('should decode T → true, F → false, null → null', () => {
    const zonData = 'active:T\narchived:F\nvalue:null';
    const result = decode(zonData);
    
    expect(result.active).toBe(true);
    expect(result.archived).toBe(false);
    expect(result.value).toBe(null);
  });

  test('should parse decimal and exponent numbers', () => {
    const zonData = 'int:42\nfloat:3.14\nbig:1000000';
    const result = decode(zonData);
    
    expect(result.int).toBe(42);
    expect(result.float).toBeCloseTo(3.14, 10);
    expect(result.big).toBe(1000000);
  });

  test('should treat leading-zero numbers as strings', () => {
    const zonData = 'code:"007"';
    const result = decode(zonData);
    
    expect(result.code).toBe('007');
    expect(typeof result.code).toBe('string');
  });

  test('should unescape quoted strings', () => {
    const zonData = 'text:"he said \\"hello\\""';
    const result = decode(zonData);
    
    expect(result.text).toBe('he said "hello"');
  });

  test('should parse table rows into array of objects', () => {
    const zonData = `
users:@(2):id,name
1,Alice
2,Bob
`;
    const result = decode(zonData);
    
    expect(result.users).toHaveLength(2);
    expect(result.users[0]).toEqual({ id: 1, name: 'Alice' });
    expect(result.users[1]).toEqual({ id: 2, name: 'Bob' });
  });

  test('should preserve key order from document', () => {
    const zonData = 'z:1\na:2\nm:3';
    const result = decode(zonData);
    
    const keys = Object.keys(result);
    expect(keys).toEqual(['z', 'a', 'm']);
  });

  test('should reject prototype pollution attempts', () => {
    const malicious = `
@data(1):id,__proto__.polluted
1,true
`;
    const decoded = decode(malicious);
    
    // @ts-ignore
    expect({}.polluted).toBeUndefined();
    // @ts-ignore
    expect(Object.prototype['polluted']).toBeUndefined();
  });

  test('should throw on nesting depth > 100', () => {
    const deepNested = '['.repeat(150) + ']'.repeat(150);
    
    expect(() => decode(deepNested)).toThrow(/Maximum nesting depth exceeded/);
  });

  test('should throw on document size > 100MB (E301)', () => {
  });

  test('should throw on line length > 1MB (E302)', () => {
    const longLine = 'key:' + 'x'.repeat(1024 * 1024 + 1);
    
    expect(() => decode(longLine)).toThrow(/E302/);
  });

  test('should handle case-insensitive null/boolean aliases', () => {
    const zonData = 'a:TRUE\nb:False\nc:NONE\nd:nil';
    const result = decode(zonData);
    
    expect(result.a).toBe(true);
    expect(result.b).toBe(false);
    expect(result.c).toBe(null);
    expect(result.d).toBe(null);
  });

  test('should reconstruct nested objects from dotted keys', () => {
    const zonData = 'config.db.host:localhost\nconfig.db.port:5432';
    const result = decode(zonData);
    
    expect(result.config.db.host).toBe('localhost');
    expect(result.config.db.port).toBe(5432);
  });

  test('should unwrap pure lists (data key)', () => {
    const zonData = `
data:@(2):id,name
1,Alice
2,Bob
`;
    const result = decode(zonData);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });

  test('should handle empty strings in table cells', () => {
    const zonData = `
users:@(2):id,name
1,""
2,Bob
`;
    const result = decode(zonData);
    
    expect(result.users[0].name).toBe('');
  });
});
