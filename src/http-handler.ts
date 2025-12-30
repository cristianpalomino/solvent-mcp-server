/**
 * HTTP Handler for Solvent MCP Server
 * Used by the Next.js API route for Claude Connectors (remote MCP)
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { createMcpServer } from './server.js'
import type { McpServerConfig } from './types.js'

export type HttpHandlerOptions = {
  apiUrl: string
}

/**
 * Create an SSE-based MCP handler for HTTP requests
 * 
 * @param token - The MCP token from the request
 * @param req - Node.js IncomingMessage
 * @param res - Node.js ServerResponse
 * @param options - Handler options including the API URL
 * @returns The SSE transport
 */
export async function createSseHandler(
  token: string,
  req: IncomingMessage,
  res: ServerResponse,
  options: HttpHandlerOptions
): Promise<SSEServerTransport> {
  const config: McpServerConfig = {
    token,
    apiUrl: options.apiUrl,
  }

  // createMcpServer is now async - it fetches metadata on startup
  const server = await createMcpServer(config)

  // Create SSE transport with Node.js HTTP response
  const transport = new SSEServerTransport('/api/mcp', res)
  
  // Connect server to transport
  await server.connect(transport)

  return transport
}

export { createMcpServer } from './server.js'
export type { McpServerConfig } from './types.js'
