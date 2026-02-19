// ExportCSVButtonWrapper.tsx
'use client'

import { useState } from 'react'
import { getAllEnrollments } from '@/action/lms-admin/enrollments/enrollmentsActions'
import  ExportCSVButton  from '@/components/shared/ExportCSVButton'

export function CSVButton() {
 const [isLoading, setIsLoading] = useState(false)

 const handleExport = async () => {
  setIsLoading(true)
  try {
   const enrollmentsResponse = await getAllEnrollments()
   return enrollmentsResponse.data
  } catch (error) {
   console.error('Error fetching enrollments:', error)
  } finally {
   setIsLoading(false)
  }
 }

 return (
  <ExportCSVButton
   onExport={handleExport}
   isLoading={isLoading}
   filename="enrollments.csv"
  />
 )
}