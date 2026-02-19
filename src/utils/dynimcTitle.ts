// In your layout or page component file
import { NextRequest } from 'next/server';

export async function generateMetadata(request: NextRequest) {
  const { headers } = request;
  const host = headers.get('host') || ''; // Get the domain from headers
  const isDefaultDomain = host === 'localhost:3000'; // Modify this check based on your default domain

  const getTitle = () => {
    if (isDefaultDomain) {
      return 'Jadarat';
    } else {
      const subdomain = host.split('.')[0]; // Get subdomain part
      return `${subdomain.toUpperCase()} LMS`;
    }
  };

  const title = getTitle();

  return {
    title,
    description: 'Your description here', // Add your description if needed
  };
}
