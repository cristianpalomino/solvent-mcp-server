/**
 * MCP Tools for Incomes
 */

import type { ApiClient } from '../api-client.js'

// Tool definitions
export const incomeTools = [
  {
    name: 'list_incomes',
    description: 'List all incomes. Can optionally include category information.',
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
    name: 'get_income',
    description: 'Get a single income by ID',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The income UUID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_income',
    description: 'Create a new income',
    inputSchema: {
      type: 'object' as const,
      properties: {
        amount: {
          type: 'string',
          description: 'The income amount (e.g., "1000.00")',
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
    name: 'update_income',
    description: 'Update an existing income',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The income UUID to update',
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
    name: 'delete_income',
    description: 'Delete an income',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The income UUID to delete',
        },
      },
      required: ['id'],
    },
  },
]

// Tool handlers
export async function handleIncomeTool(
  name: string,
  args: Record<string, unknown>,
  api: ApiClient
): Promise<string> {
  switch (name) {
    case 'list_incomes': {
      const withCategory = args.withCategory === true
      const result = await api.listIncomes(withCategory)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return JSON.stringify(result.data, null, 2)
    }

    case 'get_income': {
      const id = args.id as string
      if (!id) return 'Error: id is required'
      const result = await api.getIncome(id)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return JSON.stringify(result.data, null, 2)
    }

    case 'create_income': {
      const input = {
        amount: args.amount as string,
        currency: args.currency as string,
        category_id: args.category_id as string,
        date: args.date as string,
        description: args.description as string | undefined,
      }
      const result = await api.createIncome(input)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return `Income created successfully:\n${JSON.stringify(result.data, null, 2)}`
    }

    case 'update_income': {
      const id = args.id as string
      if (!id) return 'Error: id is required'
      const { id: _, ...updates } = args
      const result = await api.updateIncome(id, updates)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return `Income updated successfully:\n${JSON.stringify(result.data, null, 2)}`
    }

    case 'delete_income': {
      const id = args.id as string
      if (!id) return 'Error: id is required'
      const result = await api.deleteIncome(id)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return 'Income deleted successfully'
    }

    default:
      return `Unknown income tool: ${name}`
  }
}

