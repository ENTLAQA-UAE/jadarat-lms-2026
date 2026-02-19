'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/language.context';

const BackButton = () => {
  const { isRTL } = useLanguage()
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Button variant="ghost" onClick={handleGoBack} aria-label="Go back">
      {isRTL ? <ArrowRight /> : <ArrowLeft />}
    </Button>
  );
};

export default BackButton;