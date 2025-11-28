/**
 * Answer Validation System
 * 
 * Type-aware comparison that handles different representations of the same value
 * E.g., 50000 = $50,000 = 50k, "Engineering" = "engineering", true = "true"
 */

/**
 * Normalize a value for comparison
 */
function normalizeValue(value) {
  if (value === null || value === undefined) return null;
  
  const str = String(value).trim().toLowerCase();
  
  // Empty string
  if (str === '') return null;
  
  // Boolean normalization
  if (str === 'true' || str === 't' || str === 'yes' || str === '1') return 'true';
  if (str === 'false' || str === 'f' || str === 'no' || str === '0') return 'false';
  if (str === 'null' || str === 'none' || str === 'nil') return null;
  
  // Number normalization (remove formatting)
  // 50000 = $50,000 = 50k = 50,000.00
  const numMatch = str.match(/[\d,]+\.?\d*/);
  if (numMatch) {
    const cleaned = numMatch[0].replace(/,/g, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num)) {
      // Check for k/K suffix (50k = 50000)
      if (str.includes('k')) {
        return String(num * 1000);
      }
      return String(num);
    }
  }
  
  // Date normalization - try to parse as ISO date
  if (str.match(/^\d{4}-\d{2}-\d{2}/)) {
    return str.split('t')[0]; // Take just date part
  }
  
  // Array/list normalization - comma-separated values
  if (str.includes(',')) {
    return str.split(',').map(s => s.trim()).sort().join(',');
  }
  
  return str;
}

/**
 * Validate if actual answer matches expected answer
 * 
 * @param {string} actual - LLM's answer
 * @param {string} expected - Expected answer
 * @param {string} questionType - Type of question (for type-specific validation)
 * @returns {boolean} - True if answers match
 */
function validateAnswer(actual, expected, questionType) {
  // Normalize both values
  const normalizedActual = normalizeValue(actual);
  const normalizedExpected = normalizeValue(expected);
  
  // Null handling
  if (normalizedActual === null && normalizedExpected === null) return true;
  if (normalizedActual === null || normalizedExpected === null) return false;
  
  // Direct match
  if (normalizedActual === normalizedExpected) return true;
  
  // For structure questions, check if actual contains expected (flexible matching)
  if (questionType === 'structure') {
    // Check if all expected items are in actual
    const expectedParts = normalizedExpected.split(',');
    const actualParts = normalizedActual.split(',');
    return expectedParts.every(part => actualParts.includes(part));
  }
  
  // For numeric questions, allow small floating point differences
  const actualNum = parseFloat(normalizedActual);
  const expectedNum = parseFloat(normalizedExpected);
  if (!isNaN(actualNum) && !isNaN(expectedNum)) {
    return Math.abs(actualNum - expectedNum) < 0.01;
  }
  
  return false;
}

/**
 * Extract answer from LLM response
 * LLMs might return extra text like "The answer is: 42" or "Answer: 42"
 */
function extractAnswer(response) {
  if (!response) return '';
  
  const text = response.trim();
  
  // Try to extract after common patterns
  const patterns = [
    /answer:\s*(.+)/i,
    /the answer is:\s*(.+)/i,
    /result:\s*(.+)/i,
    /^(.+)$/  // Fallback: whole response
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return text;
}

module.exports = {
  validateAnswer,
  normalizeValue,
  extractAnswer
};

// Test if run directly
if (require.main === module) {
  console.log('🧪 Answer Validation Tests\n');
  console.log('═'.repeat(60));
  
  const tests = [
    // Number formatting
    {actual: '50000', expected: '$50,000', should: true},
    {actual: '50k', expected: '50000', should: true},
    {actual: '95000.00', expected: '95000', should: true},
    
    // Boolean variations
    {actual: 'true', expected: 'True', should: true},
    {actual: 'T', expected: 'true', should: true},
    {actual: 'yes', expected: 'true', should: true},
    {actual: 'false', expected: 'F', should: true},
    
    // Case insensitive
    {actual: 'Engineering', expected: 'engineering', should: true},
    {actual: 'ALICE', expected: 'alice', should: true},
    
    // Dates
    {actual: '2025-01-01', expected: '2025-01-01T00:00:00Z', should: true},
    
    // Lists/arrays
    {actual: 'a,b,c', expected: 'c,a,b', should: true},
    {actual: 'Engineering,Sales', expected: 'Sales,Engineering', should: true},
    
    // Extracted answers
    {actual: 'The answer is: 42', expected: '42', should: true},
    {actual: 'Answer: Engineering', expected: 'engineering', should: true},
    
    // Should fail
    {actual: '100', expected: '200', should: false},
    {actual: 'true', expected: 'false', should: false}
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach((test, i) => {
    const extracted = extractAnswer(test.actual);
    const result = validateAnswer(extracted, test.expected, 'field');
    const success = result === test.should;
    
    if (success) {
      passed++;
      console.log(`✅ Test ${i+1}: "${test.actual}" == "${test.expected}" → ${result}`);
    } else {
      failed++;
      console.log(`❌ Test ${i+1}: "${test.actual}" == "${test.expected}" → ${result} (expected ${test.should})`);
    }
  });
  
  console.log('\n' + '═'.repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('═'.repeat(60));
}
