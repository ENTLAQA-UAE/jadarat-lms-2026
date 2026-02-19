"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { rules } from "@/utils/constants/rulesEnums"
import { createClient } from "@/utils/supabase"
import { useAppSelector } from "@/hooks/redux.hook"
import { countries } from "@/lib/controllers/countries"
import LoadingSpinner from "@/components/loading-spinner/loading-spinner"
import { useToast } from "@/components/ui/use-toast"

import { Group } from "../groups-management/types"

import { User } from './types'
import { useLanguage } from "@/context/language.context"

export default function UserDetails({ selectedUser }: { selectedUser?: User }) {
    const { toast } = useToast()
    const { settings: { primaryColor } } = useAppSelector(state => state.organization);
    const { user } = useAppSelector(state => state.user);
    const { isRTL } = useLanguage()

    const [name, setName] = useState<string>("")
    const [department, setDepartment] = useState<string>("")
    const [role, setRole] = useState<string>("")
    const [group, setGroup] = useState<string>("")
    const [title, setTitle] = useState<string>("")
    const [grade, setGrade] = useState<string>("")
    const [country, setCountry] = useState<string>("")
    const [city, setCity] = useState<string>("")
    const [status, setStatus] = useState<string>("")
    const [groups, setGroups] = useState<Group[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (selectedUser) {
            setName(selectedUser.name ?? "")
            setDepartment(selectedUser.department ?? "")
            setRole(selectedUser.role ?? "")
            setGroup(selectedUser.group_id?.toString() ?? "")
            setTitle(selectedUser.jobtitle ?? "")
            setGrade(selectedUser.jobgrade ?? "")
            setCountry(selectedUser.country ?? "")
            setCity(selectedUser.city ?? "")
            setStatus(selectedUser.is_active ? "active" : "inactive")
        }
    }, [selectedUser])

    const getGroups = useCallback(async () => {
        const supabase = createClient()
        let { data, error } = await supabase.rpc('get_groups_with_user_count')
        if (error == null) setGroups(data)
    }, [])

    useEffect(() => {
        getGroups()
    }, [getGroups])

    const onUpdate = useCallback(async () => {
        if (!selectedUser) return

        setIsLoading(true)
        const supabase = createClient()
        let { error } = await supabase
            .rpc('update_user_details', {
                new_city: city,
                new_country: country,
                new_department: department,
                new_group_id: parseFloat(group),
                new_job_grade: grade,
                new_job_title: title,
                new_name: name,
                new_role: role,
                new_status: status === 'active',
                user_id: selectedUser.id
            })
        if (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        }
        else {
            toast({
                title: "User Update",
                description: "User details have been updated successfully.",
                variant: "success"
            })
        }
        window.dispatchEvent(new CustomEvent('refreshUsers'))
        setIsLoading(false)
    }, [city, country, department, grade, group, selectedUser, name, role, status, title, toast])

    const countryOptions = useMemo(() =>
        countries.map(item => (
            <SelectItem value={item.name} className="exclude-weglot" key={item.code}>{item.name}</SelectItem>
        ))
        , [isRTL])

    const groupOptions = useMemo(() =>
        groups.map(e => {

            return <SelectItem className="exclude-weglot" value={e.id.toString()} key={e.id}>{e.name}</SelectItem>
        })
        , [groups, isRTL])

    const roleOptions = useMemo(() =>
        Object.keys(rules).map(e => {
            if (e === 'superAdmin') return null
            return (
                <SelectItem value={e} className="exclude-weglot" key={e}>{rules[e as keyof typeof rules]}</SelectItem>
            )
        }).filter(Boolean)
        , [isRTL])

    return (
        <>
            <CardContent className="grid gap-6">
                <div>
                    <Label htmlFor="photo" className="font-semibold">
                        Basic Information
                    </Label>
                    <div className="grid gap-4 pt-2">
                        <div className="col-span-2 grid gap-2">
                            <Input id="email" type="email" placeholder="Email Address" value={selectedUser?.email} disabled />
                            <Input id="name" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
                            <Input id="department" placeholder="Department" value={department} onChange={e => setDepartment(e.target.value)} />
                            <Input id="jobTitle" placeholder="Job Title" value={title} onChange={e => setTitle(e.target.value)} />
                            <Input id="jobGrade" placeholder="Job Grade" value={grade} onChange={e => setGrade(e.target.value)} />
                            <div className="grid grid-cols-2 gap-2">
                                <Select value={country} onValueChange={setCountry}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countryOptions}
                                    </SelectContent>
                                </Select>
                                <Input id="city" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>
                <Separator />
                <div>
                    <Label htmlFor="group" className="font-semibold">
                        Organization Group
                    </Label>
                    <div className="pt-2">
                        <Select value={group} onValueChange={setGroup}>
                            <SelectTrigger>
                                <SelectValue className="exclude-weglot" placeholder="Assigned Group" />
                            </SelectTrigger>
                            <SelectContent >
                                {groupOptions}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Separator />
                <div>
                    <Label htmlFor="role" className="font-semibold">
                        Permissions
                    </Label>
                    <div className="pt-2">
                        <Select value={role} disabled={user?.id === selectedUser?.id} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="User Role" />
                            </SelectTrigger>
                            <SelectContent className="exclude-weglot">
                                {roleOptions}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Separator />
                <div>
                    <Label htmlFor="accountDetails" className="font-semibold">
                        Account Details
                    </Label>
                    <div className="grid gap-4 pt-2">
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="User Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button onClick={onUpdate} disabled={isLoading || !selectedUser}>
                    {isLoading ? <LoadingSpinner color={primaryColor} /> : "Update User"}
                </Button>
            </CardFooter>
        </>
    )
}
