'use client'

import { AlertCircle, CheckCircle2, Clock, XCircle, Download, Linkedin, Share2 } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import DisplayThumbnail from '@/components/pdfThumbnail'
import { DownloadFile } from '@/utils/downloadFile'

interface CertificateData {
  certificate_id: number
  uuid: string
  user_name: string
  user_email: string
  course_title: string
  course_description: string
  organization_name: string
  org_logo: string | null
  certificate_url: string
  certificate_auth_title: string | null
  issued_at: string
  expires_at: string | null
  status: 'active' | 'expired' | 'revoked'
  revocation_reason: string | null
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1.5 text-sm px-3 py-1">
          <CheckCircle2 className="h-4 w-4" />
          Valid Certificate
        </Badge>
      )
    case 'expired':
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1.5 text-sm px-3 py-1">
          <Clock className="h-4 w-4" />
          Expired Certificate
        </Badge>
      )
    case 'revoked':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 gap-1.5 text-sm px-3 py-1">
          <XCircle className="h-4 w-4" />
          Revoked Certificate
        </Badge>
      )
    default:
      return null
  }
}

function CertNotFound({ uuid }: { uuid: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-destructive">Certificate Not Found</h1>
              <p className="text-muted-foreground text-sm max-w-sm">
                We could not find a certificate with this verification ID. Please check the URL or QR code and try again.
              </p>
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg w-full">
              <p className="text-xs text-muted-foreground">Verification ID</p>
              <p className="font-mono text-sm break-all mt-1">{uuid}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-xs text-muted-foreground">
            If you believe this is an error, please contact the issuing organization.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function VerifyCert({
  certData,
  uuid,
}: {
  certData: CertificateData | null
  uuid: string
}) {
  if (!certData) {
    return <CertNotFound uuid={uuid} />
  }

  const issuedDate = new Date(certData.issued_at).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const expiresDate = certData.expires_at
    ? new Date(certData.expires_at).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header with org logo */}
        <div className="flex flex-col items-center gap-4">
          {certData.org_logo && (
            <Image
              src={certData.org_logo}
              width={180}
              height={80}
              alt={certData.organization_name}
              className="h-16 w-auto object-contain"
            />
          )}
          <h1 className="text-2xl font-bold text-center">Certificate Verification</h1>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <StatusBadge status={certData.status} />
        </div>

        {/* Certificate Preview */}
        <Card>
          <CardContent className="pt-6">
            {certData.status === 'revoked' && certData.revocation_reason && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Revocation reason:</strong> {certData.revocation_reason}
                </p>
              </div>
            )}

            {certData.certificate_url && (
              <div className="flex justify-center mb-6">
                <div className="w-full max-w-md">
                  <DisplayThumbnail
                    fileUrl={certData.certificate_url}
                    pageIndex={1}
                    width={400}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">Issued To</p>
                <p className="font-semibold">{certData.user_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">Course</p>
                <p className="font-semibold">{certData.course_title}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">Issued By</p>
                <p>{certData.organization_name}</p>
              </div>
              {certData.certificate_auth_title && (
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium">Signed By</p>
                  <p>{certData.certificate_auth_title}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">Issue Date</p>
                <p>{issuedDate}</p>
              </div>
              {expiresDate && (
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium">Expiration Date</p>
                  <p>{expiresDate}</p>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3 border-t pt-4">
            <div className="flex gap-2 w-full flex-wrap">
              {certData.status === 'active' && certData.certificate_url && (
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => DownloadFile(certData.certificate_url)}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              )}
              {certData.status === 'active' && (
                <>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      const url = new URL('https://www.linkedin.com/profile/add')
                      url.searchParams.set('startTask', 'CERTIFICATION_NAME')
                      url.searchParams.set('name', certData.course_title)
                      url.searchParams.set('issueYear', String(new Date(certData.issued_at).getFullYear()))
                      url.searchParams.set('issueMonth', String(new Date(certData.issued_at).getMonth() + 1))
                      url.searchParams.set('certUrl', window.location.href)
                      url.searchParams.set('certId', certData.uuid)
                      window.open(url.toString(), '_blank')
                    }}
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      const text = `I earned a certificate for "${certData.course_title}" from ${certData.organization_name}!`
                      window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`,
                        '_blank'
                      )
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    X
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      const text = `I earned a certificate for "${certData.course_title}" from ${certData.organization_name}! ${window.location.href}`
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                    }}
                  >
                    WhatsApp
                  </Button>
                </>
              )}
            </div>
            <div className="p-3 bg-muted rounded-lg w-full text-center">
              <p className="text-xs text-muted-foreground">Certificate ID</p>
              <p className="font-mono text-sm mt-1">{certData.uuid}</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
