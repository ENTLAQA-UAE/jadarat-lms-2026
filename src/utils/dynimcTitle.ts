// In your layout or page component file
import { NextRequest } from 'next/server';

export async function generateMetadata(request: NextRequest) {
  const { headers } = request;
  const host = headers.get('host') || '';
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMIAN || '';
  const isDefaultDomain = host === mainDomain;

  const getTitle = () => {
    if (isDefaultDomain) {
      return 'Jadarat';
    } else {
      const subdomain = host.split('.')[0];
      return `${subdomain.toUpperCase()} LMS`;
    }
  };

  const title = getTitle();

  return {
    title,
    description: 'Your description here', // Add your description if needed
  };
}
