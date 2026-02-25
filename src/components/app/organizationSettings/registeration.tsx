"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppSelector } from "@/hooks/redux.hook"
import { createClient } from "@/utils/supabase"
import { Save } from "lucide-react"
import LoadingSpinner from "@/components/loading-spinner/loading-spinner"
import { toast } from "sonner"
import RegistrationSkelton from "./skeletons/RegistrationSkelton"

export default function Registeration() {
    const { settings: { registerationDomain, registerationEnabled, registerationRequireApproval, registerationRequireSpecificDomain, primaryColor }, loading: LoadingTheme } = useAppSelector(state => state.organization);
    const { user: { organization_id } } = useAppSelector(state => state.user);

    const [enableRegistration, setEnableRegistration] = React.useState<boolean>(registerationEnabled)
    const [allowAnyDomain, setAllowAnyDomain] = React.useState<boolean>(!registerationRequireSpecificDomain)
    const [requireApproval, setRequireApproval] = React.useState<boolean>(registerationRequireApproval)
    const [domain, setDomain] = React.useState<string>(registerationDomain);
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [isClient, setIsClient] = useState<boolean>(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSaveSettings = useCallback(async () => {
        setIsLoading(true)

        const supabase = createClient();

        let { error } = await supabase
            .rpc('update_organization_registeration', {
                approval_required: requireApproval,
                domain,
                enabled: enableRegistration,
                orgid: organization_id,
                require_specific_domain: !allowAnyDomain
            })

        if (error) {
            toast.error("Error while updating", {
                description: error.message,
            })
        }
        else {
            toast.success("Saved", {
                description: "Registration settings saved successfully.",
            })
        }

        setIsLoading(false)
    }, [allowAnyDomain, domain, enableRegistration, organization_id, requireApproval])

    useEffect(() => {
        if (!LoadingTheme) {
            setEnableRegistration(registerationEnabled)
            setAllowAnyDomain(!registerationRequireSpecificDomain)
            setRequireApproval(registerationRequireApproval)
            setDomain(registerationDomain)
        }
    }, [LoadingTheme, registerationDomain, registerationEnabled, registerationRequireApproval, registerationRequireSpecificDomain])

    if (LoadingTheme)
        return <RegistrationSkelton />
        
    

    return (
        <>
            {isClient && <Card className="w-full min-h-[321px]">
                <CardHeader>
                    <CardTitle>Registration Settings</CardTitle>
                    <CardDescription>If activated users will be able to directly register from the login page</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="flex items-center justify-between gap-4">
                        <Label htmlFor="enableRegistration">Enable User Registration</Label>
                        <Switch
                            id="enableRegistration"
                            checked={enableRegistration}
                            onCheckedChange={setEnableRegistration}
                            className={`${enableRegistration ? "bg-success" : "bg-muted"
                                } relative inline-flex h-6 w-11 items-center rounded-full`}
                        >
                            <span
                                className={`${enableRegistration ? "translate-x-6" : "translate-x-1"
                                    } inline-block h-4 w-4 transform rounded-full bg-card transition`}
                            />
                        </Switch>
                    </div>
                    {enableRegistration ? (
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between gap-4">
                                <Label htmlFor="requireApproval">Require approval on new registrations</Label>
                                <Switch
                                    id="requireApproval"
                                    checked={requireApproval}
                                    onCheckedChange={setRequireApproval}
                                    className={`${requireApproval ? "bg-success" : "bg-muted"
                                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                                >
                                    <span
                                        className={`${requireApproval ? "translate-x-6" : "translate-x-1"
                                            } inline-block h-4 w-4 transform rounded-full bg-card transition`}
                                    />
                                </Switch>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <Label htmlFor="allowAnyDomain">Allow registration for any domain name</Label>
                                <Switch
                                    id="allowAnyDomain"
                                    checked={allowAnyDomain}
                                    onCheckedChange={setAllowAnyDomain}
                                    className={`${allowAnyDomain ? "bg-success" : "bg-muted"
                                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                                >
                                    <span
                                        className={`${allowAnyDomain ? "translate-x-6" : "translate-x-1"
                                            } inline-block h-4 w-4 transform rounded-full bg-card transition`}
                                    />
                                </Switch>
                            </div>
                            {!allowAnyDomain && (
                                <div className="space-y-2">
                                    <Label htmlFor="allowedDomain">Allowed Domain</Label>
                                    <Input id="allowedDomain" type="text" placeholder="example.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-[64px]" />
                    )}
                </CardContent>

                <CardFooter className="border-t pt-6">
                    <Button onClick={handleSaveSettings} disabled={isLoading} className="flex items-center gap-2">
                        Save Settings
                        {isLoading ? (
                            <LoadingSpinner color={primaryColor} />
                        ) : (
                            <Save className="h-5 w-5" />
                        )}
                    </Button>
                </CardFooter>
            </Card>}
        </>
    )
}