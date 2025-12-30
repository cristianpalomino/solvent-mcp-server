/**
 * MCP Tools Index
 * Exports all tool definitions and handlers
 */

import type { ApiClient } from '../api-client.js'
import { expenseTools, handleExpenseTool } from './expenses.js'
import { incomeTools, handleIncomeTool } from './incomes.js'
import { categoryTools, handleCategoryTool } from './categories.js'
import { recurringTools, handleRecurringTool } from './recurrings.js'

// All tool definitions
export const allTools = [
  ...expenseTools,
  ...incomeTools,
  ...categoryTools,
  ...recurringTools,
]

// Tool name sets for routing
const expenseToolNames = new Set(expenseTools.map(t => t.name))
const incomeToolNames = new Set(incomeTools.map(t => t.name))
const categoryToolNames = new Set(categoryTools.map(t => t.name))
const recurringToolNames = new Set(recurringTools.map(t => t.name))

/**
 * Handle a tool call by routing to the appropriate handler
 */
export async function handleToolCall(
  name: string,
  args: Record<string, unknown>,
  api: ApiClient
): Promise<string> {
  if (expenseToolNames.has(name)) {
    return handleExpenseTool(name, args, api)
  }
  if (incomeToolNames.has(name)) {
    return handleIncomeTool(name, args, api)
  }
  if (categoryToolNames.has(name)) {
    return handleCategoryTool(name, args, api)
  }
  if (recurringToolNames.has(name)) {
    return handleRecurringTool(name, args, api)
  }
  return `Unknown tool: ${name}`
}

// Re-export individual tools for granular access
export { expenseTools, handleExpenseTool } from './expenses.js'
export { incomeTools, handleIncomeTool } from './incomes.js'
export { categoryTools, handleCategoryTool } from './categories.js'
export { recurringTools, handleRecurringTool } from './recurrings.js'

