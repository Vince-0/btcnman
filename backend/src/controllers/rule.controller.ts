import { Request, Response } from 'express';
import * as ruleService from '../services/rule.service';

/**
 * Get all rules
 */
export async function getAllRules(req: Request, res: Response) {
  try {
    const rules = await ruleService.getAllRules();
    return res.status(200).json(rules);
  } catch (error) {
    console.error('Error in getAllRules controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Get a rule by ID
 */
export async function getRuleById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'Valid rule ID is required' });
    }
    
    const rule = await ruleService.getRuleById(Number(id));
    
    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }
    
    return res.status(200).json(rule);
  } catch (error) {
    console.error('Error in getRuleById controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Create a new rule
 */
export async function createRule(req: Request, res: Response) {
  try {
    const { name, description, conditions, actions, isActive } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Rule name is required' });
    }
    
    if (!conditions) {
      return res.status(400).json({ message: 'Rule conditions are required' });
    }
    
    if (!actions) {
      return res.status(400).json({ message: 'Rule actions are required' });
    }
    
    // Validate JSON strings
    try {
      JSON.parse(conditions);
      JSON.parse(actions);
    } catch (jsonError) {
      return res.status(400).json({ message: 'Invalid JSON in conditions or actions' });
    }
    
    const rule = await ruleService.createRule({
      name,
      description,
      conditions,
      actions,
      isActive: isActive !== undefined ? isActive : true
    });
    
    return res.status(201).json(rule);
  } catch (error) {
    console.error('Error in createRule controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Update a rule
 */
export async function updateRule(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, conditions, actions, isActive } = req.body;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'Valid rule ID is required' });
    }
    
    // Check if rule exists
    const existingRule = await ruleService.getRuleById(Number(id));
    
    if (!existingRule) {
      return res.status(404).json({ message: 'Rule not found' });
    }
    
    // Validate JSON strings if provided
    if (conditions) {
      try {
        JSON.parse(conditions);
      } catch (jsonError) {
        return res.status(400).json({ message: 'Invalid JSON in conditions' });
      }
    }
    
    if (actions) {
      try {
        JSON.parse(actions);
      } catch (jsonError) {
        return res.status(400).json({ message: 'Invalid JSON in actions' });
      }
    }
    
    const updatedRule = await ruleService.updateRule(Number(id), {
      name,
      description,
      conditions,
      actions,
      isActive
    });
    
    return res.status(200).json(updatedRule);
  } catch (error) {
    console.error('Error in updateRule controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Delete a rule
 */
export async function deleteRule(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'Valid rule ID is required' });
    }
    
    // Check if rule exists
    const existingRule = await ruleService.getRuleById(Number(id));
    
    if (!existingRule) {
      return res.status(404).json({ message: 'Rule not found' });
    }
    
    await ruleService.deleteRule(Number(id));
    
    return res.status(200).json({ message: 'Rule deleted successfully' });
  } catch (error) {
    console.error('Error in deleteRule controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Execute a rule
 */
export async function executeRule(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'Valid rule ID is required' });
    }
    
    // Check if rule exists
    const existingRule = await ruleService.getRuleById(Number(id));
    
    if (!existingRule) {
      return res.status(404).json({ message: 'Rule not found' });
    }
    
    const result = await ruleService.executeRule(Number(id));
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in executeRule controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Execute all active rules
 */
export async function executeAllRules(req: Request, res: Response) {
  try {
    const results = await ruleService.executeAllRules();
    
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error in executeAllRules controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Get rule logs
 */
export async function getRuleLogs(req: Request, res: Response) {
  try {
    const { ruleId, limit, offset } = req.query;
    
    const options: {
      ruleId?: number;
      limit?: number;
      offset?: number;
    } = {};
    
    if (ruleId && !isNaN(Number(ruleId))) {
      options.ruleId = Number(ruleId);
    }
    
    if (limit && !isNaN(Number(limit))) {
      options.limit = Number(limit);
    }
    
    if (offset && !isNaN(Number(offset))) {
      options.offset = Number(offset);
    }
    
    const logs = await ruleService.getRuleLogs(options);
    
    return res.status(200).json(logs);
  } catch (error) {
    console.error('Error in getRuleLogs controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
