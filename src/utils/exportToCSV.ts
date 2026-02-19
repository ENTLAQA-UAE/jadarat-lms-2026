interface Column {
 header: string;
 accessorKey: string;
}

export function exportToCSV(data: any[], columns: Column[], filename: string = 'data.csv'): void {
 const csvRows: string[] = [];

 // Extract headers from columns, excluding Thumbnail and Course Image
 const headers = columns
  .filter((column) => column.header !== 'Thumbnail' && column.header !== 'Course Image')
  .map((column) => column.header)
  .join(',');

 csvRows.push(headers);

 // Map data rows for CSV
 data.forEach((row) => {
  const values = columns
   .filter((column) => column.header !== 'Thumbnail' && column.header !== 'Course Image')
   .map((column) => {
    const value = row[column.accessorKey];
    // Handle objects, arrays, null, and undefined
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value); // Convert objects/arrays to string
    return String(value); // Ensure all values are strings
   });

  csvRows.push(values.join(','));
 });

 // Create CSV Blob and initiate download
 const csvString = csvRows.join('\n');
 const blob = new Blob([csvString], { type: 'text/csv' });
 const url = window.URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = filename;
 a.click();
 window.URL.revokeObjectURL(url);
}
