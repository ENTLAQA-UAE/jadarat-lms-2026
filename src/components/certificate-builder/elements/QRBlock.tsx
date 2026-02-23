'use client'

import { QrCode } from 'lucide-react'

interface QRBlockProps {
  scale: number
}

export default function QRBlock({ scale }: QRBlockProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-white border border-dashed border-muted-foreground/30 rounded pointer-events-none">
      <QrCode
        className="text-muted-foreground/70"
        style={{ width: 32 * scale, height: 32 * scale }}
      />
    </div>
  )
}
