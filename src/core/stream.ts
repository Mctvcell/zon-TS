import { ZonEncoder } from './encoder';
import { ZonDecoder } from './decoder';
import { quoteString, parseValue } from './utils';

/**
 * Streaming Encoder for ZON format.
 * Uses Async Generators to process data chunk by chunk, suitable for large datasets.
 */
export class ZonStreamEncoder {
  private encoder: ZonEncoder;
  private hasWrittenHeader: boolean = false;
  private columns: string[] | null = null;

  constructor() {
    this.encoder = new ZonEncoder();
  }

  /**
   * Encodes a stream of objects into ZON format.
   * Assumes the stream consists of uniform objects (table format).
   * 
   * @param source - Iterable or AsyncIterable of objects
   * @returns AsyncGenerator yielding ZON string chunks
   * @throws Error if the source contains non-object items
   */
  async *encode(source: Iterable<any> | AsyncIterable<any>): AsyncGenerator<string> {
    for await (const item of source) {
      if (!this.hasWrittenHeader) {
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          this.columns = Object.keys(item).sort();
          const header = `@:${this.columns.join(',')}`;
          yield header;
          this.hasWrittenHeader = true;
        } else {
          throw new Error("ZonStreamEncoder currently only supports streams of objects (tables).");
        }
      }

      if (this.columns) {
        const row = this.columns.map(col => {
          const val = item[col];
          return this._formatValue(val);
        });
        yield "\n" + row.join(',');
      }
    }
  }

  /**
   * Formats a single value for ZON output.
   * 
   * @param val - The value to format
   * @returns The formatted string
   */
  private _formatValue(val: any): string {
    if (val === true) return 'T';
    if (val === false) return 'F';
    if (val === null || val === undefined) return 'null';
    if (typeof val === 'number') {
        if (Number.isNaN(val) || !Number.isFinite(val)) return 'null';
        return val.toString();
    }
    const s = String(val);
    return quoteString(s);
  }
}

/**
 * Streaming Decoder for ZON format.
 * Processes string chunks and yields parsed objects.
 */
export class ZonStreamDecoder {
  private decoder: ZonDecoder;
  private buffer: string = '';
  private columns: string[] | null = null;
  private isTable: boolean = false;

  constructor() {
    this.decoder = new ZonDecoder();
  }

  /**
   * Decodes a stream of ZON string chunks into objects.
   * 
   * @param source - Iterable or AsyncIterable of string chunks
   * @returns AsyncGenerator yielding parsed objects
   */
  async *decode(source: Iterable<string> | AsyncIterable<string>): AsyncGenerator<any> {
    for await (const chunk of source) {
      this.buffer += chunk;
      
      let newlineIdx: number;
      while ((newlineIdx = this.buffer.indexOf('\n')) !== -1) {
        const line = this.buffer.slice(0, newlineIdx).trim();
        this.buffer = this.buffer.slice(newlineIdx + 1);

        if (!line) continue;

        if (!this.columns) {
          if (line.startsWith('@')) {
            this.isTable = true;
            const parts = line.split(':');
            const colPart = parts[parts.length - 1];
            this.columns = colPart.split(',');
          }
        } else {
          const values = this._parseRow(line);
          const obj: Record<string, any> = {};
          this.columns.forEach((col, i) => {
            if (i < values.length) {
              obj[col] = values[i];
            }
          });
          yield obj;
        }
      }
    }
    
    if (this.buffer.trim()) {
       const line = this.buffer.trim();
       if (this.columns) {
          const values = this._parseRow(line);
          const obj: Record<string, any> = {};
          this.columns.forEach((col, i) => {
            if (i < values.length) {
              obj[col] = values[i];
            }
          });
          yield obj;
       }
    }
  }

  /**
   * Parses a single row of ZON data.
   * 
   * @param line - The line to parse
   * @returns Array of parsed values
   */
  private _parseRow(line: string): any[] {
    const values: any[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(parseValue(current));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(parseValue(current));
    return values;
  }
}
