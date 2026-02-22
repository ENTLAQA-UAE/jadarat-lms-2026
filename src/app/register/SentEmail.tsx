/* eslint-disable react/no-unescaped-entities */
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import React from 'react';

function SentEmail({ email }: { email: string }) {
  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <Mail className="mx-auto h-24 w-24 text-primary" />
        <h1 className="text-3xl font-bold">Check your email</h1>
        <p className="text-muted-foreground">
          We've sent a confirmation email to {email}. Please check your inbox
          and follow the instructions to complete your registration.
        </p>
        <Button
          onClick={() => (window.location.href = '/login')}
          className="w-full"
        >
          Back to Login
        </Button>
      </div>
    </div>
  );
}

export default SentEmail;
