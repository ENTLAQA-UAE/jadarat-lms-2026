'use client'

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from "next/link";
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';

import { createClient } from '@/utils/supabase/client';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import SideNavMobile from './ui/SideNavMobile';
import { LanguageSwitcher } from './languageSwithcer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAppSelector } from '@/hooks/redux.hook';
import { useLanguage } from '@/context/language.context';
import { resetUser } from '@/redux/user.slice';
import { sideMenuContentBasedOnRule } from '@/utils/constants/navigationItems';
import { rules } from '@/utils/constants/rulesEnums';
import { lmsAdminRoutes, publicRoute } from '@/utils/routes';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from "@/components/ui/skeleton";

// Define type for role, now matching the keys of the `rules` enum
type RoleType = keyof typeof rules | null;

// Helper function to fetch user role with proper return type
const fetchUserRole = async (userId: string): Promise<RoleType> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching role:', error);
        return null; // Return null in case of error
    }

    return data?.role as keyof typeof rules || null;
};

const Navbar = () => {
    const { replace } = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch();
    const { isRTL } = useLanguage();

    const { settings: { logo }, loading } = useAppSelector(state => state.organization);
    const { user } = useAppSelector(state => state.user);

    // Set the type of role to `keyof typeof rules | null`
    const [role, setRole] = useState<RoleType>(null);

    useEffect(() => {
        if (user?.id) {
            (async () => {
                const userRole = await fetchUserRole(user.id!);
                setRole(userRole); // Properly set the role
            })();
        }
    }, [user?.id]);

    // Now, `role` is properly typed and TypeScript will know that `rules[role]` is valid
    const navigation = useMemo(() => role ? sideMenuContentBasedOnRule(rules[role]) : [], [role]);
    const nonNavRoutes = useMemo(() => [...publicRoute, ...lmsAdminRoutes], []);

    const onLogout = useCallback(async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        dispatch(resetUser());
        replace("/");
    }, [dispatch, replace]);

    // Hide Navbar on specific routes
    if (
        nonNavRoutes.includes(pathname) ||
        pathname.startsWith('/dashboard/courses/add-course/build-course') ||
        pathname.startsWith('/dashboard/courses/preview-content') ||
        pathname.startsWith('/dashboard/courses/edit-content')
    ) {
        return null;
    }

    return (
        <header className="flex h-16 items-center sticky top-0 md:static gap-4 border-b bg-background px-4 md:px-6 max-w-full z-50 justify-between">
            <nav className="hidden lg:flex md:flex-row md:items-center gap-6 text-lg font-medium md:text-sm">
                <Link href="/dashboard" className="">
                    {loading ? (
                        <Skeleton className="w-[120px] h-[40px]" />
                    ) : (
                        <Image src={logo as string} width={120} height={40} alt="logo" className="h-auto max-h-[56px] w-auto" priority />)}
                </Link>
                {loading ? (
                    // Loading skeletons for navigation links
                    Array(4).fill(0).map((_, index) => (
                        <Skeleton key={index} className="w-20 h-6" />
                    ))
                ) : (
                    navigation.map(item => {
                        const isActive = item.href?.replace('/', '') === pathname?.replace('/', '') || pathname?.startsWith(item.href!);
                        return (
                            <Link
                                key={item.name}
                                href={item.href as string}
                                className={twMerge(isActive ? "text-foreground" : "text-muted-foreground", "hover:text-foreground transition-colors min-w-fit")}
                            >
                                {item.name}
                            </Link>
                        );
                    })
                )}
            </nav>

            <SideNavMobile navigation={navigation} />

            <div className='flex items-center gap-4 '>
                <LanguageSwitcher />
                {user ? (
                    <DropdownMenu   >
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full exclude-weglot">
                                <Avatar className='exclude-weglot'>
                                    <AvatarImage className='exclude-weglot' src={user?.avatar_url} />
                                    <AvatarFallback className='exclude-weglot'>
                                        {user?.name?.split(' ').map(name => name[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isRTL ? "start" : "end"}>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <Link href="/profile">Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Link href="/login">
                        <Button>Login</Button>
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Navbar;
