const fs = require('fs');
const path = require('path');
const { unifiedDataset } = require('./datasets');

const OUTPUT_FILE = path.join(__dirname, 'questions-309.js');
const TARGET_COUNT = 309;

const QUESTION_TYPES = {
  FIELD_RETRIEVAL: 'field',
  AGGREGATION: 'aggregation',
  FILTERING: 'filtering',
  STRUCTURE_AWARENESS: 'structure',
  STRUCTURAL_VALIDATION: 'validation'
};

function generateQuestions() {
  const questions = [];

  // Helper to add question if we haven't reached target
  const addQ = (q, a, type) => {
    // if (questions.length < TARGET_COUNT) {
      questions.push({ q, a: String(a), type });
    // }
  };

  // --- 1. Metadata (Single Fields) ---
  for (const [key, val] of Object.entries(unifiedDataset.metadata)) {
    if (Array.isArray(val)) {
      addQ(`What is the first tag in metadata?`, val[0], QUESTION_TYPES.FIELD_RETRIEVAL);
      addQ(`How many tags are in metadata?`, val.length, QUESTION_TYPES.AGGREGATION);
    } else {
      addQ(`What is the system ${key}?`, val, QUESTION_TYPES.FIELD_RETRIEVAL);
    }
  }

  // --- 2. Users (Retrieval & Filtering) ---
  unifiedDataset.users.forEach(user => {
    addQ(`What is the role of user ${user.name}?`, user.role, QUESTION_TYPES.FIELD_RETRIEVAL);
    addQ(`Is user ${user.name} active?`, user.active, QUESTION_TYPES.FIELD_RETRIEVAL);
    addQ(`What is the login count for ${user.name}?`, user.loginCount, QUESTION_TYPES.FIELD_RETRIEVAL);
    addQ(`What is the ID of ${user.name}?`, user.id, QUESTION_TYPES.FIELD_RETRIEVAL);
  });

  // Role counts
  const roles = [...new Set(unifiedDataset.users.map(u => u.role))];
  roles.forEach(role => {
    const count = unifiedDataset.users.filter(u => u.role === role).length;
    addQ(`How many users have role '${role}'?`, count, QUESTION_TYPES.FILTERING);
    
    // Negative filtering
    const notCount = unifiedDataset.users.filter(u => u.role !== role).length;
    addQ(`How many users do NOT have role '${role}'?`, notCount, QUESTION_TYPES.FILTERING);
  });

  // Active/Inactive counts
  const activeCount = unifiedDataset.users.filter(u => u.active).length;
  addQ(`How many users are active?`, activeCount, QUESTION_TYPES.FILTERING);
  addQ(`How many users are inactive?`, unifiedDataset.users.length - activeCount, QUESTION_TYPES.FILTERING);

  // Complex Filtering (Role + Active)
  roles.forEach(role => {
    const count = unifiedDataset.users.filter(u => u.role === role && u.active).length;
    addQ(`How many active users have role '${role}'?`, count, QUESTION_TYPES.FILTERING);
  });

  // Aggregation
  const totalLogins = unifiedDataset.users.reduce((sum, u) => sum + u.loginCount, 0);
  addQ(`What is the total login count for all users?`, totalLogins, QUESTION_TYPES.AGGREGATION);
  
  const avgLogins = totalLogins / unifiedDataset.users.length;
  addQ(`What is the average login count?`, avgLogins, QUESTION_TYPES.AGGREGATION);

  // --- 3. Config (Nested Retrieval) ---
  // Database
  addQ(`What is the database host?`, unifiedDataset.config.database.host, QUESTION_TYPES.FIELD_RETRIEVAL);
  addQ(`What is the database port?`, unifiedDataset.config.database.port, QUESTION_TYPES.FIELD_RETRIEVAL);
  addQ(`What is the database timeout?`, unifiedDataset.config.database.timeout, QUESTION_TYPES.FIELD_RETRIEVAL);
  addQ(`How many database replicas are there?`, unifiedDataset.config.database.replicas.length, QUESTION_TYPES.AGGREGATION);
  
  unifiedDataset.config.database.replicas.forEach((rep, i) => {
    addQ(`What is the priority of replica ${i+1}?`, rep.priority, QUESTION_TYPES.FIELD_RETRIEVAL);
    addQ(`What is the host of replica ${i+1}?`, rep.host, QUESTION_TYPES.FIELD_RETRIEVAL);
  });

  // Cache
  addQ(`Is cache enabled?`, unifiedDataset.config.cache.enabled, QUESTION_TYPES.FIELD_RETRIEVAL);
  addQ(`What is the cache provider?`, unifiedDataset.config.cache.provider, QUESTION_TYPES.FIELD_RETRIEVAL);
  addQ(`What is the cache TTL?`, unifiedDataset.config.cache.ttl, QUESTION_TYPES.FIELD_RETRIEVAL);
  addQ(`How many cache nodes are there?`, unifiedDataset.config.cache.nodes.length, QUESTION_TYPES.AGGREGATION);

  // Features
  addQ(`Is darkMode enabled?`, unifiedDataset.config.features.darkMode, QUESTION_TYPES.FIELD_RETRIEVAL);
  addQ(`Is betaAccess enabled?`, unifiedDataset.config.features.betaAccess, QUESTION_TYPES.FIELD_RETRIEVAL);
  addQ(`Is analytics enabled?`, unifiedDataset.config.features.analytics.enabled, QUESTION_TYPES.FIELD_RETRIEVAL);

  // --- 4. Logs (Retrieval & Filtering) ---
  unifiedDataset.logs.forEach(log => {
    addQ(`What is the level of log ${log.id}?`, log.level, QUESTION_TYPES.FIELD_RETRIEVAL);
    addQ(`What is the source of log ${log.id}?`, log.source, QUESTION_TYPES.FIELD_RETRIEVAL);
    addQ(`What is the message of log ${log.id}?`, log.message, QUESTION_TYPES.FIELD_RETRIEVAL);
  });

  const levels = [...new Set(unifiedDataset.logs.map(l => l.level))];
  levels.forEach(level => {
    const count = unifiedDataset.logs.filter(l => l.level === level).length;
    addQ(`How many logs are '${level}' level?`, count, QUESTION_TYPES.FILTERING);
    
    // Negative
    const notCount = unifiedDataset.logs.filter(l => l.level !== level).length;
    addQ(`How many logs are NOT '${level}' level?`, notCount, QUESTION_TYPES.FILTERING);
  });

  const sources = [...new Set(unifiedDataset.logs.map(l => l.source))];
  sources.forEach(source => {
    const count = unifiedDataset.logs.filter(l => l.source === source).length;
    addQ(`How many logs are from source '${source}'?`, count, QUESTION_TYPES.FILTERING);
  });

  // --- 5. Structure Awareness ---
  addQ(`Does the dataset contain 'users'?`, true, QUESTION_TYPES.STRUCTURE_AWARENESS);
  addQ(`Does 'config' contain 'database'?`, true, QUESTION_TYPES.STRUCTURE_AWARENESS);
  addQ(`Does 'config' contain 'invalidKey'?`, false, QUESTION_TYPES.STRUCTURE_AWARENESS);
  addQ(`Is 'logs' an array?`, true, QUESTION_TYPES.STRUCTURE_AWARENESS);
  
  // --- 6. Validation ---
  addQ(`Are all user IDs unique?`, true, QUESTION_TYPES.STRUCTURAL_VALIDATION);
  addQ(`Do all logs have a timestamp?`, true, QUESTION_TYPES.STRUCTURAL_VALIDATION);

  // --- 7. Internet Data (New) ---
  // Products
  unifiedDataset.products.forEach(p => {
    addQ(`What is the price of ${p.name}?`, p.price, QUESTION_TYPES.FIELD_RETRIEVAL);
    addQ(`Is ${p.name} in stock?`, p.inStock, QUESTION_TYPES.FIELD_RETRIEVAL);
  });
  
  const electronicsCount = unifiedDataset.products.filter(p => p.category === 'Electronics').length;
  addQ(`How many products are in category 'Electronics'?`, electronicsCount, QUESTION_TYPES.FILTERING);
  
  const inStockCount = unifiedDataset.products.filter(p => p.inStock).length;
  addQ(`How many products are in stock?`, inStockCount, QUESTION_TYPES.FILTERING);

  // Feed
  unifiedDataset.feed.forEach(f => {
    if (f.author) addQ(`Who is the author of feed item ${f.id}?`, f.author, QUESTION_TYPES.FIELD_RETRIEVAL);
    if (f.likes) addQ(`How many likes did feed item ${f.id} get?`, f.likes, QUESTION_TYPES.FIELD_RETRIEVAL);
  });
  
  const postCount = unifiedDataset.feed.filter(f => f.type === 'post').length;
  addQ(`How many feed items are posts?`, postCount, QUESTION_TYPES.FILTERING);

  // --- 8. Tricky Questions (New) ---
  // Non-existent fields - Accept null/undefined variations
  addQ(`What is the 'middleName' of user Alice Admin?`, "null", QUESTION_TYPES.FIELD_RETRIEVAL);
  addQ(`What is the 'secretKey' in config?`, "null", QUESTION_TYPES.FIELD_RETRIEVAL);

  // Logic Traps
  addQ(`How many users are both active AND inactive?`, "0", QUESTION_TYPES.FILTERING);
  // Clarify logic trap to avoid ambiguity
  addQ(`How many logs have level 'INFO' AND level 'ERROR' simultaneously?`, "0", QUESTION_TYPES.FILTERING);

  // Case Sensitivity (assuming strict matching)
  addQ(`How many users have role 'ADMIN' (uppercase)?`, "0", QUESTION_TYPES.FILTERING);
  
  // Type Coercion / Exact Match
  addQ(`Is the database port '5432' (string)?`, "false", QUESTION_TYPES.FIELD_RETRIEVAL); // It's a number 5432

  // --- 9. Filler / Combinations to reach 309 ---
  // Generate permutations of "Is user X active?" vs "Is user X inactive?"
  unifiedDataset.users.forEach(user => {
     addQ(`Is user ${user.name} inactive?`, !user.active, QUESTION_TYPES.FIELD_RETRIEVAL);
     addQ(`Does user ${user.name} have login count > 100?`, user.loginCount > 100, QUESTION_TYPES.FILTERING);
     addQ(`Does user ${user.name} have login count < 50?`, user.loginCount < 50, QUESTION_TYPES.FILTERING);
  });

  // Log specific checks
  unifiedDataset.logs.forEach(log => {
      if (log.latency) addQ(`What is the latency of log ${log.id}?`, log.latency, QUESTION_TYPES.FIELD_RETRIEVAL);
      if (log.usage) addQ(`What is the usage of log ${log.id}?`, log.usage, QUESTION_TYPES.FIELD_RETRIEVAL);
      if (log.duration) addQ(`What is the duration of log ${log.id}?`, log.duration, QUESTION_TYPES.FIELD_RETRIEVAL);
  });

  // Fill remaining with variations if needed
  let i = 0;
  while (questions.length < TARGET_COUNT) {
    const user = unifiedDataset.users[i % unifiedDataset.users.length];
    const field = ['id', 'name', 'role', 'active'][i % 4];
    // Duplicate question with slight variation to ensure robustness
    addQ(`[Variation ${i}] What is the ${field} of user ${user.name}?`, user[field], QUESTION_TYPES.FIELD_RETRIEVAL);
    i++;
  }

  // Trim to exact target
  const finalQuestions = questions.slice(0, TARGET_COUNT);
  
  console.log(`✅ Generated ${finalQuestions.length} questions.`);

  const fileContent = `
/**
 * Algorithmically Generated 309 Benchmark Questions
 */
const questions = ${JSON.stringify(finalQuestions, null, 2)};

module.exports = { unifiedDataset: questions };
`;

  fs.writeFileSync(OUTPUT_FILE, fileContent);
  console.log(`💾 Saved to ${OUTPUT_FILE}`);
}

generateQuestions();
