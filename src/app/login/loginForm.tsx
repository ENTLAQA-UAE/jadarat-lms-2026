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
   <div className="mt-4 text-center text-sm text-muted-foreground">
    Not have an account?{" "}
    <Link
     href={registerLink}
     className="font-medium text-primary hover:text-primary/80 transition-colors"
    >
     Sign up your account
    </Link>
   </div>
  )
 ), [registerLink, registerationEnabled])

 return (
  <Form {...form}>
   <form action={dispatch} className="space-y-5">
    <FormField
     control={form.control}
     name="email"
     render={({ field }) => (
      <FormItem>
       <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Email</Label>
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
        <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Password</Label>
        <Link
         className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
         href="/reset-password"
        >
         Forgot password?
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
    {errorMessage && (
     <div role="alert" className="text-sm text-destructive bg-destructive/8 rounded-lg px-3 py-2.5 border border-destructive/15">
      {errorMessage}
     </div>
    )}
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
  <Button className="w-full h-10 gradient-vivid text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 hover:brightness-110" disabled={pending} aria-disabled={pending} type="submit" onClick={handleClick}>
   {pending ? (
    <span className='flex items-center justify-center gap-2'>
     <span>Please wait</span>
     <Loader2 className="h-4 w-4 animate-spin" />
    </span>
   ) : (
    "Login"
   )}
  </Button>
 )
}
