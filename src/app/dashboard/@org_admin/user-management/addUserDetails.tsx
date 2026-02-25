"use client"

import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { rules } from "@/utils/constants/rulesEnums"
import { createAdminClient, createClient } from "@/utils/supabase"
import { useAppSelector } from "@/hooks/redux.hook"
import { countries } from "@/lib/controllers/countries"
import LoadingSpinner from "@/components/loading-spinner/loading-spinner"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { fulldomain } from "@/utils/getFullDomain"

import { Group } from "../groups-management/types"
import { ScrollArea } from "@/components/ui/scroll-area"

const scheme = z.object({
    email: z.string().email(),
    name: z.string().min(1, { message: "Name filed is required." }),
    department: z.string().optional(),
    role: z.string().min(1, { message: "Permissions filed is required." }),
    group: z.string().nullable(),
    title: z.string().optional(),
    grade: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    status: z.string().min(1, { message: "Status filed is required." }),
})

export default function AddUser({ setOpenAddUser }: { setOpenAddUser: Dispatch<SetStateAction<boolean>> }) {
    const { settings: { primaryColor } } = useAppSelector(state => state.organization);

    const [groups, setGroups] = useState<Group[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const form = useForm<z.infer<typeof scheme>>({
        resolver: zodResolver(scheme),
        defaultValues: {
            email: "",
            city: "",
            country: "",
            department: "",
            grade: "",
            group: null,
            name: "",
            role: "",
            status: "",
            title: ""
        },
    })

    useEffect(() => {
        const getGroups = async () => {
            const supabase = createClient()
            let { data, error } = await supabase
                .rpc('get_groups_with_user_count')
            if (error == null) setGroups(data)
        }
        getGroups()
    }, [])

    const onSave = useCallback(async ({ email, city, country, department, grade, group, name, role, status, title }: any) => {
        setIsLoading(true)
        const supabase = createClient()
        const adminSupabase = createAdminClient()

        try {
            const { data, error } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
                redirectTo: window?.location?.protocol + '//' + fulldomain + "/welcome"
            })

            if (error) {
                toast.error("Error", {
                    description: error.message,
                })
                return
            }

            let { error: addUserError } = await supabase
                .rpc('add_user', {
                    status: status === 'active',
                    user_city: city,
                    user_country: country,
                    user_department: department,
                    user_email: email,
                    user_group_id: group || null,
                    user_id: data.user.id,
                    user_job_grade: grade,
                    user_job_title: title,
                    user_name: name,
                    user_role: role
                })

            if (addUserError) {
                toast({
                    title: "Error",
                    description: addUserError.message,
                    variant: "destructive"
                })
                await adminSupabase.auth.admin.deleteUser(email)
                return
            }

            toast({
                title: 'Add user status',
                description: `User with email ${email} has been created successfully.\nand have received an invitation link.`,
                variant: "success"
            })
            setOpenAddUser(false)
            window.dispatchEvent(new CustomEvent('refreshUsers'))

        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
            window.dispatchEvent(new CustomEvent('refreshUsers'))
        }
    }, [setOpenAddUser, toast])

    return (
        <>
            <ScrollArea className="h-[80vh] md:h-full">
                <CardContent className="grid gap-6">
                    <div>
                        <Label htmlFor="photo" className="font-semibold">
                            Basic Information
                        </Label>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSave)} className="grid gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label htmlFor="email" className="font-semibold">
                                                Email <span className="text-destructive text-base">*</span>
                                            </Label>
                                            <FormControl>
                                                <Input placeholder="m@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label htmlFor="name" className="font-semibold">
                                                Name <span className="text-destructive text-base">*</span>
                                            </Label>
                                            <FormControl>
                                                <Input placeholder="John" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="IT" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Job Title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="grade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Senior" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Select {...field} onValueChange={value => field.onChange({ target: { value } })}>
                                                        <SelectTrigger className="exclude-weglot">
                                                            <SelectValue className="exclude-weglot" placeholder="Country" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {countries.map(item => {
                                                                return (
                                                                    <SelectItem value={item.name} key={item.code}>{item.name}</SelectItem>
                                                                )
                                                            })}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="City" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Separator />

                                <FormField
                                    control={form.control}
                                    name="group"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label htmlFor="group" className="font-semibold">
                                                Organization Group
                                            </Label>
                                            <FormControl>
                                                <Select
                                                    {...field}
                                                    value={field.value || ""} // Handle null value
                                                    onValueChange={(value) => {
                                                        // Set null if empty string, otherwise set the value
                                                        field.onChange(value || null)
                                                    }}
                                                >
                                                    <SelectTrigger className="exclude-weglot">
                                                        <SelectValue className="exclude-weglot" placeholder="Assigned Group" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {groups.map(e => {
                                                            return (
                                                                <SelectItem className="exclude-weglot" value={e.id.toString()} key={e.id}>{e.name}</SelectItem>
                                                            )
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label htmlFor="group" className="font-semibold">
                                                Permissions <span className="text-destructive text-base">*</span>
                                            </Label>
                                            <FormControl>
                                                <Select {...field} onValueChange={value => field.onChange({ target: { value } })}>
                                                    <SelectTrigger className="exclude-weglot">
                                                        <SelectValue className="exclude-weglot" placeholder="User Role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.keys(rules).map(e => {
                                                            if (e === 'superAdmin') {
                                                                return <></>
                                                            }
                                                            return (
                                                                <SelectItem className="exclude-weglot" value={e} key={e}>{rules[e as keyof typeof rules]}</SelectItem>
                                                            )
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label htmlFor="group" className="font-semibold">
                                                Account Details <span className="text-destructive text-base">*</span>
                                            </Label>
                                            <FormControl>
                                                <Select {...field} onValueChange={value => field.onChange({ target: { value } })}>
                                                    <SelectTrigger className="exclude-weglot">
                                                        <SelectValue className="exclude-weglot" placeholder="User Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem className="exclude-weglot" value="active">Active</SelectItem>
                                                        <SelectItem className="exclude-weglot" value="inactive">Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <CardFooter className="flex justify-end p-0">
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? <LoadingSpinner color={primaryColor} /> : "Add User"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </div>
                </CardContent>
            </ScrollArea>
        </>
    )
}
