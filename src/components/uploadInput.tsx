"use client"

import { SetStateAction, useCallback, useState } from "react"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "./ui/use-toast"
import { Skeleton } from "./ui/skeleton"

type ComponentTypes = {
    label: string
    defaultValue?: string
    className?: string
    imageClassName?: string
    onSelect: React.Dispatch<SetStateAction<File | undefined>>
    maxSize?: number
};

export default function UploadImageInput({ label, defaultValue, className, imageClassName, onSelect, maxSize = 5242880 }: ComponentTypes) {
    const { toast } = useToast();
    const [file, setFile] = useState<string | undefined>(defaultValue)

    const handleSelection = useCallback((event: React.ChangeEvent<HTMLInputElement> | undefined) => {
        const file = event?.target?.files?.[0];
        if (file) {
            if (file.size > maxSize) {
                toast({
                    title: "Error",
                    description: "File size exceeds maximum limit 5 MB.",
                    variant: "destructive"
                })
                return;
            }
            setFile(URL.createObjectURL(file) as any)
        }

        onSelect(file);
    }, [maxSize, onSelect, toast])

    const handleRemoveLogo = useCallback(() => {
        setFile(undefined)
        onSelect(undefined);
    }, [onSelect])

    const onClick = useCallback(() => {
        if (file == null) {
            const input: any = document.getElementById(label);
            if (input?.click)
                input.click();
        }
    }, [file, label]);

    const imageLoader = ({ src, width, quality }: any) => {
        if (!src.startsWith('/'))
            return `${src}&w=${width}&q=${quality || 75}`
        else return src
    }

    return (
        <div>
            <label htmlFor={label} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <div
                className={cn("mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer overflow-hidden", className)}
                onClick={onClick}
            >
                {file ? (
                    <div className="w-full h-full flex items-center justify-center relative">
                        <Image width={500} loader={imageLoader} height={500} src={file} alt={label} className={cn("object-contain", imageClassName)} />
                        

                        <button
                            className="absolute -top-4 ltr:-right-5 rtl:-left-5 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700 focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-gray-500"
                            onClick={handleRemoveLogo}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-1 text-center flex flex-col justify-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                            <span>Upload a file</span>
                            <input id={label} type="file" accept="image/*" className="sr-only" onChange={handleSelection} />
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB</p>
                    </div>
                )}
            </div>
        </div>
    )
}