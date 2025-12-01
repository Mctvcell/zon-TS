import { zon, validate } from '../schema';
import { encode } from '../encoder';

describe('ZON Schema Validation', () => {
  describe('Primitives', () => {
    it('should validate strings', () => {
      const schema = zon.string();
      expect(validate('hello', schema).success).toBe(true);
      expect(validate(123, schema).success).toBe(false);
    });

    it('should validate numbers', () => {
      const schema = zon.number();
      expect(validate(123, schema).success).toBe(true);
      expect(validate('123', schema).success).toBe(true);
      expect(validate('"123"', schema).success).toBe(false);
    });

    it('should validate booleans', () => {
      const schema = zon.boolean();
      expect(validate(true, schema).success).toBe(true);
      expect(validate('true', schema).success).toBe(true);
      expect(validate('"true"', schema).success).toBe(false);
    });
  });

  describe('Enums', () => {
    it('should validate enums', () => {
      const schema = zon.enum(['admin', 'user']);
      expect(validate('admin', schema).success).toBe(true);
      expect(validate('guest', schema).success).toBe(false);
    });
  });

  describe('Objects', () => {
    it('should validate simple objects', () => {
      const schema = zon.object({
        name: zon.string(),
        age: zon.number(),
      });
      const data = { name: 'Alice', age: 30 };
      expect(validate(data, schema).success).toBe(true);
    });

    it('should fail on missing keys', () => {
      const schema = zon.object({
        name: zon.string(),
        age: zon.number(),
      });
      const data = { name: 'Alice' };
      const result = validate(data, schema);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Expected number');
      }
    });

    it('should validate nested objects', () => {
      const schema = zon.object({
        user: zon.object({
          id: zon.number(),
        }),
      });
      const data = { user: { id: 1 } };
      expect(validate(data, schema).success).toBe(true);
    });
  });

  describe('Arrays', () => {
    it('should validate arrays of primitives', () => {
      const schema = zon.array(zon.number());
      expect(validate([1, 2, 3], schema).success).toBe(true);
      expect(validate([1, '2'], schema).success).toBe(false);
    });

    it('should validate arrays of objects', () => {
      const schema = zon.array(zon.object({ id: zon.number() }));
      expect(validate([{ id: 1 }, { id: 2 }], schema).success).toBe(true);
    });
  });

  describe('Optional Fields', () => {
    it('should handle optional fields', () => {
      const schema = zon.object({
        required: zon.string(),
        optional: zon.string().optional(),
      });
      
      expect(validate({ required: 'hi' }, schema).success).toBe(true);
      expect(validate({ required: 'hi', optional: 'there' }, schema).success).toBe(true);
      expect(validate({ required: 'hi', optional: 123 }, schema).success).toBe(false);
    });
  });

  describe('ZON Integration', () => {
    it('should validate from ZON string', () => {
      const schema = zon.object({
        name: zon.string(),
        active: zon.boolean(),
      });
      
      const zonStr = `
name:Alice
active:T
`;
      const result = validate(zonStr, schema);
      expect(result.success).toBe(true);
    });

    it('should return useful error messages for LLMs', () => {
      const schema = zon.object({
        age: zon.number(),
      });
      
      const zonStr = `age:"not a number"`;
      const result = validate(zonStr, schema);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Expected number at age");
      }
    });
  });

  describe('Prompt Generation', () => {
    it('should generate a prompt for a simple object', () => {
      const schema = zon.object({
        name: zon.string().describe('Full name'),
        age: zon.number().describe('Age in years'),
      });
      
      const prompt = schema.toPrompt();
      expect(prompt).toContain('name: string - Full name');
      expect(prompt).toContain('age: number - Age in years');
    });

    it('should generate a prompt for enums', () => {
      const schema = zon.enum(['admin', 'user']).describe('User role');
      const prompt = schema.toPrompt();
      expect(prompt).toContain('enum(admin, user) - User role');
    });

    it('should generate a prompt for nested objects', () => {
      const schema = zon.object({
        user: zon.object({
          id: zon.number(),
        }).describe('User details'),
      });
      
      const prompt = schema.toPrompt();
      expect(prompt).toContain('user: object: (User details)');
      expect(prompt).toContain('id: number');
    });
  });
});
