/**
 * Solvent MCP Server
 * 
 * This module exports the main components for running the Solvent MCP server:
 * - createMcpServer: Creates a transport-agnostic MCP server
 * - ApiClient: HTTP client for the Solvent API
 * - Tool definitions and handlers
 */

export { createMcpServer, ApiClient } from './server.js'
export type { McpServerConfig } from './types.js'
export { allTools, handleToolCall } from './tools/index.js'

