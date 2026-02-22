"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Dialog, DialogContent, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { useAppSelector } from "@/hooks/redux.hook"
import Image from "next/image"
import { useLanguage } from "@/context/language.context"



const formSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email address." }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  repeatPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
}).refine(data => data.password === data.repeatPassword, {
  message: "Passwords must match",
  path: ["repeatPassword"],
});

export default function CreateAccount() {
  const { isRTL } = useLanguage();
  const { settings: { logo }, loading: LoadingTheme } = useAppSelector(state => state.organization);


  const [isLoading, setIsLoading] = useState(false)
  const [showPopup, setShowPopup] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      repeatPassword: "",
    },
  })



  function onSubmit(values: z.infer<typeof formSchema>) {

    console.log(values)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="container mx-auto max-w-md px-4">
        <div className="mb-8 flex justify-center">
          <Image
            src={logo}
            alt="Image"
            width="500"
            height="500"
            className="w-1/2 object-cover self-end mb-2 mx-auto"
            key={Math.random()}
          />        </div>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              <div className="flex flex-col    justify-center items-center">
                <CardTitle className="text-2xl font-bold">
                  {isRTL ? "إنشاء حساب" : "Create an account"}
                </CardTitle>
                <CardDescription>
                  {isRTL ? "أدخل بياناتك للبدء" : "Enter your details to get started."}
                </CardDescription>
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input   {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )} />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password"  {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repeatPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repeat Password</FormLabel>
                      <FormControl>
                        <Input type="password"  {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading
                    ? (isRTL ? "جاري التحميل..." : "Loading...")
                    : (isRTL ? "تسجيل" : "Register")}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  {isRTL ? "هل لديك حساب بالفعل؟" : "Already have an account?"}{" "}
                  <Link href="#" className="font-medium underline" prefetch={false}>
                    {isRTL ? "تسجيل الدخول" : "Login"}
                  </Link>
                </div>
              </div>
            </form >
          </Form>
        </div>
      </div>
      {showPopup && (
        <Dialog>
          <DialogContent>
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <CircleCheckIcon className="size-12 text-success" />
              <p className="text-lg font-medium">Please check your email for confirmation.</p>
            </div>
            <DialogFooter>
              <div>
                <Button type="button" onClick={() => setShowPopup(false)}>
                  OK
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function CircleCheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}


