import { headers } from "next/headers"
import Link from "next/link"
import Image from "next/image"
import LoginForm from "./loginForm"
import { getOrganizationDetails } from "@/action/organization/organizationAction"
const logo = "/logo.png"
const auth = "/side.png"
import { LanguageSwitcher } from "@/components/languageSwithcer"


export default async function Login() {
    const domain = headers().get('host') ?? '';

    const org = await getOrganizationDetails(domain ?? '')

    return (
        <div className="min-h-screen w-full">
            <div className="grid lg:grid-cols-2">
                <div className="relative">
                    <LanguageSwitcher className="absolute top-10 left-10 rtl:right-10 rtl:left-0" />
                    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                        <div className="w-full max-w-sm space-y-8">
                            <div className="flex flex-col items-center space-y-4">
                                <Image
                                    src={org?.logo ?? logo}
                                    alt="Jadarat Logo"
                                    width={160}
                                    height={60}
                                    className="h-15 w-40"
                                />
                            </div>
                            <div className="space-y-2 text-center">
                                <h1 className="text-3xl font-bold">Welcome back</h1>
                                <p className="text-muted-foreground">
                                    Enter your email below to login to your account
                                </p>
                            </div>
                            <LoginForm domain={domain} registerationEnabled={org?.registeration_enabled} />
                            {[
                                process.env.NEXT_PUBLIC_MAIN_DOMIAN,
                                process.env.NEXT_PUBLIC_MAIN_DOMIAN_DEV,
                            ].includes(domain as string) && (
                                    <div className="mt-4 text-center text-sm">
                                        Not a member?{" "}
                                        <Link
                                            href={`${process.env.NEXT_PUBLIC_DOMIAN_MARKETING}`}
                                            className="underline"
                                        >
                                            Sign up your organization
                                        </Link>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
                <div className="hidden bg-gradient-to-br from-navy via-primary-800 to-primary-700 lg:block">
                    <div className="relative flex h-full items-center justify-center overflow-hidden">
                        <div className="absolute right-0 top-1/2 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-sky/20 blur-3xl" />
                        <div className="absolute bottom-0 left-0 h-64 w-64 translate-y-1/3 -translate-x-1/3 rounded-full bg-accent/20 blur-3xl" />
                        <Image
                            src={org?.auth_bg ?? auth}
                            alt="Login hero image"
                            width={800}
                            height={1000}
                            className="relative z-10 h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}