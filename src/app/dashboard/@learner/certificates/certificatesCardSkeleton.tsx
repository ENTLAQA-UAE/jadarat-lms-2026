import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export function CertificatesSkeleton() {
  return (
    <div className='flex flex-col gap-4 p-2 rounded-lg shadow-md'>
        <Skeleton className='w-full h-[240px]' />
        <Skeleton className='w-full h-[30px]' />
        <div className='flex flex-col gap-[2px]'>
        <Skeleton className='w-full h-[12px]' />
        <Skeleton className='w-[90%] h-[12px]' />
        </div>
        <div className='flex flex-col gap-[6px] mt-2'>
        <Skeleton className='w-[50%]  h-[20px]' />
        <Skeleton className='w-[54%] h-[20px]' />
        </div>

        <div className='pt-2 px-2 flex flex-col gap-2'>
        <Skeleton className=' w-full h-[35px]' />
        <Skeleton className=' w-full h-[35px]' />
        </div>
        

    </div>
  )
}

