'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ExpiredTokenForm() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <Card className='h-screen flex flex-col justify-center items-start'>
      <CardHeader>
        <CardTitle className="text-2xl">Session Expired</CardTitle>
        <CardDescription>Your session has expired. Please log in again to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-5 w-5" />
          <p>Your authentication token has expired due to inactivity.</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleLogin}>
          Log In Again
        </Button>
      </CardFooter>
    </Card>
  );
}