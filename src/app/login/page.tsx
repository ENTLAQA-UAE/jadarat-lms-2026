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
        <div className="min-h-screen w-full bg-background">
            <div className="grid lg:grid-cols-2 min-h-screen">
                {/* Form Panel */}
                <div className="relative flex flex-col">
                    <LanguageSwitcher className="absolute top-6 left-6 rtl:right-6 rtl:left-0 z-10" />
                    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                        <div className="w-full max-w-[380px] space-y-8">
                            <div className="flex flex-col items-center space-y-6">
                                <Image
                                    src={org?.logo ?? logo}
                                    alt="Jadarat Logo"
                                    width={160}
                                    height={60}
                                    className="h-12 w-auto"
                                />
                            </div>
                            <div className="space-y-2 text-center">
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
                                <p className="text-sm text-muted-foreground/70">
                                    Enter your credentials to access your account
                                </p>
                            </div>
                            <LoginForm domain={domain} registerationEnabled={org?.registeration_enabled} />
                            {[
                                process.env.NEXT_PUBLIC_MAIN_DOMIAN,
                                process.env.NEXT_PUBLIC_MAIN_DOMIAN_DEV,
                            ].includes(domain as string) && (
                                    <div className="mt-4 text-center text-sm text-muted-foreground">
                                        Not a member?{" "}
                                        <Link
                                            href={`${process.env.NEXT_PUBLIC_DOMIAN_MARKETING}`}
                                            className="font-medium text-primary hover:text-primary/80 transition-colors"
                                        >
                                            Sign up your organization
                                        </Link>
                                    </div>
                                )}
                        </div>
                    </div>
                    {/* Footer branding */}
                    <div className="pb-6 text-center">
                        <p className="text-xs text-muted-foreground/40">Powered by Jadarat LMS</p>
                    </div>
                </div>

                {/* Visual Panel */}
                <div className="hidden lg:block relative overflow-hidden bg-[hsl(240,22%,6%)]">
                    {/* Ambient glow orbs */}
                    <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-[hsl(245_82%_63%/0.12)] blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-[hsl(280_80%_60%/0.08)] blur-[100px]" />
                    <div className="absolute top-1/2 right-1/3 h-[250px] w-[250px] rounded-full bg-[hsl(330_80%_58%/0.06)] blur-[80px]" />

                    {/* Dot grid pattern overlay */}
                    <div className="absolute inset-0 bg-canvas-dots opacity-30" />

                    {/* Hero image */}
                    <div className="relative flex h-full items-center justify-center p-8">
                        <Image
                            src={org?.auth_bg ?? auth}
                            alt="Login hero image"
                            width={800}
                            height={1000}
                            className="relative z-10 h-full w-full object-cover rounded-2xl mix-blend-luminosity opacity-80"
                        />
                    </div>

                    {/* Bottom gradient fade */}
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[hsl(240,22%,6%)] to-transparent z-20" />
                </div>
            </div>
        </div>
    )
}
