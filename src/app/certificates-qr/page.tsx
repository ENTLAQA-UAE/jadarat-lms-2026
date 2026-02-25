import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import LoadingComponent from './LoadingComponent'

const CertNotFound = dynamic(() => import('./CertNotFound'), {
  loading: () => <LoadingComponent />,
  ssr: false,
})

/**
 * Legacy verification page - redirects to /verify/[uuid] if possible.
 * Kept for backward compatibility with old QR codes that use ?s=userId&c=courseId format.
 */
async function CertificatesQrPage({ searchParams }: { searchParams: { s: string; c: string } }) {
  try {
    const supabase = await createClient()

    // Try to find the certificate by user_id + course_id and redirect to UUID-based URL
    const { data: cert } = await supabase
      .from('user_certificates')
      .select('uuid')
      .eq('user_id', searchParams.s)
      .eq('course_id', parseInt(searchParams.c))
      .single()

    if (cert?.uuid) {
      redirect(`/verify/${cert.uuid}`)
    }

    // Fallback: try the old RPC approach for certificates without UUIDs
    const { getCertData } = await import('@/action/organization/organizationAction')
    const data = await getCertData(searchParams.s, searchParams.c)

    if (!data) {
      return <CertNotFound />
    }

    // If we got data but no UUID redirect, show the old page
    const Cert = (await import('./Cert')).default
    return <Cert certData={data} />
  } catch (error) {
    return <CertNotFound />
  }
}

export default CertificatesQrPage
