/**
 * Solvent MCP Server
 * 
 * A dynamic MCP server that automatically discovers and proxies API endpoints
 * from the Solvent finance API metadata.
 * 
 * Usage:
 *   import { createMcpServer } from 'solvent-mcp'
 *   
 *   const server = await createMcpServer({
 *     apiUrl: 'https://solvent.app',
 *     token: 'slvt_...',
 *   })
 */

export { createMcpServer } from './server.js'
export type {
  McpServerConfig,
  ApiMetadata,
  EntityMetadata,
  EndpointMetadata,
  FieldSchema,
  FieldType,
  HttpMethod,
  ApiResponse,
} from './types.js'
