"use client"

import { useCallback, useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Eye, Save, ShieldCheck } from "lucide-react"
import Image from "next/image"
import { CertificateTemplate } from "@/app/dashboard/@org_admin/organization-settings/types"
import { useToast } from "@/components/ui/use-toast"
import { useAppSelector } from "@/hooks/redux.hook"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { generateImage, getImageURL } from "@/lib/controllers/certificate"
import LoadingSpinner from "@/components/loading-spinner/loading-spinner"
import { uploadCertificatesImages } from "@/utils/uploadFile"
import { createClient } from "@/utils/supabase"
import { ScrollArea } from "@/components/ui/scroll-area"

export const revalidate = 0

export default function EditCertificate({ selected }: { selected?: CertificateTemplate }) {
    const { toast } = useToast()
    const { settings: { logo: orgLogo, name, certificate }, loading: LoadingTheme } = useAppSelector(state => state.organization)
    const { user: { organization_id } } = useAppSelector(state => state.user)

    console.log("certificate =>", certificate);

    const [logo, setLogo] = useState<File>()
    const [logoURL, setLogoURL] = useState<string>()
    const [color, setColor] = useState<string>(certificate?.certificateBGColor ?? '#ffffff')
    const [signTitle, setSignTitle] = useState<string>(certificate?.certificateAuthTitle ?? name)
    const [sign, setSign] = useState<File>()
    const [signURL, setSignURL] = useState<string>()
    const [previewImg, setPreviewImg] = useState<string | undefined>(certificate?.certificatePreview ?? undefined)
    const [loadingPreview, setLoadingPreview] = useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(false)

    const getPreviewURL = useCallback(async (id: number) => {
        const data = await getImageURL(id)

        if (data.image_url != null) {
            setPreviewImg(data.image_url)
            setLoadingPreview(false)
        } else {
            setTimeout(async () => {
                await getPreviewURL(id)
            }, 1000)
        }
    }, [])

    const uploadImagesIfExists = useCallback(async () => {
        const obj: { logo_url?: string; sign_url?: string } = {}

        if (logo) {
            const logo_url = await uploadCertificatesImages(`${new Date().getTime()}-${logo.name}`, logo, toast, 'temp')
            if (logo_url) {
                setLogoURL(logo_url.signedUrl)
                obj.logo_url = logo_url.signedUrl
            }
        }

        if (sign) {
            const sign_url = await uploadCertificatesImages(`${new Date().getTime()}-${sign.name}`, sign, toast, 'temp')
            if (sign_url) {
                setSignURL(sign_url.signedUrl)
                obj.sign_url = sign_url.signedUrl
            }
        }

        return obj
    }, [logo, sign, toast])

    const onPreview = useCallback(async (shouldLoad: boolean = true) => {
        if (shouldLoad) {
            setLoadingPreview(true)
        }

        const imagesURLs = await uploadImagesIfExists()

        const { data } = await generateImage({
            color: color ?? certificate?.certificateBGColor ?? '#ffffff',
            logo: imagesURLs.logo_url ?? certificate?.certificateLogo ?? '',
            sign: imagesURLs.sign_url ?? certificate?.certificateSign ?? '',
            title: signTitle ?? certificate?.certificateAuthTitle ?? '',
            uuid: selected?.placid ?? ""
        })

        if (data.id != null) {
            await getPreviewURL(data.id)
        } else {
            setLoadingPreview(false)
            toast({
                title: "Error",
                description: "Failed to generate preview image",
                variant: "destructive"
            })
        }
    }, [color, getPreviewURL, orgLogo, selected?.placid, signTitle, uploadImagesIfExists, toast])

    const onSave = useCallback(async () => {
        setIsSaving(true)
        const supabase = createClient()

        if (logo != null || sign != null) {
            await onPreview(false)
        }

        const { error } = await supabase.rpc('update_organization_certificate_settings', {
            auth_title: signTitle ?? certificate?.certificateAuthTitle,
            color: color ?? certificate?.certificateBGColor,
            logo_url: logoURL ?? certificate?.certificateLogo,
            orgid: organization_id,
            preview_url: previewImg ?? certificate?.certificatePreview,
            sign_url: signURL ?? certificate?.certificateSign,
            uuid: selected?.id
        })

        if (error) {
            toast({
                title: "Error",
                description: error.message,
                duration: 10000,
                variant: "destructive"
            })
        } else {
            toast({
                title: "Success",
                description: "Certificate settings saved successfully.",
                duration: 10000,
                variant: "success"
            })
            setOpen(false)
        }
        setIsSaving(false)
    }, [color, logo, logoURL, onPreview, organization_id, previewImg, selected?.id, sign, signTitle, signURL, toast])

    if (LoadingTheme) {
        return <></>
    }
// push to git
    return (
        selected?.id != null &&
        <Dialog open={open} onOpenChange={(open) => {
            if (!open) {
                setSign(undefined)
                setLogo(undefined)
                setLogoURL(undefined)
                setSignURL(undefined)
                setSignTitle(name)
                setColor('#ffffff')
                setPreviewImg(undefined)
                setLoadingPreview(false)
            }
            setOpen(open)
        }}>
            <DialogTrigger asChild>
                <Button className="w-fit flex gap-2 h-[36px]">
                    Edit Certificate
                    <ShieldCheck className="w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[97dvh] md:max-h-[90vh] max-w-[90vw] bg-secondary overflow-hidden p-2 md:p-4">
                <ScrollArea className="h-screen">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto py-12 px-4 md:px-6">
                        <div className="bg-card p-6 rounded-lg">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold">Certificate Settings</h2>
                                <div className="grid gap-2">
                                    <Label htmlFor="logo">Logo</Label>
                                    <div className="relative">
                                        <Input
                                            id="logo"
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(event) => {
                                                const file = event?.target?.files?.[0];
                                                if (file) setLogo(file);
                                            }}
                                        />
                                        <span className="block w-full p-2  text-sm   font-semibold bg-card border border-border rounded cursor-pointer">
                                            {logo ? logo.name : 'Choose certificate'}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="backgroundColor">Background Color</Label>
                                    <Input id="backgroundColor" type="color" value={color} onChange={(event) => {
                                        setColor(event.target.value)
                                    }} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="signatureTitle">Signature Title</Label>
                                    <Input id="signatureTitle" placeholder="Enter signature title" value={signTitle} onChange={(event) => {
                                        setSignTitle(event.target.value)
                                    }} />
                                </div>
                                <div className="grid gap-2 ">
                                    <Label htmlFor="signature">Signature</Label>
                                    <div className="relative">
                                        <Input
                                            id="signature"
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={event => {
                                                const file = event?.target?.files?.[0];
                                                if (file) setSign(file)
                                            }} />
                                        <span className="block w-full p-2  text-sm   font-semibold bg-card border border-border rounded cursor-pointer">
                                            {sign ? sign.name : 'Choose signature'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 flex-wrap">
                                    <Button variant="default" onClick={onSave} disabled={sign == null || isSaving || (logo == null && (orgLogo == null || orgLogo === ''))}>
                                        {isSaving ?
                                            <LoadingSpinner color="#1F48E8" />
                                            : <>
                                                <Save className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                                                Save Settings
                                            </>}
                                    </Button>
                                    <Button variant="outline" onClick={() => onPreview()} disabled={signTitle === "" || isSaving}>
                                        {loadingPreview ?
                                            <LoadingSpinner color="#1F48E8" />
                                            : <>
                                                <Eye className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                                                Preview Certificate
                                            </>}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="bg-card p-6 rounded-lg">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold">Certificate Preview</h2>
                                <Image
                                    src={previewImg ?? selected.thumbnail}
                                    alt="Certificate"
                                    width={600}
                                    height={400}
                                    className="w-full rounded-lg object-cover"
                                    key={Math.random() * 100}
                                />
                            </div>
                        </div>
                        <DialogFooter className="sm:justify-start">
                            <DialogClose asChild>
                                <Button type="button" >
                                    Close
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </div>

                </ScrollArea>

            </DialogContent>
        </Dialog>
    )
}