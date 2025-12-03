/**
 * Binary ZON Format Constants and Type Markers
 * 
 * Inspired by MessagePack with ZON-specific extensions
 */

/**
 * Binary ZON magic header (4 bytes): "ZNB\x01"
 */
export const MAGIC_HEADER = new Uint8Array([0x5A, 0x4E, 0x42, 0x01]); // "ZNB" + version 1

/**
 * Type markers for Binary ZON
 * 
 * Layout inspired by MessagePack:
 * - 0x00-0x7F: Positive fixint (0-127)
 * - 0x80-0x8F: Fixmap (0-15 entries)
 * - 0x90-0x9F: Fixarray (0-15 elements)
 * - 0xA0-0xBF: Fixstr (0-31 bytes)
 * - 0xC0-0xDF: Special types & extensions
 */
export const TypeMarker = {
  // Special values
  NIL: 0xC0,
  FALSE: 0xC2,  // Changed from F to match bool values
  TRUE: 0xC3,   // Changed from T to match bool values
  
  // Binary data
  BIN8: 0xC4,   // Binary data (length: uint8)
  BIN16: 0xC5,  // Binary data (length: uint16)
  BIN32: 0xC6,  // Binary data (length: uint32)
  
  // Strings
  STR8: 0xD9,   // String (length: uint8)
  STR16: 0xDA,  // String (length: uint16)
  STR32: 0xDB,  // String (length: uint32)
  
  // Arrays
  ARRAY16: 0xDC,  // Array (length: uint16)
  ARRAY32: 0xDD,  // Array (length: uint32)
  
  // Maps/Objects
  MAP16: 0xDE,  // Map (length: uint16)
  MAP32: 0xDF,  // Map (length: uint32)
  
  // Floats
  FLOAT32: 0xCA,
  FLOAT64: 0xCB,
  
  // Integers
  UINT8: 0xCC,
  UINT16: 0xCD,
  UINT32: 0xCE,
  UINT64: 0xCF,
  
  INT8: 0xD0,
  INT16: 0xD1,
  INT32: 0xD2,
  INT64: 0xD3,
  
  // ZON-specific extensions (0xD4-0xD8)
  EXT_METADATA: 0xD4,      // Document metadata
  EXT_COMPRESSED: 0xD5,    // Compressed block
  EXT_TABLE: 0xD6,         // ZON table structure
  EXT_DELTA: 0xD7,         // Delta-encoded array
  EXT_SPARSE: 0xD8,        // Sparse array
} as const;

/**
 * Check if byte is a positive fixint (0x00-0x7F)
 */
export function isPositiveFixint(byte: number): boolean {
  return byte >= 0x00 && byte <= 0x7F;
}

/**
 * Check if byte is a negative fixint (0xE0-0xFF)
 */
export function isNegativeFixint(byte: number): boolean {
  return byte >= 0xE0 && byte <= 0xFF;
}

/**
 * Check if byte is a fixmap marker (0x80-0x8F)
 */
export function isFixmap(byte: number): boolean {
  return byte >= 0x80 && byte <= 0x8F;
}

/**
 * Get fixmap size from marker
 */
export function getFixmapSize(byte: number): number {
  return byte & 0x0F;
}

/**
 * Check if byte is a fixarray marker (0x90-0x9F)
 */
export function isFixarray(byte: number): boolean {
  return byte >= 0x90 && byte <= 0x9F;
}

/**
 * Get fixarray size from marker
 */
export function getFixarraySize(byte: number): number {
  return byte & 0x0F;
}

/**
 * Check if byte is a fixstr marker (0xA0-0xBF)
 */
export function isFixstr(byte: number): boolean {
  return byte >= 0xA0 && byte <= 0xBF;
}

/**
 * Get fixstr size from marker
 */
export function getFixstrSize(byte: number): number {
  return byte & 0x1F;
}

/**
 * Create fixint marker for positive integers 0-127
 */
export function createPositiveFixint(value: number): number {
  return value & 0x7F;
}

/**
 * Create negative fixint marker for integers -32 to -1
 */
export function createNegativeFixint(value: number): number {
  return value & 0xFF;
}

/**
 * Create fixmap marker for maps with 0-15 entries
 */
export function createFixmap(size: number): number {
  return 0x80 | (size & 0x0F);
}

/**
 * Create fixarray marker for arrays with 0-15 elements
 */
export function createFixarray(size: number): number {
  return 0x90 | (size & 0x0F);
}

/**
 * Create fixstr marker for strings with 0-31 bytes
 */
export function createFixstr(size: number): number {
  return 0xA0 | (size & 0x1F);
}
