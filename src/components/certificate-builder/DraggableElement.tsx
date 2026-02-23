'use client'

import { useCallback, useRef, useState } from 'react'
import type { CertificateElement } from './types'

interface DraggableElementProps {
  element: CertificateElement
  scale: number
  isSelected: boolean
  onSelect: (id: string) => void
  onMove: (id: string, x: number, y: number) => void
  onResize: (id: string, w: number, h: number, x?: number, y?: number) => void
  children: React.ReactNode
}

type ResizeHandle = 'se' | 'sw' | 'ne' | 'nw'

export default function DraggableElement({
  element,
  scale,
  isSelected,
  onSelect,
  onMove,
  onResize,
  children,
}: DraggableElementProps) {
  const elRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation()
      onSelect(element.id)

      const startX = e.clientX
      const startY = e.clientY
      const origX = element.x
      const origY = element.y

      setIsDragging(true)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

      const onPointerMove = (ev: PointerEvent) => {
        const dx = (ev.clientX - startX) / scale
        const dy = (ev.clientY - startY) / scale
        onMove(element.id, Math.round(origX + dx), Math.round(origY + dy))
      }

      const onPointerUp = () => {
        setIsDragging(false)
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)
      }

      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
    },
    [element.id, element.x, element.y, scale, onSelect, onMove]
  )

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent, handle: ResizeHandle) => {
      e.stopPropagation()
      e.preventDefault()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

      const startX = e.clientX
      const startY = e.clientY
      const origW = element.width
      const origH = element.height
      const origEX = element.x
      const origEY = element.y

      const onPointerMove = (ev: PointerEvent) => {
        const dx = (ev.clientX - startX) / scale
        const dy = (ev.clientY - startY) / scale

        let newW = origW
        let newH = origH
        let newX = origEX
        let newY = origEY

        if (handle === 'se') {
          newW = Math.max(30, origW + dx)
          newH = Math.max(20, origH + dy)
        } else if (handle === 'sw') {
          newW = Math.max(30, origW - dx)
          newH = Math.max(20, origH + dy)
          newX = origEX + (origW - newW)
        } else if (handle === 'ne') {
          newW = Math.max(30, origW + dx)
          newH = Math.max(20, origH - dy)
          newY = origEY + (origH - newH)
        } else if (handle === 'nw') {
          newW = Math.max(30, origW - dx)
          newH = Math.max(20, origH - dy)
          newX = origEX + (origW - newW)
          newY = origEY + (origH - newH)
        }

        onResize(element.id, Math.round(newW), Math.round(newH), Math.round(newX), Math.round(newY))
      }

      const onPointerUp = () => {
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)
      }

      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
    },
    [element.id, element.width, element.height, element.x, element.y, scale, onResize]
  )

  const handles: ResizeHandle[] = ['nw', 'ne', 'sw', 'se']
  const handlePositions: Record<ResizeHandle, string> = {
    nw: '-top-1.5 -left-1.5 cursor-nw-resize',
    ne: '-top-1.5 -right-1.5 cursor-ne-resize',
    sw: '-bottom-1.5 -left-1.5 cursor-sw-resize',
    se: '-bottom-1.5 -right-1.5 cursor-se-resize',
  }

  return (
    <div
      ref={elRef}
      className={`absolute select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: element.x * scale,
        top: element.y * scale,
        width: element.width * scale,
        height: element.height * scale,
        zIndex: element.zIndex,
        outline: isSelected ? '2px solid #3b82f6' : 'none',
        outlineOffset: '1px',
      }}
      onPointerDown={handlePointerDown}
    >
      <div className="w-full h-full overflow-hidden">{children}</div>

      {isSelected &&
        handles.map((h) => (
          <div
            key={h}
            className={`absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full ${handlePositions[h]}`}
            onPointerDown={(e) => handleResizePointerDown(e, h)}
          />
        ))}
    </div>
  )
}
