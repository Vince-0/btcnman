import * as ruleService from './rule.service';

// Default interval for rule execution (5 minutes)
const DEFAULT_RULE_EXECUTION_INTERVAL = 5 * 60 * 1000;

// Store the interval ID for rule execution
let ruleExecutionIntervalId: NodeJS.Timeout | null = null;

/**
 * Start the rule execution scheduler
 */
export function startRuleScheduler(interval = DEFAULT_RULE_EXECUTION_INTERVAL) {
  // Clear any existing interval
  if (ruleExecutionIntervalId) {
    clearInterval(ruleExecutionIntervalId);
  }

  console.log(`Starting rule scheduler with interval of ${interval / 1000} seconds`);

  // Set up the new interval
  ruleExecutionIntervalId = setInterval(async () => {
    try {
      console.log('Executing scheduled rules...');
      const results = await ruleService.executeAllRules();
      console.log('Rule execution results:', results);
    } catch (error) {
      console.error('Error executing scheduled rules:', error);
    }
  }, interval);

  return ruleExecutionIntervalId;
}

/**
 * Stop the rule execution scheduler
 */
export function stopRuleScheduler() {
  if (ruleExecutionIntervalId) {
    clearInterval(ruleExecutionIntervalId);
    ruleExecutionIntervalId = null;
    console.log('Rule scheduler stopped');
  }
}

/**
 * Check if the rule scheduler is running
 */
export function isRuleSchedulerRunning() {
  return ruleExecutionIntervalId !== null;
}

/**
 * Get the current rule execution interval
 */
export function getRuleExecutionInterval() {
  return DEFAULT_RULE_EXECUTION_INTERVAL;
}
