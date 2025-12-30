import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

const API_URL = process.env.SOLVENT_API_URL || 'https://solvent-api.vercel.app'

// Inline API Client for Vercel serverless
class ApiClient {
  private token: string
  private apiUrl: string

  constructor(config: { token: string; apiUrl: string }) {
    this.token = config.token
    this.apiUrl = config.apiUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Tool definitions
const allTools = [
  {
    name: 'list_expenses',
    description: 'List all expenses with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        month: { type: 'number', description: 'Filter by month (1-12)' },
        year: { type: 'number', description: 'Filter by year' },
        category_id: { type: 'string', description: 'Filter by category ID' },
      },
    },
  },
  {
    name: 'create_expense',
    description: 'Create a new expense',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Expense title' },
        amount: { type: 'number', description: 'Expense amount' },
        category_id: { type: 'string', description: 'Category ID' },
        date: { type: 'string', description: 'Date (YYYY-MM-DD)' },
        notes: { type: 'string', description: 'Optional notes' },
      },
      required: ['title', 'amount', 'category_id', 'date'],
    },
  },
  {
    name: 'list_incomes',
    description: 'List all incomes with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        month: { type: 'number', description: 'Filter by month (1-12)' },
        year: { type: 'number', description: 'Filter by year' },
      },
    },
  },
  {
    name: 'create_income',
    description: 'Create a new income',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Income title' },
        amount: { type: 'number', description: 'Income amount' },
        date: { type: 'string', description: 'Date (YYYY-MM-DD)' },
        notes: { type: 'string', description: 'Optional notes' },
      },
      required: ['title', 'amount', 'date'],
    },
  },
  {
    name: 'list_categories',
    description: 'List all expense categories',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_recurrings',
    description: 'List all recurring transactions',
    inputSchema: { type: 'object', properties: {} },
  },
]

// Handle tool calls
async function handleToolCall(name: string, args: Record<string, unknown>, api: ApiClient): Promise<string> {
  switch (name) {
    case 'list_expenses': {
      const params = new URLSearchParams()
      if (args.month) params.append('month', String(args.month))
      if (args.year) params.append('year', String(args.year))
      if (args.category_id) params.append('category_id', String(args.category_id))
      const query = params.toString() ? `?${params.toString()}` : ''
      const expenses = await api.get(`/api/expenses${query}`)
      return JSON.stringify(expenses, null, 2)
    }
    case 'create_expense': {
      const expense = await api.post('/api/expenses', args)
      return JSON.stringify(expense, null, 2)
    }
    case 'list_incomes': {
      const params = new URLSearchParams()
      if (args.month) params.append('month', String(args.month))
      if (args.year) params.append('year', String(args.year))
      const query = params.toString() ? `?${params.toString()}` : ''
      const incomes = await api.get(`/api/incomes${query}`)
      return JSON.stringify(incomes, null, 2)
    }
    case 'create_income': {
      const income = await api.post('/api/incomes', args)
      return JSON.stringify(income, null, 2)
    }
    case 'list_categories': {
      const categories = await api.get('/api/categories')
      return JSON.stringify(categories, null, 2)
    }
    case 'list_recurrings': {
      const recurrings = await api.get('/api/recurrings')
      return JSON.stringify(recurrings, null, 2)
    }
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

function createMcpServer(token: string) {
  const api = new ApiClient({ token, apiUrl: API_URL })

  const server = new Server(
    { name: 'solvent', version: '1.0.0' },
    { capabilities: { tools: {} } }
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: allTools,
  }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params
    try {
      const result = await handleToolCall(name, args as Record<string, unknown> || {}, api)
      return {
        content: [{ type: 'text', text: result }],
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      }
    }
  })

  return server
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  // Health check for GET without auth
  if (req.method === 'GET' && !req.headers.authorization) {
    return res.status(200).json({ 
      status: 'ok', 
      service: 'solvent-mcp-server',
      message: 'MCP server is running. Use Authorization header with Bearer token to connect.'
    })
  }

  // Extract token from Authorization header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  }

  const token = authHeader.slice(7)
  const server = createMcpServer(token)

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Create SSE transport
  const transport = new SSEServerTransport('/api/mcp', res)
  
  // Connect server to transport
  await server.connect(transport)

  // Handle client disconnect
  req.on('close', () => {
    transport.close()
  })
}
