'use client'
import { Menu } from 'lucide-react';
import React from 'react'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from './sheet';
import { Button } from './button';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuItem } from '@/utils/constants/navigationItems';

function SideNavMobile({ navigation }: { navigation: MenuItem[] }) {
  const pathname = usePathname()
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="/home"
            className="min-w-[100px]"
          >
            {/* <Image src={logo as string} alt='logo' width={500} height={500} className='w-[120px]' /> */}
          </Link>
          {navigation.map((item) => {
            const isActive = item.href === pathname;
            return (
              <Link
                key={item.name}
                href={item.href as string}
                className={twMerge(isActive ? "text-foreground" : "text-muted-foreground", "transition-colors hover:text-foreground min-w-fit")}
              >
                <SheetClose>
                  {item.name}
                </SheetClose>
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

export default SideNavMobile