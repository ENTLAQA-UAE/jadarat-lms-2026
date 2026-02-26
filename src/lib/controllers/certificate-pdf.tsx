/* eslint-disable jsx-a11y/alt-text -- @react-pdf/renderer Image has no alt prop */
import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  Image,
  Font,
  Svg,
  Rect,
} from '@react-pdf/renderer'
import QRCodeLib from 'qrcode'
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

// ── QR Code Generator (using qrcode library with proper error correction) ──

function generateQRMatrix(data: string): boolean[][] {
  const qr = QRCodeLib.create(data, { errorCorrectionLevel: 'M' })
  const size = qr.modules.size
  const modules = qr.modules.data

  const matrix: boolean[][] = []
  for (let y = 0; y < size; y++) {
    const row: boolean[] = []
    for (let x = 0; x < size; x++) {
      row.push(modules[y * size + x] === 1)
    }
    matrix.push(row)
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
  certificateId?: string
  verificationUrl?: string
  courseGrade?: string
  courseScore?: string
  creditHours?: string
  instructorName?: string
  dateHijri?: string
  courseLevel?: string
  courseCategory?: string
  expirationDate?: string
}

function replaceVariables(content: string, vars: CertificateVariables, lang: CertificateLang): string {
  const dateFormatted = lang === 'ar'
    ? new Date(vars.date).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : new Date(vars.date).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })

  let result = content
    .replace(/\{\{student_name\}\}/g, vars.studentName)
    .replace(/\{\{course_name\}\}/g, vars.courseName)
    .replace(/\{\{date\}\}/g, dateFormatted)
    .replace(/\{\{org_name\}\}/g, vars.orgName)
    .replace(/\{\{signature_title\}\}/g, vars.signatureTitle)
    .replace(/\{\{certificate_id\}\}/g, vars.certificateId || '')
    .replace(/\{\{verification_url\}\}/g, vars.verificationUrl || '')
    .replace(/\{\{course_grade\}\}/g, vars.courseGrade || '')
    .replace(/\{\{course_score\}\}/g, vars.courseScore || '')
    .replace(/\{\{credit_hours\}\}/g, vars.creditHours || '')
    .replace(/\{\{instructor_name\}\}/g, vars.instructorName || '')
    .replace(/\{\{date_hijri\}\}/g, vars.dateHijri || '')
    .replace(/\{\{course_level\}\}/g, vars.courseLevel || '')
    .replace(/\{\{course_category\}\}/g, vars.courseCategory || '')
    .replace(/\{\{expiration_date\}\}/g, vars.expirationDate || '')

  return result
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
