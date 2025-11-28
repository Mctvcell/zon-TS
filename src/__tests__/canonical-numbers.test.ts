import { encode, decode } from '../index';

describe('Canonical Number Formatting', () => {
  describe('Integer Numbers', () => {
    test('should encode integers without decimal point', () => {
      const data = { value: 42 };
      const encoded = encode(data);
      
      expect(encoded).toContain('42');
      expect(encoded).not.toContain('42.0');
    });

    test('should handle zero', () => {
      const data = { value: 0 };
      const encoded = encode(data);
      
      expect(encoded).toContain('value:0');
    });

    test('should handle negative integers', () => {
      const data = { value: -123 };
      const encoded = encode(data);
      
      expect(encoded).toContain('-123');
    });
  });

  describe('Floating Point Numbers', () => {
    test('should encode floats without trailing zeros', () => {
      const data = { value: 3.14 };
      const encoded = encode(data);
      
      expect(encoded).toContain('3.14');
      expect(encoded).not.toContain('3.140000');
    });

    test('should handle very small decimals', () => {
      const data = { value: 0.001 };
      const encoded = encode(data);
      
      expect(encoded).toContain('0.001');
      expect(encoded).not.toContain('1e-3');
    });

    test('should not use scientific notation for large numbers', () => {
      const data = { value: 1000000 };
      const encoded = encode(data);
      
      expect(encoded).toContain('1000000');
      expect(encoded).not.toContain('1e6');
      expect(encoded).not.toContain('1e+6');
    });

    test('should handle numbers with many decimal places', () => {
      const data = { value: 3.141592653589793 };
      const encoded = encode(data);
      
      // Should preserve precision but trim trailing zeros
      expect(encoded).toContain('3.14159265358979'); // JavaScript precision
      // Should not contain scientific notation (e+, e-)
      expect(encoded).not.toMatch(/\de[+-]?\d/);
    });
  });

  describe('Special Values', () => {
    test('should encode NaN as null', () => {
      const data = { value: NaN };
      const encoded = encode(data);
      
      expect(encoded).toContain('value:null');
    });

    test('should encode Infinity as null', () => {
      const data = { value: Infinity };
      const encoded = encode(data);
      
      expect(encoded).toContain('value:null');
    });

    test('should encode -Infinity as null', () => {
      const data = { value: -Infinity };
      const encoded = encode(data);
      
      expect(encoded).toContain('value:null');
    });
  });

  describe('Round-Trip Preservation', () => {
    test('should preserve integer values through round-trip', () => {
      const data = { value: 42 };
      const encoded = encode(data);
      const decoded = decode(encoded);
      
      expect(decoded.value).toBe(42);
      expect(Number.isInteger(decoded.value)).toBe(true);
    });

    test('should preserve float values through round-trip', () => {
      const data = { value: 3.14 };
      const encoded = encode(data);
      const decoded = decode(encoded);
      
      expect(decoded.value).toBeCloseTo(3.14, 10);
    });

    test('should preserve large numbers through round-trip', () => {
      const data = { value: 1000000 };
      const encoded = encode(data);
      const decoded = decode(encoded);
      
      expect(decoded.value).toBe(1000000);
    });

    test('should preserve very small numbers through round-trip', () => {
      const data = { value: 0.000001 };
      const encoded = encode(data);
      const decoded = decode(encoded);
      
      expect(decoded.value).toBeCloseTo(0.000001, 10);
    });
  });

  describe('Array of Numbers', () => {
    test('should format all numbers canonically in arrays', () => {
      const data = {
        values: [
          { num: 1000000 },
          { num: 0.001 },
          { num: 42 },
          { num: 3.14 }
        ]
      };
      
      const encoded = encode(data);
      
      // Should not contain scientific notation
      expect(encoded).not.toContain('e+');
      expect(encoded).not.toContain('e-');
      expect(encoded).not.toContain('E');
      
      // Should contain actual values
      expect(encoded).toContain('1000000');
      expect(encoded).toContain('0.001');
      expect(encoded).toContain('42');
      expect(encoded).toContain('3.14');
    });
  });
});
