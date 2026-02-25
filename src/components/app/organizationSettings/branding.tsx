"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAppSelector } from "@/hooks/redux.hook"
import { createClient } from "@/utils/supabase"
import { Save, RotateCcw } from "lucide-react"
import UploadImageInput from "@/components/uploadInput"
import { useToast } from "@/components/ui/use-toast"
import { uploadImage } from "@/utils/uploadFile"
import LoadingSpinner from "@/components/loading-spinner/loading-spinner"
import BrandingSkelton from "./skeletons/BrandingSkelton"
import { store } from "@/redux/sotre"
import { setOrganizationColors } from "@/redux/organization.slice"

const DEFAULT_PRIMARY = "#33658a"
const DEFAULT_SECONDARY = "#f26419"

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/

function ColorPickerField({
    label,
    description,
    value,
    defaultValue,
    onChange,
}: {
    label: string
    description: string
    value: string
    defaultValue: string
    onChange: (v: string) => void
}) {
    const isValid = HEX_REGEX.test(value)

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
                {label}
            </label>
            <p className="text-xs text-muted-foreground">{description}</p>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <input
                        type="color"
                        value={isValid ? value : defaultValue}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-10 h-10 rounded-md border border-border cursor-pointer p-0.5"
                    />
                </div>
                <Input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={defaultValue}
                    className={`w-32 font-mono text-sm uppercase ${!isValid ? 'border-destructive' : ''}`}
                    maxLength={7}
                />
                {value !== defaultValue && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onChange(defaultValue)}
                        title="Reset to default"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                )}
            </div>
            {!isValid && value.length > 0 && (
                <p role="alert" className="text-xs text-destructive">Enter a valid hex color (e.g. #33658a)</p>
            )}
        </div>
    )
}

function ColorPreview({ primary, secondary }: { primary: string; secondary: string }) {
    const pValid = HEX_REGEX.test(primary) ? primary : DEFAULT_PRIMARY
    const sValid = HEX_REGEX.test(secondary) ? secondary : DEFAULT_SECONDARY

    return (
        <div className="rounded-lg border border-border p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Live Preview</p>
            <div className="flex gap-2 items-center">
                <div className="h-8 flex-1 rounded" style={{ background: pValid }} />
                <div className="h-8 flex-1 rounded" style={{ background: sValid }} />
            </div>
            <div className="flex gap-2 items-center flex-wrap">
                <button
                    type="button"
                    className="px-4 py-1.5 rounded-md text-white text-xs font-medium"
                    style={{ background: pValid }}
                >
                    Primary Button
                </button>
                <button
                    type="button"
                    className="px-4 py-1.5 rounded-md text-white text-xs font-medium"
                    style={{ background: sValid }}
                >
                    Accent Button
                </button>
                <span
                    className="px-2 py-0.5 rounded-full text-white text-xs font-medium"
                    style={{ background: sValid }}
                >
                    Badge
                </span>
            </div>
        </div>
    )
}

export default function Branding() {
    const { toast } = useToast();
    const { settings: { logo, authBackground, name, primaryColor, secondaryColor }, loading: LoadingTheme } = useAppSelector(state => state.organization);
    const { user: { organization_id } } = useAppSelector(state => state.user);
    const [isLoading, setIsLoading] = useState(false)
    const [orgName, setOrgName] = useState<string>('')
    const [logoFile, setLogoFile] = useState<File>()
    const [authBgFile, setAuthBgFile] = useState<File>()
    const [localPrimary, setLocalPrimary] = useState(DEFAULT_PRIMARY)
    const [localSecondary, setLocalSecondary] = useState(DEFAULT_SECONDARY)

    const handleSave = async () => {
        setIsLoading(true)
        const supabase = createClient();
        const updatedData: {
            new_auth?: string;
            new_logo?: string;
            new_name?: string;
            new_primary_color?: string;
            new_secondary_color?: string;
        } = {};

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

        // Add colors if changed
        const primaryValid = HEX_REGEX.test(localPrimary)
        const secondaryValid = HEX_REGEX.test(localSecondary)

        if (primaryValid && localPrimary !== primaryColor) {
            updatedData.new_primary_color = localPrimary;
        }
        if (secondaryValid && localSecondary !== secondaryColor) {
            updatedData.new_secondary_color = localSecondary;
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
                // Update Redux so TenantBranding applies the new colors immediately
                if (updatedData.new_primary_color || updatedData.new_secondary_color) {
                    store.dispatch(setOrganizationColors({
                        primaryColor: updatedData.new_primary_color ?? primaryColor,
                        secondaryColor: updatedData.new_secondary_color ?? secondaryColor,
                    }))
                }
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
        if (!LoadingTheme) {
            setOrgName(name)
            setLocalPrimary(primaryColor || DEFAULT_PRIMARY)
            setLocalSecondary(secondaryColor || DEFAULT_SECONDARY)
        }
    }, [name, primaryColor, secondaryColor, LoadingTheme])

    if (LoadingTheme)
        return <BrandingSkelton />;

    return (
        <Card className="w-full">
            <CardContent className="w-full px-6 py-12 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-20">
                    <div className="flex flex-col gap-4">
                        <div className="text-left space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground ltr:text-left rtl:text-right" dir="auto">Branding Section</h1>
                            <p className="text-muted-foreground ltr:text-left rtl:text-right">
                                Upload your logo, organization name, and login page background to create a cohesive brand identity.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <UploadImageInput label="Organization Logo" defaultValue={logo} className="2xl:max-h-[190px] max-h-[170px] overflow-hidden" onSelect={setLogoFile} />

                            <div>
                                <label
                                    htmlFor="organization-name"
                                    className="block text-sm font-medium text-foreground"
                                >
                                    Organization Name
                                </label>
                                <div className="mt-1 relative">
                                    <Input
                                        id="organization-name"
                                        type="text"
                                        value={orgName}
                                        placeholder="Enter your organization name"
                                        className="block w-full rounded-md border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                        onChange={(e) => {
                                            setOrgName(e.target.value);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <UploadImageInput label="Login Page Background" defaultValue={authBackground} className="h-[320px]" imageClassName="object-cover max-h-[290px]" onSelect={setAuthBgFile} />
                    </div>
                </div>

                {/* Tenant Colors Section */}
                <div className="mt-8 pt-8 border-t border-border">
                    <div className="text-left space-y-2 mb-6">
                        <h2 className="text-xl font-semibold tracking-tight text-foreground ltr:text-left rtl:text-right" dir="auto">
                            Tenant Colors
                        </h2>
                        <p className="text-muted-foreground text-sm ltr:text-left rtl:text-right">
                            Choose the primary and accent colors for your organization. These colors will be applied across the sidebar, buttons, links, badges, and charts for all users in your tenant.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ColorPickerField
                            label="Primary Color"
                            description="Sidebar, buttons, links, and focus rings"
                            value={localPrimary}
                            defaultValue={DEFAULT_PRIMARY}
                            onChange={setLocalPrimary}
                        />
                        <ColorPickerField
                            label="Accent Color"
                            description="Highlights, badges, and secondary actions"
                            value={localSecondary}
                            defaultValue={DEFAULT_SECONDARY}
                            onChange={setLocalSecondary}
                        />
                        <ColorPreview primary={localPrimary} secondary={localSecondary} />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button size="lg" onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
                        {isLoading ?
                            <LoadingSpinner color={localPrimary} />
                            :
                            <Save className="h-5 w-5" />
                        }
                        Save Settings
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
