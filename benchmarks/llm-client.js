require('dotenv').config();
const { AzureOpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

const CACHE_DIR = process.env.CACHE_DIR || path.join(__dirname, '.cache');
const USE_CACHE = true;

if (USE_CACHE && !fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, {recursive: true});
}

/**
 * Azure AI client for querying multiple LLM models.
 */
class AzureAIClient {
  constructor() {
    if (!process.env.AZURE_OPENAI_API_KEY) {
      throw new Error('AZURE_OPENAI_API_KEY not set in .env file');
    }
    if (!process.env.AZURE_OPENAI_ENDPOINT) {
      throw new Error('AZURE_OPENAI_ENDPOINT not set in .env file');
    }
    
    this.client = new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01'
    });
    
    this.models = {
      'gpt-5-nano': process.env.AZURE_GPT5_DEPLOYMENT || 'gpt-5-nano',
      'grok-3': process.env.AZURE_GROK3_DEPLOYMENT || 'grok-3',
      'deepseek-v3.1': process.env.AZURE_DEEPSEEK_DEPLOYMENT || 'DeepSeek-V3.1',
      'Llama-3.3-70B-Instruct': process.env.AZURE_LLAMA33_DEPLOYMENT || 'Llama-3.3-70B-Instruct'
    };
    
    console.log(`✅ Azure AI client initialized`);
    console.log(`   Endpoint: ${process.env.AZURE_OPENAI_ENDPOINT}`);
    console.log(`   Models: ${Object.keys(this.models).join(', ')}`);
  }
  
  /**
   * Generates cache key for a query.
   * 
   * @param {string} model - Model name
   * @param {string} prompt - Prompt text
   * @returns {string} Cache file path
   */
  _getCacheKey(model, prompt) {
    const crypto = require('crypto');
    const hash = crypto.createHash('md5')
      .update(`${model}:${prompt}`)
      .digest('hex');
    return path.join(CACHE_DIR, `${hash}.json`);
  }
  
  /**
   * Retrieves cached response if available.
   * 
   * @param {string} model - Model name
   * @param {string} prompt - Prompt text
   * @returns {Object|null} Cached response or null
   */
  _getCache(model, prompt) {
    if (!USE_CACHE) return null;
    
    const cacheFile = this._getCacheKey(model, prompt);
    if (fs.existsSync(cacheFile)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        return cached;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
  
  /**
   * Saves response to cache.
   * 
   * @param {string} model - Model name
   * @param {string} prompt - Prompt text
   * @param {Object} response - Response to cache
   */
  _setCache(model, prompt, response) {
    if (!USE_CACHE) return;
    
    const cacheFile = this._getCacheKey(model, prompt);
    try {
      fs.writeFileSync(cacheFile, JSON.stringify(response, null, 2));
    } catch (e) {
      console.warn(`Failed to cache response: ${e.message}`);
    }
  }
  
  /**
   * Queries a model with a prompt.
   * 
   * @param {string} modelName - Model to query
   * @param {string} prompt - Prompt to send
   * @param {number} maxTokens - Maximum tokens in response
   * @returns {Promise<{answer: string, tokensUsed: number, cached: boolean}>}
   */
  async query(modelName, prompt, maxTokens = 2000) {
    const cached = this._getCache(modelName, prompt);
    if (cached) {
      return {
        answer: cached.answer,
        tokensUsed: cached.tokensUsed,
        cached: true
      };
    }
    
    const deployment = this.models[modelName];
    if (!deployment) {
      throw new Error(`Unknown model: ${modelName}. Available: ${Object.keys(this.models).join(', ')}`);
    }
    
    const MAX_RETRIES = 15;
    let retries = 0;
    
    while (retries <= MAX_RETRIES) {
      try {
        const response = await this.client.chat.completions.create({
          model: deployment,
          messages: [
            {
              role: 'system',
              content: 'You are a data analyst. Answer questions about provided data accurately and concisely. Provide only the direct answer without explanation.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_completion_tokens: maxTokens,
        });
        
        const answer = response.choices[0]?.message?.content?.trim() || '';
        const tokensUsed = response.usage?.total_tokens || 0;
        
        const result = {answer, tokensUsed};
        
        if (answer && answer.length > 0) {
          this._setCache(modelName, prompt, result);
        }
        
        return {...result, cached: false};
        
      } catch (error) {
        if (error.status === 429 && retries < MAX_RETRIES) {
          retries++;
          let delay = Math.pow(2, retries) * 1000 + (Math.random() * 1000);
          if (delay > 60000) delay = 60000;
          
          console.log(`      ⚠️  Rate limit hit for ${modelName}. Retrying in ${Math.round(delay)}ms (Attempt ${retries}/${MAX_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        console.error(`Error querying ${modelName}:`, error.message);
        throw error;
      }
    }
  }
  
  /**
   * Queries multiple models in parallel.
   * 
   * @param {string} prompt - Prompt to send
   * @param {number} maxTokens - Maximum tokens in response
   * @returns {Promise<Object>} Results from all models
   */
  async queryAll(prompt, maxTokens = 100) {
    const results = {};
    
    for (const modelName of Object.keys(this.models)) {
      try {
        results[modelName] = await this.query(modelName, prompt, maxTokens);
      } catch (error) {
        results[modelName] = {
          answer: null,
          tokensUsed: 0,
          error: error.message
        };
      }
    }
    
    return results;
  }
  
  /**
   * Estimates cost for a query based on token usage.
   * 
   * @param {string} modelName - Model name
   * @param {number} promptTokens - Input tokens
   * @param {number} completionTokens - Output tokens
   * @returns {number} Estimated cost in dollars
   */
  estimateCost(modelName, promptTokens, completionTokens) {
    const pricing = {
      'gpt-5-nano': {input: 0.15, output: 0.30},
      'grok-3': {input: 2.00, output: 4.00},
      'deepseek-v3.1': {input: 0.50, output: 1.00},
      'Llama-3.3-70B-Instruct': {input: 0.70, output: 0.90}
    };
    
    const modelPrices = pricing[modelName] || pricing['gpt-5-nano'];
    const inputCost = (promptTokens / 1_000_000) * modelPrices.input;
    const outputCost = (completionTokens / 1_000_000) * modelPrices.output;
    
    return inputCost + outputCost;
  }
}

module.exports = {AzureAIClient};

if (require.main === module) {
  console.log('🔬 Azure AI Client Test\\n');
  console.log('═'.repeat(60));
  
  async function test() {
    try {
      const client = new AzureAIClient();
      
      const testPrompt = `Data format: JSON
Data:
[
  {\"id\": 1, \"name\": \"Alice\", \"salary\": 95000},
  {\"id\": 2, \"name\": \"Bob\", \"salary\": 82000}
]

Question: What is Alice's salary?

Answer:`;
      
      console.log('\\n📝 Test Prompt:');
      console.log(testPrompt.substring(0, 200) + '...\\n');
      
      console.log('Querying models...\\n');
      
      const results = await client.queryAll(testPrompt);
      
      for (const [model, result] of Object.entries(results)) {
        if (result.error) {
          console.log(`❌ ${model}: Error - ${result.error}`);
        } else {
          const cacheStatus = result.cached ? '💾 (cached)' : '🌐 (live)';
          console.log(`✅ ${model} ${cacheStatus}:`);
          console.log(`   Answer: \"${result.answer}\"`);
          console.log(`   Tokens: ${result.tokensUsed}`);
        }
      }
      
      console.log('\\n' + '═'.repeat(60));
      console.log('✨ Test complete!');
      
    } catch (error) {
      console.error('\\n❌ Test failed:', error.message);
      console.error('\\nMake sure you have:');
      console.error('1. Created .env file (copy from .env.example)');
      console.error('2. Set AZURE_OPENAI_API_KEY');
      console.error('3. Set AZURE_OPENAI_ENDPOINT');
      console.error('4. Set model deployment names');
    }
  }
  
  test();
}
