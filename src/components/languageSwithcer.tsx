'use client'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/context/language.context"
import { Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { createClient } from "@/utils/supabase"
import { useCallback, useEffect, useState } from "react"


export const LanguageSwitcher = ({ className }: { className?: string }) => {
    const { isRTL } = useLanguage()
    const [mounted, setMounted] = useState(false)
    const [switched, setSwitched] = useState(false)


    useEffect(() => {
        setMounted(true)

        document.body.classList.add('lang-loaded')

        const time = setTimeout(async () => {
            // await window.location.reload()
            setSwitched(true)
        }, 1000)

        return () => {
            clearTimeout(time)
        }

    }, [])

    const onChange = useCallback(async (lang: 'ar' | 'en') => {
        // Update localStorage
        document.body.classList.add('lang-start')

        localStorage.setItem("language", lang)
        window.Weglot.switchTo(lang)

        // Update language in the database
        const supabase = createClient()
        const { data, error } = await supabase.auth.getSession()
        await supabase.rpc('update_user_lang', { new_lang: lang })
        // if (!data.session) {
        //     window.Weglot.switchTo(lang)
        // } else {
        //     window.location.reload()

        // }

        window.Weglot.switchTo(lang)


        window.location.reload()


        // After the database and localStorage updates, reload the page

        // setTimeout(async () => {
        //     // await window.location.reload()
        //     document.body.classList.add('lang-loaded')

        // }, 3000)



        // Weglot will switch to the correct language after the page reloads
    }, [])

    useEffect(() => {
        if (switched) {
            window.Weglot.switchTo(localStorage.getItem('language') || 'en')
        }
    }, [switched])

    if (!mounted) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(className, "focus-visible:ring-offset-0")}>
                    <Globe className="h-5 w-5" />
                    <span className="sr-only">Language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? "start" : "end"} className="exclude-weglot">
                <DropdownMenuItem dir={isRTL ? "rtl" : "ltr"} onClick={() => onChange('en')}>English</DropdownMenuItem>
                <DropdownMenuItem dir={isRTL ? "rtl" : "ltr"} onClick={() => onChange("ar")}>العربية</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}