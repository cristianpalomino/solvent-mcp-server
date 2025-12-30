import type { VercelRequest, VercelResponse } from '@vercel/node'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { createMcpServer } from '../src/server.js'
import type { McpServerConfig } from '../src/types.js'

const API_URL = process.env.SOLVENT_API_URL || 'https://solvent-api.vercel.app'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  // Extract token from Authorization header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  }

  const token = authHeader.slice(7)

  const config: McpServerConfig = {
    token,
    apiUrl: API_URL,
  }

  const server = createMcpServer(config)

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Create SSE transport
  const transport = new SSEServerTransport('/api/mcp', res)
  
  // Connect server to transport
  await server.connect(transport)

  // Handle client disconnect
  req.on('close', () => {
    transport.close()
  })
}

