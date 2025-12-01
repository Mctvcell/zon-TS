import { zon } from '../schema/schema';

describe('Schema Phase 1 Enhancements', () => {
  describe('Regex Pattern Validation', () => {
    it('validates custom patterns', () => {
      const schema = zon.string().regex(/^[A-Z]{3}-\d{4}$/);
      
      const valid = schema.parse('ABC-1234');
      expect(valid.success).toBe(true);
      
      const invalid = schema.parse('abc-1234');
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error).toContain('Pattern mismatch');
      }
    });

    it('accepts custom error message', () => {
      const schema = zon.string().regex(/^\d{3}-\d{2}-\d{4}$/, 'Invalid SSN format');
      
      const invalid = schema.parse('123-45-678');
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error).toContain('Invalid SSN format');
      }
    });

    it('validates order IDs', () => {
      const schema = zon.string().regex(/^ORD-\d{6}$/);
      
      expect(schema.parse('ORD-123456').success).toBe(true);
      expect(schema.parse('ORD-12345').success).toBe(false);
      expect(schema.parse('ord-123456').success).toBe(false);
    });
  });

  describe('UUID Validation', () => {
    it('validates any UUID format', () => {
      const schema = zon.string().uuid();
      
      const valid1 = schema.parse('123e4567-e89b-12d3-a456-426614174000');
      expect(valid1.success).toBe(true);
      
      const valid2 = schema.parse('550e8400-e29b-41d4-a716-446655440000');
      expect(valid2.success).toBe(true);
      
      const invalid = schema.parse('not-a-uuid');
      expect(invalid.success).toBe(false);
    });

    it('validates UUID v4 specifically', () => {
      const schema = zon.string().uuid('v4');
      
      const valid = schema.parse('123e4567-e89b-42d3-a456-426614174000');
      expect(valid.success).toBe(true);
      
      const invalid = schema.parse('123e4567-e89b-12d3-a456-426614174000');
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error).toContain('UUID v4');
      }
    });
  });

  describe('DateTime Validation', () => {
    it('validates ISO 8601 datetime', () => {
      const schema = zon.string().datetime();
      
      expect(schema.parse('2024-01-01T12:00:00Z').success).toBe(true);
      expect(schema.parse('2024-01-01T12:00:00+05:30').success).toBe(true);
      expect(schema.parse('2024-01-01').success).toBe(false);
      expect(schema.parse('12:00:00').success).toBe(false);
    });

    it('validates date only (YYYY-MM-DD)', () => {
      const schema = zon.string().date();
      
      expect(schema.parse('2024-01-01').success).toBe(true);
      expect(schema.parse('2024-01-01T12:00:00Z').success).toBe(false);
    });

    it('validates time only (HH:MM:SS)', () => {
      const schema = zon.string().time();
      
      expect(schema.parse('12:30:45').success).toBe(true);
      expect(schema.parse('23:59:59').success).toBe(true);
      expect(schema.parse('12:30').success).toBe(false);
      expect(schema.parse('2024-01-01T12:00:00Z').success).toBe(false);
    });
  });

  describe('Literal Values', () => {
    it('matches exact string literal', () => {
      const schema = zon.literal('approved');
      
      expect(schema.parse('approved').success).toBe(true);
      expect(schema.parse('pending').success).toBe(false);
      expect(schema.parse('Approved').success).toBe(false);
    });

    it('matches exact number literal', () => {
      const schema = zon.literal(42);
      
      expect(schema.parse(42).success).toBe(true);
      expect(schema.parse(43).success).toBe(false);
      expect(schema.parse('42').success).toBe(false);
    });

    it('matches exact boolean literal', () => {
      const schema = zon.literal(true);
      
      expect(schema.parse(true).success).toBe(true);
      expect(schema.parse(false).success).toBe(false);
      expect(schema.parse('true').success).toBe(false);
    });
  });

  describe('Union Types', () => {
    it('accepts string or number', () => {
      const schema = zon.union(zon.string(), zon.number());
      
      expect(schema.parse('hello').success).toBe(true);
      expect(schema.parse(42).success).toBe(true);
      expect(schema.parse(true).success).toBe(false);
    });

    it('handles multiple literals', () => {
      const schema = zon.union(
        zon.literal('pending'),
        zon.literal('approved'),
        zon.literal('rejected')
      );
      
      expect(schema.parse('pending').success).toBe(true);
      expect(schema.parse('approved').success).toBe(true);
      expect(schema.parse('rejected').success).toBe(true);
      expect(schema.parse('unknown').success).toBe(false);
    });

    it('works with complex types', () => {
      const schema = zon.union(
        zon.object({ type: zon.literal('text'), content: zon.string() }),
        zon.object({ type: zon.literal('number'), value: zon.number() })
      );
      
      expect(schema.parse({ type: 'text', content: 'hello' }).success).toBe(true);
      expect(schema.parse({ type: 'number', value: 42 }).success).toBe(true);
      expect(schema.parse({ type: 'boolean', value: true }).success).toBe(false);
    });
  });

  describe('Default Values', () => {
    it('uses default for undefined', () => {
      const schema = zon.string().default('unknown');
      
      const result = schema.parse(undefined);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('unknown');
      }
    });

    it('uses default for null', () => {
      const schema = zon.number().default(0);
      
      const result = schema.parse(null);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(0);
      }
    });

    it('does not override valid values', () => {
      const schema = zon.string().default('default');
      
      const result = schema.parse('actual');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('actual');
      }
    });

    it('works with complex types', () => {
      const schema = zon.object({ name: zon.string() }).default({ name: 'Anonymous' });
      
      const result = schema.parse(undefined);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'Anonymous' });
      }
    });
  });

  describe('Custom Refinements', () => {
    it('validates with custom logic', () => {
      const schema = zon.number().refine((val) => val % 2 === 0, 'Must be even');
      
      expect(schema.parse(2).success).toBe(true);
      expect(schema.parse(4).success).toBe(true);
      
      const odd = schema.parse(3);
      expect(odd.success).toBe(false);
      if (!odd.success) {
        expect(odd.error).toContain('Must be even');
      }
    });

    it('validates string length custom', () => {
      const schema = zon.string().refine(
        (val) => val.split(' ').length <= 10,
        'Maximum 10 words'
      );
      
      expect(schema.parse('Hello world').success).toBe(true);
      expect(schema.parse('one two three four five six seven eight nine ten eleven').success).toBe(false);
    });

    it('validates cross-field constraints', () => {
      const schema = zon.object({
        password: zon.string().min(8),
        confirmPassword: zon.string()
      }).refine(
        (data) => data.password === data.confirmPassword,
        'Passwords must match'
      );
      
      expect(schema.parse({ password: 'secret123', confirmPassword: 'secret123' }).success).toBe(true);
      
      const mismatch = schema.parse({ password: 'secret123', confirmPassword: 'different' });
      expect(mismatch.success).toBe(false);
      if (!mismatch.success) {
        expect(mismatch.error).toContain('Passwords must match');
      }
    });
  });

  describe('Combined Features', () => {
    it('uses regex with default', () => {
      const schema = zon.string().regex(/^[A-Z]{3}$/).default('ABC');
      
      const result = schema.parse(undefined);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('ABC');
      }
    });

    it('uses union with refinement', () => {
      const schema = zon.union(zon.string(), zon.number())
        .refine((val) => val !== '', 'Cannot be empty');
      
      expect(schema.parse('hello').success).toBe(true);
      expect(schema.parse(42).success).toBe(true);
      expect(schema.parse('').success).toBe(false);
    });

    it('creates complex LLM schema', () => {
      const schema = zon.object({
        orderId: zon.string().regex(/^ORD-\d{6}$/).describe('Order ID'),
        status: zon.union(
          zon.literal('pending'),
          zon.literal('approved'),
          zon.literal('rejected')
        ),
        amount: zon.number().positive().min(0),
        customerId: zon.string().uuid().optional(),
        createdAt: zon.string().datetime().default(new Date().toISOString()),
      }).refine(
        (data) => data.status !== 'approved' || data.amount > 0,
        'Approved orders must have positive amount'
      );

      const valid = {
        orderId: 'ORD-123456',
        status: 'approved',
        amount: 100,
        customerId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: '2024-01-01T12:00:00Z'
      };

      expect(schema.parse(valid).success).toBe(true);
    });
  });

  describe('toPrompt() Updates', () => {
    it('includes regex in prompt', () => {
      const schema = zon.string().regex(/^\d{3}$/);
      expect(schema.toPrompt()).toContain('pattern');
    });

    it('includes UUID in prompt', () => {
      const schema = zon.string().uuid('v4');
      expect(schema.toPrompt()).toContain('uuid-v4');
    });

    it('includes datetime in prompt', () => {
      const schema = zon.string().datetime();
      expect(schema.toPrompt()).toContain('datetime');
    });

    it('shows literal value in prompt', () => {
      const schema = zon.literal('approved');
      expect(schema.toPrompt()).toContain('"approved"');
    });

    it('shows union options in prompt', () => {
      const schema = zon.union(zon.string(), zon.number());
      const prompt = schema.toPrompt();
      expect(prompt).toContain('oneOf');
      expect(prompt).toContain('|');
    });

    it('shows default value in prompt', () => {
      const schema = zon.string().default('unknown');
      expect(schema.toPrompt()).toContain('default: "unknown"');
    });
  });
});
