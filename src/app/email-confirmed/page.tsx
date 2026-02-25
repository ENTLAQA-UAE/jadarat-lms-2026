'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function EmailConfirmed() {
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimationComplete(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const svgVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => {
      const delay = 0.5 + i * 0.5;
      return {
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: { delay, type: 'spring', duration: 1.5, bounce: 0 },
          opacity: { delay, duration: 0.01 },
        },
      };
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="relative w-48 h-48 mx-auto">
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-full h-full text-success"
          >
            <motion.path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              variants={svgVariants}
              initial="hidden"
              animate="visible"
              custom={0}
            />
            <motion.path
              d="M8 11.8571L10.5 14.3572L15.8572 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={svgVariants}
              initial="hidden"
              animate="visible"
              custom={1}
            />
          </motion.svg>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Email Confirmed!</h1>
        <p className="text-xl text-muted-foreground">
          Your email has been successfully confirmed.
        </p>
        <Button
          onClick={() => (window.location.href = '/login')}
          className="w-full"
        >
          Go to Login
        </Button>
      </div>
    </div>
  );
}
