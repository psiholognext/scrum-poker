'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Plus, Users } from 'lucide-react'
import { createRoom, joinRoom } from '@/lib/actions/rooms'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function DashboardPage() {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onCreateRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    try {
      const room = await createRoom({
        name: formData.get('name') as string,
      })
      setShowCreate(false)
      router.push(`/room/${room.id}`)
    } catch (err) {
      setError('Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  async function onJoinRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    try {
      await joinRoom(formData.get('code') as string)
      setShowJoin(false)
      router.push(`/room/${formData.get('code')}`)
    } catch (err) {
      setError('Invalid room code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Scrum Poker</h1>
          <div className="flex gap-4">
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a new room</DialogTitle>
                  <DialogDescription>
                    Enter a name for your planning poker room
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={onCreateRoom} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Room Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Room'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={showJoin} onOpenChange={setShowJoin}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Join Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join a room</DialogTitle>
                  <DialogDescription>
                    Enter the room code to join
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={onJoinRoom} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Room Code</Label>
                    <Input id="code" name="code" required />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Joining...' : 'Join Room'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Rooms</CardTitle>
              <CardDescription>Rooms you've created</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No rooms created yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Rooms</CardTitle>
              <CardDescription>Rooms you've participated in</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent rooms</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

