'use server'

import { cookies } from 'next/headers'

// Simple room storage for demo (in production, use a database)
const rooms = new Map()

export async function createRoom(formData: FormData) {
  const name = formData.get('name')
  
  if (!name || typeof name !== 'string') {
    return { success: false, error: 'Room name is required' }
  }

  // Generate a simple 6-character room code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  // Create room
  const room = {
    id: code,
    name,
    participants: [],
    votes: new Map(),
    createdAt: new Date()
  }

  // Store room
  rooms.set(code, room)

  return { 
    success: true, 
    data: { 
      id: code,
      name: room.name 
    } 
  }
}

export async function joinRoom(code: string) {
  const room = rooms.get(code)
  if (!room) {
    return { success: false, error: 'Room not found' }
  }
  return { success: true, data: room }
}

export async function getRoom(id: string) {
  const room = rooms.get(id)
  if (!room) {
    return { success: false, error: 'Room not found' }
  }
  return { success: true, data: room }
}

