'use client'

import type { TextElement, CertificateLang } from '../types'
import { FONT_DISPLAY_NAMES } from '../constants'

interface TextBlockProps {
  element: TextElement
  scale: number
  lang: CertificateLang
}

const VARIABLE_PREVIEWS: Record<string, Record<CertificateLang, string>> = {
  '{{student_name}}': { en: 'John Smith', ar: 'أحمد محمد' },
  '{{course_name}}': { en: 'Introduction to AI', ar: 'مقدمة في الذكاء الاصطناعي' },
  '{{date}}': { en: '23/02/2026', ar: '٢٣/٠٢/٢٠٢٦' },
  '{{org_name}}': { en: 'Organization', ar: 'المنظمة' },
  '{{signature_title}}': { en: 'CEO', ar: 'المدير التنفيذي' },
}

function resolvePreview(content: string, lang: CertificateLang): string {
  const match = VARIABLE_PREVIEWS[content]
  return match ? match[lang] : content
}

export default function TextBlock({ element, scale, lang }: TextBlockProps) {
  const displayText = resolvePreview(element.content, lang)
  const isVariable = element.content.startsWith('{{')
  const fontCss =
    element.fontFamily === 'IBMPlexSansArabic'
      ? 'var(--font-ibm-arabic), sans-serif'
      : 'var(--font-poppins), sans-serif'

  return (
    <div
      className="w-full h-full flex items-center pointer-events-none"
      style={{
        fontFamily: fontCss,
        fontSize: element.fontSize * scale,
        fontWeight: element.fontWeight === 'bold' ? 700 : 400,
        color: element.color,
        textAlign: element.textAlign,
        justifyContent:
          element.textAlign === 'center'
            ? 'center'
            : element.textAlign === 'right'
              ? 'flex-end'
              : 'flex-start',
        direction: lang === 'ar' ? 'rtl' : 'ltr',
        lineHeight: 1.3,
      }}
    >
      <span
        className={isVariable ? 'border-b border-dashed border-blue-400' : ''}
      >
        {displayText}
      </span>
    </div>
  )
}
