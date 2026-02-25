import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import type { CoursesType } from "@/app/home/types"
import { RecentCourses } from "./RecentCourses"
import { Insights } from "./Insights" // Ensure the casing matches the actual file name

interface MobileDrawerProps {
 courses: CoursesType[]
}

export function MobileDrawer({ courses }: MobileDrawerProps) {
 return (
  <Drawer>
   <DrawerTrigger asChild>
    <Button
     className="fixed right-4 z-[99] bottom-4 rounded-full w-14 h-14 shadow-elevated bg-primary hover:bg-primary"
     size="icon"
    >
     <Info className="h-6 w-6" />
     <span className="sr-only">Show Dashboard Info</span>
    </Button>
   </DrawerTrigger>
   <DrawerContent>
    <aside className="w-full flex-col gap-6 bg-muted p-6 md:flex">
     <RecentCourses courses={courses} />
     <Insights courses={courses} />
    </aside>
   </DrawerContent>
  </Drawer>
 )
}
