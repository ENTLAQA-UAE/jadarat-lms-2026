'use client'

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCallback, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import LoadingSpinner from "@/components/loading-spinner/loading-spinner"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useAppSelector } from "@/hooks/redux.hook"
import { fulldomain } from "@/utils/getFullDomain"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { LanguageSwitcher } from "@/components/languageSwithcer";
import { Skeleton } from "@/components/ui/skeleton";

const scheme = z.object({
    email: z.string().email(),
})

const ResetPasswordPage = () => {
    const { back } = useRouter()
    const { settings: { authBackground, logo, primaryColor }, loading: LoadingTheme } = useAppSelector(state => state.organization);
    const [loading, setLoading] = useState<boolean>(false);

    const form = useForm<z.infer<typeof scheme>>({
        resolver: zodResolver(scheme),
        defaultValues: {
            email: "",
        },
    })

    const onResetClicked = useCallback(async ({ email }: { email: string }) => {
        setLoading(true);
        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window?.location?.protocol + '//' + fulldomain + "/update-password"
        })

        if (error == null) {
            toast.success("Congratulation", {
                description: "If you have already registered account, We have sent you a password reset link.",
                duration: 10000,
            })
        } else if (error.message === "For security purposes, you can only request this once every 60 seconds") {
            toast.error("Please wait", {
                description: "You have to wait 1 minute to send a reset password request again",
                duration: 10000,
            })
        } else {
            toast.error("Error", {
                description: error.message,
                duration: 10000,
            })
        }
        setLoading(false);
    }, [])

    return (
        <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] h-screen">
            <div className="flex items-center justify-center py-12">
                <LanguageSwitcher className="absolute top-10 left-10 rtl:right-10 rtl:left-0" />
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        {LoadingTheme ? (
                            <Skeleton className="w-1/2 h-40 mb-20 mx-auto" />
                        ) : (
                            <Image
                                src={logo}
                                alt="Logo"
                                width="500"
                                height="500"
                                className="w-1/2 object-cover self-end mb-20 mx-auto"
                                key={Math.random()}
                            />
                        )}
                        <h1 className="text-3xl font-bold text-center">Reset Password</h1>
                        <p className="text-balance text-muted-foreground text-center">
                            Enter your email below to reset your password
                        </p>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onResetClicked)} className="grid gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="m@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div>
                                {form.formState.errors.root ?
                                    <p role="alert" className="text-caption font-medium text-destructive text-center">
                                        {form.formState.errors.root?.message ?? ""}
                                    </p>
                                    : <></>}
                                <Button type="submit" className="w-full mt-4">
                                    {loading ? <LoadingSpinner color={primaryColor} /> : 'Reset password'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        Remembered your password? {" "}
                        <Button onClick={back} className="underline w-fit px-0 hover:bg-transparent" variant="ghost">
                            Sign in
                        </Button>
                    </div>
                </div>
            </div>

            <div className="hidden bg-muted lg:block max-w-[1920px] max-h-screen relative">
                {LoadingTheme ? (
                    <Skeleton className="h-full w-full" />
                ) : (
                    <Image
                        src={authBackground}
                        alt="Authentication background"
                        width={1920}
                        height={1080}
                        key={Math.random() * 100}
                        className="h-full w-full object-cover"
                    />
                )}
            </div>
        </div>
    );
}

export default ResetPasswordPage;