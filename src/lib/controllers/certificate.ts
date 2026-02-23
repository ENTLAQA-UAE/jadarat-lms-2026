"use server"

import { fulldomain } from '@/utils/getFullDomain'

/**
 * Generate a certificate PDF via the internal API route.
 * This replaces the previous Placid-based generation.
 */
export async function generateCertificatePdf({
  courseId,
  studentId,
}: {
  courseId: number
  studentId?: string
}): Promise<{ url: string | null; error: string | null }> {
  try {
    const isLocal = process.env.NODE_ENV === 'development'
    const baseUrl = isLocal ? 'http://localhost:3000' : `https://${fulldomain}`

    const response = await fetch(`${baseUrl}/api/certificate/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, studentId }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { url: null, error: data.error || 'Certificate generation failed' }
    }

    return { url: data.url, error: null }
  } catch (error: any) {
    console.error('Certificate generation error:', error)
    return { url: null, error: error.message || 'Unexpected error' }
  }
}
