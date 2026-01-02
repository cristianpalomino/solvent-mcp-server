/**
 * Dynamic MCP Server for Solvent
 * Auto-discovers API endpoints from metadata and generates tools dynamically
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js'
import type {
  McpServerConfig,
  ApiMetadata,
  ApiResponse,
  EndpointMetadata,
  FieldSchema,
  ToolEndpointMapping,
  JsonSchema,
  JsonSchemaProperty,
} from './types.js'

/**
 * Generate a tool name from endpoint metadata
 *
 * Examples:
 * - GET /api/v1/expenses → list_expenses
 * - GET /api/v1/expenses/:id → get_expense
 * - POST /api/v1/expenses → create_expense
 * - PUT /api/v1/expenses/:id → update_expense
 * - PATCH /api/v1/expenses/:id → patch_expense
 * - DELETE /api/v1/expenses/:id → delete_expense
 */
function generateToolName(
  endpoint: EndpointMetadata,
  entityName: string,
  singularName: string
): string {
  const hasIdParam = endpoint.path.includes(':id')

  switch (endpoint.method) {
    case 'GET':
      return hasIdParam ? `get_${singularName}` : `list_${entityName}`
    case 'POST':
      return `create_${singularName}`
    case 'PUT':
      return `update_${singularName}`
    case 'PATCH':
      return `patch_${singularName}`
    case 'DELETE':
      return `delete_${singularName}`
  }
}

/**
 * Convert a FieldSchema to JSON Schema property
 */
function fieldToJsonSchemaProperty(field: FieldSchema): JsonSchemaProperty {
  const property: JsonSchemaProperty = {
    type: 'string',
    description: field.description,
  }

  switch (field.type) {
    case 'string':
      property.type = 'string'
      break
    case 'number':
      property.type = 'number'
      break
    case 'boolean':
      property.type = 'boolean'
      break
    case 'date':
      property.type = 'string'
      property.format = 'date'
      break
    case 'uuid':
      property.type = 'string'
      property.format = 'uuid'
      break
    case 'enum':
      property.type = 'string'
      if (field.enumValues) {
        property.enum = field.enumValues
      }
      break
  }

  return property
}

/**
 * Build JSON Schema from endpoint parameters
 * Combines pathParams + queryParams + bodySchema into a flat input schema
 */
function buildInputSchema(endpoint: EndpointMetadata): JsonSchema {
  const properties: Record<string, JsonSchemaProperty> = {}
  const required: string[] = []

  // Add path params (e.g., :id)
  if (endpoint.pathParams) {
    for (const param of endpoint.pathParams) {
      properties[param.name] = fieldToJsonSchemaProperty(param)
      if (param.required) {
        required.push(param.name)
      }
    }
  }

  // Add query params (for GET requests)
  if (endpoint.queryParams) {
    for (const param of endpoint.queryParams) {
      properties[param.name] = fieldToJsonSchemaProperty(param)
      if (param.required) {
        required.push(param.name)
      }
    }
  }

  // Add body schema (for POST/PUT requests)
  if (endpoint.bodySchema) {
    for (const field of endpoint.bodySchema) {
      properties[field.name] = fieldToJsonSchemaProperty(field)
      if (field.required) {
        required.push(field.name)
      }
    }
  }

  return {
    type: 'object',
    properties,
    required,
  }
}

/**
 * Generate MCP Tool definition from endpoint metadata
 */
function generateTool(
  endpoint: EndpointMetadata,
  entityName: string,
  singularName: string
): { tool: Tool; mapping: ToolEndpointMapping } {
  const toolName = generateToolName(endpoint, entityName, singularName)
  const inputSchema = buildInputSchema(endpoint)

  const tool: Tool = {
    name: toolName,
    description: endpoint.description,
    inputSchema,
  }

  const mapping: ToolEndpointMapping = {
    toolName,
    endpoint,
    entityName,
    singularName,
  }

  return { tool, mapping }
}

/**
 * Build URL from endpoint path and arguments
 * Substitutes :id with the provided id argument
 */
