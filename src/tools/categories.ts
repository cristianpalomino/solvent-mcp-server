/**
 * MCP Tools for Categories
 */

import type { ApiClient } from '../api-client.js'

// Tool definitions
export const categoryTools = [
  {
    name: 'list_categories',
    description: 'List all categories. Can filter by type and include statistics.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        withStats: {
          type: 'boolean',
          description: 'Include statistics (number of expenses/incomes)',
        },
        activeOnly: {
          type: 'boolean',
          description: 'Only return active categories',
        },
        type: {
          type: 'string',
          enum: ['expense', 'income', 'both'],
          description: 'Filter by category type',
        },
      },
    },
  },
  {
    name: 'get_category',
    description: 'Get a single category by ID',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The category UUID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_category',
    description: 'Create a new category',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'Category name',
        },
        type: {
          type: 'string',
          enum: ['expense', 'income', 'both'],
          description: 'Category type',
        },
        color: {
          type: 'string',
          description: 'Hex color code (e.g., "#FF5733")',
        },
        parent_id: {
          type: 'string',
          description: 'Parent category UUID for subcategories',
        },
        is_active: {
          type: 'boolean',
          description: 'Whether the category is active (default: true)',
        },
      },
      required: ['name', 'type'],
    },
  },
  {
    name: 'update_category',
    description: 'Update an existing category',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The category UUID to update',
        },
        name: {
          type: 'string',
          description: 'New name',
        },
        type: {
          type: 'string',
          enum: ['expense', 'income', 'both'],
          description: 'New type',
        },
        color: {
          type: 'string',
          description: 'New hex color code',
        },
        parent_id: {
          type: 'string',
          description: 'New parent category UUID',
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
    name: 'delete_category',
    description: 'Delete a category. Note: Categories with subcategories cannot be deleted.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The category UUID to delete',
        },
      },
      required: ['id'],
    },
  },
]

// Tool handlers
export async function handleCategoryTool(
  name: string,
  args: Record<string, unknown>,
  api: ApiClient
): Promise<string> {
  switch (name) {
    case 'list_categories': {
      const options = {
        withStats: args.withStats === true,
        activeOnly: args.activeOnly === true,
        type: args.type as 'expense' | 'income' | 'both' | undefined,
      }
      const result = await api.listCategories(options)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return JSON.stringify(result.data, null, 2)
    }

    case 'get_category': {
      const id = args.id as string
      if (!id) return 'Error: id is required'
      const result = await api.getCategory(id)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return JSON.stringify(result.data, null, 2)
    }

    case 'create_category': {
      const input = {
        name: args.name as string,
        type: args.type as 'expense' | 'income' | 'both',
        color: args.color as string | undefined,
        parent_id: args.parent_id as string | undefined,
        is_active: args.is_active as boolean | undefined,
      }
      const result = await api.createCategory(input)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return `Category created successfully:\n${JSON.stringify(result.data, null, 2)}`
    }

    case 'update_category': {
      const id = args.id as string
      if (!id) return 'Error: id is required'
      const { id: _, ...updates } = args
      const result = await api.updateCategory(id, updates)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return `Category updated successfully:\n${JSON.stringify(result.data, null, 2)}`
    }

    case 'delete_category': {
      const id = args.id as string
      if (!id) return 'Error: id is required'
      const result = await api.deleteCategory(id)
      if (!result.success) {
        return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`
      }
      return 'Category deleted successfully'
    }

    default:
      return `Unknown category tool: ${name}`
  }
}

