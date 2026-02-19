'use client'

import { FC, createContext, useContext, useEffect, useState } from "react"
import { publicRoute } from "@/utils/routes"


export const LanguageContext = createContext<{
    isRTL: boolean,
    numbers: 'ar-EG' | 'en-US'
}>({
    isRTL: false,
    numbers: 'en-US'
})

const LangugageProvider: FC<{ children: any }> = ({ children }) => {
    const [numbers, setNumbers] = useState<'en-US' | 'ar-EG'>()
    const [isRTL, setIsRTL] = useState<boolean>(false)

    useEffect(() => {

        const currentPath = window.location.pathname
        const isPublicRoute = publicRoute.some(route => currentPath.includes(route))
        console.log('currentPath', currentPath)
        console.log('isPublicRoute', isPublicRoute)
        if (isPublicRoute) {
            document.body.classList.add('lang-loaded')
        }

        window.Weglot.switchTo('en')


        window.Weglot.on('languageChanged', (lang: any) => {
            setIsRTL(lang === 'ar')
        })

    }, [])

    useEffect(() => {
        if (isRTL) {
            document.dir = "rtl"
            setNumbers('ar-EG')
        } else {
            document.dir = "ltr"
            setNumbers('en-US')
        }



    }, [isRTL])

    const contextValue = { isRTL, numbers }

    return (
        <LanguageContext.Provider value={contextValue as any}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => useContext(LanguageContext)

export default LangugageProvider