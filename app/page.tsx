'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Users, Globe } from 'lucide-react'
import { createRoom } from '@/lib/actions/rooms'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/lib/contexts/language-context'

export default function HomePage() {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { language, setLanguage, t } = useLanguage()

  async function onCreateRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await createRoom(new FormData(e.currentTarget))

      if (!result.success) {
        setError(result.error || 'Failed to create room')
        return
      }

      setShowCreate(false)
      router.push(`/room/${result.data.id}`)
    } catch (err) {
      setError('Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  async function onJoinRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const code = new FormData(e.currentTarget).get('code') as string
    if (code) {
      router.push(`/room/${code.toUpperCase()}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md space-y-8">
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
            className="rounded-full"
          >
            <Globe className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('createOrJoin')}
          </p>
        </div>

        <div className="grid gap-4">
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                {t('createRoom')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('createRoom')}</DialogTitle>
                <DialogDescription>
                  {t('createRoomDescription')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={onCreateRoom} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('roomName')}</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    placeholder={t('enterRoomName')}
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('creating') : t('createRoom')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showJoin} onOpenChange={setShowJoin}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                {t('joinRoom')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('joinRoom')}</DialogTitle>
                <DialogDescription>
                  {t('joinRoomDescription')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={onJoinRoom} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">{t('roomCode')}</Label>
                  <Input 
                    id="code" 
                    name="code" 
                    required 
                    placeholder={t('enterRoomCode')}
                    autoCapitalize="characters"
                    autoComplete="off"
                    autoFocus
                    pattern="[A-Za-z0-9]+"
                    minLength={6}
                    maxLength={6}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {t('joinRoom')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

