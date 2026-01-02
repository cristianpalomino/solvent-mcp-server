/**
 * Types for the Solvent MCP Server
 * Dynamic API metadata types for auto-discovery
 */

// ==================== Field Schema Types ====================

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'uuid' | 'enum'

export type FieldSchema = {
  name: string
  type: FieldType
  required: boolean
  description?: string
  enumValues?: string[]
}

// ==================== Endpoint Metadata Types ====================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type Permission = {
  entity: string
  action: 'read' | 'write'
}

export type EndpointMetadata = {
  path: string                    // e.g., "/api/v1/expenses" or "/api/v1/expenses/:id"
  method: HttpMethod
  description: string
  permission: Permission
  queryParams?: FieldSchema[]     // For GET requests with filters
  bodySchema?: FieldSchema[]      // For POST/PUT request bodies
  pathParams?: FieldSchema[]      // For :id parameters
}

// ==================== Entity Metadata Types ====================

export type EntityMetadata = {
  name: string           // e.g., "expenses"
  singularName: string   // e.g., "expense"
  description: string
  endpoints: EndpointMetadata[]
}

// ==================== API Metadata Types ====================

export type AuthenticationConfig = {
  type: 'bearer'
  header: string
  prefix: string
}

export type ApiMetadata = {
  version: string
  baseUrl: string
  authentication: AuthenticationConfig
  entities: EntityMetadata[]
}

// ==================== API Response Types ====================

export type ApiResponse<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
  message?: string
}

// ==================== MCP Server Configuration ====================

export type McpServerConfig = {
  apiUrl: string
  token: string
}

// ==================== Tool Mapping Types ====================

export type ToolEndpointMapping = {
  toolName: string
  endpoint: EndpointMetadata
  entityName: string
  singularName: string
}

// ==================== JSON Schema Types (for MCP tools) ====================

export type JsonSchemaProperty = {
  type: 'string' | 'number' | 'boolean'
  description?: string
  format?: string
  enum?: string[]
}

export type JsonSchema = {
  type: 'object'
  properties: Record<string, JsonSchemaProperty>
  required: string[]
}
