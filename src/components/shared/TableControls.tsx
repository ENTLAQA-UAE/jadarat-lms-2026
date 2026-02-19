
import { Button } from "@/components/ui/button"

interface TableControlsProps {
 currentPage: number
 pageSize: number
 count: number
 displayedRows?: number
 onPageChange: (page: number) => void
}

export function TableControls({ currentPage, pageSize, count, onPageChange }: TableControlsProps) {
 const nextPage = currentPage + 1
 const previousPage = currentPage > 1 ? currentPage - 1 : 1

 const isNextDisabled = currentPage * pageSize >= count
 const isPreviousDisabled = currentPage === 1

 const totalPages = Math.ceil(count / pageSize);

 return (
  <div className="flex justify-between items-center mt-3">
   <p className="text-sm text-muted-foreground">
    {`Page ${currentPage} of ${totalPages}`}
   </p>
   <div className="space-x-2">
    <Button
     variant="outline"
     size="sm"
     onClick={() => onPageChange(previousPage)}
     disabled={isPreviousDisabled}
     className={isPreviousDisabled ? 'cursor-not-allowed' : ''}
    >
     Previous
    </Button>
    <Button
     variant="outline"
     size="sm"
     onClick={() => onPageChange(nextPage)}
     disabled={isNextDisabled}
     className={isNextDisabled ? 'cursor-not-allowed' : ''}
    >
     Next
    </Button>
   </div>
  </div>
 )
}