/* eslint-disable react/no-unescaped-entities */
'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from 'lucide-react'

export default function Custom404() {
 return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground relative overflow-hidden">
   {/* Ambient glow orbs */}
   <div className="absolute top-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/[0.04] blur-[120px]" />
   <div className="absolute bottom-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-accent/[0.03] blur-[100px]" />

   <motion.div
    className="relative z-10 flex flex-col items-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
   >
    {/* 404 number */}
    <motion.div
     className="text-[120px] sm:text-[160px] font-bold leading-none tracking-tighter text-foreground/[0.06]"
     initial={{ scale: 0.8, opacity: 0 }}
     animate={{ scale: 1, opacity: 1 }}
     transition={{ duration: 0.6, delay: 0.1 }}
    >
     404
    </motion.div>

    {/* Content */}
    <div className="-mt-8 flex flex-col items-center text-center space-y-3">
     <h1 className="text-xl font-semibold tracking-tight text-foreground">Page not found</h1>
     <p className="text-sm text-muted-foreground/70 max-w-sm">
      The page you're looking for doesn't exist or has been moved.
     </p>
    </div>

    {/* Actions */}
    <div className="mt-8 flex items-center gap-3">
     <Button variant="outline" asChild>
      <Link href="javascript:history.back()" className="flex items-center gap-2">
       <ArrowLeft className="h-4 w-4" />
       Go Back
      </Link>
     </Button>
     <Button asChild>
      <Link href="/dashboard" className="flex items-center gap-2">
       <Home className="h-4 w-4" />
       Dashboard
      </Link>
     </Button>
    </div>
   </motion.div>
  </div>
 )
}
