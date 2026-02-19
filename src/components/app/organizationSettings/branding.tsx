"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAppSelector } from "@/hooks/redux.hook"
import { createClient } from "@/utils/supabase"
import { Save } from "lucide-react"
import UploadImageInput from "@/components/uploadInput"
import { useToast } from "@/components/ui/use-toast"
import { uploadImage } from "@/utils/uploadFile"
import LoadingSpinner from "@/components/loading-spinner/loading-spinner"
import BrandingSkelton from "./skeletons/BrandingSkelton"

export default function Branding() {
    const { toast } = useToast();
    const { settings: { logo, authBackground, name, primaryColor }, loading: LoadingTheme } = useAppSelector(state => state.organization);
    const { user: { organization_id } } = useAppSelector(state => state.user);
    const [isLoading, setIsLoading] = useState(false)
    const [orgName, setOrgName] = useState<string>('')
    const [logoFile, setLogoFile] = useState<File>()
    const [authBgFile, setAuthBgFile] = useState<File>()

    const handleSave = async () => {
        setIsLoading(true)
        const supabase = createClient();
        const updatedData: { new_auth?: string; new_logo?: string; new_name?: string } = {};

        // Upload logo if selected
        if (logoFile) {
            const name = "logo." + logoFile.name.split('.')[1];
            const logoURL = await uploadImage(name, logoFile, organization_id, toast);
            if (logoURL?.signedUrl) {
                updatedData.new_logo = logoURL.signedUrl;
            } else {
                setIsLoading(false)
                return;
            }
        }

        // Upload auth background if selected
        if (authBgFile) {
            const name = "auth-background." + authBgFile.name.split('.')[1];
            const authBgURL = await uploadImage(name, authBgFile, organization_id, toast);
            if (authBgURL?.signedUrl) {
                updatedData.new_auth = authBgURL.signedUrl;
            } else {
                setIsLoading(false)
                return;
            }
        }

        // Add new name if changed
        if (orgName !== name) {
            updatedData.new_name = orgName;
        }

        // Only update if there are changes
        if (Object.keys(updatedData).length > 0) {
            let { error } = await supabase
                .rpc('update_organization_branding', {
                    ...updatedData,
                    orgid: organization_id
                })

            if (error) {
                toast({
                    title: "Error while updating",
                    description: error.message,
                    variant: "destructive"
                })
            } else {
                toast({
                    title: "Saved",
                    description: "Branding saved successfully.",
                    variant: "success"
                })
            }
        } else {
            toast({
                title: "No changes",
                description: "No changes were detected to save.",
                variant: "default"
            })
        }

        setIsLoading(false)
    }

    useEffect(() => {
        if (!LoadingTheme)
            setOrgName(name)
    }, [name, LoadingTheme])

    if (LoadingTheme)
        return <BrandingSkelton />;

    return (
        <Card className="w-full">
            <CardContent className="w-full px-6 py-12 rounded-lg dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-20">
                    <div className="h-[400px] flex flex-col gap-4">
                        <div className="text-left space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 ltr:text-left rtl:text-right" dir="auto">Branding Section</h1>
                            <p className="text-gray-600 dark:text-gray-400 ltr:text-left rtl:text-right">
                                Upload your logo, organization name, and login page background to create a cohesive brand identity.
                            </p>
                        </div>

                        <div className="flex flex-col h-full justify-between">
                            <UploadImageInput label="Organization Logo" defaultValue={logo} className="2xl:max-h-[190px] max-h-[170px] overflow-hidden" onSelect={setLogoFile} />

                            <div>
                                <label
                                    htmlFor="organization-name"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Organization Name
                                </label>
                                <div className="mt-1 relative">
                                    <Input
                                        id="organization-name"
                                        type="text"
                                        value={orgName}
                                        placeholder="Enter your organization name"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        onChange={(e) => {
                                            setOrgName(e.target.value);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-[400px] flex flex-col justify-between">
                        <UploadImageInput label="Login Page Background" defaultValue={authBackground} className="h-[320px]" imageClassName="object-cover max-h-[290px]" onSelect={setAuthBgFile} />

                        <div className="relative w-full flex justify-end">
                            <Button size="lg" onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
                                {isLoading ?
                                    <LoadingSpinner color={primaryColor} />
                                    :
                                    <Save className="h-5 w-5" />
                                }
                                Save Settings
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}