import { encodeAdaptive } from '../core/adaptive';
import { decode } from '../core/decoder';

describe('Smart Quoting', () => {
  it('should use single quotes for JSON strings', () => {
    const data = { json: '{"key": "value"}' };
    const output = encodeAdaptive(data, { mode: 'compact' }) as string;
    expect(output).toBe("json:'{\"key\": \"value\"}'");
    
    const decoded = decode(output);
    expect(decoded).toEqual(data);
  });

  it('should allow unquoted strings with spaces', () => {
    const data = { text: "hello world" };
    const output = encodeAdaptive(data, { mode: 'compact' }) as string;
    expect(output).toBe('text:hello world');
    
    const decoded = decode(output);
    expect(decoded).toEqual(data);
  });

  it('should allow unquoted strings with single quotes', () => {
    const data = { text: "It's me" };
    const output = encodeAdaptive(data, { mode: 'compact' }) as string;
    expect(output).toBe("text:It's me");
    
    const decoded = decode(output);
    expect(decoded).toEqual(data);
  });
});
