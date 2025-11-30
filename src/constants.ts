/**
 * ZON Protocol Constants v1.0.5
 */

// Format markers
export const TABLE_MARKER = '@';
export const META_SEPARATOR = ':';

// Reserved tokens (for future use)
export const GAS_TOKEN = '_';      // Gas/placeholder
export const LIQUID_TOKEN = '^';   // Liquid/variable

// Default anchor interval for large datasets
export const DEFAULT_ANCHOR_INTERVAL = 100;

// Security limits (DOS prevention)
export const MAX_DOCUMENT_SIZE = 100 * 1024 * 1024;  // 100 MB
export const MAX_LINE_LENGTH = 1024 * 1024;          // 1 MB
export const MAX_ARRAY_LENGTH = 1_000_000;           // 1 million items
export const MAX_OBJECT_KEYS = 100_000;              // 100K keys
export const MAX_NESTING_DEPTH = 100;                // Already enforced in decoder

// Legacy compatibility (v1.x)
export const LEGACY_TABLE_MARKER = '@';     // Flatten lists with 1 item to metadata
export const INLINE_THRESHOLD_ROWS = 0;

// Legacy compatibility (kept for potential fallback)
export const DICT_REF_PREFIX = "%";
export const ANCHOR_PREFIX = "$";
export const REPEAT_SUFFIX = "x";
