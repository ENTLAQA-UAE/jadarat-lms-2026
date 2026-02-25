'use client'
import { useAppSelector } from '@/hooks/redux.hook';
import Image from 'next/image'
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from 'react';
import { LanguageSwitcher } from '@/components/languageSwithcer';

type NonAuthHOCType = {
    component: React.ElementType
}

function NonAuthHOC({ component: Component }: NonAuthHOCType) {
    const [isClient, setIsClient] = useState<boolean>(false)
    const { settings: { authBackground }, loading } = useAppSelector(state => state.organization);
    useEffect(() => {
        setIsClient(true)
    }, [])
    return (
        <>
            {isClient && <div className="w-full relative lg:grid  lg:grid-cols-2">
                <LanguageSwitcher className="absolute top-10 left-10 rtl:right-10 rtl:left-0" />

                <Component />

                <div className="hidden bg-muted lg:block max-w-[1920px] max-h-screen relative">
                    {loading ? (
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
            </div>}
        </>
    )
}

export default NonAuthHOC