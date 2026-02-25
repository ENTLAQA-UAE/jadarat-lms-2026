'use client'

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from "sonner"
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
import { LanguageSwitcher } from "@/components/languageSwithcer";
import { Skeleton } from "@/components/ui/skeleton";

const scheme = z.object({
    password: z.string(),
    confirm: z.string()
}).refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
});

const UpdatePasswordPage = () => {
    const { replace } = useRouter();
    const searchParam = useSearchParams();
    const { settings: { authBackground, logo, primaryColor }, loading: LoadingTheme } = useAppSelector(state => state.organization);
    const [loading, setLoading] = useState<boolean>(false);
    const [shouldStop, setShouldStop] = useState<boolean>(false);

    const form = useForm<z.infer<typeof scheme>>({
        resolver: zodResolver(scheme),
        defaultValues: {
            password: '',
            confirm: ''
        },
    })

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hashedTokens = window.location.href.split("#")?.[1];
            if (hashedTokens) {
                const refreshToken = hashedTokens.substring(
                    hashedTokens.indexOf("refresh_token=") + 14,
                    hashedTokens.lastIndexOf("&token_type")
                )
                const accessToken = hashedTokens.substring(
                    hashedTokens.indexOf("access_token=") + 13,
                    hashedTokens.lastIndexOf("&expires_at")
                )
                const auth = async () => {
                    const supabase = createClient()
                    await supabase.auth.setSession({
                        refresh_token: refreshToken,
                        access_token: accessToken
                    });
                }

                auth()
            }
        }
    }, [searchParam])

    const checkResponse = useCallback((time: number) => {
        const date = new Date().getTime();

        if ((date - time) > 5000) {
            replace('/');
        } else {
            if (!shouldStop)
                setTimeout(() => {
                    checkResponse(time);
                }, 1000)
        }
    }, [replace, shouldStop])

    const onUpdatePassword = useCallback(async ({ password }: { password: string }) => {
        setLoading(true);
        const supabase = createClient();

        const startedAt = new Date().getTime();

        checkResponse(startedAt)

        const { error } = await supabase.auth.updateUser({
            password: password,
        })

        setShouldStop(true);
        if (error != null)
            toast.error(error.message)
        setLoading(false);
    }, [checkResponse])

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
                        <h1 className="text-3xl font-bold text-center">Update Password</h1>
                        <p className="text-balance text-muted-foreground text-center">
                            Enter your password below to update it
                        </p>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onUpdatePassword)} className="grid gap-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirm"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
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
                                    {loading ? <LoadingSpinner color={primaryColor} /> : "Confirm"}
                                </Button>
                            </div>
                        </form>
                    </Form>
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

export default UpdatePasswordPage;