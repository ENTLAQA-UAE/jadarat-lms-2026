import React from 'react'
import { Skeleton } from '../ui/skeleton'

function HeadTitleTableSkeleton() {
  return (
    <div className='flex justify-between items-center'>
        <Skeleton className='w-[250px] h-[20px]' />
        <Skeleton className='w-[130px] h-[25px]' />

    </div>
  )
}

export default HeadTitleTableSkeleton