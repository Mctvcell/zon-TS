import { TokenCounter } from './token-counter';
import { ZonEncoder } from '../core/encoder';

export class LLMOptimizer {
  private tokenizer: TokenCounter;

  constructor() {
    this.tokenizer = new TokenCounter();
  }

  /**
   * Optimizes the order of fields in an array of objects to minimize token usage.
   * 
   * @param data - Array of objects to optimize
   * @returns Data with optimized field order
   */
  optimizeFieldOrder(data: any[]): any[] {
    if (!Array.isArray(data) || data.length === 0) {
      return data;
    }

    const sample = data[0];
    if (typeof sample !== 'object' || sample === null) {
      return data;
    }

    const fields = Object.keys(sample);
    if (fields.length <= 1) {
      return data;
    }

    const encoder = new ZonEncoder();
    
    // Generate candidate orderings
    const orderings = this._generateOrderings(fields);
    
    let bestOrdering = fields;
    let minTokens = Infinity;

    const testData = data.slice(0, Math.min(data.length, 5));

    for (const ordering of orderings) {
      const reordered = this._reorderData(testData, ordering);
      const encoded = encoder.encode(reordered);
      const tokens = this.tokenizer.count(encoded);

      if (tokens < minTokens) {
        minTokens = tokens;
        bestOrdering = ordering;
      }
    }

    return this._reorderData(data, bestOrdering);
  }

  /**
   * Reorders data fields according to the specified ordering.
   * 
   * @param data - Data to reorder
   * @param ordering - Field order
   * @returns Reordered data
   */
  private _reorderData(data: any[], ordering: string[]): any[] {
    return data.map(row => {
      const newRow: any = {};
      for (const field of ordering) {
        if (field in row) {
          newRow[field] = row[field];
        }
      }
      
      for (const key of Object.keys(row)) {
        if (!ordering.includes(key)) {
          newRow[key] = row[key];
        }
      }
      return newRow;
    });
  }

  /**
   * Generates candidate field orderings to test.
   * 
   * @param fields - List of fields
   * @returns Array of candidate orderings
   */
  private _generateOrderings(fields: string[]): string[][] {
    const orderings: string[][] = [];

    orderings.push([...fields]);
    orderings.push([...fields].sort());
    orderings.push([...fields].sort((a, b) => a.length - b.length));
    orderings.push([...fields].sort((a, b) => b.length - a.length));

    return orderings;
  }
}
