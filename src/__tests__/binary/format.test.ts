/**
 * Tests for Binary ZON Format
 */

import { describe, it, expect } from '@jest/globals';
import { encodeBinary, decodeBinary } from '../../binary';

describe('Binary ZON Format', () => {
  describe('Round-trip encoding', () => {
    it('should encode and decode null', () => {
      const original = null;
      const encoded = encodeBinary(original);
      const decoded = decodeBinary(encoded);
      expect(decoded).toBe(original);
    });

    it('should encode and decode booleans', () => {
      expect(decodeBinary(encodeBinary(true))).toBe(true);
      expect(decodeBinary(encodeBinary(false))).toBe(false);
    });

    it('should encode and decode positive integers', () => {
      expect(decodeBinary(encodeBinary(0))).toBe(0);
      expect(decodeBinary(encodeBinary(1))).toBe(1);
      expect(decodeBinary(encodeBinary(127))).toBe(127);
      expect(decodeBinary(encodeBinary(255))).toBe(255);
      expect(decodeBinary(encodeBinary(65535))).toBe(65535);
    });

    it('should encode and decode negative integers', () => {
      expect(decodeBinary(encodeBinary(-1))).toBe(-1);
      expect(decodeBinary(encodeBinary(-32))).toBe(-32);
      expect(decodeBinary(encodeBinary(-128))).toBe(-128);
      expect(decodeBinary(encodeBinary(-32768))).toBe(-32768);
    });

    it('should encode and decode floating point numbers', () => {
      expect(decodeBinary(encodeBinary(3.14))).toBeCloseTo(3.14);
      expect(decodeBinary(encodeBinary(-2.5))).toBeCloseTo(-2.5);
      expect(decodeBinary(encodeBinary(0.1 + 0.2))).toBeCloseTo(0.3);
    });

    it('should encode and decode strings', () => {
      expect(decodeBinary(encodeBinary(''))).toBe('');
      expect(decodeBinary(encodeBinary('a'))).toBe('a');
      expect(decodeBinary(encodeBinary('Hello, World!'))).toBe('Hello, World!');
      expect(decodeBinary(encodeBinary('A'.repeat(100)))).toBe('A'.repeat(100));
    });

    it('should encode and decode UTF-8 strings', () => {
      expect(decodeBinary(encodeBinary('こんにちは'))).toBe('こんにちは');
      expect(decodeBinary(encodeBinary('🚀'))).toBe('🚀');
      expect(decodeBinary(encodeBinary('Ñoño'))).toBe('Ñoño');
    });

    it('should encode and decode arrays', () => {
      expect(decodeBinary(encodeBinary([]))).toEqual([]);
      expect(decodeBinary(encodeBinary([1, 2, 3]))).toEqual([1, 2, 3]);
      expect(decodeBinary(encodeBinary(['a', 'b', 'c']))).toEqual(['a', 'b', 'c']);
    });

    it('should encode and decode mixed arrays', () => {
      const data = [1, 'two', true, null, 3.14];
      expect(decodeBinary(encodeBinary(data))).toEqual(data);
    });

    it('should encode and decode objects', () => {
      expect(decodeBinary(encodeBinary({}))).toEqual({});
      expect(decodeBinary(encodeBinary({ a: 1 }))).toEqual({ a: 1 });
      expect(decodeBinary(encodeBinary({ a: 1, b: 2, c: 3 }))).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should encode and decode nested structures', () => {
      const data = {
        users: [
          { id: 1, name: 'Alice', active: true },
          { id: 2, name: 'Bob', active: false }
        ],
        count: 2,
        metadata: {
          version: '1.0',
          timestamp: 1234567890
        }
      };
      
      const decoded = decodeBinary(encodeBinary(data));
      expect(decoded).toEqual(data);
    });

    it('should handle deeply nested data', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'deep'
              }
            }
          }
        }
      };
      
      expect(decodeBinary(encodeBinary(data))).toEqual(data);
    });

    it('should handle large arrays', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i);
      expect(decodeBinary(encodeBinary(data))).toEqual(data);
    });

    it('should handle large objects', () => {
      const data: Record<string, number> = {};
      for (let i = 0; i < 100; i++) {
        data[`key${i}`] = i;
      }
      expect(decodeBinary(encodeBinary(data))).toEqual(data);
    });
  });

  describe('Size comparison', () => {
    it('should be smaller than JSON for typical data', () => {
      const data = {
        users: [
          { id: 1, name: 'Alice', age: 30 },
          { id: 2, name: 'Bob', age: 25 }
        ]
      };
      
      const binarySize = encodeBinary(data).length;
      const jsonSize = JSON.stringify(data).length;
      
      // Binary should be significantly smaller
      expect(binarySize).toBeLessThan(jsonSize);
    });

    it('should handle numbers efficiently', () => {
      const data = [1, 2, 3, 4, 5];
      const binarySize = encodeBinary(data).length;
      const jsonSize = JSON.stringify(data).length;
      
      expect(binarySize).toBeLessThan(jsonSize);
    });
  });

  describe('Error handling', () => {
    it('should throw on invalid binary data', () => {
      const invalidData = new Uint8Array([0x00, 0x01, 0x02]);
      expect(() => decodeBinary(invalidData)).toThrow();
    });

    it('should validate magic header', () => {
      const invalidHeader = new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0x00]);
      expect(() => decodeBinary(invalidHeader)).toThrow('magic header');
    });
  });
});
