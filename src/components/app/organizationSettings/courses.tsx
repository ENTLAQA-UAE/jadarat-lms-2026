"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAppSelector } from "@/hooks/redux.hook"
import { createClient } from "@/utils/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Save } from "lucide-react"
import LoadingSpinner from "@/components/loading-spinner/loading-spinner"
import CourseSkelton from "./skeletons/CourseSkelton"

export default function Courses() {
    const { toast } = useToast();
    const { settings: { courseExpirationEnabled, courseExpirationPeriod, courseSelfEntrollmentPolicy, primaryColor }, loading: LoadingTheme } = useAppSelector(state => state.organization);
    const { user: { organization_id } } = useAppSelector(state => state.user);

    const [expirationEnabled, setExpirationEnabled] = useState<boolean>(courseExpirationEnabled)
    const [expirationDays, setExpirationDays] = useState<number>(courseExpirationPeriod)
    const [selfEnrollmentEnabled, setSelfEnrollmentEnabled] = useState<boolean>(courseSelfEntrollmentPolicy === 'direct')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleSaveSettings = useCallback(async () => {
        setIsLoading(true)
        const supabase = createClient();

        let { error } = await supabase
            .rpc('update_organization_courses', {
                course_expiration: expirationEnabled,
                expiration_period: expirationDays,
                self_enrollment: selfEnrollmentEnabled ? 'direct' : 'lms',
                orgid: organization_id
            })

        if (error) {
            toast({
                title: "Error while updating",
                description: error.message,
                variant: "destructive"
            })
        }
        else {
            toast({
                title: "Saved",
                description: "Courses settings saved successfully.",
                variant: "success"
            })
        }

        setIsLoading(false)
    }, [expirationDays, expirationEnabled, organization_id, selfEnrollmentEnabled, toast]);

    useEffect(() => {
        if (!LoadingTheme) {
            setExpirationDays(courseExpirationPeriod)
            setExpirationEnabled(courseExpirationEnabled)
            setSelfEnrollmentEnabled(courseSelfEntrollmentPolicy === 'direct')
        }
    }, [LoadingTheme, courseExpirationEnabled, courseExpirationPeriod, courseSelfEntrollmentPolicy])

    if (LoadingTheme)
        return <CourseSkelton />;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Course Settings</CardTitle>
                <CardDescription>Manage your course settings here.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8">
                <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="expiration-enabled">Course Expiration</Label>
                        <Switch id="expiration-enabled" checked={expirationEnabled} onCheckedChange={setExpirationEnabled} />
                    </div>
                    {expirationEnabled && (
                        <div className="grid gap-2">
                            <Label htmlFor="expiration-days">Days until expiration</Label>
                            <Input
                                id="expiration-days"
                                type="number"
                                value={expirationDays}
                                onChange={(e) => setExpirationDays(Number(e.target.value))}
                                min={1}
                            />
                        </div>
                    )}
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="self-enrollment-enabled">Self Enrollment</Label>
                        <Switch
                            id="self-enrollment-enabled"
                            checked={selfEnrollmentEnabled}
                            onCheckedChange={setSelfEnrollmentEnabled}
                        />
                    </div>
                    {selfEnrollmentEnabled ? (
                        <div className="text-sm text-muted-foreground">
                            Users will be able to Enroll directly to courses.
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            LMS admin only will be able to Enroll users to courses.
                        </div>
                    )}
                </div>
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
        </Card>
    )
}