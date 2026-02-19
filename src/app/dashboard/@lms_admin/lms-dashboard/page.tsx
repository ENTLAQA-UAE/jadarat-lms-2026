
import dynamic from 'next/dynamic';
// import GraphSection from '@/components/app/home/dashboard/graphSection'
const GraphSection = dynamic(() => import('@/components/app/home/dashboard/graphSection'), {
  ssr: false
});
import NavLMS from '@/hoc/nav-lms.hoc'
import React from 'react'

function GeneralPage() {
  return (
    <NavLMS data={[]}>
        <GraphSection />
    </NavLMS>
  )
}

export default GeneralPage