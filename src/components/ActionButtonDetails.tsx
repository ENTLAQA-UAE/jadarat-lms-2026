"use client"
import { Button } from '@/components/ui/button'
import { FileDown, Printer } from 'lucide-react'

function ActionButtonsDetails({ data, courseInfo, enrollmentCompletionData }: { data: any, courseInfo: any, enrollmentCompletionData: any }) {

  // Function to handle printing the report
  const handlePrintReport = () => {
    const printContent = `
            <html>
            <head>
                <title>Print Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h1>Course Report</h1>
                <h2>Course Information</h2>
                <p><strong>Course Name:</strong> ${courseInfo.name}</p>
                <p><strong>Category:</strong> ${courseInfo.category}</p>
                <p><strong>Total Enrollments:</strong> ${courseInfo.enrollments}</p>
                <p><strong>Total Completions:</strong> ${courseInfo.completions}</p>

                <h2>Enrollments vs Completions</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Enrollments</th>
                            <th>Completions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${enrollmentCompletionData.map((data: any) => `
                            <tr>
                                <td>${data.month}</td>
                                <td>${data.enrollments}</td>
                                <td>${data.completions}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <h2>Learner Information</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Enrollment Date</th>
                            <th>Progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((learner: any) => `
                            <tr>
                                <td>${learner.name}</td>
                                <td>${learner.email}</td>
                                <td>${new Date(learner.enrollment_date).toLocaleDateString()}</td>
                                <td>${learner.progress}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      console.error('Failed to open print window. Please allow popups for this website.');
    }
  }

  // Function to handle exporting data to CSV
  const handleExportCSV = () => {
    const courseInfoCsv = [
      ['Course Name', 'Category', 'Total Enrollments', 'Total Completions'].join(','),
      [courseInfo.name, courseInfo.category, courseInfo.enrollments, courseInfo.completions].join(',')
    ].join('\n');

    const enrollmentsCsv = [
      ['Month', 'Enrollments', 'Completions'].join(','),
      ...enrollmentCompletionData.map((data: any) => [
        data.month,
        data.enrollments,
        data.completions
      ].join(','))
    ].join('\n');

    const learnersCsv = [
      ['Name', 'Email', 'Enrollment Date', 'Progress'].join(','),
      ...data.map((learner: any) => [
        learner.name,
        learner.email,
        new Date(learner.enrollment_date).toLocaleDateString(),
        learner.progress
      ].join(','))
    ].join('\n');

    const csvContent = `${courseInfoCsv}\n\n${enrollmentsCsv}\n\n${learnersCsv}`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'course_report.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="flex justify-end space-x-4">
      <Button variant="outline" onClick={handlePrintReport}>
        <Printer className="me-2 h-4 w-4" />
        Print Report
      </Button>
      <Button variant="outline" onClick={handleExportCSV}>
        <FileDown className="me-2 h-4 w-4" />
        Export CSV
      </Button>
    </div>
  )
}

export default ActionButtonsDetails;
