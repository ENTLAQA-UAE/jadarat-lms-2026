"use client"
import { useFormState, useFormStatus } from 'react-dom'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
 Form,
 FormControl,
 FormField,
 FormItem,
 FormMessage,
} from "@/components/ui/form"
import Link from "next/link"
import { loginAuth } from '@/action/authAction'
import { Loader2 } from 'lucide-react'
import { memo, useMemo } from 'react'

const formSchema = z.object({
 email: z.string().email({
  message: "Please enter a valid email address.",
 }),
 password: z.string().min(6, {
  message: "Password must be at least 6 characters long.",
 }),
})

function LoginForm({ domain, registerationEnabled }: { domain: string, registerationEnabled : boolean}) {
 const [errorMessage, dispatch] = useFormState(loginAuth, undefined) 

 const isBrowser = typeof window !== 'undefined'; // Check if running in the browser

 let registerLink = ""; // Initialize with a default value
 if (isBrowser) {
  registerLink = `${window.location.protocol}//${domain}/register`
 } 

 const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
   email: "",
   password: "",
  },
 })

 const RegistrationLink = useMemo(() => (
  registerationEnabled && (
   <div className="mt-4 text-center text-sm">
    Not have an account?{" "}
    <Link
     href={registerLink}
     className="underline"
    >
     Sign up your account
    </Link>
   </div>
  )
 ), [registerLink, registerationEnabled])

 return (
  <Form {...form}>
   <form action={dispatch} className="space-y-6">
    <FormField
     control={form.control}
     name="email"
     render={({ field }) => (
      <FormItem>
       <Label htmlFor="email">Email</Label>
       <FormControl>
        <Input placeholder="m@example.com" {...field} />
       </FormControl>
       <FormMessage />
      </FormItem>
     )}
    />
    <FormField
     control={form.control}
     name="password"
     render={({ field }) => (
      <FormItem>
       <div className="flex items-center justify-between">
        <Label htmlFor="password">Password</Label>
        <Link
         className="text-sm text-primary hover:underline"
         href="/reset-password"
        >
         Forgot your password?
        </Link>
       </div>
       <FormControl>
        <Input type="password" {...field} />
       </FormControl>
       <FormMessage />
      </FormItem>
     )}
    />
    <LoginButton />
    {errorMessage && <div className="text-red-500">{errorMessage}</div>}
   </form>
   {RegistrationLink}
  </Form>
 )
}

export default memo(LoginForm)

function LoginButton() {
 const { pending } = useFormStatus()

 const handleClick = (event: any) => {
  if (pending) {
   event.preventDefault()
  }
 }


 return (
  <Button className="w-full bg-[#2B4155] hover:bg-[#1e2e3c]" disabled={pending} aria-disabled={pending} type="submit" onClick={handleClick}>
   {pending ? (
    <span className='flex items-center justify-center gap-2'>
     <span>Please wait</span>
     <Loader2 className="animate-spin" />
    </span>
   ) : (
    "Login"
   )}
  </Button>
 )
}