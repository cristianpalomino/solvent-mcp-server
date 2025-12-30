/**
 * MCP Server for Solvent
 * Transport-agnostic server setup
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { ApiClient } from './api-client.js'
import { allTools, handleToolCall } from './tools/index.js'
import type { McpServerConfig } from './types.js'

/**
 * Create an MCP server instance configured with the Solvent API
 */
export function createMcpServer(config: McpServerConfig): Server {
  const api = new ApiClient(config)

  const server = new Server(
    {
      name: 'solvent',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  )

  // Handle list tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: allTools,
    }
  })

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    try {
      const result = await handleToolCall(name, args as Record<string, unknown> || {}, api)
      return {
        content: [
          {
            type: 'text',
            text: result,
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

export { ApiClient } from './api-client.js'
export type { McpServerConfig } from './types.js'

