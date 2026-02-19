import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/context/language.context";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase";

export const LanguageSwitcherDropdown = ({ className }: { className?: string }) => {
    const { isRTL } = useLanguage();
    const [language, setLanguage] = useState("en");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedLanguage = localStorage.getItem("language");
            if (storedLanguage) {
                setLanguage(storedLanguage);
            }
        }
    }, []);

    const onChange = useCallback(async (lang: 'ar' | 'en') => {
        if (typeof window !== "undefined") {
            window.Weglot.switchTo(lang);
            localStorage.setItem("language", lang);
        }
        setLanguage(lang);

        const supabase = createClient();
        let { data, error } = await supabase.rpc('update_user_lang', {
            new_lang: lang
        });

        // Handle errors or data as needed
    }, []);

    return (
        <Select onValueChange={onChange} defaultValue={language}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent align={isRTL ? "start" : "end"}>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
            </SelectContent>
        </Select>
    );
};
