/**
 * Converts array of objects to delimited text format.
 * 
 * @param {Array<Object>} data - Array of objects to convert
 * @param {string} delimiter - Delimiter character
 * @returns {string} Formatted string
 */
function arrayToDelimited(data, delimiter = ',') {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  if (typeof data[0] !== 'object' || data[0] === null) {
    return data.join(delimiter);
  }

  const allKeys = new Set();
  data.forEach(obj => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => allKeys.add(key));
    }
  });
  const headers = Array.from(allKeys);

  const headerRow = headers.join(delimiter);

  const dataRows = data.map(obj => {
    return headers.map(header => {
      const value = obj[header];
      
      if (value === undefined || value === null) {
        return '';
      }
      
      if (typeof value === 'object') {
        const jsonStr = JSON.stringify(value);
        return `"${jsonStr.replace(/"/g, '""')}"`;
      }
      
      if (typeof value === 'string') {
        if (value.includes(delimiter) || value.includes('"') || value.includes('\\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }
      
      return String(value);
    }).join(delimiter);
  });

  return [headerRow, ...dataRows].join('\\n');
}

/**
 * Converts object to delimited text format.
 * 
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
      parts.push(`\\n# ${key}`);
      parts.push(arrayToDelimited(value, delimiter));
    } else if (Array.isArray(value)) {
      parts.push(`${key}${delimiter}${value.join(delimiter)}`);
    } else if (typeof value === 'object' && value !== null) {
      parts.push(`${key}${delimiter}"${JSON.stringify(value).replace(/"/g, '""')}"`);
    } else {
      parts.push(`${key}${delimiter}${value}`);
    }
  }
  
  return parts.join('\\n');
}

/**
 * Encodes data to CSV format.
 * 
 * @param {any} data - Data to encode
 * @returns {string} CSV formatted string
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
 * Encodes data to TSV format.
 * 
 * @param {any} data - Data to encode
 * @returns {string} TSV formatted string
 */
function encodeToTSV(data) {
  if (Array.isArray(data)) {
    return arrayToDelimited(data, '\\t');
  }
  if (data && typeof data === 'object') {
    return objectToDelimited(data, '\\t');
  }
  return String(data);
}

module.exports = {
  encodeToCSV,
  encodeToTSV
};
