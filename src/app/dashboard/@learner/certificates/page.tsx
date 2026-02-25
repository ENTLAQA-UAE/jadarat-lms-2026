export const dynamic = 'force-dynamic'
import { getUserCertificates } from '@/action/leaner/getUserCertificates'
import CertificatesCardPage from './CertificatesCardPage'
import { fetchUserData } from '@/action/authAction'
import { createClient } from '@/utils/supabase/server';

async function CertificatesPage() {
  const supabase = await createClient();
  let { data} = await supabase.rpc('get_user_certificates');

  return (
    <div className="p-4 sm:p-6">
      <CertificatesCardPage userCertificates={data} />
    </div>
  )
}

export default CertificatesPage