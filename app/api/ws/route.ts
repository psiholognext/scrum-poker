import { WebSocket } from 'ws'
import { WebSocketServer } from 'ws'
import { createServer } from 'http'
import { NextRequest } from 'next/server'

// Store active connections
const rooms = new Map<string, Map<string, WebSocket>>()

// Initialize WebSocket server
//const wss = new WebSocketServer({ noServer: true })

// Handle WebSocket connections
//wss.on('connection', (ws, request, roomId: string, userId: string) => {
//  // Add user to room
//  if (!rooms.has(roomId)) {
//    rooms.set(roomId, new Map())
//  }
//  const room = rooms.get(roomId)!
//  room.set(userId, ws)

//  // Handle messages
//  ws.on('message', (data) => {
//    const message = JSON.parse(data.toString())
//    // Broadcast to all users in the room except sender
//    room.forEach((client, clientId) => {
//      if (clientId !== userId && client.readyState === WebSocket.OPEN) {
//        client.send(JSON.stringify(message))
//      }
//    })
//  })

//  // Handle disconnection
//  ws.on('close', () => {
//    const room = rooms.get(roomId)
//    if (room) {
//      room.delete(userId)
//      if (room.size === 0) {
//        rooms.delete(roomId)
//      }
//    }
//  })
//})

// Create HTTP server for WebSocket upgrade
//const server = createServer()

//server.on('upgrade', (request, socket, head) => {
//  const url = new URL(request.url!, `http://${request.headers.host}`)
//  const roomId = url.searchParams.get('roomId')
//  const userId = url.searchParams.get('userId')

//  if (!roomId || !userId) {
//    socket.destroy()
//    return
//  }

//  wss.handleUpgrade(request, socket, head, (ws) => {
//    wss.emit('connection', ws, request, roomId, userId)
//  })
//})

// Start server
//server.listen(process.env.WEBSOCKET_PORT || 3001)

export async function GET(request: NextRequest) {
  if (!request.headers.get('upgrade')?.includes('websocket')) {
    return new Response('Expected websocket', { status: 400 })
  }

  try {
    const { socket: ws, response } = new WebSocketServer({
      noServer: true
    }).handleUpgrade(request, {
      headers: request.headers,
      method: request.method,
      url: request.url
    })

    const url = new URL(request.url)
    const roomId = url.searchParams.get('roomId')
    const userId = url.searchParams.get('userId')

    if (!roomId || !userId) {
      ws.close()
      return response
    }

    // Add user to room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map())
    }
    const room = rooms.get(roomId)!
    room.set(userId, ws)

    // Handle messages
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString())
      // Broadcast to all users in the room except sender
      room.forEach((client, clientId) => {
        if (clientId !== userId && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message))
        }
      })
    })

    // Handle disconnection
    ws.on('close', () => {
      const room = rooms.get(roomId)
      if (room) {
        room.delete(userId)
        if (room.size === 0) {
          rooms.delete(roomId)
        }
      }
    })

    return response

  } catch (error) {
    return new Response('WebSocket upgrade failed', { status: 500 })
  }
}

