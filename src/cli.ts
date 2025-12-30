#!/usr/bin/env node

/**
 * CLI entry point for Solvent MCP Server
 * Uses stdio transport for local usage with Claude Desktop
 */

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
  token = token || process.env.SOLVENT_TOKEN || ''
  apiUrl = apiUrl || process.env.SOLVENT_API_URL || ''

  if (!token) {
    console.error('Error: --token is required (or set SOLVENT_TOKEN environment variable)')
    printHelp()
    process.exit(1)
  }

  if (!apiUrl) {
    console.error('Error: --api-url is required (or set SOLVENT_API_URL environment variable)')
    printHelp()
    process.exit(1)
  }

  return { token, apiUrl }
}

function printHelp(): void {
  console.log(`
Solvent MCP Server - Personal Finance Manager for Claude

Usage:
  solvent-mcp --token <token> --api-url <url>
  npx solvent-mcp --token <token> --api-url <url>

Options:
  --token <token>     Your Solvent MCP token (required)
  --api-url <url>     The Solvent API URL (required)
  --help, -h          Show this help message

Environment Variables:
  SOLVENT_TOKEN       Alternative to --token
  SOLVENT_API_URL     Alternative to --api-url

Example:
  solvent-mcp --token slvt_abc123... --api-url https://solvent.app

Claude Desktop Configuration:
  Add to ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
  or %APPDATA%\\Claude\\claude_desktop_config.json (Windows):

  {
    "mcpServers": {
      "solvent": {
        "command": "npx",
        "args": ["solvent-mcp", "--token", "slvt_...", "--api-url", "https://solvent.app"]
      }
    }
  }
`)
}

async function main(): Promise<void> {
  const { token, apiUrl } = parseArgs()

  // Create the MCP server
  const server = createMcpServer({
    token,
    apiUrl,
  })

  // Create stdio transport
  const transport = new StdioServerTransport()

  // Connect server to transport
  await server.connect(transport)

  // Log to stderr (stdout is used for MCP communication)
  console.error('Solvent MCP Server started')
  console.error(`Connected to: ${apiUrl}`)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

