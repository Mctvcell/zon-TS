const { AzureAIClient } = require('./llm-client');
const fs = require('fs');
const path = require('path');
const { unifiedDataset } = require('./datasets');

const OUTPUT_FILE = path.join(__dirname, 'questions-309.js');

async function generateQuestions() {
  const client = new AzureAIClient();
  const dataStr = JSON.stringify(unifiedDataset, null, 2);

  const prompt = `
  I need to generate a diverse set of 309 benchmark questions for the following dataset.
  The questions should test an LLM's ability to retrieve specific fields, filter lists, aggregate data, and understand structure.
  
  Dataset:
  ${dataStr}
  
  Please generate 309 unique questions in JSON format.
  The output should be a JSON array of objects with the following structure:
  { "q": "Question text", "a": "Expected answer", "type": "field|filtering|aggregation|structure|validation" }
  
  Ensure a mix of:
  - Simple retrieval (e.g., "What is X?")
  - Nested retrieval (e.g., "What is the port of the database?")
  - Filtering (e.g., "How many users are active?")
  - Complex filtering (e.g., "Users with role 'admin' and active=true")
  - Aggregation (e.g., "Sum of...", "Average of...")
  - Negative constraints (e.g., "Who is NOT active?")
  - Structural checks (e.g., "Does 'config' have 'cache'?")
  
  IMPORTANT: Return ONLY the JSON array. No markdown, no explanations.
  `;

  console.log('🚀 Generating 309 questions with GPT-5...');
  try {
    // Requesting a large token limit to accommodate 200 questions
    const result = await client.query('gpt-5-nano', prompt, 16000); 
    
    let jsonStr = result.answer;
    // Clean up markdown if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\n/, '').replace(/\n```$/, '');
    }
    
    const questions = JSON.parse(jsonStr);
    console.log(`✅ Generated ${questions.length} questions.`);
    
    const fileContent = `
/**
 * Auto-generated 200 Benchmark Questions
 */
const questions = ${JSON.stringify(questions, null, 2)};

module.exports = { unifiedDataset: questions };
`;

    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log(`💾 Saved to ${OUTPUT_FILE}`);
    
  } catch (e) {
    console.error('❌ Generation failed:', e);
  }
}

generateQuestions();
