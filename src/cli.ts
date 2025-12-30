#!/usr/bin/env node

/**
 * CLI entry point for Solvent MCP Server
 * Uses stdio transport for local usage with Claude Desktop
 */

// Load environment variables from .env file (for local development)
import 'dotenv/config'

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createMcpServer } from './server.js'

interface CliArgs {
  token: string
  apiUrl: string
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2)
  let token = ''
  let apiUrl = ''

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--token' && args[i + 1]) {
      token = args[++i]
    } else if (arg === '--api-url' && args[i + 1]) {
      apiUrl = args[++i]
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    }
  }

  // Also check environment variables
  token = token || process.env.SOLVENT_API_TOKEN || process.env.SOLVENT_TOKEN || ''
  apiUrl = apiUrl || process.env.SOLVENT_API_URL || 'http://localhost:3000'

  if (!token) {
    console.error('Error: --token is required (or set SOLVENT_API_TOKEN environment variable)')
    printHelp()
    process.exit(1)
  }

  // Validate token format
  if (!token.startsWith('slvt_')) {
    console.error('Warning: Token should start with "slvt_" prefix')
  }

  return { token, apiUrl }
}

function printHelp(): void {
  console.log(`
Solvent MCP Server - Dynamic API Proxy for Claude

This MCP server automatically discovers API endpoints from the Solvent API
metadata and generates tools dynamically.

Usage:
  solvent-mcp --token <token> [--api-url <url>]
  npx solvent-mcp --token <token> [--api-url <url>]

Options:
  --token <token>     Your Solvent API token (required, starts with slvt_)
  --api-url <url>     The Solvent API URL (default: http://localhost:3000)
  --help, -h          Show this help message

Environment Variables:
  SOLVENT_API_TOKEN   Alternative to --token
  SOLVENT_API_URL     Alternative to --api-url

  You can also create a .env file in your project root with these variables.

Example:
  solvent-mcp --token slvt_abc123... --api-url https://solvent.app

Claude Desktop Configuration:
  Add to ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
  or %APPDATA%\\Claude\\claude_desktop_config.json (Windows):

  {
    "mcpServers": {
      "solvent": {
        "command": "npx",
        "args": ["solvent-mcp", "--token", "slvt_..."],
        "env": {
          "SOLVENT_API_URL": "https://solvent.app"
        }
      }
    }
  }

Generated Tools:
  The server dynamically generates tools based on API metadata. Typically:
  - list_<entity>   - List all items (e.g., list_expenses)
  - get_<entity>    - Get a single item by ID (e.g., get_expense)
  - create_<entity> - Create a new item (e.g., create_expense)
  - update_<entity> - Update an existing item (e.g., update_expense)
  - delete_<entity> - Delete an item (e.g., delete_expense)
`)
}

async function main(): Promise<void> {
  const { token, apiUrl } = parseArgs()

  console.error('Solvent MCP Server starting...')
  console.error(`API URL: ${apiUrl}`)

  try {
    // Create the MCP server (this fetches metadata and generates tools)
    const server = await createMcpServer({
      token,
      apiUrl,
    })

    // Create stdio transport
    const transport = new StdioServerTransport()

    // Connect server to transport
    await server.connect(transport)

    console.error('Solvent MCP Server ready')
  } catch (error) {
    console.error('Failed to start Solvent MCP Server:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
