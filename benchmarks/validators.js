/**
 * Normalizes a value for comparison.
 * 
 * @param {any} value - Value to normalize
 * @returns {string|null} Normalized value
 */
function normalizeValue(value) {
  if (value === null || value === undefined) return null;
  
  const str = String(value).trim().toLowerCase();
  
  if (str === '') return null;
  
  if (str === 'true' || str === 't' || str === 'yes' || str === '1') return 'true';
  if (str === 'false' || str === 'f' || str === 'no' || str === '0') return 'false';
  if (str === 'null' || str === 'none' || str === 'nil') return null;
  
  const numMatch = str.match(/[\\d,]+\\.?\\d*/);
  if (numMatch) {
    const cleaned = numMatch[0].replace(/,/g, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num)) {
      if (str.includes('k')) {
        return String(num * 1000);
      }
      return String(num);
    }
  }
  
  if (str.match(/^\\d{4}-\\d{2}-\\d{2}/)) {
    return str.split('t')[0];
  }
  
  if (str.includes(',')) {
    return str.split(',').map(s => s.trim()).sort().join(',');
  }
  
  return str;
}

/**
 * Validates if actual answer matches expected answer.
 * 
 * @param {string} actual - LLM's answer
 * @param {string} expected - Expected answer
 * @param {string} questionType - Type of question
 * @returns {boolean} True if answers match
 */
function validateAnswer(actual, expected, questionType) {
  const normalizedActual = normalizeValue(actual);
  const normalizedExpected = normalizeValue(expected);
  
  if (normalizedActual === null && normalizedExpected === null) return true;
  if (normalizedActual === null || normalizedExpected === null) return false;
  
  if (normalizedActual === normalizedExpected) return true;
  
  if (questionType === 'structure') {
    const expectedParts = normalizedExpected.split(',');
    const actualParts = normalizedActual.split(',');
    return expectedParts.every(part => actualParts.includes(part));
  }
  
  const actualNum = parseFloat(normalizedActual);
  const expectedNum = parseFloat(normalizedExpected);
  if (!isNaN(actualNum) && !isNaN(expectedNum)) {
    return Math.abs(actualNum - expectedNum) < 0.01;
  }
  
  return false;
}

/**
 * Extracts answer from LLM response.
 * 
 * @param {string} response - LLM response text
 * @returns {string} Extracted answer
 */
function extractAnswer(response) {
  if (!response) return '';
  
  const text = response.trim();
  
  const patterns = [
    /answer:\\s*(.+)/i,
    /the answer is:\\s*(.+)/i,
    /result:\\s*(.+)/i,
    /^(.+)$/
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

if (require.main === module) {
  console.log('🧪 Answer Validation Tests\\n');
  console.log('═'.repeat(60));
  
  const tests = [
    {actual: '50000', expected: '$50,000', should: true},
    {actual: '50k', expected: '50000', should: true},
    {actual: '95000.00', expected: '95000', should: true},
    {actual: 'true', expected: 'True', should: true},
    {actual: 'T', expected: 'true', should: true},
    {actual: 'yes', expected: 'true', should: true},
    {actual: 'false', expected: 'F', should: true},
    {actual: 'Engineering', expected: 'engineering', should: true},
    {actual: 'ALICE', expected: 'alice', should: true},
    {actual: '2025-01-01', expected: '2025-01-01T00:00:00Z', should: true},
    {actual: 'a,b,c', expected: 'c,a,b', should: true},
    {actual: 'Engineering,Sales', expected: 'Sales,Engineering', should: true},
    {actual: 'The answer is: 42', expected: '42', should: true},
    {actual: 'Answer: Engineering', expected: 'engineering', should: true},
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
  
  console.log('\\n' + '═'.repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('═'.repeat(60));
}
