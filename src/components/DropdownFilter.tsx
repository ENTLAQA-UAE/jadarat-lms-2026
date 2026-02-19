import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/language.context";
import { ScrollArea } from "./ui/scroll-area";





interface Category {
  id: number,
  ar_name: string;
  created_at: string
  image: null | string
  name: string;
  organization_id: number;
};



interface DropdownFilterTypes {
  selectedCategory: number | null
  setSelectedCategory: Dispatch<SetStateAction<number | null>>
  categories: Category[]
}



function DropdownFilter({ selectedCategory, setSelectedCategory, categories }: DropdownFilterTypes) {

  const { isRTL } = useLanguage()


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="shrink-0">
          Filter by Category
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Categories</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
          All
        </DropdownMenuItem>
        {categories
          .sort((a, b) => a.name.localeCompare(b.name)) // Sort by the `name` property
          .map((category: Category) => (
            <DropdownMenuItem
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`${selectedCategory === category.id ? "bg-muted" : ""} exclude-weglot`}
            >
              <Image src={category.image || "/placeholder.svg"} width={32} height={32} alt={category.name} className="me-2" />
              {isRTL ? category.ar_name : category.name}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownFilter