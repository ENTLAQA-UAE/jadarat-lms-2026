'use client'

import { ImageIcon } from 'lucide-react'
import type { ImageElement } from '../types'

interface ImageBlockProps {
  element: ImageElement
  scale: number
}

export default function ImageBlock({ element, scale }: ImageBlockProps) {
  if (!element.src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/40 border border-dashed border-muted-foreground/30 rounded pointer-events-none">
        <ImageIcon
          className="text-muted-foreground/50"
          style={{ width: 24 * scale, height: 24 * scale }}
        />
      </div>
    )
  }

  return (
    <div className="w-full h-full pointer-events-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={element.src}
        alt=""
        className="w-full h-full"
        style={{ objectFit: element.objectFit }}
        draggable={false}
      />
    </div>
  )
}
