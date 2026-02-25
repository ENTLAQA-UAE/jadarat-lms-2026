import { createClient } from '@/utils/supabase/server'
import type { Metadata } from 'next'
import VerifyCert from './VerifyCert'

interface VerifyPageProps {
  params: { uuid: string }
}

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

async function getCertificateData(uuid: string): Promise<CertificateData | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('verify_certificate', {
    cert_uuid: uuid,
  })

  if (error || !data || data.length === 0) return null
  return data[0] as CertificateData
}

export async function generateMetadata({ params }: VerifyPageProps): Promise<Metadata> {
  const cert = await getCertificateData(params.uuid)

  if (!cert) {
    return {
      title: 'Certificate Not Found | Jadarat',
      description: 'The certificate you are looking for could not be found.',
    }
  }

  const statusLabel = cert.status === 'active' ? 'Valid' : cert.status === 'expired' ? 'Expired' : 'Revoked'

  return {
    title: `${statusLabel} Certificate - ${cert.user_name} | ${cert.organization_name}`,
    description: `${cert.user_name} earned a certificate for completing "${cert.course_title}" from ${cert.organization_name}.`,
    openGraph: {
      title: `${statusLabel} Certificate - ${cert.course_title}`,
      description: `${cert.user_name} completed "${cert.course_title}" at ${cert.organization_name}`,
      type: 'website',
      ...(cert.org_logo ? { images: [{ url: cert.org_logo }] } : {}),
    },
  }
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const cert = await getCertificateData(params.uuid)

  return <VerifyCert certData={cert} uuid={params.uuid} />
}
