/* eslint-disable react/no-unescaped-entities */
'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Home } from 'lucide-react'

export default function Custom404() {
 return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
   <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    className="w-64 h-64 mb-8"
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5 }}
   >
    <motion.path
     d="M10,50 A40,40 0 1,1 90,50 A40,40 0 1,1 10,50 Z"
     fill="none"
     stroke="currentColor"
     strokeWidth="4"
     initial={{ pathLength: 0 }}
     animate={{ pathLength: 1 }}
     transition={{
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 1
     }}
    />
    <motion.path
     d="M35,40 L45,50 L35,60 M65,40 L55,50 L65,60"
     fill="none"
     stroke="currentColor"
     strokeWidth="4"
     initial={{ pathLength: 0 }}
     animate={{ pathLength: 1 }}
     transition={{
      duration: 1,
      ease: "easeInOut",
      delay: 1,
      repeat: Infinity,
      repeatDelay: 2
     }}
    />
    <motion.path
     d="M30,70 Q50,60 70,70"
     fill="none"
     stroke="currentColor"
     strokeWidth="4"
     initial={{ pathLength: 0 }}
     animate={{ pathLength: 1 }}
     transition={{
      duration: 1,
      ease: "easeInOut",
      delay: 2,
      repeat: Infinity,
      repeatDelay: 1
     }}
    />
   </motion.svg>
   <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
   <p className="text-xl mb-8">Oops! The page you're looking for couldn't be found.</p>
   
    <Button asChild >
     <Link href={"/dashboard"} className="flex items-center justify-center gap-2"><Home size={18} /> <p className='text-xl'>Back to Home</p></Link>
    </Button>
  </div>
 )
}