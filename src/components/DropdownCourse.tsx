import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import Image from "next/image"
import { Button } from "./ui/button"

function DropdownCourse() {
  return (
    <div className="flex items-center gap-2 mt-4 md:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="shrink-0">
                  Filter by Category
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Categories</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                // onClick={() => setSelectedCategory(null)}
                // className={selectedCategory === null ? "bg-muted" : ""}
                >
                  All
                </DropdownMenuItem>
                <DropdownMenuItem
                // onClick={() => setSelectedCategory("Technology")}
                // className={selectedCategory === "Technology" ? "bg-muted" : ""}
                >
                  <Image src="/placeholder.svg" width={32} height={32} alt="Technology" className="mr-2" />
                  Technology
                </DropdownMenuItem>
                <DropdownMenuItem
                // onClick={() => setSelectedCategory("Business")}
                // className={selectedCategory === "Business" ? "bg-muted" : ""}
                >
                  <Image src="/placeholder.svg" width={32} height={32} alt="Business" className="mr-2" />
                  Business
                </DropdownMenuItem>
                <DropdownMenuItem
                // onClick={() => setSelectedCategory("Design")}
                // className={selectedCategory === "Design" ? "bg-muted" : ""}
                >
                  <Image src="/placeholder.svg" width={32} height={32} alt="Design" className="mr-2" />
                  Design
                </DropdownMenuItem>
                <DropdownMenuItem
                // onClick={() => setSelectedCategory("Marketing")}
                // className={selectedCategory === "Marketing" ? "bg-muted" : ""}
                >
                  <Image src="/placeholder.svg" width={32} height={32} alt="Marketing" className="mr-2" />
                  Marketing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              View All
            </Button>
          </div>
  )
}

export default DropdownCourse