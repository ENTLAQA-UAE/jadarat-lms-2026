// ExportCSVButton.tsx
'use client'

import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'
import React from 'react'

interface ExportCSVButtonProps {
 onExport: () => Promise<any[]>
 isLoading: boolean
 filename?: string
}

function convertToCSV(data: any[]) {
 const headers = Object.keys(data[0]).filter(key => key !== 'thumbnail').join(',')
 const rows = data.map(row => 
  Object.entries(row)
    .filter(([key]) => key !== 'thumbnail')
    .map(([, value]) => value)
    .join(',')
 )
 return [headers, ...rows].join('\n')
}

function downloadCSV(data: any[], filename: string) {
 const csvContent = convertToCSV(data)
 const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
 const url = URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.setAttribute('href', url)
 link.setAttribute('download', filename)
 link.click()
}

export default function ExportCSVButton({ onExport, isLoading, filename = 'export.csv' }: ExportCSVButtonProps) {
 const handleExportCSV = async () => {
  const data = await onExport()
  if (data && data.length > 0) {
   downloadCSV(data, filename)
  }
 }

 return (
  <Button onClick={handleExportCSV} disabled={isLoading}>
   <FileDown className="mr-2 h-4 w-4" />
   {isLoading ? 'Exporting...' : 'Export CSV'}
  </Button>
 )
}