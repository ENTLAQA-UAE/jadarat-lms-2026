import { redirect } from 'next/navigation'
import { MFAVerification } from "@/components/auth/MFAVerification"
import { checkMFAStatusAction } from '@/app/actions/mfa'

export default async function VerifyMFAPage() {
  // Check if MFA is required
  const { isEnabled, factorId } = await checkMFAStatusAction()
  
  // If MFA is not enabled or already verified, redirect to dashboard
  if (!isEnabled) {
    redirect('/dashboard')
  }

  return <MFAVerification />
} 