import { encode, decode } from '../index';

describe('Security & Robustness', () => {
  describe('Prototype Pollution', () => {
    test('should reject __proto__ keys', () => {
      const malicious = `
@data(1): id, __proto__.polluted
1, true
`;
      const decoded = decode(malicious);
      // @ts-ignore
      expect({}.polluted).toBeUndefined();
      // @ts-ignore
      expect(Object.prototype['polluted']).toBeUndefined();
    });

    test('should reject constructor.prototype keys', () => {
      const malicious = `
@data(1): id, constructor.prototype.polluted
1, true
`;
      const decoded = decode(malicious);
      // @ts-ignore
      expect({}.polluted).toBeUndefined();
    });
  });

  describe('Denial of Service (DoS)', () => {
    test('should throw on deep nesting in decoder', () => {
      const depth = 150;
      const deepZon = '['.repeat(depth) + ']' + ']'.repeat(depth - 1);
      
      expect(() => decode(deepZon)).toThrow('Maximum nesting depth exceeded');
    });
  });

  describe('Circular References', () => {
    test('should throw on circular reference in encoder', () => {
      const circular: any = { name: 'loop' };
      circular.self = circular;

      expect(() => encode(circular)).toThrow('Circular reference detected');
    });

    test('should throw on indirect circular reference', () => {
      const a: any = { name: 'a' };
      const b: any = { name: 'b' };
      a.next = b;
      b.next = a;

      expect(() => encode(a)).toThrow('Circular reference detected');
    });
  });
});
