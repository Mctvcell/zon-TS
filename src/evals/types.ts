/**
 * Type Definitions for ZON LLM Evaluation Framework
 */

/**
 * Evaluation configuration
 */
export interface EvalConfig {
  /** Unique name for this evaluation */
  name: string;
  
  /** Version of the evaluation configuration */
  version: string;
  
  /** Datasets to evaluate against */
  datasets: Dataset[];
  
  /** Models to test */
  models: ModelConfig[];
  
  /** Metrics to calculate */
  metrics: string[];
  
  /** Quality thresholds that must be met */
  thresholds: Record<string, number>;
  
  /** Optional metadata */
  metadata?: Record<string, any>;
}

/**
 * Model configuration for testing
 */
export interface ModelConfig {
  /** Model identifier (e.g., "gpt-4o", "claude-3.5-sonnet") */
  name: string;
  
  /** API provider */
  provider: 'openai' | 'azure' | 'anthropic' | 'custom';
  
  /** Optional model parameters */
  params?: {
    temperature?: number;
    maxTokens?: number;
    [key: string]: any;
  };
}

/**
 * Dataset definition
 */
export interface Dataset {
  /** Unique dataset ID */
  id: string;
  
  /** Dataset version */
  version: string;
  
  /** Human-readable name */
  name: string;
  
  /** The actual data to encode */
  data: any;
  
  /** Questions to ask about the data */
  questions: Question[];
  
  /** Optional schema for validation */
  schema?: any;
  
  /** Tags for categorization */
  tags: string[];
}

/**
 * A question to ask about the data
 */
export interface Question {
  /** Question ID */
  id: string;
  
  /** The question text */
  question: string;
  
  /** Expected answer */
  expectedAnswer: any;
  
  /** Answer type for validation */
  answerType?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  
  /** Category/tag for this question */
  category?: string;
}

/**
 * Result from running an evaluation
 */
export interface EvalResult {
  /** Unique test ID */
  testId: string;
  
  /** Timestamp of evaluation */
  timestamp: number;
  
  /** Configuration used */
  config: EvalConfig;
  
  /** Results per model and metric */
  results: {
    [modelName: string]: {
      [metricName: string]: number;
    };
  };
  
  /** Individual question results */
  questionResults?: QuestionResult[];
  
  /** Whether all thresholds were met */
  passed: boolean;
  
  /** Detected regressions (if compared with baseline) */
  regressions: Regression[];
  
  /** Total duration in milliseconds */
  duration: number;
}

/**
 * Result for a single question
 */
export interface QuestionResult {
  questionId: string;
  modelName: string;
  question: string;
  expectedAnswer: any;
  actualAnswer: any;
  correct: boolean;
  tokensUsed?: number;
  latencyMs?: number;
}

/**
 * Detected regression between baseline and current
 */
export interface Regression {
  /** Metric that regressed */
  metric: string;
  
  /** Model that regressed */
  model: string;
  
  /** Baseline value */
  baselineValue: number;
  
  /** Current value */
  currentValue: number;
  
  /** Percentage change (negative = regression) */
  change: number;
  
  /** Severity: critical, major, minor */
  severity: 'critical' | 'major' | 'minor';
}

/**
 * Metric calculation function
 */
export interface Metric {
  /** Metric name */
  name: string;
  
  /** Human-readable description */
  description: string;
  
  /** Compute the metric value */
  compute: (expected: any, actual: any, context?: MetricContext) => number | Promise<number>;
  
  /** Whether higher is better (default: true) */
  higherIsBetter?: boolean;
}

/**
 * Context passed to metric computation
 */
export interface MetricContext {
  /** Source data that was encoded */
  sourceData?: any;
  
  /** Encoded string that was sent to LLM */
  encodedData?: string;
  
  /** Tokens used */
  tokens?: number;
  
  /** Schema (if any) */
  schema?: any;
  
  /** Question asked */
  question?: string;
  
  /** Any additional context */
  [key: string]: any;
}

/**
 * Storage interface for eval results
 */
export interface EvalStorage {
  /** Save evaluation result */
  save(result: EvalResult): Promise<void>;
  
  /** Load evaluation result by test ID */
  load(testId: string): Promise<EvalResult | null>;
  
  /** Get latest result for a config */
  getLatest(configName: string): Promise<EvalResult | null>;
  
  /** List all results */
  list(filter?: {configName?: string; limit?: number}): Promise<EvalResult[]>;
}
