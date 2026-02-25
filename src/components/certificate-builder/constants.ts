import type {
  CertificateLang,
  CertificateTemplateJSON,
  FontFamily,
} from './types'

// ── Canvas ──

export const CANVAS_WIDTH = 842   // A4 landscape in pt
export const CANVAS_HEIGHT = 595

// ── Fonts ──

export const FONTS_BY_LANG: Record<CertificateLang, FontFamily> = {
  en: 'Poppins',
  ar: 'IBMPlexSansArabic',
}

export const FONT_DISPLAY_NAMES: Record<FontFamily, string> = {
  Poppins: 'Poppins',
  IBMPlexSansArabic: 'IBM Plex Sans Arabic',
}

// ── Dynamic Variables ──

export const DYNAMIC_VARIABLES = [
  { key: '{{student_name}}', labelEn: 'Student Name', labelAr: 'اسم الطالب', category: 'student' },
  { key: '{{course_name}}', labelEn: 'Course Name', labelAr: 'اسم الدورة', category: 'course' },
  { key: '{{date}}', labelEn: 'Completion Date', labelAr: 'تاريخ الإنجاز', category: 'certificate' },
  { key: '{{date_hijri}}', labelEn: 'Hijri Date', labelAr: 'التاريخ الهجري', category: 'certificate' },
  { key: '{{org_name}}', labelEn: 'Organization', labelAr: 'المنظمة', category: 'organization' },
  { key: '{{signature_title}}', labelEn: 'Signature Title', labelAr: 'عنوان التوقيع', category: 'organization' },
  { key: '{{certificate_id}}', labelEn: 'Certificate ID', labelAr: 'رقم الشهادة', category: 'certificate' },
  { key: '{{verification_url}}', labelEn: 'Verification URL', labelAr: 'رابط التحقق', category: 'certificate' },
  { key: '{{course_grade}}', labelEn: 'Grade', labelAr: 'الدرجة', category: 'course' },
  { key: '{{course_score}}', labelEn: 'Score', labelAr: 'النتيجة', category: 'course' },
  { key: '{{credit_hours}}', labelEn: 'Credit Hours', labelAr: 'الساعات المعتمدة', category: 'course' },
  { key: '{{instructor_name}}', labelEn: 'Instructor', labelAr: 'المدرب', category: 'course' },
  { key: '{{course_level}}', labelEn: 'Course Level', labelAr: 'مستوى الدورة', category: 'course' },
  { key: '{{course_category}}', labelEn: 'Category', labelAr: 'التصنيف', category: 'course' },
  { key: '{{expiration_date}}', labelEn: 'Expiration Date', labelAr: 'تاريخ الانتهاء', category: 'certificate' },
] as const

export const VARIABLE_CATEGORIES = [
  { key: 'student', labelEn: 'Student', labelAr: 'الطالب' },
  { key: 'course', labelEn: 'Course', labelAr: 'الدورة' },
  { key: 'certificate', labelEn: 'Certificate', labelAr: 'الشهادة' },
  { key: 'organization', labelEn: 'Organization', labelAr: 'المنظمة' },
] as const

// ── Default Templates ──

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function createClassicTemplate(lang: CertificateLang): CertificateTemplateJSON {
  const font = FONTS_BY_LANG[lang]
  const isAr = lang === 'ar'
  return {
    version: 1,
    lang,
    canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, backgroundColor: '#FFFFFF' },
    elements: [
      {
        id: uid(), type: 'text', x: 171, y: 40, width: 500, height: 50,
        rotation: 0, zIndex: 10,
        content: isAr ? 'شهادة إنجاز' : 'Certificate of Completion',
        fontFamily: font, fontSize: 32, fontWeight: 'bold',
        color: '#1a1a2e', textAlign: 'center',
      },
      {
        id: uid(), type: 'text', x: 171, y: 110, width: 500, height: 30,
        rotation: 0, zIndex: 10,
        content: isAr ? 'يُمنح هذا لـ' : 'This is awarded to',
        fontFamily: font, fontSize: 16, fontWeight: 'normal',
        color: '#6b7280', textAlign: 'center',
      },
      {
        id: uid(), type: 'text', x: 171, y: 155, width: 500, height: 45,
        rotation: 0, zIndex: 10,
        content: '{{student_name}}',
        fontFamily: font, fontSize: 28, fontWeight: 'bold',
        color: '#1a1a2e', textAlign: 'center',
      },
      {
        id: uid(), type: 'text', x: 171, y: 215, width: 500, height: 30,
        rotation: 0, zIndex: 10,
        content: isAr ? 'لإتمامه بنجاح دورة' : 'for successfully completing',
        fontFamily: font, fontSize: 14, fontWeight: 'normal',
        color: '#6b7280', textAlign: 'center',
      },
      {
        id: uid(), type: 'text', x: 171, y: 255, width: 500, height: 40,
        rotation: 0, zIndex: 10,
        content: '{{course_name}}',
        fontFamily: font, fontSize: 22, fontWeight: 'bold',
        color: '#1a1a2e', textAlign: 'center',
      },
      {
        id: uid(), type: 'text', x: 171, y: 320, width: 500, height: 25,
        rotation: 0, zIndex: 10,
        content: '{{date}}',
        fontFamily: font, fontSize: 14, fontWeight: 'normal',
        color: '#6b7280', textAlign: 'center',
      },
      {
        id: uid(), type: 'text', x: 171, y: 350, width: 500, height: 20,
        rotation: 0, zIndex: 10,
        content: '{{certificate_id}}',
        fontFamily: font, fontSize: 10, fontWeight: 'normal',
        color: '#9ca3af', textAlign: 'center',
      },
      {
        id: uid(), type: 'image', x: 50, y: 30, width: 100, height: 60,
        rotation: 0, zIndex: 10,
        src: '', objectFit: 'contain' as const,
      },
      {
        id: uid(), type: 'text', x: 171, y: 460, width: 500, height: 25,
        rotation: 0, zIndex: 10,
        content: '{{signature_title}}',
        fontFamily: font, fontSize: 14, fontWeight: 'normal',
        color: '#374151', textAlign: 'center',
      },
      {
        id: uid(), type: 'qr', x: 720, y: 470, width: 80, height: 80,
        rotation: 0, zIndex: 10,
      },
    ],
  }
}

