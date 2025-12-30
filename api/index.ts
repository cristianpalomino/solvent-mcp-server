import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    name: 'Solvent MCP Server',
    version: '1.0.0',
    description: 'MCP server for Solvent - Personal Finance Manager',
    endpoints: {
      mcp: '/api/mcp',
    },
    usage: 'Connect to /api/mcp with an Authorization: Bearer <token> header',
  })
}

