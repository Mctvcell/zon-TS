/**
 * CSV Encoder for Benchmark Comparisons
 * Converts JSON data structures to CSV format
 */

/**
 * Convert array of objects to CSV
 * @param {Array<Object>} data - Array of objects to convert
 * @returns {string} CSV formatted string
 */
/**
 * Convert array of objects to delimited text (CSV/TSV)
 * @param {Array<Object>} data - Array of objects to convert
 * @param {string} delimiter - Delimiter character (default: ',')
 * @returns {string} Formatted string
 */
function arrayToDelimited(data, delimiter = ',') {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  // Handle array of primitives
  if (typeof data[0] !== 'object' || data[0] === null) {
    return data.join(delimiter);
  }

  // Get all unique keys from all objects (for semi-uniform data)
  const allKeys = new Set();
  data.forEach(obj => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => allKeys.add(key));
    }
  });
  const headers = Array.from(allKeys);

  // Create header row
  const headerRow = headers.join(delimiter);

  // Create data rows
  const dataRows = data.map(obj => {
    return headers.map(header => {
      const value = obj[header];
      
      // Handle missing values
      if (value === undefined || value === null) {
        return '';
      }
      
      // Handle nested objects/arrays - convert to JSON
      if (typeof value === 'object') {
        const jsonStr = JSON.stringify(value);
        // Escape quotes and wrap in quotes if contains delimiter or quote
        return `"${jsonStr.replace(/"/g, '""')}"`;
      }
      
      // Handle strings that need escaping
      if (typeof value === 'string') {
        if (value.includes(delimiter) || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }
      
      return String(value);
    }).join(delimiter);
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Convert object to delimited text (handles nested structures)
 * @param {Object} data - Object to convert
 * @param {string} delimiter - Delimiter character
 * @returns {string} Formatted string
 */
function objectToDelimited(data, delimiter = ',') {
  if (!data || typeof data !== 'object') {
    return String(data);
  }

  const parts = [];
  
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      // Add section header
      parts.push(`\n# ${key}`);
      parts.push(arrayToDelimited(value, delimiter));
    } else if (Array.isArray(value)) {
      // Simple array - add as key-value
      parts.push(`${key}${delimiter}${value.join(delimiter)}`);
    } else if (typeof value === 'object' && value !== null) {
      // Nested object - flatten or convert to JSON
      parts.push(`${key}${delimiter}"${JSON.stringify(value).replace(/"/g, '""')}"`);
    } else {
      // Simple value
      parts.push(`${key}${delimiter}${value}`);
    }
  }
  
  return parts.join('\n');
}

/**
 * Main CSV encoder
 */
function encodeToCSV(data) {
  if (Array.isArray(data)) {
    return arrayToDelimited(data, ',');
  }
  if (data && typeof data === 'object') {
    return objectToDelimited(data, ',');
  }
  return String(data);
}

/**
 * Main TSV encoder
 */
function encodeToTSV(data) {
  if (Array.isArray(data)) {
    return arrayToDelimited(data, '\t');
  }
  if (data && typeof data === 'object') {
    return objectToDelimited(data, '\t');
  }
  return String(data);
}

module.exports = {
  encodeToCSV,
  encodeToTSV
};
