/**
 * MCP Tools for Recurring Transactions
 */

import type { ApiClient } from '../api-client.js'

// Tool definitions
export const recurringTools = [
  {
    name: 'list_recurrings',
    description: 'List all recurring transactions. Can filter by type and active status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        withCategory: {
          type: 'boolean',
          description: 'Include category name and color in the response',
        },
        activeOnly: {
          type: 'boolean',
          description: 'Only return active recurring transactions',
        },
        type: {
          type: 'string',
          enum: ['expense', 'income'],
          description: 'Filter by type',
        },
      },
    },
  },
  {
    name: 'get_recurring',
    description: 'Get a single recurring transaction by ID',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The recurring transaction UUID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_recurring',
    description: 'Create a new recurring transaction',
    inputSchema: {
      type: 'object' as const,
      properties: {
        amount: {
          type: 'string',
          description: 'The amount (e.g., "100.00")',
        },
        currency: {
          type: 'string',
          description: 'Currency code (e.g., "USD", "EUR")',
        },
        category_id: {
          type: 'string',
          description: 'The category UUID',
        },
        type: {
          type: 'string',
          enum: ['expense', 'income'],
          description: 'Transaction type',
        },
        frequency: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly', 'yearly'],
          description: 'How often the transaction recurs',
        },
        start_date: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        interval: {
          type: 'number',
          description: 'Interval between occurrences (default: 1)',
        },
        day_of_week: {
          type: 'number',
          description: 'Day of week (0-6, 0=Sunday) for weekly frequency',
        },
        day_of_month: {
          type: 'number',
          description: 'Day of month (1-31) for monthly frequency',
        },
        month_of_year: {
          type: 'number',
          description: 'Month of year (1-12) for yearly frequency',
        },
        end_date: {
          type: 'string',
          description: 'Optional end date in YYYY-MM-DD format',
        },
        description: {
          type: 'string',
          description: 'Optional description',
        },
        is_active: {
          type: 'boolean',
          description: 'Whether the recurring is active (default: true)',
        },
      },
      required: ['amount', 'currency', 'category_id', 'type', 'frequency', 'start_date'],
    },
  },
  {
    name: 'update_recurring',
    description: 'Update an existing recurring transaction',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The recurring transaction UUID to update',
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
        frequency: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly', 'yearly'],
          description: 'New frequency',
        },
        interval: {
          type: 'number',
          description: 'New interval',
        },
        day_of_week: {
          type: 'number',
          description: 'New day of week',
        },
        day_of_month: {
          type: 'number',
          description: 'New day of month',
        },
        month_of_year: {
          type: 'number',
          description: 'New month of year',
        },
        end_date: {
          type: 'string',
          description: 'New end date',
        },
        description: {
          type: 'string',
          description: 'New description',
        },
        is_active: {
          type: 'boolean',
          description: 'New active status',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_recurring',
    description: 'Delete a recurring transaction',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The recurring transaction UUID to delete',
        },
      },
      required: ['id'],
    },
  },
]

// Tool handlers
export async function handleRecurringTool(
  name: string,
  args: Record<string, unknown>,
  api: ApiClient
): Promise<string> {
  switch (name) {
    case 'list_recurrings': {
      const options = {
        withCategory: args.withCategory === true,
        activeOnly: args.activeOnly === true,
        type: args.type as 'expense' | 'income' | undefined,
      }
      const result = await api.listRecurrings(options)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return JSON.stringify(result.data, null, 2)
    }

    case 'get_recurring': {
      const id = args.id as string
      if (!id) return 'Error: id is required'
      const result = await api.getRecurring(id)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return JSON.stringify(result.data, null, 2)
    }

    case 'create_recurring': {
      const input = {
        amount: args.amount as string,
        currency: args.currency as string,
        category_id: args.category_id as string,
        type: args.type as 'expense' | 'income',
        frequency: args.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
        start_date: args.start_date as string,
        interval: args.interval as number | undefined,
        day_of_week: args.day_of_week as number | undefined,
        day_of_month: args.day_of_month as number | undefined,
        month_of_year: args.month_of_year as number | undefined,
        end_date: args.end_date as string | undefined,
        description: args.description as string | undefined,
        is_active: args.is_active as boolean | undefined,
      }
      const result = await api.createRecurring(input)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return `Recurring transaction created successfully:\n${JSON.stringify(result.data, null, 2)}`
    }

    case 'update_recurring': {
      const id = args.id as string
      if (!id) return 'Error: id is required'
      const { id: _, ...updates } = args
      const result = await api.updateRecurring(id, updates)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return `Recurring transaction updated successfully:\n${JSON.stringify(result.data, null, 2)}`
    }

    case 'delete_recurring': {
      const id = args.id as string
      if (!id) return 'Error: id is required'
      const result = await api.deleteRecurring(id)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return 'Recurring transaction deleted successfully'
    }

    default:
      return `Unknown recurring tool: ${name}`
  }
}

