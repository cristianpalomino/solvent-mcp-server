import type { VercelRequest, VercelResponse } from '@vercel/node'

const API_URL = process.env.SOLVENT_API_URL || 'https://solvent-webapp.vercel.app'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Proxy the request to the actual API
    const response = await fetch(`${API_URL}/api/v1/meta`)
    const data = await response.json()

    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Meta proxy error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch metadata',
      message: errorMessage
    })
  }
}
