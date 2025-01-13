'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { userSchema } from '../db/schema'

// Simple hash function for demo purposes
// In production, use a proper password hashing solution
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const registerSchema = userSchema.pick({ 
  email: true, 
  password: true, 
  name: true 
})

export async function register(data: z.infer<typeof registerSchema>) {
  const parsed = registerSchema.parse(data)
  const hashedPassword = await hashPassword(parsed.password)
  
  // In a real app, save to database
  const user = {
    id: Math.random().toString(),
    ...parsed,
    password: hashedPassword
  }

  // Set session cookie
  cookies().set('session', user.id, { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  return { success: true }
}

const loginSchema = userSchema.pick({ 
  email: true, 
  password: true 
})

export async function login(data: z.infer<typeof loginSchema>) {
  const parsed = loginSchema.parse(data)
  
  // In a real app, fetch from database
  const user = {
    id: '1',
    email: parsed.email,
    password: await hashPassword(parsed.password)
  }

  const hashedAttempt = await hashPassword(parsed.password)
  const valid = hashedAttempt === user.password

  if (!valid) throw new Error('Invalid credentials')

  cookies().set('session', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  })

  return { success: true }
}

export async function logout() {
  cookies().delete('session')
  return { success: true }
}

