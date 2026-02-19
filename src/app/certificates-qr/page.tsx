import dynamic from 'next/dynamic';
import { getCertData } from '@/action/organization/organizationAction'
import Cert from './Cert';
import LoadingComponent from './LoadingComponent';
// import CertNotFound from './CertNotFound';

const CertNotFound = dynamic(() => import('./CertNotFound'), {
  loading: () => <LoadingComponent/>,
  ssr: false
})

async function CertificatesQrPage({ searchParams }: { searchParams: { s: string, c:string } }) {
  try {
    const data = await getCertData(searchParams.s, searchParams.c)
    
    if (!data) {
      return <CertNotFound/>
    }
    
    return <Cert certData={data} />
  } catch (error) {
    // Handle any errors from getCertData
    return <CertNotFound/>
  }
}

export default CertificatesQrPage