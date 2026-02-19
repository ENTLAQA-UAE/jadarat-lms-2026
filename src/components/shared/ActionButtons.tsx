import { Button } from '@/components/ui/button'
import { FileDown, Printer } from 'lucide-react'

function ActionButtons({ course, learner }: { course: any, learner: any }) {

    const handlePrintReport = () => {
        const printContent = `
            <html>
            <head>
                <title>Print Report</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .header { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
                    .section { margin-bottom: 20px; }
                    .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <div class="header">Enrollment Report</div>
                <div class="section">
                    <div class="section-title">Learner Details</div>
                    <p><strong>Name:</strong> ${learner.name}</p>
                    <p><strong>Department:</strong> ${learner.department}</p>
                    <p><strong>Job Title:</strong> ${learner.jobTitle}</p>
                    <p><strong>Group:</strong> ${learner.group}</p>
                </div>
                <div class="section">
                    <div class="section-title">Course Details</div>
                    <p><strong>Course Name:</strong> ${course.name}</p>
                    <p><strong>Category:</strong> ${course.category}</p>
                    <p><strong>Enrollment Date:</strong> ${course.enrollmentDate}</p>
                    <p><strong>Completion Percentage:</strong> ${course.completionPercentage}%</p>
                </div>
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

    const handleExportCSV = () => {
        const csvHeaders = "Name,Course,Department,Group,Enrollment Date,Progress\n";
        const csvRows = [
            `"${learner.name}","${course.name}","${learner.department}","${learner.group}","${course.enrollmentDate}",${course.completionPercentage}%`
        ].join("\n");

        const csvContent = `data:text/csv;charset=utf-8,${csvHeaders}${csvRows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "enrollment_data.csv");
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

export default ActionButtons;
