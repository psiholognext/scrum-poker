'use client'

import { useEffect, useRef } from 'react'
import QRCodeLib from 'qrcode'

interface QRCodeProps {
  value: string
  size?: number
}

export function QRCode({ value, size = 160 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    QRCodeLib.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  }, [value, size])

  return (
    <div className="bg-white p-4 rounded-lg flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size}
        className="w-full h-auto"
      />
    </div>
  )
}

