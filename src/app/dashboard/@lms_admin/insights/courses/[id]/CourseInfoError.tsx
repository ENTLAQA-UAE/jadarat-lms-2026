"use client"
import { AlertTriangle } from 'lucide-react'; // Optional: for a warning icon

interface ErrorComponentProps {
 errorMessage: string;
}

const CourseInfoError = ({ errorMessage }: ErrorComponentProps) => {
 return (
  <div className="bg-destructive/10 border border-destructive/40 text-destructive px-4 py-3 rounded-lg relative" role="alert">
   <div className="flex items-center space-x-2">
    <AlertTriangle className="h-6 w-6 text-destructive" />
    <span className="font-bold">Error:</span>
    <span>{errorMessage}</span>
   </div>
  </div>
 );
};

export default CourseInfoError;
