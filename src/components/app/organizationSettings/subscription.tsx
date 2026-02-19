"use client"

import React, { useCallback, useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useAppSelector } from "@/hooks/redux.hook"
import { createClient } from "@/utils/supabase"
import { useToast } from "@/components/ui/use-toast"
import LoadingSpinner from "@/components/loading-spinner/loading-spinner"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/context/language.context"
import MyComponentWithSkeleton from "./skeletons/used-skelton"

const options: any = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
}

export default function Subscription() {
    const { numbers } = useLanguage()
    const { toast } = useToast();
    const { subscription, loading } = useAppSelector(state => state.organization);
    const { user: { organization_id } } = useAppSelector(state => state.user);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [counts, setCounts] = useState<{
        total_users: number
        admin_users: number
        total_courses: number
    } | null>(null); // Initialize as null or a default object
    const [requestSent, setRequestSent] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [numUsers, setNumUsers] = useState<number | string>(10)
    const [numCourses, setNumCourses] = useState<number | string>(50)
    const [numCreators, setNumCreators] = useState<number | string>(1)
    const [isClient, setIsClient] = useState<boolean>(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        const getNoOfUsers = async () => {
            const supabase = createClient();

            let { data, error } = await supabase
                .rpc('get_subscription_usage')
            if (error) {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive"
                })
            }
            else setCounts(data);
        }

        if (!loading)
            getNoOfUsers();

    }, [loading, toast])

    const handleSubmit = useCallback(async () => {
        const supabase = createClient();
        setIsLoading(true);

        let { error } = await supabase
            .rpc('submit_subscription_request', {
                courses_count: numCourses,
                creators_count: numCreators,
                orgid: organization_id,
                users_count: numUsers
            })
        if (error) {
            setIsLoading(false);
            toast({
                title: "Submitting request failed.",
                description: error.message,
                variant: "destructive"
            })
            return;
        }

        setIsLoading(false);
        setRequestSent(true)
    }, [numCourses, numCreators, numUsers, organization_id, toast]);
    const handleCloseModal = () => {
        setIsModalOpen(false)
        setTimeout(() => {
            setIsLoading(false)
            setRequestSent(false)
        }, 100)
    }

    if (subscription?.id == null) {
        return <></>
    }


    if (loading) {
        return <div className="flex items-center gap-4 w-full">
            <MyComponentWithSkeleton />
            <MyComponentWithSkeleton />
        </div>
    }

    return (
        <>
            {isClient && <div className="flex flex-col gap-8 mx-auto">
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription</CardTitle>
                            <CardDescription>Details about your current subscription.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium">Start Date</div>
                                <div className="text-sm">{new Date(subscription.start_date).toLocaleDateString(numbers, options)}</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium">End Date</div>
                                <div className="text-sm">{new Date(subscription.expires_at).toLocaleDateString(numbers, options)}</div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => setIsModalOpen(true)}>
                                Upgrade Subscription <ArrowRight className="ml-2 rtl:ms-2 rtl:ml-0 h-4 w-4 rtl:rotate-180" />
                            </Button>
                        </CardFooter>
                    </Card>
                    <Card>

                        { } <CardHeader>
                            <CardTitle>Usage</CardTitle>
                        </CardHeader>

                        {!counts ? <MyComponentWithSkeleton /> : (
                            <CardContent className="grid gap-4">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium">Users</div>
                                        <div className="text-sm">
                                            <span className="font-semibold">{counts?.total_users}</span> / {subscription.max_user} Allowed
                                        </div>
                                    </div>
                                    <Progress value={((counts?.total_users ?? 0) / subscription.max_user) * 100} className="h-4" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium">Courses</div>
                                        <div className="text-sm">
                                            <span className="font-semibold">{counts?.total_courses}</span> / {subscription.max_courses} Allowed
                                        </div>
                                    </div>
                                    <Progress value={((counts?.total_courses ?? 0) / subscription.max_courses) * 100} className="h-4" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium">Content Creators</div>
                                        <div className="text-sm">
                                            <span className="font-semibold">{counts?.admin_users}</span> / {subscription.max_lms_managers} Allowed
                                        </div>
                                    </div>
                                    <Progress value={((counts?.admin_users ?? 0) / subscription.max_lms_managers) * 100} className="h-4" />
                                </div>
                            </CardContent>
                        )}
                    </Card>
                </div>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent>
                        {requestSent ? (
                            <div className="flex flex-col items-center justify-between">
                                <p className="text-lg font-semibold mb-4">Your request has been sent</p>
                                <Button onClick={handleCloseModal}>
                                    Close
                                </Button>
                            </div>
                        ) : (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-start">Upgrade Subscription</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid items-center grid-cols-4 gap-4">
                                        <Label htmlFor="numUsers" className="text-right">
                                            Number of Users
                                        </Label>
                                        <Input
                                            id="numUsers"
                                            type="number"
                                            value={numUsers}
                                            onChange={(e) => setNumUsers(parseInt(e.target.value))}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid items-center grid-cols-4 gap-4">
                                        <Label htmlFor="numCourses" className="text-right">
                                            Number of Courses
                                        </Label>
                                        <Input
                                            id="numCourses"
                                            type="number"
                                            value={numCourses}
                                            onChange={(e) => setNumCourses(parseInt(e.target.value))}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid items-center grid-cols-4 gap-4">
                                        <Label htmlFor="numCourses" className="text-right">
                                            Number of Creators
                                        </Label>
                                        <Input
                                            id="numCreators"
                                            type="number"
                                            value={numCreators}
                                            onChange={(e) => setNumCreators(parseInt(e.target.value))}
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSubmit} disabled={isLoading}>{isLoading ? <LoadingSpinner /> : "Send Request"}</Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div >}
        </>
    )
}