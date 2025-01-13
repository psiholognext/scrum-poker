import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Store room state
const rooms = new Map<string, {
  controllers: Map<string, ReadableStreamDefaultController>
  state: {
    participants: any[]
    revealed: boolean
  }
}>()

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const roomId = params.id
  const userId = req.nextUrl.searchParams.get('userId')

  if (!userId) {
    return new Response('Missing userId', { status: 400 })
  }

  const stream = new ReadableStream({
    start(controller) {
      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          controllers: new Map(),
          state: {
            participants: [],
            revealed: false
          }
        })
      }

      const room = rooms.get(roomId)!
      room.controllers.set(userId, controller)

      // Send initial state immediately after connection
      const initialState = {
        type: 'syncState',
        state: room.state
      }
      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify(initialState)}\n\n`)
      )

      // Notify others about the new participant
      const message = `data: ${JSON.stringify({
        type: 'connected',
        userId,
        timestamp: Date.now()
      })}\n\n`
      const encoded = new TextEncoder().encode(message)
      room.controllers.forEach((otherController, otherId) => {
        if (otherId !== userId) {
          otherController.enqueue(encoded)
        }
      })

      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        room.controllers.delete(userId)
        
        // Clean up if all controllers are gone and it's been some time
        if (room.controllers.size === 0) {
          setTimeout(() => {
            if (room.controllers.size === 0) {
              rooms.delete(roomId)
            }
          }, 300000) // 5 minutes
        }
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    }
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const roomId = params.id
  const room = rooms.get(roomId)

  if (!room) {
    return new Response('Room not found', { status: 404 })
  }

  const data = await req.json()
  let participantToUpdate
  
  // Update room state based on events
  switch (data.type) {
    case 'join':
      participantToUpdate = room.state.participants.find(p => p.id === data.userId)
      if (participantToUpdate) {
        // Update existing participant while preserving seat if not explicitly set
        participantToUpdate.name = data.username
        if (data.seatIndex !== undefined) {
          participantToUpdate.seatIndex = data.seatIndex
        }
      } else {
        // Add new participant
        room.state.participants.push({
          id: data.userId,
          name: data.username,
          vote: null,
          seatIndex: data.seatIndex
        })
      }

      // Send current state to all participants to ensure sync
      const syncMessage = `data: ${JSON.stringify({
        type: 'syncState',
        state: room.state
      })}\n\n`
      const syncEncoded = new TextEncoder().encode(syncMessage)
      room.controllers.forEach(controller => {
        controller.enqueue(syncEncoded)
      })
      break
      
    case 'moveToObservers':
      participantToUpdate = room.state.participants.find(p => p.id === data.userId)
      if (participantToUpdate) {
        participantToUpdate.seatIndex = null
        participantToUpdate.vote = null
      }
      break
      
    case 'leave':
      if (data.permanent) {
        room.state.participants = room.state.participants.filter(p => p.id !== data.userId)
        // Send updated state to all remaining participants
        const leaveMessage = `data: ${JSON.stringify({
          type: 'syncState',
          state: room.state
        })}\n\n`
        const leaveEncoded = new TextEncoder().encode(leaveMessage)
        room.controllers.forEach((controller, id) => {
          if (id !== data.userId) {
            controller.enqueue(leaveEncoded)
          }
        })
      }
      break
      
    case 'vote':
      participantToUpdate = room.state.participants.find(p => p.id === data.userId)
      if (participantToUpdate) {
        participantToUpdate.vote = data.vote
      }
      break
      
    case 'reveal':
      room.state.revealed = data.revealed
      break
      
    case 'reset':
      room.state.revealed = false
      room.state.participants.forEach(p => p.vote = null)
      break
      
    case 'requestState':
      // Send current state to the requester
      const requesterController = room.controllers.get(data.userId)
      if (requesterController) {
        requesterController.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({
            type: 'syncState',
            state: room.state
          })}\n\n`)
        )
      }
      return new Response('OK')
      
    case 'changeName':
      participantToUpdate = room.state.participants.find(p => p.id === data.userId)
      if (participantToUpdate) {
        participantToUpdate.name = data.username
        data.seatIndex = participantToUpdate.seatIndex
      }
      break
  }

  // Broadcast event to all participants except sender
  const message = `data: ${JSON.stringify(data)}\n\n`
  const encoded = new TextEncoder().encode(message)

  room.controllers.forEach((controller, id) => {
    if (id !== data.userId) {
      controller.enqueue(encoded)
    }
  })

  return new Response('OK')
}

