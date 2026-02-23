// ── Certificate Template Builder Types ──

export type CertificateLang = 'ar' | 'en'

export type FontFamily = 'Poppins' | 'IBMPlexSansArabic'

export type ElementType = 'text' | 'image' | 'qr'

export interface CertificateCanvas {
  width: number   // 842 = A4 landscape in pt
  height: number  // 595
  backgroundColor: string
  backgroundImage?: string
}

export interface BaseElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
}

export interface TextElement extends BaseElement {
  type: 'text'
  content: string
  fontFamily: FontFamily
  fontSize: number
  fontWeight: 'normal' | 'bold'
  color: string
  textAlign: 'left' | 'center' | 'right'
}

export interface ImageElement extends BaseElement {
  type: 'image'
  src: string
  objectFit: 'contain' | 'cover'
}

export interface QRCodeElement extends BaseElement {
  type: 'qr'
}

export type CertificateElement = TextElement | ImageElement | QRCodeElement

export interface CertificateTemplateJSON {
  version: 1
  lang: CertificateLang
  canvas: CertificateCanvas
  elements: CertificateElement[]
}

// ── Builder State ──

export interface BuilderState {
  template: CertificateTemplateJSON
  selectedElementId: string | null
  isDirty: boolean
}

export type BuilderAction =
  | { type: 'SET_TEMPLATE'; payload: CertificateTemplateJSON }
  | { type: 'SET_LANG'; payload: CertificateLang }
  | { type: 'SET_CANVAS_BG'; payload: string }
  | { type: 'SET_CANVAS_BG_IMAGE'; payload: string | undefined }
  | { type: 'ADD_ELEMENT'; payload: CertificateElement }
  | { type: 'UPDATE_ELEMENT'; payload: { id: string; changes: Partial<CertificateElement> } }
  | { type: 'REMOVE_ELEMENT'; payload: string }
  | { type: 'MOVE_ELEMENT'; payload: { id: string; x: number; y: number } }
  | { type: 'RESIZE_ELEMENT'; payload: { id: string; width: number; height: number; x?: number; y?: number } }
  | { type: 'SELECT_ELEMENT'; payload: string | null }
  | { type: 'REORDER_ELEMENT'; payload: { id: string; zIndex: number } }
  | { type: 'MARK_CLEAN' }
