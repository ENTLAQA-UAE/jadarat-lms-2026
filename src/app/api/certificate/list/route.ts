import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * GET /api/certificate/list
 * List all certificates for the admin's organization. Admin role required.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role and org
    const { data: userData } = await supabase
      .from('users')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()

    if (!userData || !['organizationAdmin', 'LMSAdmin', 'superAdmin'].includes(userData.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get all certificates for the organization
    const { data: certificates, error } = await supabase
      .from('user_certificates')
      .select(`
        id,
        uuid,
        certificate,
        status,
        expires_at,
        revoked_at,
        revocation_reason,
        created_at,
        updated_at,
        user_id,
        course_id,
        users!inner(name, email, organization_id),
        courses!inner(title)
      `)
      .eq('users.organization_id', userData.organization_id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Flatten the response
    const result = (certificates || []).map((cert: any) => ({
      id: cert.id,
      uuid: cert.uuid,
      certificate_url: cert.certificate,
      status: cert.status === 'revoked' ? 'revoked'
        : (cert.expires_at && new Date(cert.expires_at) < new Date()) ? 'expired'
        : 'active',
      expires_at: cert.expires_at,
      revoked_at: cert.revoked_at,
      revocation_reason: cert.revocation_reason,
      issued_at: cert.created_at,
      student_name: cert.users?.name,
      student_email: cert.users?.email,
      course_title: cert.courses?.title,
    }))

    return NextResponse.json({ certificates: result })
  } catch (error: any) {
    console.error('Certificate list error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
