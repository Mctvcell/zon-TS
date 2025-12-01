import { decode, DecodeOptions } from '../index';
import { ZonDecodeError } from '../core/exceptions';

describe('Strict Mode Validation', () => {
  describe('E001: Row Count Mismatch', () => {
    test('should throw when table has fewer rows than declared (strict mode)', () => {
      const zonData = `
users:@(3):id,name
1,Alice
2,Bob
`;
      
      expect(() => decode(zonData)).toThrow(ZonDecodeError);
      expect(() => decode(zonData)).toThrow(/Row count mismatch/);
      expect(() => decode(zonData)).toThrow(/E001/);
    });

    test('should allow row count mismatch in non-strict mode', () => {
      const zonData = `
users:@(3):id,name
1,Alice
2,Bob
`;
      
      const result = decode(zonData, { strict: false });
      expect(result.users).toHaveLength(2);
    });

    test('should pass when row count matches (strict mode)', () => {
      const zonData = `
users:@(2):id,name
1,Alice
2,Bob
`;
      
      const result = decode(zonData);
      expect(result.users).toHaveLength(2);
      expect(result.users[0]).toEqual({ id: 1, name: 'Alice' });
    });
  });

  describe('E002: Field Count Mismatch', () => {
    test('should throw when row has fewer fields than declared columns (strict mode)', () => {
      const zonData = `
users:@(2):id,name,role
1,Alice
2,Bob,admin
`;
      
      expect(() => decode(zonData)).toThrow(ZonDecodeError);
      expect(() => decode(zonData)).toThrow(/Field count mismatch/);
      expect(() => decode(zonData)).toThrow(/E002/);
    });

    test('should allow missing fields in non-strict mode', () => {
      const zonData = `
users:@(2):id,name,role
1,Alice
2,Bob,admin
`;
      
      const result = decode(zonData, { strict: false });
      expect(result.users).toHaveLength(2);
      expect(result.users[0].id).toBe(1);
      expect(result.users[0].name).toBe('Alice');
      expect(result.users[1]).toEqual({ id: 2, name: 'Bob', role: 'admin' });
    });

    test('should pass when all rows have correct field count (strict mode)', () => {
      const zonData = `
users:@(2):id,name,role
1,Alice,user
2,Bob,admin
`;
      
      const result = decode(zonData);
      expect(result.users).toHaveLength(2);
      expect(result.users[0]).toEqual({ id: 1, name: 'Alice', role: 'user' });
    });

    test('should allow sparse fields even in strict mode', () => {
      const zonData = `
users:@(2):id,name
1,Alice,role:admin,score:98
2,Bob
`;
      
      const result = decode(zonData);
      expect(result.users[0]).toEqual({ id: 1, name: 'Alice', role: 'admin', score: 98 });
      expect(result.users[1]).toEqual({ id: 2, name: 'Bob' });
    });
  });

  describe('Error Details', () => {
    test('should include error code in error object', () => {
      const zonData = `users:@(2):id,name
1,Alice`;
      
      try {
        decode(zonData);
        fail('Should have thrown');
      } catch (e: any) {
        expect(e).toBeInstanceOf(ZonDecodeError);
        expect(e.code).toBe('E001');
      }
    });

    test('should include context in error message', () => {
      const zonData = `users:@(2):id,name
1,Alice`;
      
      try {
        decode(zonData);
        fail('Should have thrown');
      } catch (e: any) {
        expect(e.context).toBeTruthy();
        expect(e.toString()).toContain('Table: users');
      }
    });
  });

  describe('Default Behavior', () => {
    test('strict mode should be enabled by default', () => {
      const zonData = `
users:@(2):id,name
1,Alice
`;
      
      expect(() => decode(zonData)).toThrow(ZonDecodeError);
    });

    test('can explicitly enable strict mode', () => {
      const zonData = `
users:@(2):id,name
1,Alice
`;
      
      expect(() => decode(zonData, { strict: true })).toThrow(ZonDecodeError);
    });
  });

  describe('Complex Scenarios', () => {
    test('should validate multiple tables independently', () => {
      const zonData = `
users:@(2):id,name
1,Alice
2,Bob
products:@(1):id,title
100,Widget
`;
      
      const result = decode(zonData);
      expect(result.users).toHaveLength(2);
      expect(result.products).toHaveLength(1);
    });

    test('should work with valid data across multiple tables', () => {
      const zonData = `
users:@(2):id,name
1,Alice
2,Bob
products:@(2):id,title
100,Widget
200,Gadget
`;
      
      const result = decode(zonData);
      expect(result.users).toHaveLength(2);
      expect(result.products).toHaveLength(2);
    });
  });
});
