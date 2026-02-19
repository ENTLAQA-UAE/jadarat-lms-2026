'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Loader2, Shield } from 'lucide-react'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { setupMFAAction, verifyMFAAction, checkMFAStatusAction, unenrollMFAAction } from '@/app/actions/mfa'
import { Step } from '../ui/steps'
import { Steps } from '../ui/steps'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

interface MFASetupState {
 factorId: string
 qrCode: string
 uri: string
 secret: string
}

export function MFASetup() {
 const [setupData, setSetupData] = useState<MFASetupState | null>(null)
 const [verifyCode, setVerifyCode] = useState('')
 const [isLoading, setIsLoading] = useState(false)
 const [currentStep, setCurrentStep] = useState(0)
 const [copied, setCopied] = useState(false)
 const [isMFAEnabled, setIsMFAEnabled] = useState<boolean | null>(null)
 const [isDisabling, setIsDisabling] = useState(false)

 useEffect(() => {
  checkMFAStatus()
 }, [])

 async function checkMFAStatus() {
  try {
   const { isEnabled } = await checkMFAStatusAction()
   setIsMFAEnabled(isEnabled)
  } catch (error) {
   toast.error('Failed to check MFA status')
  }
 }

 async function handleSetupMFA() {
  setIsLoading(true)
  try {
   const result = await setupMFAAction()
   setSetupData(result)
   setCurrentStep(1)
  } catch (error: any) {
   toast.error('Failed to setup MFA. Please try again.')
  } finally {
   setIsLoading(false)
  }
 }

 async function handleVerifyMFA() {
  if (!setupData?.factorId || !verifyCode) return

  setIsLoading(true)
  try {
   await verifyMFAAction(setupData.factorId, verifyCode)
   toast.success('Two-factor authentication enabled successfully!')
   setCurrentStep(2)
  } catch (error: any) {
   toast.error('Invalid verification code. Please try again.')
  } finally {
   setIsLoading(false)
  }
 }

 const handleCopySecret = () => {
  if (setupData?.secret) {
   navigator.clipboard.writeText(setupData.secret)
   setCopied(true)
   toast.success('Secret code copied to clipboard')
   setTimeout(() => setCopied(false), 2000)
  }
 }

 const handleKeyPress = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && verifyCode.length === 6) {
   handleVerifyMFA()
  }
 }

 async function handleDisableMFA() {
  console.log('handleDisableMFA called')
  const { factorId } = await checkMFAStatusAction()
  console.log('factorId:', factorId)
  setIsDisabling(true)
  try {
    await unenrollMFAAction(factorId!)
    toast.success('Two-factor authentication has been disabled')
    setIsMFAEnabled(false)
    setSetupData(null)
    setCurrentStep(0)
  } catch (error) {
    toast.error('Failed to disable two-factor authentication')
  } finally {
    setIsDisabling(false)
  }
 }

 if (isMFAEnabled === null) {
  return (
   <Card className="w-full max-w-md mx-auto">
    <CardContent className="py-6">
     <div className="flex justify-center">
      <Loader2 className="h-6 w-6 animate-spin" />
     </div>
    </CardContent>
   </Card>
  )
 }

 if (isMFAEnabled) {
  return (
   <Card className="w-full max-w-md mx-auto">
    <CardHeader>
     <CardTitle className="flex items-center gap-2">
      <Shield className="w-5 h-5" />
      Two-Factor Authentication
     </CardTitle>
     <CardDescription>
      Your account is protected with two-factor authentication
     </CardDescription>
    </CardHeader>
    <CardContent>
     <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center justify-center space-x-2 text-center">
       <div className="rounded-full bg-green-100 p-3">
        <Check className="w-6 h-6 text-green-600" />
       </div>
       <p className="text-sm text-muted-foreground">
        Two-factor authentication is enabled
       </p>
      </div>

      <AlertDialog>
       <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isDisabling}>
         {isDisabling ? (
          <>
           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
           Disabling...
          </>
         ) : (
          'Disable Two-Factor Authentication'
         )}
        </Button>
       </AlertDialogTrigger>
       <AlertDialogContent>
        <AlertDialogHeader>
         <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
         <AlertDialogDescription>
          This will remove the additional security layer from your account. Are you sure you want to continue?
         </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
         <AlertDialogCancel>Cancel</AlertDialogCancel>
         <AlertDialogAction onClick={handleDisableMFA} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
          Disable
         </AlertDialogAction>
        </AlertDialogFooter>
       </AlertDialogContent>
      </AlertDialog>
     </div>
    </CardContent>
   </Card>
  )
 }

 return (
  <Card className="w-full max-w-md mx-auto">
   <CardHeader>
    <CardTitle className="flex items-center gap-2">
     <Shield className="w-5 h-5" />
     Two-Factor Authentication
    </CardTitle>
    <CardDescription>
     Enhance your account security by enabling two-factor authentication
    </CardDescription>
   </CardHeader>
   <CardContent>
    <Steps currentStep={currentStep} className="mb-8">
     <Step title="Initialize" description="Start MFA setup" />
     <Step title="Scan QR" description="Connect your authenticator app" />
     <Step title="Verify" description="Complete the setup" />
    </Steps>

    <div className="space-y-6">
     <AnimatePresence mode="wait">
      {!setupData && currentStep === 0 && (
       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
       >
        <Button
         onClick={handleSetupMFA}
         disabled={isLoading}
         className="w-full"
        >
         {isLoading ? (
          <>
           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
           Initializing...
          </>
         ) : (
          'Setup Two-Factor Authentication'
         )}
        </Button>
       </motion.div>
      )}

      {setupData && currentStep === 1 && (
       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center space-y-6"
       >
        <div className="p-4 bg-white rounded-lg">
         <QRCode
          value={setupData.uri}
          aria-label="QR Code for authenticator app"
         />
        </div>

        <div className="text-center space-y-2">
         <p className="text-sm text-muted-foreground">
          Scan this QR code with your authenticator app
         </p>
         <div className="flex items-center justify-center gap-2">
          <code className="px-2 py-1 bg-muted rounded text-xs">
           {setupData.secret}
          </code>
          <Button
           variant="ghost"
           size="icon"
           onClick={handleCopySecret}
           aria-label="Copy secret code"
          >
           {copied ? (
            <Check className="h-4 w-4" />
           ) : (
            <Copy className="h-4 w-4" />
           )}
          </Button>
         </div>
        </div>

        <div className="space-y-2 w-full">
         <Input
          type="text"
          placeholder="Enter 6-digit code"
          value={verifyCode}
          onChange={(e) => {
           const value = e.target.value.replace(/[^0-9]/g, '')
           if (value.length <= 6) setVerifyCode(value)
          }}
          onKeyPress={handleKeyPress}
          maxLength={6}
          className="text-center text-lg tracking-wider"
          aria-label="Verification code input"
         />
         <Button
          onClick={handleVerifyMFA}
          disabled={isLoading || verifyCode.length !== 6}
          className="w-full"
         >
          {isLoading ? (
           <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
           </>
          ) : (
           'Verify and Enable'
          )}
         </Button>
        </div>
       </motion.div>
      )}

      {currentStep === 2 && (
       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
       >
        <div className="flex justify-center">
         <div className="rounded-full bg-green-100 p-3">
          <Check className="w-6 h-6 text-green-600" />
         </div>
        </div>
        <h3 className="text-lg font-semibold">Setup Complete!</h3>
        <p className="text-sm text-muted-foreground">
         Two-factor authentication has been successfully enabled for your account.
        </p>
       </motion.div>
      )}
     </AnimatePresence>
    </div>
   </CardContent>
  </Card>
 )
}

