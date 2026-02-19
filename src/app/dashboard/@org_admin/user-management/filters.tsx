"use client"

import { useCallback, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { rules } from "@/utils/constants/rulesEnums"

export default function Filters({ departments, groups, onFilter }: { departments: string[], groups: string[], onFilter: any }) {
    const [name, setName] = useState<string>()
    const [email, setEmail] = useState<string>()
    const [group, setGroup] = useState<string>()
    const [department, setDepartment] = useState<string>()
    const [status, setStatus] = useState<string>()
    const [role, setRole] = useState<string>()

    const handleApplyFilter = useCallback(() => {
        onFilter({ name, email, group, department, status, role })
    }, [department, email, group, name, onFilter, role, status])

    const handleResetFilter = () => {
        setName('')
        setEmail('')
        setGroup('')
        setDepartment('')
        setStatus('')
        setRole('')
        onFilter({
            department: undefined, email: undefined, group: undefined, name: undefined, role: undefined, status: undefined
        })
    }

    return (
        <Card className="lg:flex-1 w-full lg:h-screen rounded-none lg:min-w-[300px]">
            <CardHeader>
                <CardTitle>User Filter</CardTitle>
                <CardDescription>Filter users based on the following criteria.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" type="text" placeholder="Enter name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="group">Group</Label>
                    <Select onValueChange={setGroup} value={group}>
                        <SelectTrigger id="group">
                            <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel >Groups</SelectLabel>
                                {groups.map(group => (
                                    <SelectItem className="exclude-weglot" value={group} key={group}>{group}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div></div>
                <div className="grid gap-2 ">
                    <Label htmlFor="department" >Department</Label>
                    <Select onValueChange={setDepartment} value={department}>
                        <SelectTrigger id="department">
                            <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Departments</SelectLabel>
                                {departments.map(department => (
                                    <SelectItem className="exclude-weglot " value={department} key={department}>{department}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select onValueChange={setStatus} value={status}>
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Status</SelectLabel>
                                <SelectItem className="exclude-weglot" value="active" key="active">Active</SelectItem>
                                <SelectItem className="exclude-weglot" value="inactive" key="inactive">Inactive</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="role">User Role</Label>
                    <Select onValueChange={setRole} value={role}>
                        <SelectTrigger id="role">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Roles</SelectLabel>
                                {Object.keys(rules).map(e => (
                                    e !== 'superAdmin' && (
                                        <SelectItem value={e} className="exclude-weglot" key={e}>{rules[e as keyof typeof rules]}</SelectItem>
                                    )
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter className="space-x-4">
                <Button className="ml-auto flex items-center" onClick={handleResetFilter} variant="outline">
                    Reset
                </Button>
                <Button className="ml-auto flex items-center" onClick={handleApplyFilter}>
                    Apply Filter
                </Button>
            </CardFooter>
        </Card>
    )
}
