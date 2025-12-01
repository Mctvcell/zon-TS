export interface ZonDecodeErrorDetails {
  code?: string;
  line?: number;
  column?: number;
  context?: string;
}

export class ZonDecodeError extends Error {
  code?: string;
  line?: number;
  column?: number;
  context?: string;

  constructor(message: string, details?: ZonDecodeErrorDetails) {
    super(message);
    this.name = 'ZonDecodeError';
    this.code = details?.code;
    this.line = details?.line;
    this.column = details?.column;
    this.context = details?.context;
    Object.setPrototypeOf(this, ZonDecodeError.prototype);
  }

  toString(): string {
    let msg = `${this.name}`;
    if (this.code) msg += ` [${this.code}]`;
    msg += `: ${this.message}`;
    if (this.line) msg += ` (line ${this.line})`;
    if (this.context) msg += `\n  Context: ${this.context}`;
    return msg;
  }
}
