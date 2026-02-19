'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { checkMFAStatusAction, verifyMFAAction } from '@/app/actions/mfa'

export function MFAVerification() {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleVerify() {
    if (!code || code.length !== 6) return
    setIsLoading(true)
    
    try {
      const {factorId } = await checkMFAStatusAction()

      if (!factorId) {
        throw new Error('No TOTP factor found')
      }

      // Use server action for verification
      await verifyMFAAction(factorId, code)
      
      toast.success('Verification successful')
      // Redirect to the intended page or dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Enter the 6-digit code from your authenticator app
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
          <Button 
            onClick={handleVerify}
            disabled={isLoading || code.length !== 6}
            className="w-full"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 