import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * POST /api/certificate/revoke
 * Revoke a certificate by UUID. Only accessible by org admins.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Role check - only org admins and LMS admins can revoke
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || !['organizationAdmin', 'LMSAdmin', 'superAdmin'].includes(userData.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { uuid, reason } = body as { uuid: string; reason?: string }

    if (!uuid) {
      return NextResponse.json({ error: 'uuid is required' }, { status: 400 })
    }

    const { error } = await supabase.rpc('revoke_certificate', {
      cert_uuid: uuid,
      reason: reason || null,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Certificate revocation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
