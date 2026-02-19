import { Button } from "@/components/ui/button";
import { FileDown, Printer } from "lucide-react";
import React from "react";

function LearnerActionButtons({
  coursesData,
  learnerInsights,
  learner,
}: {
  coursesData: any;
  learnerInsights: any;
  learner: any;
}) {
  const handlePrintReport = () => {
    const printContent = `
            <html>
            <head>
                <title>Print Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                   
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .flex { display: flex; justify-content: space-between; gap: 1.5rem; }
                    .section { flex: 1; }
                    .section-title { font-weight: bold; margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <h1>Learner Report</h1>
                <div class="flex">
                    <div class="section">
                        <div class="section-title">Learner Details</div>
                        <p><strong>Name:</strong> ${learner.name}</p>
                        <p><strong>Department:</strong> ${
                          learner.department
                        }</p>
                        <p><strong>Job Title:</strong> ${learner.jobTitle}</p>
                        <p><strong>Group:</strong> ${learner.group}</p>
                    </div>
                    <div class="section">
                        <div class="section-title">Learner Insights</div>
                        <p><strong>All Courses:</strong> ${
                          learnerInsights.allCourses
                        }</p>
                        <p><strong>Completed Courses:</strong> ${
                          learnerInsights.completedCourses
                        }</p>
                        <p><strong>JActive Courses:</strong> ${
                          learnerInsights.activeCourses
                        }</p>
                    </div>
                </div>
                <div class="section-title">Learner Courses</div>
                <table>
                    <thead>
                        <tr>
                            <th>Course ID</th>
                            <th>Course Name</th>
                            <th>Enrollment Date</th>
                            <th>Progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${coursesData
                          .map(
                            (course: any) => `
                            <tr>
                                <td>${course.id}</td>
                                <td>${course.name}</td>
                                <td>${new Date(
                                  course.enrollmentDate
                                ).toLocaleDateString()}</td>
                                <td>${course.progress}%</td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </body>
            </html>
        `;

    const printWindow = window.open("", "_blank", "width=800,height=600");

    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      console.error(
        "Failed to open print window. Please allow popups for this website."
      );
    }
  };

  const handleExportCSV = () => {
    // Convert coursesData to CSV
    const csvContent = [
      ["Course ID", "Course Name", "Enrollment Date", "Progress"].join(","), // Header row
      ...coursesData.map((course: any) =>
        [
          course.id,
          course.name,
          new Date(course.enrollmentDate).toLocaleDateString(),
          course.progress,
        ].join(",")
      ),
    ].join("\n");

    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Create a link to download the CSV file
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "courses_data.csv");
    link.style.visibility = "hidden";

    // Append the link to the document and click it to trigger the download
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
  };

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
  );
}

export default LearnerActionButtons;
