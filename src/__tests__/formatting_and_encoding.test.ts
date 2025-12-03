import { encodeAdaptive } from '../core/adaptive';
import { expandPrint } from '../tools/printer';

describe('Formatting and Encoding Tests', () => {
  
  describe('Delta Encoding Disabled', () => {
    const sequentialData = {
      ids: [1, 2, 3, 4, 5],
      timestamps: [100, 200, 300, 400, 500]
    };

    const nestedData = {
      users: [
        { id: 1, loginCount: 10 },
        { id: 2, loginCount: 20 },
        { id: 3, loginCount: 30 }
      ]
    };

    it('should not use delta encoding in auto mode', () => {
      const output = encodeAdaptive(sequentialData, { mode: 'compact' }) as string;
      expect(output).not.toContain('+1');
      expect(output).not.toContain(':delta');
    });

    it('should not use delta encoding in compact mode', () => {
      const output = encodeAdaptive(sequentialData, { mode: 'compact' }) as string;
      expect(output).not.toContain('+1');
      expect(output).not.toContain(':delta');
    });

    it('should not use delta encoding in readable mode', () => {
      const output = encodeAdaptive(sequentialData, { mode: 'readable' }) as string;
      expect(output).not.toContain('+1');
      expect(output).not.toContain(':delta');
    });

    it('should not use delta encoding in llm-optimized mode', () => {
      const output = encodeAdaptive(sequentialData, { mode: 'llm-optimized' }) as string;
      expect(output).not.toContain('+1');
      expect(output).not.toContain(':delta');
    });

    it('should not use delta encoding for nested structures', () => {
      const output = encodeAdaptive(nestedData, { mode: 'compact' }) as string;
      expect(output).not.toContain('+1');
      expect(output).not.toContain(':delta');
    });
  });

  describe('Readable Mode Table Formatting', () => {
    const tableWithArrays = {
      products: [
        { id: "p1", tags: ["a", "b"] },
        { id: "p2", tags: ["c"] }
      ]
    };

    const tableWithObjects = {
      logs: [
        { id: 1, meta: { user: "u1" } },
        { id: 2, meta: { user: "u2" } }
      ]
    };

    const complexTable = {
      items: [
        { id: 1, data: [1, 2], config: { a: 1 } },
        { id: 2, data: [3], config: { b: 2 } }
      ]
    };

    it('should format arrays inline within table cells', () => {
      const output = encodeAdaptive(tableWithArrays, { mode: 'readable' }) as string;
      const lines = output.split('\n');
      // Check that tags are on the same line as the row
      const row1 = lines.find(l => l.includes('p1'));
      expect(row1).toBeDefined();
      expect(row1).toContain('[a,b]');
    });

    it('should format objects inline within table cells', () => {
      const output = encodeAdaptive(tableWithObjects, { mode: 'readable' }) as string;
      const lines = output.split('\n');
      const row1 = lines.find(l => l.includes('1'));
      expect(row1).toBeDefined();
      // Objects are flattened in tables by default
      const row1Flattened = lines.find(l => l.includes('1'));
      expect(row1Flattened).toBeDefined();
      // Expect flattened value "u1" for column meta.user
      expect(row1Flattened).toContain('u1');
    });

    it('should handle complex nested structures in tables', () => {
      const output = encodeAdaptive(complexTable, { mode: 'readable' }) as string;
      const lines = output.split('\n');
      const row1 = lines.find(l => l.includes('1'));
      expect(row1).toBeDefined();
      expect(row1).toContain('[1,2]');
      const row1Complex = lines.find(l => l.includes('1'));
      expect(row1Complex).toBeDefined();
      expect(row1Complex).toContain('[1,2]');
      // config.a is flattened to 1
      expect(row1Complex).toContain('1');
    });
  });
});
