import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * GET /api/certificate/badge?uuid=<cert-uuid>
 * Returns Open Badges 3.0 / W3C Verifiable Credentials 2.0 compatible JSON-LD
 * for a given certificate UUID. Public endpoint, no auth required.
 */
export async function GET(request: NextRequest) {
  const uuid = request.nextUrl.searchParams.get('uuid')

  if (!uuid) {
    return NextResponse.json({ error: 'uuid parameter is required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase.rpc('verify_certificate', {
    cert_uuid: uuid,
  })

  if (error || !data || data.length === 0) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
  }

  const cert = data[0]
  const host = request.headers.get('host') || ''
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`

  // Open Badges 3.0 / W3C VC 2.0 compliant credential
  const credential = {
    '@context': [
      'https://www.w3.org/ns/credentials/v2',
      'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json',
    ],
    type: ['VerifiableCredential', 'OpenBadgeCredential'],
    id: `${baseUrl}/verify/${cert.uuid}`,
    name: `Certificate of Completion: ${cert.course_title}`,
    issuer: {
      type: ['Profile'],
      id: `${baseUrl}`,
      name: cert.organization_name,
      ...(cert.org_logo ? { image: { id: cert.org_logo, type: 'Image' } } : {}),
    },
    issuanceDate: cert.issued_at,
    ...(cert.expires_at ? { expirationDate: cert.expires_at } : {}),
    credentialSubject: {
      type: ['AchievementSubject'],
      name: cert.user_name,
      achievement: {
        type: ['Achievement'],
        name: cert.course_title,
        description: cert.course_description || `Completion of ${cert.course_title}`,
        criteria: {
          narrative: `Successfully completed the course "${cert.course_title}" offered by ${cert.organization_name}.`,
        },
      },
    },
    credentialStatus: {
      type: 'StatusList2021Entry',
      statusPurpose: 'revocation',
      statusListIndex: String(cert.certificate_id),
      statusListCredential: `${baseUrl}/api/certificate/badge?uuid=${cert.uuid}`,
    },
    // Human-readable verification
    verification: {
      type: 'HostedBadge',
      verificationProperty: 'id',
    },
    // Certificate status
    _status: cert.status,
  }

  return NextResponse.json(credential, {
    headers: {
      'Content-Type': 'application/ld+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
