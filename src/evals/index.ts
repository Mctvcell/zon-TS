/**
 * ZON LLM Evaluation Framework
 * 
 * Provides automated testing, regression detection, and quality gates for LLM interactions.
 */

export * from './types';
export * from './framework';
export * from './metrics';
export * from './datasets';
export * from './storage';

// Convenience exports
export { ZonEvaluator, globalEvaluator } from './framework';
export { BUILTIN_METRICS, registerBuiltinMetrics } from './metrics';
export { DatasetRegistry, globalRegistry, createDataset } from './datasets';
export { FileEvalStorage, MemoryEvalStorage, defaultStorage } from './storage';
