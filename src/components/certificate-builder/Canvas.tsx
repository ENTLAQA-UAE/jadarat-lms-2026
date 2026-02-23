'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import type { CertificateTemplateJSON, CertificateElement } from './types'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants'
import DraggableElement from './DraggableElement'
import TextBlock from './elements/TextBlock'
import ImageBlock from './elements/ImageBlock'
import QRBlock from './elements/QRBlock'

interface CanvasProps {
  template: CertificateTemplateJSON
  selectedElementId: string | null
  onSelectElement: (id: string | null) => void
  onMoveElement: (id: string, x: number, y: number) => void
  onResizeElement: (id: string, w: number, h: number, x?: number, y?: number) => void
}

export default function Canvas({
  template,
  selectedElementId,
  onSelectElement,
  onMoveElement,
  onResizeElement,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.7)

  const updateScale = useCallback(() => {
    if (!containerRef.current) return
    const containerW = containerRef.current.clientWidth - 32 // padding
    const containerH = containerRef.current.clientHeight - 32
    const scaleX = containerW / CANVAS_WIDTH
    const scaleY = containerH / CANVAS_HEIGHT
    setScale(Math.min(scaleX, scaleY, 1))
  }, [])

  useEffect(() => {
    updateScale()
    const ro = new ResizeObserver(updateScale)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [updateScale])

  const renderElement = (el: CertificateElement) => {
    switch (el.type) {
      case 'text':
        return <TextBlock element={el} scale={scale} lang={template.lang} />
      case 'image':
        return <ImageBlock element={el} scale={scale} />
      case 'qr':
        return <QRBlock scale={scale} />
    }
  }

  const sortedElements = [...template.elements].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-muted/30 overflow-hidden p-4"
      onClick={() => onSelectElement(null)}
    >
      <div
        className="relative shadow-lg"
        style={{
          width: CANVAS_WIDTH * scale,
          height: CANVAS_HEIGHT * scale,
          backgroundColor: template.canvas.backgroundColor,
          backgroundImage: template.canvas.backgroundImage
            ? `url(${template.canvas.backgroundImage})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {sortedElements.map((el) => (
          <DraggableElement
            key={el.id}
            element={el}
            scale={scale}
            isSelected={el.id === selectedElementId}
            onSelect={onSelectElement}
            onMove={onMoveElement}
            onResize={onResizeElement}
          >
            {renderElement(el)}
          </DraggableElement>
        ))}
      </div>
    </div>
  )
}
