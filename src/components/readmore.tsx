'use client'
import { useLanguage } from '@/context/language.context'
import { useState, useMemo } from 'react'

interface ReadMoreProps {
    id: string
    text: string
    amountOfWords?: number
}

export const ReadMore = ({ id, text, amountOfWords = 36 }: ReadMoreProps) => {
    const { isRTL } = useLanguage()
    const [isExpanded, setIsExpanded] = useState(false)

    // Memoize the split text to avoid recomputation on each render
    const { beginText, endText, itCanOverflow } = useMemo(() => {
        const splittedText = text.split(' ')
        const itCanOverflow = splittedText.length > amountOfWords
        const beginText = itCanOverflow
            ? splittedText.slice(0, amountOfWords - 1).join(' ')
            : text
        const endText = splittedText.slice(amountOfWords - 1).join(' ')

        return { beginText, endText, itCanOverflow }
    }, [text, amountOfWords])

    // Toggle the expanded/collapsed state
    const toggleExpand = () => setIsExpanded(prev => !prev)

    // Handle keyboard events
    const handleKeyboard = (e: React.KeyboardEvent) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            toggleExpand()
        }
    }

    return (
        <p id={id} className='text-sm text-muted-foreground leading-relaxed  exclude-weglot' dir='auto'>
            {beginText}{" "}
            {itCanOverflow && (
                <>
                    {!isExpanded && <span>... </span>}
                    {isExpanded && <span>{endText}</span>}
                    <span
                        className='text-info ml-2'
                        role="button"
                        tabIndex={0}
                        aria-expanded={isExpanded}
                        aria-controls={id}
                        onKeyDown={handleKeyboard}
                        onClick={toggleExpand}
                    >
                        {isExpanded ? (isRTL ? "عرض أقل" : "See less") : (isRTL ? "عرض المزيد" : "See More")}
                    </span>
                </>
            )}
        </p>
    )
}
