import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ProfileDataTableSkeleton() {
 return (
  <Table className="w-full">
   <TableHeader>
    <TableRow>
     <TableHead className="w-[50px]">
      <Skeleton className="h-4 w-8" />
     </TableHead>
     <TableHead>
      <Skeleton className="h-4 w-16" />
     </TableHead>
     <TableHead>
      <Skeleton className="h-4 w-24" />
     </TableHead>
     <TableHead>
      <Skeleton className="h-4 w-16" />
     </TableHead>
     <TableHead>
      <Skeleton className="h-4 w-20" />
     </TableHead>
    </TableRow>
   </TableHeader>
   <TableBody>
    {[...Array(5)].map((_, index) => (
     <TableRow key={index}>
      <TableCell>
       <Skeleton className="h-10 w-10" />
      </TableCell>
      <TableCell>
       <Skeleton className="h-4 w-[250px]" />
      </TableCell>
      <TableCell>
       <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
       <div className="flex items-center gap-2">
        <Skeleton className="h-2 w-24" />
        <Skeleton className="h-4 w-8" />
       </div>
      </TableCell>
      <TableCell>
       <Skeleton className="h-8 w-24" />
      </TableCell>
     </TableRow>
    ))}
   </TableBody>
  </Table>
 )
}