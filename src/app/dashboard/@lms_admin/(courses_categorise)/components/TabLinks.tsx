"use client";

import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';

const TabLinks = () => {
 const pathname = usePathname();
 const router = useRouter();

 // Array of tabs
 const tabs = [
  { name: 'Courses', path: '/dashboard/courses' },
  { name: 'Categories', path: '/dashboard/categories' },
 ];

 // Render the component only if the current path starts with /dashboard
 if (pathname.endsWith('/dashboard/courses') || pathname.endsWith('/dashboard/categories')) {
  return <>
   <div className='container flex gap-4 w-full mt-4'>
    {tabs.map((tab) => (
     <Button
      key={tab.path}
      className={`w-full text-lg`}
      onClick={() => router.push(tab.path)}
      variant={pathname === tab.path ? 'default' : 'outline'}
     >
      {tab.name}
     </Button>
    ))}
   </div>
  </>
 } else {
  return null;
 }

};

export default TabLinks;
