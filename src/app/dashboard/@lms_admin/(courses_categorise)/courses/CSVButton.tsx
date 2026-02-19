// ExportCSVButtonWrapper.tsx
'use client'

import { useState } from 'react'
import ExportCSVButton from '@/components/shared/ExportCSVButton'
import { exportCourses } from '@/action/lms-admin/insights/courses/coursesAction'

export function CSVButton() {
 const [isLoading, setIsLoading] = useState(false)

 const handleExport = async () => {
  setIsLoading(true)
  try {
   const coursesTable = await exportCourses();
   return coursesTable
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
   filename="Courses.csv"
  />
 )
}