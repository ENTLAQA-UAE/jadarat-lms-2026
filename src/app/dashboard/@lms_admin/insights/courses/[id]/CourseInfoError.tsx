"use client"
import { AlertTriangle } from 'lucide-react'; // Optional: for a warning icon

interface ErrorComponentProps {
 errorMessage: string;
}

const CourseInfoError = ({ errorMessage }: ErrorComponentProps) => {
 return (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
   <div className="flex items-center space-x-2">
    <AlertTriangle className="h-6 w-6 text-red-700" />
    <span className="font-bold">Error:</span>
    <span>{errorMessage}</span>
   </div>
  </div>
 );
};

export default CourseInfoError;
