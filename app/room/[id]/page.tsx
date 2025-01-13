'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Share2, Globe, Plus, RefreshCcw, Menu, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/lib/contexts/language-context'
import { calculateStatistics } from '@/lib/utils/statistics'
import { useRoom } from '@/lib/hooks/useRoom'
import { JoinDialog } from '@/components/join-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { QRCode } from '@/components/qr-code'

export default function RoomPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { t, language, setLanguage } = useLanguage()
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [username, setUsername] = useState<string | null>(null)
  const [userId] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedUserId = localStorage.getItem('userId')
      if (savedUserId) return savedUserId
      const newUserId = Math.random().toString(36).slice(2)
      localStorage.setItem('userId', newUserId)
      return newUserId
    }
    return ''
  })
  const [isEditing, setIsEditing] = useState(false)

  // Load username from localStorage only once during initial mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('username')
    setUsername(savedUsername)
    setIsLoading(false)
  }, [])

  // Clear username from localStorage when leaving the room
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('username')
      }
    }
  }, [])

  const {
    participants = [],
    revealed = false,
    vote,
    reveal,
    reset,
    join,
    moveToObservers,
    changeName
  } = useRoom(params.id, userId, username || '')

  const handleJoin = (name: string) => {
    setUsername(name)
    localStorage.setItem('username', name)
  }

  // Show loading state or join dialog
  if (isLoading) {
    return null // Or a loading spinner if you prefer
  }

  if (!username) {
    return <JoinDialog onJoin={handleJoin} />
  }

  const cards = ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "?"]
  const currentParticipant = participants.find(p => p.id === userId)
  const observers = participants.filter(p => p.seatIndex === null || p.seatIndex === undefined)
  const seatedParticipants = participants.filter(p => p.seatIndex !== null && p.seatIndex !== undefined)
  const totalSeats = Math.max(5, seatedParticipants.length + 1)
  const stats = revealed && participants.length > 0 
    ? calculateStatistics(participants.map(p => p?.vote)) 
    : null
  const takenSeats = participants
    .map(p => p.seatIndex)
    .filter((index): index is number => index !== null && index !== undefined)

  const roomUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/room/${params.id}`
    : ''

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">
              {t('room')}: {params.id}
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
            >
              <Globe className="h-4 w-4" />
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  {t('share')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('share')}</DialogTitle>
                  <DialogDescription>
                    {t('shareDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-full flex justify-center">
                    <QRCode value={roomUrl} size={160} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">{t('roomCode')}</p>
                    <p className="text-2xl font-bold">{params.id}</p>
                  </div>
                  <div className="grid w-full gap-2">
                    <Label htmlFor="room-url">{t('roomUrl')}</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="room-url" 
                        value={roomUrl} 
                        readOnly 
                        onClick={(e) => e.currentTarget.select()} 
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(roomUrl)
                        }}
                      >
                        {t('copy')}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('changeName')}</DialogTitle>
                  <DialogDescription>
                    {t('changeNameDescription')}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const newName = new FormData(e.currentTarget).get('name') as string
                  if (newName.trim()) {
                    handleJoin(newName.trim())
                    changeName(newName.trim())
                    setShowSettings(false)
                  }
                }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('yourName')}</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      defaultValue={username}
                      required 
                      minLength={2}
                      maxLength={30}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {t('save')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('settings')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowSettings(true)}>
                  {t('changeName')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Table Area */}
        <div className="relative">
          {/* Circular Table */}
          <div className="aspect-square max-w-3xl mx-auto relative">
            {/* Table Surface */}
            <div className="absolute inset-[15%] rounded-[60%/40%] bg-primary/10 shadow-lg">
              {/* Center Control Panel */}
              <div className="absolute inset-[20%] rounded-[60%/40%] bg-background shadow-inner flex flex-col items-center justify-center gap-4">
                {revealed ? (
                  <>
                    <div className="text-center space-y-4">
                      <div className="text-2xl font-bold">{t('results')}</div>
                      {stats && (
                        <div className="space-y-2">
                          <div>
                            <div className="text-sm text-muted-foreground">{t('mostVoted')}</div>
                            <div className="text-4xl font-bold">{stats.mode}</div>
                          </div>
                          {stats.average && (
                            <div>
                              <div className="text-sm text-muted-foreground">{t('average')}</div>
                              <div className="text-2xl font-bold">{stats.average}</div>
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground mt-2">
                            {t('distribution')}:
                          </div>
                          <div className="text-sm space-y-1">
                            {Object.entries(stats.distribution).map(([value, count]) => (
                              <div key={value} className="flex items-center gap-2">
                                <div className="w-8 font-medium">{value}</div>
                                <div className="flex-1 h-2 bg-primary/10 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary transition-all"
                                    style={{ 
                                      width: `${(count / participants.length) * 100}%` 
                                    }}
                                  />
                                </div>
                                <div className="w-12 text-right text-muted-foreground">
                                  {count} {t('votes')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button onClick={reset} variant="outline" size="sm">
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      {t('newVote')}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={reveal}
                    disabled={!participants.some(p => p?.vote !== null)}
                    size="lg"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {t('revealCards')}
                  </Button>
                )}
              </div>
            </div>

            {/* Seats around the table */}
            {Array.from({ length: totalSeats }).map((_, index) => {
              const angle = (index * (360 / totalSeats)) * (Math.PI / 180)
              const radius = 42
              const left = 50 + radius * Math.cos(angle)
              const top = 50 + radius * Math.sin(angle)

              const participant = seatedParticipants.find(p => p.seatIndex === index)

              if (!participant) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        variant="ghost"
                        className="w-20 h-28 border-2 border-dashed border-muted-foreground/20 hover:border-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => join(index)}
                        disabled={currentParticipant?.seatIndex !== null && currentParticipant?.seatIndex !== undefined}
                      >
                        <Plus className="h-6 w-6 text-muted-foreground" />
                      </Button>
                      <div className="text-center text-sm text-muted-foreground">
                        {currentParticipant?.seatIndex !== null && currentParticipant?.seatIndex !== undefined 
                          ? t('alreadyHasSeat') 
                          : t('emptySeat')}
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={participant.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Card 
                      className={`w-20 h-28 transition-all duration-500 relative
                        ${revealed ? "rotate-0" : "rotate-180"}
                        ${participant.vote ? "ring-2 ring-primary" : ""}
                      `}
                    >
                      <CardContent className="p-4 h-full flex items-center justify-center">
                        <span className="text-3xl font-bold">
                          {revealed ? participant.vote || "?" : "🎯"}
                        </span>
                      </CardContent>
                      {revealed && participant.id === userId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                          }}
                          title={t('editVote')}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
                    </Card>
                    <div className="text-center">
                      <div className="font-medium">{participant.name}</div>
                      {participant.vote && !revealed && (
                        <div className="text-sm text-primary font-medium">
                          {t('ready')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Card Selection - Always show if participant has a seat */}
          {currentParticipant?.seatIndex !== null && currentParticipant?.seatIndex !== undefined && (
            <div className="mt-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
                {cards.map((card) => (
                  <Button
                    key={card}
                    variant={currentParticipant.vote === card ? "default" : "outline"}
                    className={`h-12 text-lg font-bold hover:scale-105 transition-transform
                      ${currentParticipant.vote === card ? "ring-2 ring-primary" : ""}
                    `}
                    onClick={() => {
                      vote(card);
                      setIsEditing(false);
                    }}
                    disabled={revealed && !isEditing}
                  >
                    {card}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Observers Section - Always visible */}
        <div className="fixed bottom-6 right-6">
          <Card className="w-64">
            <CardHeader className="py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">{t('observers')}</CardTitle>
              {currentParticipant?.seatIndex !== null && currentParticipant?.seatIndex !== undefined && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={moveToObservers}
                >
                  {t('moveToObservers')}
                </Button>
              )}
            </CardHeader>
            <CardContent className="py-2">
              <div className="space-y-2">
                {observers.map(observer => (
                  <div
                    key={observer.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>{observer.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {t('observing')}
                    </span>
                  </div>
                ))}
                {observers.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    {t('noObservers')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Instructions */}
        <div className="text-center text-sm text-muted-foreground">
          {!currentParticipant?.seatIndex ? (
            <p>{t('clickSeatToJoin')}</p>
          ) : (
            <p>{t('votingInstructions')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

