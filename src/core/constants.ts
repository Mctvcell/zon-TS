/** Marker for table headers (@) */
export const TABLE_MARKER = '@';
/** Separator for metadata keys and values (:) */
export const META_SEPARATOR = ':';

export const GAS_TOKEN = '_';
export const LIQUID_TOKEN = '^';

/** Default interval for anchor points in sparse arrays */
export const DEFAULT_ANCHOR_INTERVAL = 100;

/** Maximum document size in bytes (100MB) */
export const MAX_DOCUMENT_SIZE = 100 * 1024 * 1024;
/** Maximum line length in characters (1MB) */
export const MAX_LINE_LENGTH = 1024 * 1024;
/** Maximum array length (1M items) */
export const MAX_ARRAY_LENGTH = 1_000_000;
/** Maximum number of object keys (100K) */
export const MAX_OBJECT_KEYS = 100_000;
/** Maximum nesting depth (100 levels) */
export const MAX_NESTING_DEPTH = 100;

export const LEGACY_TABLE_MARKER = '@';
export const INLINE_THRESHOLD_ROWS = 0;

export const DICT_REF_PREFIX = "%";
export const ANCHOR_PREFIX = "$";
export const REPEAT_SUFFIX = "x";
