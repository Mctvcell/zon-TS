/**
 * Quotes a string for ZON format if necessary.
 * 
 * @param s - The string to quote
 * @returns The quoted string
 */
export function quoteString(s: string): string {
  if (/^-?\d+(\.\d+)?$/.test(s)) return `"${s}"`;
  if (/^(true|false|t|f|null|none|nil)$/i.test(s)) return `"${s}"`;
  
  if (/^[a-zA-Z0-9_\-\.]+$/.test(s)) return s;
  
  const json = JSON.stringify(s);
  const inner = json.slice(1, -1);
  const zon = inner.replace(/\\"/g, '""');
  return `"${zon}"`;
}

/**
 * Parses a ZON value string into its corresponding primitive type.
 * 
 * @param val - The string value to parse
 * @returns The parsed value (boolean, null, number, or string)
 */
/**
 * Parses a ZON value string into its corresponding primitive type.
 * Handles booleans, nulls, numbers, and quoted strings.
 * 
 * @param val - The string value to parse
 * @returns The parsed value (boolean, null, number, or string)
 */
export function parseValue(val: string): any {
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();

  if (lower === 't' || lower === 'true') return true;
  if (lower === 'f' || lower === 'false') return false;
  if (lower === 'null' || lower === 'none' || lower === 'nil') return null;

  if (trimmed.startsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      if (trimmed.endsWith('"')) {
        return trimmed.slice(1, -1).replace(/""/g, '"');
      }
    }
  }

  if (trimmed !== '') {
    const num = Number(trimmed);
    if (!Number.isNaN(num)) return num;
  }
  
  return trimmed;
}
