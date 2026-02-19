export const dynamic = 'force-dynamic'
import { getUserCertificates } from '@/action/leaner/getUserCertificates'
import CertificatesCardPage from './CertificatesCardPage'
import { fetchUserData } from '@/action/authAction'
import { createClient } from '@/utils/supabase/server';

async function CertificatesPage() {
  const supabase = await createClient();
  let { data} = await supabase.rpc('get_user_certificates');

  return (
    <CertificatesCardPage userCertificates={data} />
   
  )
}

export default CertificatesPage