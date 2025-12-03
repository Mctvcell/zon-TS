/**
 * Tests for Adaptive Encoding
 */

import { describe, it, expect } from '@jest/globals';
import {
  encodeAdaptive,
  recommendMode,
  DataComplexityAnalyzer
} from '../core/adaptive';
import { decode } from '../core/decoder';

describe('Adaptive Encoding', () => {
  describe('encodeAdaptive', () => {
    it('should encode data in auto mode', () => {
      const data = { users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] };
      const encoded = encodeAdaptive(data);
      
      expect(typeof encoded).toBe('string');
      const decoded = decode(encoded as string);
      expect(decoded).toEqual(data);
    });

    it('should encode in compact mode', () => {
      const data = { items: [{ a: 1, b: 2 }, { a: 3, b: 4 }] };
      const encoded = encodeAdaptive(data, { mode: 'compact' });
      
      expect(typeof encoded).toBe('string');
      const decoded = decode(encoded as string);
      expect(decoded).toEqual(data);
    });

    it('should encode in readable mode', () => {
      const data = { value: 'test' };
      const encoded = encodeAdaptive(data, { mode: 'readable' });
      
      expect(typeof encoded).toBe('string');
      const decoded = decode(encoded as string);
      expect(decoded).toEqual(data);
    });

    it('should encode in llm-optimized mode', () => {
      const data = { messages: [{ id: 1, text: 'Hello' }] };
      const encoded = encodeAdaptive(data, { mode: 'llm-optimized' });
      
      expect(typeof encoded).toBe('string');
      const decoded = decode(encoded as string);
      expect(decoded).toEqual(data);
    });

    it('should return debug info when debug=true', () => {
      const data = { test: 'value' };
      const result = encodeAdaptive(data, { debug: true });
      
      expect(result).toHaveProperty('output');
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('modeUsed');
      expect(result).toHaveProperty('decisions');
      expect(Array.isArray((result as any).decisions)).toBe(true);
    });

    it('should handle complex nested data', () => {
      const data = {
        config: {
          database: { host: 'localhost', port: 5432 },
          cache: { enabled: true }
        },
        users: [{ id: 1 }]
      };
      
      const encoded = encodeAdaptive(data);
      const decoded = decode(encoded as string);
      expect(decoded).toEqual(data);
    });

    it('should handle empty data', () => {
      const encoded = encodeAdaptive({});
      expect(typeof encoded).toBe('string');
    });

    it('should handle arrays', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const encoded = encodeAdaptive(data);
      const decoded = decode(encoded as string);
      expect(decoded).toEqual(data);
    });
  });

  describe('recommendMode', () => {
    it('should recommend compact for uniform data', () => {
      const data = {
        users: [
          { id: 1, name: 'Alice', age: 30 },
          { id: 2, name: 'Bob', age: 25 },
          { id: 3, name: 'Charlie', age: 35 }
        ]
      };
      
      const recommendation = recommendMode(data);
      expect(recommendation.mode).toBe('compact');
      expect(recommendation.confidence).toBeGreaterThan(0.5);
    });

    it('should recommend readable for deeply nested data', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: { value: 'deep' }
              }
            }
          }
        }
      };
      
      const recommendation = recommendMode(data);
      // May recommend readable due to nesting
      expect(['readable', 'llm-optimized']).toContain(recommendation.mode);
    });

    it('should provide reasoning', () => {
      const data = { test: 'value' };
      const recommendation = recommendMode(data);
      
      expect(recommendation.reason).toBeDefined();
      expect(typeof recommendation.reason).toBe('string');
      expect(recommendation.reason.length).toBeGreaterThan(0);
    });
  });

  describe('DataComplexityAnalyzer', () => {
    const analyzer = new DataComplexityAnalyzer();

    it('should analyze simple object', () => {
      const data = { a: 1, b: 2 };
      const analysis = analyzer.analyze(data);
      
      expect(analysis.nesting).toBe(1);
      expect(analysis.fieldCount).toBe(2);
      expect(analysis.irregularity).toBe(0);
    });

    it('should detect nesting depth', () => {
      const data = { a: { b: { c: { d: 'deep' } } } };
      const analysis = analyzer.analyze(data);
      
      expect(analysis.nesting).toBe(4);
    });

    it('should calculate irregularity', () => {
      const uniform = {
        items: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
          { id: 3, name: 'Charlie' }
        ]
      };
      
      const irregular = {
        items: [
          { id: 1, name: 'Alice' },
          { age: 25, email: 'bob@example.com' },
          { x: 1, y: 2, z: 3 }
        ]
      };
      
      const uniformAnalysis = analyzer.analyze(uniform);
      const irregularAnalysis = analyzer.analyze(irregular);
      
      expect(uniformAnalysis.irregularity).toBeLessThan(irregularAnalysis.irregularity);
    });

    it('should detect array size', () => {
      const data = {
        small: [1, 2, 3],
        large: new Array(100).fill(0).map((_, i) => ({ id: i }))
      };
      
      const analysis = analyzer.analyze(data);
      expect(analysis.arraySize).toBe(100);
    });

    it('should provide recommendations', () => {
      const data = {
        users: [
          { id: 1, name: 'Alice', email: 'alice@example.com' },
          { id: 2, name: 'Bob', email: 'bob@example.com' }
        ]
      };
      
      const analysis = analyzer.analyze(data);
      expect(analysis.recommendation).toBeDefined();
      expect(['table', 'inline', 'json', 'mixed']).toContain(analysis.recommendation);
      expect(analysis.confidence).toBeGreaterThan(0);
      expect(analysis.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle empty objects', () => {
      const analysis = analyzer.analyze({});
      expect(analysis.nesting).toBe(1);
      expect(analysis.fieldCount).toBe(0);
    });

    it('should handle arrays of primitives', () => {
      const data = [1, 2, 3, 4, 5];
      const analysis = analyzer.analyze(data);
      
      expect(analysis.nesting).toBeGreaterThan(0);
      expect(analysis.arraySize).toBe(5);
    });
  });

  describe('Mode Selection Logic', () => {
    it('should select appropriate mode for uniform tabular data', () => {
      const data = {
        products: new Array(50).fill(0).map((_, i) => ({
          id: i,
          name: `Product ${i}`,
          price: i * 10
        }))
      };
      
      const result = encodeAdaptive(data, { debug: true }) as any;
      expect(['compact', 'auto']).toContain(result.modeUsed);
    });

    it('should adapt to irregular data', () => {
      const data = {
        items: [
          { type: 'A', value: 1 },
          { kind: 'B', amount: 2, extra: 'field' },
          { category: 'C' }
        ]
      };
      
      const result = encodeAdaptive(data, { debug: true }) as any;
      // Should choose a mode that handles irregularity
      expect(result.decisions.length).toBeGreaterThan(0);
    });
  });
});
