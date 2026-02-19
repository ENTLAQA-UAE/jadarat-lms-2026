"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

export function SearchInput() {
 const router = useRouter()
 const [keyword, setKeyword] = useState<string>("")

 return (
  <Input
   placeholder="Search courses..."
   className="w-full rounded-lg bg-background shadow-sm"
   onChange={(e) => setKeyword(e.target.value)}
   onKeyDown={(event) => {
    if (event.code === "Enter" && keyword.length > 0) {
     router.push(`/dashboard/search?keyword=${keyword}`)
    }
   }}
  />
 )
}