function buildUrl(
  baseApiUrl: string,
  endpoint: EndpointMetadata,
  args: Record<string, unknown>
): string {
  let path = endpoint.path

  // Substitute path params (e.g., :id)
  if (endpoint.pathParams) {
    for (const param of endpoint.pathParams) {
      const value = args[param.name]
      if (value !== undefined) {
        path = path.replace(`:${param.name}`, String(value))
      }
    }
  }

  // Build query string for GET requests
  if (endpoint.method === 'GET' && endpoint.queryParams) {
    const queryParams = new URLSearchParams()
    for (const param of endpoint.queryParams) {
      const value = args[param.name]
      if (value !== undefined) {
        queryParams.set(param.name, String(value))
      }
    }
    const queryString = queryParams.toString()
    if (queryString) {
      path += `?${queryString}`
    }
  }

  return `${baseApiUrl}${path}`
}

/**
 * Build request body from endpoint schema and arguments
 */
function buildBody(
  endpoint: EndpointMetadata,
  args: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (endpoint.method !== 'POST' && endpoint.method !== 'PUT' && endpoint.method !== 'PATCH') {
    return undefined
  }

  if (!endpoint.bodySchema) {
    return undefined
  }

  const body: Record<string, unknown> = {}
  for (const field of endpoint.bodySchema) {
    const value = args[field.name]
    if (value !== undefined) {
      body[field.name] = value
    }
  }

  return Object.keys(body).length > 0 ? body : undefined
}

/**
 * Execute an API request
 */
async function executeApiRequest(
  baseApiUrl: string,
  token: string,
  endpoint: EndpointMetadata,
  args: Record<string, unknown>
): Promise<unknown> {
  const url = buildUrl(baseApiUrl, endpoint, args)
  const body = buildBody(endpoint, args)

  const response = await fetch(url, {
    method: endpoint.method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()
  return data
}

/**
 * Fetch API metadata from the meta endpoint
 */
async function fetchApiMetadata(
  baseApiUrl: string,
  token: string
): Promise<ApiMetadata> {
  const url = `${baseApiUrl}/api/v1/meta`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch API metadata: HTTP ${response.status}`)
  }

  const result = await response.json() as ApiResponse<ApiMetadata>

  if (result.success === false) {
    throw new Error(`Failed to fetch API metadata: ${result.error}`)
  }

  return result.data
}

/**
 * Create a dynamic MCP server that auto-discovers API endpoints
 */
export async function createMcpServer(config: McpServerConfig): Promise<Server> {
  const baseApiUrl = config.apiUrl.replace(/\/$/, '')
  
  // Fetch API metadata
  console.error('Fetching API metadata...')
  const metadata = await fetchApiMetadata(baseApiUrl, config.token)
  console.error(`Discovered ${metadata.entities.length} entities with ${metadata.entities.reduce((sum, e) => sum + e.endpoints.length, 0)} endpoints`)

  // Generate tools from metadata
  const tools: Tool[] = []
  const toolMappings = new Map<string, ToolEndpointMapping>()

  for (const entity of metadata.entities) {
    for (const endpoint of entity.endpoints) {
      const { tool, mapping } = generateTool(endpoint, entity.name, entity.singularName)
      tools.push(tool)
      toolMappings.set(tool.name, mapping)
    }
  }

  console.error(`Generated ${tools.length} tools: ${tools.map(t => t.name).join(', ')}`)

  // Create MCP server
  const server = new Server(
    {
      name: 'solvent',
      version: metadata.version,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  )

  // Handle list tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools }
  })

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params
    const mapping = toolMappings.get(name)

    if (!mapping) {
      return {
        content: [
          {
            type: 'text',
            text: `Unknown tool: ${name}`,
          },
        ],
        isError: true,
      }
    }

    try {
      const result = await executeApiRequest(
        baseApiUrl,
        config.token,
        mapping.endpoint,
        (args as Record<string, unknown>) || {}
      )

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        content: [
          {
            type: 'text',
            text: `Error executing tool ${name}: ${errorMessage}`,
          },
        ],
        isError: true,
      }
    }
  })

  return server
}

export type { McpServerConfig } from './types.js'
