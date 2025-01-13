import { useState, useEffect, useCallback, useRef } from 'react'

interface Participant {
  id: string
  name: string
  vote: string | null
  seatIndex: number | null
}

interface RoomState {
  participants: Participant[]
  revealed: boolean
}

export function useRoom(roomId: string, userId: string, username: string) {
  const [state, setState] = useState<RoomState>({
    participants: [],
    revealed: false
  })

  const hasJoined = useRef(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  const sendEvent = useCallback(async (event: any) => {
    if (!username) return // Don't send events if username is not set

    try {
      await fetch(`/api/room/${roomId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          userId,
          timestamp: Date.now()
        })
      })
    } catch (error) {
      console.error('Failed to send event:', error)
    }
  }, [roomId, userId, username])

  // Load saved position and rejoin room
  useEffect(() => {
    if (!username || hasJoined.current) return // Skip if no username or already joined

    // Check if user was an observer
    const wasObserver = localStorage.getItem(`observer-${roomId}-${userId}`) === 'true'
    const savedSeatIndex = localStorage.getItem(`seat-${roomId}-${userId}`)
    
    // Only use saved seat index if user wasn't an observer
    const seatIndex = !wasObserver && savedSeatIndex !== null 
      ? parseInt(savedSeatIndex, 10) 
      : null

    // Mark as joined before sending the event
    hasJoined.current = true

    sendEvent({
      type: 'join',
      username,
      seatIndex
    })

    // Cleanup function to handle only page close/navigation
    const handleBeforeUnload = () => {
      sendEvent({
        type: 'leave',
        permanent: true
      })
    }

    // Add event listener only for actual page unload
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup event listener on component unmount or room change
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Send leave event only if we're actually leaving the room (component unmount)
      if (!document.hidden) {
        handleBeforeUnload()
      }
    }
  }, [roomId, userId, username, sendEvent])

  useEffect(() => {
    if (!username) return // Don't connect if no username

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    // Create new EventSource connection
    const eventSource = new EventSource(`/api/room/${roomId}/events?userId=${userId}`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'connected':
          // Request current state when someone else connects
          if (data.userId !== userId) {
            sendEvent({
              type: 'requestState',
              userId,
              username
            })
          }
          break

        case 'syncState':
          if (data.state) {
            setState(prev => {
              // Preserve local participant's data when syncing state
              const localParticipant = prev.participants.find(p => p.id === userId)
              const wasObserver = localStorage.getItem(`observer-${roomId}-${userId}`) === 'true'
              
              const newParticipants = data.state.participants.map(p => {
                if (p.id === userId && localParticipant) {
                  return {
                    ...p,
                    name: username,
                    seatIndex: wasObserver ? null : (localParticipant.seatIndex ?? p.seatIndex)
                  }
                }
                return p
              })

              return {
                ...data.state,
                participants: newParticipants
              }
            })
          }
          break

        case 'join':
          setState(prev => {
            const existingParticipant = prev.participants.find(p => p.id === data.userId)
            if (existingParticipant) {
              return {
                ...prev,
                participants: prev.participants.map(p =>
                  p.id === data.userId
                    ? {
                        ...p,
                        name: data.username,
                        seatIndex: data.seatIndex !== undefined ? data.seatIndex : p.seatIndex
                      }
                    : p
                )
              }
            }
            return {
              ...prev,
              participants: [...prev.participants, {
                id: data.userId,
                name: data.username,
                vote: null,
                seatIndex: data.seatIndex
              }]
            }
          })
          break

        case 'leave':
          if (data.permanent) {
            setState(prev => ({
              ...prev,
              participants: prev.participants.filter(p => p.id !== data.userId)
            }))
          }
          break

        case 'vote':
          setState(prev => ({
            ...prev,
            participants: prev.participants.map(p =>
              p.id === data.userId ? { ...p, vote: data.vote } : p
            )
          }))
          break

        case 'reveal':
          setState(prev => ({
            ...prev,
            revealed: data.revealed
          }))
          break

        case 'reset':
          setState(prev => ({
            ...prev,
            revealed: false,
            participants: prev.participants.map(p => ({ ...p, vote: null }))
          }))
          break

        case 'moveToObservers':
          setState(prev => ({
            ...prev,
            participants: prev.participants.map(p =>
              p.id === data.userId
                ? { ...p, seatIndex: null }
                : p
            )
          }))
          break

        case 'changeName':
          setState(prev => ({
            ...prev,
            participants: prev.participants.map(p =>
              p.id === data.userId
                ? {
                    ...p,
                    name: data.username,
                    seatIndex: data.seatIndex !== undefined ? data.seatIndex : p.seatIndex
                  }
                : p
            )
          }))
          break
      }
    }

    // Cleanup function
    return () => {
      eventSource.close()
      eventSourceRef.current = null
    }
  }, [roomId, userId, username, sendEvent])

  const vote = useCallback((value: string) => {
    setState(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === userId ? { ...p, vote: value } : p
      )
    }))
    sendEvent({ type: 'vote', vote: value })
  }, [userId, sendEvent])

  const reveal = useCallback(() => {
    setState(prev => ({ ...prev, revealed: true }))
    sendEvent({ type: 'reveal', revealed: true })
  }, [sendEvent])

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      revealed: false,
      participants: prev.participants.map(p => ({ ...p, vote: null }))
    }))
    sendEvent({ type: 'reset' })
  }, [sendEvent])

  const join = useCallback((seatIndex: number) => {
    // Clear observer status when joining a seat
    localStorage.removeItem(`observer-${roomId}-${userId}`)
    localStorage.setItem(`seat-${roomId}-${userId}`, seatIndex.toString())
    
    setState(prev => {
      const participant = prev.participants.find(p => p.id === userId)
      return {
        ...prev,
        participants: participant
          ? prev.participants.map(p =>
              p.id === userId
                ? { ...p, seatIndex }
                : p
            )
          : [...prev.participants, {
              id: userId,
              name: username,
              vote: null,
              seatIndex
            }]
      }
    })
    sendEvent({
      type: 'join',
      username,
      seatIndex
    })
  }, [roomId, userId, username, sendEvent])

  const moveToObservers = useCallback(() => {
    // Set observer status and remove seat position
    localStorage.setItem(`observer-${roomId}-${userId}`, 'true')
    localStorage.removeItem(`seat-${roomId}-${userId}`)
    
    setState(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === userId
          ? { ...p, seatIndex: null }
          : p
      )
    }))
    sendEvent({ type: 'moveToObservers' })
  }, [roomId, userId, sendEvent])

  const changeName = useCallback((newName: string) => {
    const currentParticipant = state.participants.find(p => p.id === userId)
    setState(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === userId
          ? {
              ...p,
              name: newName,
              seatIndex: currentParticipant?.seatIndex ?? null
            }
          : p
      )
    }))
    sendEvent({
      type: 'changeName',
      username: newName,
      seatIndex: currentParticipant?.seatIndex ?? null
    })
  }, [userId, sendEvent, state.participants])

  return {
    participants: state.participants,
    revealed: state.revealed,
    vote,
    reveal,
    reset,
    join,
    moveToObservers,
    changeName
  }
}

