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
      return NextResponse.json({ url: existingCert[0].certificate })
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

    // 4. Get course details
    const { data: courseData } = await supabase
      .from('courses')
      .select('title, organization_id')
      .eq('id', courseId)
      .single()

    if (!courseData) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // 5. Get organization settings with certificate template
    const { data: orgSettings } = await supabase
      .from('organization_settings')
      .select('certificate_template_json, name, certificate_auth_title')
      .eq('organization_id', courseData.organization_id)
      .single()

    if (!orgSettings?.certificate_template_json) {
      return NextResponse.json(
        { error: 'No certificate template configured for this organization' },
        { status: 400 }
      )
    }

    const template = orgSettings.certificate_template_json as CertificateTemplateJSON

    // 6. Build variables
    const host = request.headers.get('host') || ''
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    const qrValue = `${protocol}://${host}/certificates-qr?s=${encodeURIComponent(targetUserId)}&c=${encodeURIComponent(courseId)}`

    const variables: CertificateVariables = {
      studentName: userData.name || userData.email || 'Student',
      courseName: courseData.title || 'Course',
      date: new Date().toISOString(),
      orgName: orgSettings.name || '',
      signatureTitle: orgSettings.certificate_auth_title || '',
    }

    // 7. Render PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(CertificateDocument, {
        template,
        variables,
        qrValue,
      }) as any
    )

    // 8. Upload to Supabase Storage
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

    // 9. Create signed URL (20-year expiry)
    const { data: urlData } = await supabase.storage
      .from('LMS Resources')
      .createSignedUrl(storagePath, 630720000)

    if (!urlData?.signedUrl) {
      return NextResponse.json({ error: 'Failed to create signed URL' }, { status: 500 })
    }

    // 10. Save to user_certificates
    await supabase.rpc('insert_user_certificate', {
      certificate_url: urlData.signedUrl,
      course: courseId,
    })

    return NextResponse.json({ url: urlData.signedUrl })
  } catch (error: any) {
    console.error('Certificate generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
