export class TokenCounter {
  /**
   * Estimates the number of tokens in a string.
   * Uses a simple heuristic: ~4 characters per token.
   * 
   * @param text - Text to count tokens for
   * @returns Estimated token count
   */
  count(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  /**
   * Estimates tokens for a specific model (placeholder for future expansion).
   * 
   * @param text - Text to count
   * @param model - Model identifier
   * @returns Estimated token count
   */
  countForModel(text: string, model: string): number {
    return this.count(text);
  }
}
