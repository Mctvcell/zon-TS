const { unifiedDataset } = require('./datasets');

const QUESTION_TYPES = {
  FIELD_RETRIEVAL: 'field',
  AGGREGATION: 'aggregation',
  FILTERING: 'filtering',
  STRUCTURE_AWARENESS: 'structure',
  STRUCTURAL_VALIDATION: 'validation'
};

/**
 * Generates benchmark questions for unified dataset.
 * 
 * @returns {Object} Object containing questions array
 */
function generateUnifiedQuestions() {
  const questions = [];

  questions.push(
    { q: "What is the system version?", a: "2.5.0", type: QUESTION_TYPES.FIELD_RETRIEVAL },
    { q: "What is the database host?", a: "db-primary.internal", type: QUESTION_TYPES.FIELD_RETRIEVAL },
    { q: "What is the role of user Alice Admin?", a: "admin", type: QUESTION_TYPES.FIELD_RETRIEVAL },
    { q: "What is the log level of event 104?", a: "ERROR", type: QUESTION_TYPES.FIELD_RETRIEVAL },
    { q: "Is beta access enabled?", a: "false", type: QUESTION_TYPES.FIELD_RETRIEVAL },
    { q: "What is the cache TTL?", a: "3600", type: QUESTION_TYPES.FIELD_RETRIEVAL },
    { q: "What is the priority of the second database replica?", a: "5", type: QUESTION_TYPES.FIELD_RETRIEVAL },
    { q: "Which source generated the high memory warning?", a: "monitor", type: QUESTION_TYPES.FIELD_RETRIEVAL }
  );

  questions.push(
    { q: "How many users are there?", a: "5", type: QUESTION_TYPES.AGGREGATION },
    { q: "How many active users?", a: "4", type: QUESTION_TYPES.AGGREGATION },
    { q: "What is the total login count for all users?", a: "500", type: QUESTION_TYPES.AGGREGATION },
    { q: "How many log entries are INFO level?", a: "4", type: QUESTION_TYPES.AGGREGATION },
    { q: "How many cache nodes are configured?", a: "3", type: QUESTION_TYPES.AGGREGATION },
    { q: "What is the average priority of database replicas?", a: "7.5", type: QUESTION_TYPES.AGGREGATION }
  );

  questions.push(
    { q: "How many users have role 'dev' or 'ops'?", a: "2", type: QUESTION_TYPES.FILTERING },
    { q: "How many logs occurred after 10:05:00?", a: "2", type: QUESTION_TYPES.FILTERING },
    { q: "How many active users have logged in more than 100 times?", a: "2", type: QUESTION_TYPES.FILTERING },
    { q: "Which users are inactive?", a: "Charlie Check", type: QUESTION_TYPES.FILTERING },
    { q: "How many features are explicitly enabled?", a: "2", type: QUESTION_TYPES.FILTERING }
  );

  questions.push(
    { q: "What are the top-level keys in the dataset?", a: "metadata,users,config,logs", type: QUESTION_TYPES.STRUCTURE_AWARENESS },
    { q: "What fields are available for a user?", a: "id,name,role,active,loginCount,lastLogin", type: QUESTION_TYPES.STRUCTURE_AWARENESS },
    { q: "Does the config section contain database settings?", a: "true", type: QUESTION_TYPES.STRUCTURE_AWARENESS }
  );

  questions.push(
    { q: "Are all user IDs unique?", a: "true", type: QUESTION_TYPES.STRUCTURAL_VALIDATION },
    { q: "Do all logs have a timestamp?", a: "true", type: QUESTION_TYPES.STRUCTURAL_VALIDATION },
    { q: "How many users are active AND have role 'admin'?", a: "1", type: QUESTION_TYPES.FILTERING },
    { q: "Which user has the highest ID?", a: "Eve External", type: QUESTION_TYPES.FILTERING },
    { q: "How many logs are NOT 'INFO' level?", a: "2", type: QUESTION_TYPES.FILTERING },
    { q: "What is the port of the database?", a: "5432", type: QUESTION_TYPES.FIELD_RETRIEVAL },
    { q: "Is the 'darkMode' feature enabled?", a: "true", type: QUESTION_TYPES.FIELD_RETRIEVAL },
    { q: "What is the sum of all user IDs?", a: "15", type: QUESTION_TYPES.AGGREGATION },
    { q: "How many top-level keys are in the config object?", a: "3", type: QUESTION_TYPES.AGGREGATION },
    { q: "Is the user with the highest login count active?", a: "true", type: QUESTION_TYPES.FILTERING },
    { q: "What is the role of the user who logged in most recently?", a: "guest", type: QUESTION_TYPES.FILTERING },
    { q: "How many users have a role starting with 'a'?", a: "1", type: QUESTION_TYPES.FILTERING },
    { q: "Does the 'cache' config have more nodes than 'database' replicas?", a: "true", type: QUESTION_TYPES.STRUCTURE_AWARENESS }
  );

  return { unifiedDataset: questions };
}

module.exports = {
  QUESTION_TYPES,
  generateUnifiedQuestions
};
