/**
 * MCP Tools for Expenses
 */

import type { ApiClient } from '../api-client.js'

// Tool definitions
export const expenseTools = [
  {
    name: 'list_expenses',
    description: 'List all expenses. Can optionally include category information.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        withCategory: {
          type: 'boolean',
          description: 'Include category name and color in the response',
        },
      },
    },
  },
  {
    name: 'get_expense',
    description: 'Get a single expense by ID',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The expense UUID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_expense',
    description: 'Create a new expense',
    inputSchema: {
      type: 'object' as const,
      properties: {
        amount: {
          type: 'string',
          description: 'The expense amount (e.g., "50.00")',
        },
        currency: {
          type: 'string',
          description: 'Currency code (e.g., "USD", "EUR")',
        },
        category_id: {
          type: 'string',
          description: 'The category UUID',
        },
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format',
        },
        description: {
          type: 'string',
          description: 'Optional description',
        },
      },
      required: ['amount', 'currency', 'category_id', 'date'],
    },
  },
  {
    name: 'update_expense',
    description: 'Update an existing expense',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The expense UUID to update',
        },
        amount: {
          type: 'string',
          description: 'New amount',
        },
        currency: {
          type: 'string',
          description: 'New currency code',
        },
        category_id: {
          type: 'string',
          description: 'New category UUID',
        },
        date: {
          type: 'string',
          description: 'New date in YYYY-MM-DD format',
        },
        description: {
          type: 'string',
          description: 'New description',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_expense',
    description: 'Delete an expense',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The expense UUID to delete',
        },
      },
      required: ['id'],
    },
  },
]

// Tool handlers
export async function handleExpenseTool(
  name: string,
  args: Record<string, unknown>,
  api: ApiClient
): Promise<string> {
  switch (name) {
    case 'list_expenses': {
      const withCategory = args.withCategory === true
      const result = await api.listExpenses(withCategory)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return JSON.stringify(result.data, null, 2)
    }

    case 'get_expense': {
      const id = args.id as string
      if (!id) return 'Error: id is required'
      const result = await api.getExpense(id)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return JSON.stringify(result.data, null, 2)
    }

    case 'create_expense': {
      const input = {
        amount: args.amount as string,
        currency: args.currency as string,
        category_id: args.category_id as string,
        date: args.date as string,
        description: args.description as string | undefined,
      }
      const result = await api.createExpense(input)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return `Expense created successfully:\n${JSON.stringify(result.data, null, 2)}`
    }

    case 'update_expense': {
      const id = args.id as string
      if (!id) return 'Error: id is required'
      const { id: _, ...updates } = args
      const result = await api.updateExpense(id, updates)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return `Expense updated successfully:\n${JSON.stringify(result.data, null, 2)}`
    }

    case 'delete_expense': {
      const id = args.id as string
      if (!id) return 'Error: id is required'
      const result = await api.deleteExpense(id)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return 'Expense deleted successfully'
    }

    default:
      return `Unknown expense tool: ${name}`
  }
}

