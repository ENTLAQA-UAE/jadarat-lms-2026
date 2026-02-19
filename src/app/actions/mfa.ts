'use server'

import { createClient } from '@/utils/supabase/server'

export async function setupMFAAction() {
  const supabase = await createClient()

  // First check existing factors
  const { data: factorData, error: listError } = await supabase.auth.mfa.listFactors()
  console.log('Existing factors:', factorData)
  if (listError) throw listError

  // Enroll new TOTP factor
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: `authenticator-${Date.now()}`
  })
  console.log('Enrollment result:', { data, error })
  if (error) throw error

  if (data.type !== 'totp' || !data.totp) {
    throw new Error('TOTP setup failed')
  }

  return {
    factorId: data.id,
    qrCode: data.totp.qr_code,
    uri: data.totp.uri,
    secret: data.totp.secret
  }
}

export async function verifyMFAAction(factorId: string, code: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code
    })
    if (error) throw error

    // Update user metadata to mark MFA as verified for this session
    await supabase.auth.updateUser({
      data: {
        mfa_verified_at: new Date().toISOString()
      }
    })

    return { success: true }
  } catch (error) {
    console.error('MFA verification error:', error)
    throw error
  }
}

export async function
  checkMFAStatusAction() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.mfa.listFactors()
    if (error) throw error

    // Check if there's any verified TOTP factor
    const verifiedTOTP = data.totp.find(factor => factor.status === 'verified')

    return {
      isEnabled: !!verifiedTOTP,
      factorId: verifiedTOTP?.id
    }
  } catch (error) {
    console.error('Error checking MFA status:', error)
    throw error
  }
}


export async function unenrollMFAAction(factorId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.unenroll({ factorId })
  console.log('Unenrollment result:', { data, error })
  if (error) throw error
  return { success: true }
}