export function createModernTemplate(lang: CertificateLang): CertificateTemplateJSON {
  const font = FONTS_BY_LANG[lang]
  const isAr = lang === 'ar'
  const align = isAr ? 'right' : 'left' as const
  return {
    version: 1,
    lang,
    canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, backgroundColor: '#f8fafc' },
    elements: [
      {
        id: uid(), type: 'image', x: 40, y: 30, width: 90, height: 55,
        rotation: 0, zIndex: 10,
        src: '', objectFit: 'contain' as const,
      },
      {
        id: uid(), type: 'text', x: 40, y: 120, width: 500, height: 45,
        rotation: 0, zIndex: 10,
        content: isAr ? 'شهادة إنجاز' : 'CERTIFICATE',
        fontFamily: font, fontSize: 36, fontWeight: 'bold',
        color: '#0f172a', textAlign: align,
      },
      {
        id: uid(), type: 'text', x: 40, y: 180, width: 500, height: 40,
        rotation: 0, zIndex: 10,
        content: '{{student_name}}',
        fontFamily: font, fontSize: 26, fontWeight: 'bold',
        color: '#3b82f6', textAlign: align,
      },
      {
        id: uid(), type: 'text', x: 40, y: 235, width: 500, height: 30,
        rotation: 0, zIndex: 10,
        content: '{{course_name}}',
        fontFamily: font, fontSize: 18, fontWeight: 'normal',
        color: '#475569', textAlign: align,
      },
      {
        id: uid(), type: 'text', x: 40, y: 280, width: 300, height: 25,
        rotation: 0, zIndex: 10,
        content: '{{date}}',
        fontFamily: font, fontSize: 13, fontWeight: 'normal',
        color: '#94a3b8', textAlign: align,
      },
      {
        id: uid(), type: 'text', x: 40, y: 310, width: 300, height: 20,
        rotation: 0, zIndex: 10,
        content: '{{certificate_id}}',
        fontFamily: font, fontSize: 10, fontWeight: 'normal',
        color: '#cbd5e1', textAlign: align,
      },
      {
        id: uid(), type: 'text', x: 40, y: 480, width: 300, height: 25,
        rotation: 0, zIndex: 10,
        content: '{{signature_title}}',
        fontFamily: font, fontSize: 13, fontWeight: 'normal',
        color: '#475569', textAlign: align,
      },
      {
        id: uid(), type: 'qr', x: 720, y: 470, width: 80, height: 80,
        rotation: 0, zIndex: 10,
      },
    ],
  }
}

export function createMinimalTemplate(lang: CertificateLang): CertificateTemplateJSON {
  const font = FONTS_BY_LANG[lang]
  const isAr = lang === 'ar'
  return {
    version: 1,
    lang,
    canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, backgroundColor: '#FFFFFF' },
    elements: [
      {
        id: uid(), type: 'text', x: 171, y: 180, width: 500, height: 50,
        rotation: 0, zIndex: 10,
        content: '{{student_name}}',
        fontFamily: font, fontSize: 30, fontWeight: 'bold',
        color: '#111827', textAlign: 'center',
      },
      {
        id: uid(), type: 'text', x: 171, y: 245, width: 500, height: 30,
        rotation: 0, zIndex: 10,
        content: '{{course_name}}',
        fontFamily: font, fontSize: 18, fontWeight: 'normal',
        color: '#6b7280', textAlign: 'center',
      },
      {
        id: uid(), type: 'text', x: 171, y: 290, width: 500, height: 25,
        rotation: 0, zIndex: 10,
        content: '{{date}}',
        fontFamily: font, fontSize: 13, fontWeight: 'normal',
        color: '#9ca3af', textAlign: 'center',
      },
      {
        id: uid(), type: 'qr', x: 381, y: 370, width: 80, height: 80,
        rotation: 0, zIndex: 10,
      },
      {
        id: uid(), type: 'text', x: 171, y: 470, width: 500, height: 25,
        rotation: 0, zIndex: 10,
        content: '{{org_name}}',
        fontFamily: font, fontSize: 12, fontWeight: 'normal',
        color: '#9ca3af', textAlign: 'center',
      },
    ],
  }
}

export const DEFAULT_TEMPLATES = [
  { name: 'Classic', nameAr: 'كلاسيكي', create: createClassicTemplate },
  { name: 'Modern', nameAr: 'عصري', create: createModernTemplate },
  { name: 'Minimal', nameAr: 'بسيط', create: createMinimalTemplate },
] as const
