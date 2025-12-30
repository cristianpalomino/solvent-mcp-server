import type { VercelRequest, VercelResponse } from '@vercel/node'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { createMcpServer } from '../src/server.js'

const API_URL = process.env.SOLVENT_API_URL || 'https://solvent-api.vercel.app'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, mcp-session-id')

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Extract token from query parameter OR Authorization header
  const queryToken = req.query.token as string | undefined
  const authHeader = req.headers.authorization
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
  const token = queryToken || headerToken

  // Health check for GET without any token (and not an MCP request)
  if (req.method === 'GET' && !token && !req.headers.accept?.includes('text/event-stream')) {
    return res.status(200).json({
      status: 'ok',
      service: 'solvent-mcp-server',
      message: 'MCP server is running. Pass token via ?token= query param or Authorization: Bearer header.'
    })
  }

  if (!token) {
    return res.status(401).json({ error: 'Missing token. Use ?token= query param or Authorization: Bearer header.' })
  }

  // Create MCP server using shared configuration
  const server = createMcpServer({
    token,
    apiUrl: API_URL,
  })

  // Use stateless mode for serverless compatibility
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // Stateless mode
  })

  // Connect server to transport
  await server.connect(transport)

  // Handle the request
  try {
    await transport.handleRequest(req, res, req.body)
  } catch (error) {
    console.error('MCP request error:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
