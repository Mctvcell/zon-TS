const comprehensiveDatasets = require('./comprehensive-datasets');

/**
 * Generates pilot questions for comprehensive datasets.
 * 
 * @returns {Object} Questions grouped by dataset
 */
function generatePilotQuestions() {
  const questions = {};
  
  questions.smallSimpleUniformFlat = [
    { q: "What is the salary of Employee 5?", a: "70000", type: "field" },
    { q: "What department does Employee 10 work in?", a: "Sales", type: "field" },
    { q: "Is Employee 3 active?", a: "true", type: "field" },
    { q: "How many employees are there in total?", a: "20", type: "aggregation" },
    { q: "How many employees are active?", a: "13", type: "aggregation" },
    { q: "What is the total salary of all employees?", a: "1950000", type: "aggregation" },
    { q: "How many employees work in Engineering?", a: "5", type: "filtering" },
    { q: "How many inactive employees are there?", a: "7", type: "filtering" },
    { q: "What fields are available for each employee?", a: "id,name,department,salary,active", type: "structure" },
    { q: "What is the top-level key in this dataset?", a: "employees", type: "structure" }
  ];
  
  questions.mediumComplexNonUniformFlat = [
    { q: "What is the log level of log ID 3?", a: "ERROR", type: "field" },
    { q: "What source generated log ID 5?", a: "api", type: "field" },
    { q: "What is the timestamp of log ID 1?", a: "2024-12-31T18:30:00.000Z", type: "field" },
    { q: "How many log entries are there in total?", a: "300", type: "aggregation" },
    { q: "How many ERROR level logs are there?", a: "75", type: "aggregation" },
    { q: "How many logs have a userId field?", a: "60", type: "aggregation" },
    { q: "How many logs are from the 'worker' source?", a: "100", type: "filtering" },
    { q: "How many WARN level logs have a warningCode?", a: "75", type: "filtering" },
    { q: "What are the core fields present in all logs?", a: "id,timestamp,level,message,source", type: "structure" },
    { q: "Which optional fields can appear in logs?", a: "errorCode,stackTrace,warningCode,userId,duration", type: "structure" }
  ];
  
  questions.largeComplexNonuniformNestedNonuniform = [
    { q: "What is the transaction amount for ID 10?", a: "109", type: "field" },
    { q: "What type is transaction ID 5?", a: "withdrawal", type: "field" },
    { q: "What currency is used in transaction ID 1?", a: "USD", type: "field" },
    { q: "How many transactions are there in total?", a: "2500", type: "aggregation" },
    { q: "How many transfer transactions are there?", a: "625", type: "aggregation" },
    { q: "How many transactions have fees?", a: "834", type: "aggregation" },
    { q: "How many payment transactions involve a merchant?", a: "625", type: "filtering" },
    { q: "How many transactions have metadata?", a: "250", type: "filtering" },
    { q: "What are the core fields in every transaction?", a: "id,txnId,timestamp,type,amount,currency,accountId", type: "structure" },
    { q: "Which transaction types can have a recipient?", a: "transfer,payment", type: "structure" }
  ];
  
  return questions;
}

module.exports = { generatePilotQuestions };
