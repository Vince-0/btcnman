import { PrismaClient } from '@prisma/client';
import * as bitcoinService from './bitcoin.service';

const prisma = new PrismaClient();

/**
 * Get all rules
 */
export async function getAllRules() {
  try {
    return await prisma.rule.findMany({
      orderBy: { updatedAt: 'desc' }
    });
  } catch (error) {
    console.error('Error getting rules:', error);
    throw error;
  }
}

/**
 * Get a rule by ID
 */
export async function getRuleById(id: number) {
  try {
    return await prisma.rule.findUnique({
      where: { id },
      include: {
        RuleLog: {
          orderBy: { triggeredAt: 'desc' },
          take: 10
        }
      }
    });
  } catch (error) {
    console.error(`Error getting rule ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new rule
 */
export async function createRule(ruleData: {
  name: string;
  description?: string;
  conditions: string;
  actions: string;
  isActive: boolean;
}) {
  try {
    // Validate JSON strings
    JSON.parse(ruleData.conditions);
    JSON.parse(ruleData.actions);

    return await prisma.rule.create({
      data: ruleData
    });
  } catch (error) {
    console.error('Error creating rule:', error);
    throw error;
  }
}

/**
 * Update a rule
 */
export async function updateRule(
  id: number,
  ruleData: {
    name?: string;
    description?: string;
    conditions?: string;
    actions?: string;
    isActive?: boolean;
  }
) {
  try {
    // Validate JSON strings if provided
    if (ruleData.conditions) {
      JSON.parse(ruleData.conditions);
    }
    if (ruleData.actions) {
      JSON.parse(ruleData.actions);
    }

    return await prisma.rule.update({
      where: { id },
      data: ruleData
    });
  } catch (error) {
    console.error(`Error updating rule ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a rule
 */
export async function deleteRule(id: number) {
  try {
    // Delete associated rule logs first
    await prisma.ruleLog.deleteMany({
      where: { ruleId: id }
    });

    // Then delete the rule
    return await prisma.rule.delete({
      where: { id }
    });
  } catch (error) {
    console.error(`Error deleting rule ${id}:`, error);
    throw error;
  }
}

/**
 * Get rule logs
 */
export async function getRuleLogs(options: {
  ruleId?: number;
  limit?: number;
  offset?: number;
}) {
  try {
    const { ruleId, limit = 50, offset = 0 } = options;

    const where = ruleId ? { ruleId } : {};

    const [logs, total] = await Promise.all([
      prisma.ruleLog.findMany({
        where,
        orderBy: { triggeredAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          rule: {
            select: {
              name: true
            }
          }
        }
      }),
      prisma.ruleLog.count({ where })
    ]);

    return { logs, total };
  } catch (error) {
    console.error('Error getting rule logs:', error);
    throw error;
  }
}

/**
 * Execute a rule against all peers
 */
export async function executeRule(ruleId: number) {
  try {
    // Get the rule
    const rule = await prisma.rule.findUnique({
      where: { id: ruleId }
    });

    if (!rule) {
      throw new Error(`Rule with ID ${ruleId} not found`);
    }

    if (!rule.isActive) {
      return {
        success: false,
        message: 'Rule is not active',
        matchedPeers: 0,
        actionsExecuted: 0
      };
    }

    // Get all peers
    const peersResponse = await bitcoinService.getPeers();
    const peers = peersResponse.data || [];

    // Parse rule conditions and actions
    const conditions = JSON.parse(rule.conditions);
    const actions = JSON.parse(rule.actions);

    // Filter peers that match the conditions
    const matchedPeers = peers.filter(peer => evaluateConditions(peer, conditions));

    // Execute actions on matched peers
    let actionsExecuted = 0;

    for (const peer of matchedPeers) {
      try {
        const result = await executeActions(peer, actions);

        // Log the rule execution
        await prisma.ruleLog.create({
          data: {
            ruleId: rule.id,
            peerInfo: JSON.stringify(peer),
            actionTaken: actions.action,
            result: result.message
          }
        });

        if (result.success) {
          actionsExecuted++;
        }
      } catch (actionError) {
        console.error(`Error executing action for peer ${peer.addr}:`, actionError);

        // Log the error
        await prisma.ruleLog.create({
          data: {
            ruleId: rule.id,
            peerInfo: JSON.stringify(peer),
            actionTaken: actions.action,
            result: `Error: ${actionError.message}`
          }
        });
      }
    }

    return {
      success: true,
      message: `Rule executed successfully. Matched ${matchedPeers.length} peers, executed ${actionsExecuted} actions.`,
      matchedPeers: matchedPeers.length,
      actionsExecuted
    };
  } catch (error) {
    console.error(`Error executing rule ${ruleId}:`, error);
    throw error;
  }
}

/**
 * Execute all active rules
 */
export async function executeAllRules() {
  try {
    // Get all active rules
    const rules = await prisma.rule.findMany({
      where: { isActive: true }
    });

    const results = [];

    for (const rule of rules) {
      try {
        const result = await executeRule(rule.id);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          ...result
        });
      } catch (ruleError) {
        console.error(`Error executing rule ${rule.id}:`, ruleError);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          success: false,
          message: ruleError.message
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error executing all rules:', error);
    throw error;
  }
}

/**
 * Evaluate if a peer matches the given conditions
 */
function evaluateConditions(peer: any, conditions: any): boolean {
  // If no conditions, return true
  if (!conditions || Object.keys(conditions).length === 0) {
    return true;
  }

  // Check each condition
  for (const [field, condition] of Object.entries(conditions)) {
    const value = getNestedValue(peer, field);

    // Skip if the field doesn't exist
    if (value === undefined) {
      return false;
    }

    // Check the condition
    if (!evaluateCondition(value, condition as any)) {
      return false;
    }
  }

  return true;
}

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((prev, curr) => {
    return prev && prev[curr] !== undefined ? prev[curr] : undefined;
  }, obj);
}

/**
 * Evaluate a single condition
 */
function evaluateCondition(value: any, condition: any): boolean {
  // If condition is a primitive value, compare directly
  if (typeof condition !== 'object' || condition === null) {
    return value === condition;
  }

  // Check each operator
  for (const [operator, operand] of Object.entries(condition)) {
    switch (operator) {
      case 'eq':
        if (value !== operand) return false;
        break;
      case 'neq':
        if (value === operand) return false;
        break;
      case 'gt':
        if (typeof value !== 'number' || value <= Number(operand)) return false;
        break;
      case 'gte':
        if (typeof value !== 'number' || value < Number(operand)) return false;
        break;
      case 'lt':
        if (typeof value !== 'number' || value >= Number(operand)) return false;
        break;
      case 'lte':
        if (typeof value !== 'number' || value > Number(operand)) return false;
        break;
      case 'contains':
        if (typeof value !== 'string' || !value.includes(operand as string)) return false;
        break;
      case 'startsWith':
        if (typeof value !== 'string' || !value.startsWith(operand as string)) return false;
        break;
      case 'endsWith':
        if (typeof value !== 'string' || !value.endsWith(operand as string)) return false;
        break;
      case 'in':
        if (!Array.isArray(operand) || !operand.includes(value)) return false;
        break;
      default:
        console.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }

  return true;
}

/**
 * Execute actions on a peer
 */
async function executeActions(peer: any, actions: any): Promise<{ success: boolean; message: string }> {
  const { action } = actions;

  switch (action) {
    case 'ban':
      const banTime = actions.banTime || 86400; // Default to 24 hours
      return await bitcoinService.banPeer(peer.addr, banTime);

    case 'disconnect':
      return await bitcoinService.disconnectPeer(peer.id);

    default:
      return { success: false, message: `Unknown action: ${action}` };
  }
}
