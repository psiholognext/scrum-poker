'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/lib/contexts/language-context'

interface JoinDialogProps {
  onJoin: (username: string) => void
}

export function JoinDialog({ onJoin }: JoinDialogProps) {
  const { t } = useLanguage()
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      localStorage.setItem('username', name.trim())
      onJoin(name.trim())
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('enterName')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('yourName')}</Label>
                <Input 
                  id="username" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('yourName')} 
                  required 
                  autoFocus
                  minLength={2}
                  maxLength={30}
                />
              </div>
              <Button type="submit" className="w-full">
                {t('joinRoom')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

