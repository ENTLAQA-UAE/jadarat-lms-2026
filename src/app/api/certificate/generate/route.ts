import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/utils/supabase/server'
import { CertificateDocument } from '@/lib/controllers/certificate-pdf'
import type { CertificateTemplateJSON } from '@/components/certificate-builder/types'
import type { CertificateVariables } from '@/lib/controllers/certificate-pdf'
import React from 'react'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId, studentId } = body as { courseId: number; studentId?: string }

    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
    }

    const targetUserId = studentId || user.id

    // 2. Check if certificate already exists
    const { data: existingCert } = await supabase.rpc('get_certificate_if_exists', {
      course_id: courseId,
    })

    if (existingCert && existingCert.length > 0 && existingCert[0].certificate) {
      return NextResponse.json({
        url: existingCert[0].certificate,
        uuid: existingCert[0].uuid,
      })
    }

    // 3. Get user details
    const { data: userData } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', targetUserId)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 4. Get course details with category and template
    const { data: courseData } = await supabase
      .from('courses')
      .select('title, organization_id, level, certificate_template_id, category_id')
      .eq('id', courseId)
      .single()

    if (!courseData) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // 5. Get category name
    let categoryName = ''
    if (courseData.category_id) {
      const { data: catData } = await supabase
        .from('categories')
        .select('name')
        .eq('id', courseData.category_id)
        .single()
      if (catData) categoryName = catData.name
    }

    // 6. Get organization settings
    const { data: orgSettings } = await supabase
      .from('organization_settings')
      .select('certificate_template_json, name, certificate_auth_title, linkedin_company_id')
      .eq('organization_id', courseData.organization_id)
      .single()

    // 7. Resolve template: course-level → org default template → org settings legacy
    let template: CertificateTemplateJSON | null = null

    if (courseData.certificate_template_id) {
      const { data: courseTemplate } = await supabase
        .from('certificate_templates')
        .select('template_json')
        .eq('id', courseData.certificate_template_id)
        .single()
      if (courseTemplate?.template_json) {
        template = courseTemplate.template_json as CertificateTemplateJSON
      }
    }

    if (!template) {
      // Try org default template
      const { data: defaultTemplate } = await supabase
        .from('certificate_templates')
        .select('template_json')
        .eq('organization_id', courseData.organization_id)
        .eq('is_default', true)
        .single()
      if (defaultTemplate?.template_json) {
        template = defaultTemplate.template_json as CertificateTemplateJSON
      }
    }

    if (!template && orgSettings?.certificate_template_json) {
      template = orgSettings.certificate_template_json as CertificateTemplateJSON
    }

    if (!template) {
      return NextResponse.json(
        { error: 'No certificate template configured for this organization' },
        { status: 400 }
      )
    }

    // 8. Generate UUID for this certificate
    const certUuid = crypto.randomUUID()

    // 9. Build verification URL
    const host = request.headers.get('host') || ''
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    const verificationUrl = `${protocol}://${host}/verify/${certUuid}`

    // 10. Get course completion data
    const { data: courseProgress } = await supabase
      .from('user_courses')
      .select('progress, completed_at')
      .eq('user_id', targetUserId)
      .eq('course_id', courseId)
      .single()

    // 11. Build variables
    const variables: CertificateVariables = {
      studentName: userData.name || userData.email || 'Student',
      courseName: courseData.title || 'Course',
      date: courseProgress?.completed_at || new Date().toISOString(),
      orgName: orgSettings?.name || '',
      signatureTitle: orgSettings?.certificate_auth_title || '',
      certificateId: certUuid,
      verificationUrl,
      courseGrade: courseProgress?.progress ? `${courseProgress.progress}%` : '',
      courseScore: courseProgress?.progress || '',
      courseLevel: courseData.level || '',
      courseCategory: categoryName,
      instructorName: '',
      creditHours: '',
      dateHijri: formatHijriDate(courseProgress?.completed_at || new Date().toISOString()),
    }

    // 12. Render PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(CertificateDocument, {
        template,
        variables,
        qrValue: verificationUrl,
      }) as any
    )

    // 13. Upload to Supabase Storage
    const sanitizedName = `${userData.name?.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '-') || 'student'}-${courseData.title?.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '-') || 'course'}`
    const storagePath = `certificates/${courseData.organization_id}/${sanitizedName}-${Date.now()}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('LMS Resources')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    // 14. Create signed URL (20-year expiry)
    const { data: urlData } = await supabase.storage
      .from('LMS Resources')
      .createSignedUrl(storagePath, 630720000)

    if (!urlData?.signedUrl) {
      return NextResponse.json({ error: 'Failed to create signed URL' }, { status: 500 })
    }

    // 15. Save to user_certificates with UUID
    // Using direct insert since the RPC insert_user_certificate uses auth.uid()
    // and we may be generating for a different student
    const { error: insertError } = await supabase
      .from('user_certificates')
      .upsert({
        user_id: targetUserId,
        course_id: courseId,
        certificate: urlData.signedUrl,
        uuid: certUuid,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,course_id' })

    if (insertError) {
      // Fallback to RPC for self-issuance
      await supabase.rpc('insert_user_certificate', {
        certificate_url: urlData.signedUrl,
        course: courseId,
      })
    }

    return NextResponse.json({ url: urlData.signedUrl, uuid: certUuid })
  } catch (error: any) {
    console.error('Certificate generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Convert a Gregorian date to approximate Hijri date string.
 * Uses the Intl.DateTimeFormat with 'ar-SA' locale and 'islamic-umalqura' calendar.
 */
function formatHijriDate(isoDate: string): string {
  try {
    const date = new Date(isoDate)
    const formatter = new Intl.DateTimeFormat('ar-SA', {
      calendar: 'islamic-umalqura',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    return formatter.format(date)
  } catch {
    return ''
  }
}
