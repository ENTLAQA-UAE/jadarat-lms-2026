// ExportCSVButtonWrapper.tsx
'use client'

import { useState } from 'react'
import ExportCSVButton from '@/components/shared/ExportCSVButton'
import { getAllLearners } from '@/action/lms-admin/insights/students/studentsActions'

export function CSVButton() {
 const [isLoading, setIsLoading] = useState(false)

 const handleExport = async () => {
  setIsLoading(true)
  try {
   const studentsTable = await getAllLearners();
   return studentsTable.data
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
   filename="Learners.csv"
  />
 )
}