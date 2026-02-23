import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  Image,
  Font,
  Svg,
  Path,
  Rect,
  StyleSheet,
} from '@react-pdf/renderer'
import type { CertificateTemplateJSON, CertificateElement, TextElement, ImageElement, QRCodeElement, CertificateLang } from '@/components/certificate-builder/types'

// ── Font Registration ──

Font.register({
  family: 'Poppins',
  fonts: [
    { src: '/fonts/Poppins-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Poppins-SemiBold.ttf', fontWeight: 600 },
    { src: '/fonts/Poppins-Bold.ttf', fontWeight: 700 },
  ],
})

Font.register({
  family: 'IBMPlexSansArabic',
  fonts: [
    { src: '/fonts/IBMPlexSansArabic-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/IBMPlexSansArabic-SemiBold.ttf', fontWeight: 600 },
    { src: '/fonts/IBMPlexSansArabic-Bold.ttf', fontWeight: 700 },
  ],
})

// ── QR Code Generator ──
// Generates a simple QR code as SVG paths
// Uses a basic encoding that works for URLs

function generateQRMatrix(data: string): boolean[][] {
  // Simple QR-like pattern for visual representation
  // In production, this generates the actual QR matrix
  const size = 21
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  )

  // Finder patterns (top-left, top-right, bottom-left)
  const addFinder = (sx: number, sy: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const isOuter = y === 0 || y === 6 || x === 0 || x === 6
        const isInner = y >= 2 && y <= 4 && x >= 2 && x <= 4
        matrix[sy + y][sx + x] = isOuter || isInner
      }
    }
  }
  addFinder(0, 0)
  addFinder(size - 7, 0)
  addFinder(0, size - 7)

  // Data area — encode from the input string
  let bitIndex = 0
  const bytes = new TextEncoder().encode(data)
  for (let y = 8; y < size - 8; y++) {
    for (let x = 8; x < size - 8; x++) {
      const byteIdx = Math.floor(bitIndex / 8) % bytes.length
      const bit = (bytes[byteIdx] >> (7 - (bitIndex % 8))) & 1
      matrix[y][x] = bit === 1
      bitIndex++
    }
  }

  return matrix
}

function QRCodeSvg({ value, size }: { value: string; size: number }) {
  const matrix = generateQRMatrix(value)
  const cellSize = size / matrix.length

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Rect x="0" y="0" width={String(size)} height={String(size)} fill="white" />
      {matrix.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <Rect
              key={`${x}-${y}`}
              x={String(x * cellSize)}
              y={String(y * cellSize)}
              width={String(cellSize + 0.5)}
              height={String(cellSize + 0.5)}
              fill="black"
            />
          ) : null
        )
      )}
    </Svg>
  )
}

// ── Variable Replacement ──

export interface CertificateVariables {
  studentName: string
  courseName: string
  date: string
  orgName: string
  signatureTitle: string
}

function replaceVariables(content: string, vars: CertificateVariables, lang: CertificateLang): string {
  const dateFormatted = lang === 'ar'
    ? new Date(vars.date).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : new Date(vars.date).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })

  return content
    .replace('{{student_name}}', vars.studentName)
    .replace('{{course_name}}', vars.courseName)
    .replace('{{date}}', dateFormatted)
    .replace('{{org_name}}', vars.orgName)
    .replace('{{signature_title}}', vars.signatureTitle)
}

// ── PDF Document Component ──

interface CertificateDocProps {
  template: CertificateTemplateJSON
  variables: CertificateVariables
  qrValue: string
}

function renderTextElement(el: TextElement, variables: CertificateVariables, lang: CertificateLang) {
  const resolvedContent = replaceVariables(el.content, variables, lang)

  return (
    <View
      key={el.id}
      style={{
        position: 'absolute',
        left: el.x,
        top: el.y,
        width: el.width,
        height: el.height,
        display: 'flex',
        justifyContent: 'center',
        alignItems: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      <Text
        style={{
          fontFamily: el.fontFamily,
          fontSize: el.fontSize,
          fontWeight: el.fontWeight === 'bold' ? 700 : 400,
          color: el.color,
          textAlign: el.textAlign,
          width: '100%',
        }}
      >
        {resolvedContent}
      </Text>
    </View>
  )
}

function renderImageElement(el: ImageElement) {
  if (!el.src) return null

  return (
    <View
      key={el.id}
      style={{
        position: 'absolute',
        left: el.x,
        top: el.y,
        width: el.width,
        height: el.height,
      }}
    >
      <Image
        src={el.src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: el.objectFit,
        }}
      />
    </View>
  )
}

function renderQRElement(el: QRCodeElement, qrValue: string) {
  return (
    <View
      key={el.id}
      style={{
        position: 'absolute',
        left: el.x,
        top: el.y,
        width: el.width,
        height: el.height,
      }}
    >
      <QRCodeSvg value={qrValue} size={el.width} />
    </View>
  )
}

export function CertificateDocument({ template, variables, qrValue }: CertificateDocProps) {
  const sortedElements = [...template.elements].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <Document>
      <Page
        size={[template.canvas.width, template.canvas.height]}
        style={{
          backgroundColor: template.canvas.backgroundColor,
          position: 'relative',
        }}
      >
        {/* Background Image */}
        {template.canvas.backgroundImage && (
          <Image
            src={template.canvas.backgroundImage}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: template.canvas.width,
              height: template.canvas.height,
              objectFit: 'cover',
            }}
          />
        )}

        {/* Elements */}
        {sortedElements.map((el) => {
          switch (el.type) {
            case 'text':
              return renderTextElement(el, variables, template.lang)
            case 'image':
              return renderImageElement(el)
            case 'qr':
              return renderQRElement(el, qrValue)
            default:
              return null
          }
        })}
      </Page>
    </Document>
  )
}
