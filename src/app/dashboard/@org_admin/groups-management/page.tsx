"use client"

import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, Plus } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { createClient } from "@/utils/supabase"
import { useAppSelector } from "@/hooks/redux.hook"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import LoadingSpinner from "@/components/loading-spinner/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"

import { Group } from "./types"
import HeadTitleTableSkeleton from "@/components/skeleton/HeadTitleTableSkeleton"

export default function GroupsPage() {
    const { toast } = useToast();
    const { settings: { primaryColor }, loading } = useAppSelector(state => state.organization);
    const { user: { organization_id } } = useAppSelector(state => state.user);

    const [groups, setGroups] = useState<Group[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [selectedToModify, setSelectedToModify] = useState<Group & { action: string }>()
    const [groupName, setGroupName] = useState<string>('');
    const [selectedGroups, setSelectedGroups] = useState<number[]>([])
    const [sortDirection, setSortDirection] = useState("asc")
    const [isAdding, setIsAdding] = useState<boolean>(false)
    const [openAdd, setOpenAdd] = useState<boolean>(false);

    const handleSort = useCallback(() => {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    }, [sortDirection])

    const getGroups = useCallback(async () => {
        const supabase = createClient()
        let { data, error } = await supabase
            .rpc('get_groups_with_user_count')
        if (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        }
        else setGroups(data)
    }, [toast])

    useEffect(() => {
        if (!loading) {
            setIsLoading(true);
            getGroups().finally(() => {
                setIsLoading(false);
            })
        }
    }, [getGroups, loading])

    const handleSelectGroup = useCallback((groupId: number) => {
        if (selectedGroups.includes(groupId)) {
            setSelectedGroups(selectedGroups.filter((id) => id !== groupId))
        } else {
            setSelectedGroups([...selectedGroups, groupId])
        }
    }, [selectedGroups])

    const table = useMemo(() => {
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-1/4 flex items-center cursor-pointer">
                            <Checkbox className="me-4  " checked={selectedGroups.length === groups.length} onCheckedChange={(checked) => {
                                if (checked)
                                    setSelectedGroups(groups.map(e => e.id))
                                else
                                    setSelectedGroups([])
                            }} disabled={isLoading} /><Button variant="ghost" className="px-0 hover:bg-transparent" onClick={handleSort}>
                                Group {sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 ms-2" /> : <ArrowDown className="w-4 h-4 ms-2" />}
                            </Button>
                        </TableHead>
                        <TableHead className="w-1/4">Users</TableHead>
                        <TableHead className="w-1/4">Created At</TableHead>
                        <TableHead className="w-1/4">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? <>
                        {[...Array(5)].map(() => {
                            return (
                                <TableRow key={Math.random() * 100}>
                                    <TableCell colSpan={4} className="h-[88px] mb-2">
                                        <Skeleton className="w-full h-full" />
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </> : groups.sort((a, b) => {
                        if (a['name'] < b['name']) return sortDirection === "asc" ? -1 : 1
                        if (a['name'] > b['name']) return sortDirection === "asc" ? 1 : -1
                        return 0
                    }).map((group) => (
                        <TableRow key={group.id}>
                            <TableCell>
                                <div className="flex items-center gap-4">
                                    <Checkbox
                                        checked={selectedGroups.includes(group.id)}
                                        onCheckedChange={() => handleSelectGroup(group.id)}
                                    />
                                    <span className="exclude-weglot">{group.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>{group.user_count}</TableCell>
                            <TableCell className="truncate ">{new Date(group.created_at).toDateString()}</TableCell>
                            <TableCell>
                                <div className="flex flex-col md:flex-row items-center gap-4">
                                    <Button variant="secondary" className="w-[110px]" onClick={() => setSelectedToModify({ ...group, action: "edit" })}>
                                        Edit Group
                                    </Button>
                                    <Button variant="destructive" className="w-[110px]" onClick={() => setSelectedToModify({ ...group, action: "delete" })}>
                                        Delete Group
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

        )
    }
        , [groups, handleSelectGroup, handleSort, isLoading, selectedGroups, sortDirection])

    const editGroup = useCallback(async () => {
        setIsAdding(true)
        const supabase = createClient();

        const { error } = await supabase
            .rpc('update_group', {
                new_name: selectedToModify?.name,
                group_id: selectedToModify?.id
            })
        if (error)
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        else {
            toast({
                title: "Success",
                description: `${selectedToModify?.name} group has been updated successfully.`,
                variant: "success"
            })
            setGroups(st => st.map(e => e.id === selectedToModify?.id ? { ...e, name: selectedToModify.name } : e))
            setSelectedToModify(undefined)
        }
        setIsAdding(false)
    }, [toast, selectedToModify?.name, selectedToModify?.id])

    const deleteGroup = useCallback(async () => {
        setIsAdding(true)
        const supabase = createClient();
        let idsToDelete: number[] = [];

        if (selectedToModify?.id) {
            idsToDelete.push(selectedToModify.id);
        } else if (selectedGroups.length) {
            idsToDelete = [...selectedGroups]
        }

        const { error } = await supabase
            .rpc('delete_groups_by_ids', {
                ids: idsToDelete
            })

        if (error)
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        else {
            toast({
                title: "Success",
                description: selectedToModify?.name ? `${selectedToModify?.name} group has been deleted successfully.` : "Selected groups has beed deleted succssfully.",
                variant: "success"
            })
            if (selectedToModify?.id) {
                setGroups(st => st.filter(e => e.id !== selectedToModify?.id))
                setSelectedToModify(undefined)
            } else if (selectedGroups.length) {
                setGroups(st => st.filter(e => !selectedGroups.includes(e.id)))
                setSelectedGroups([])
            }
        }
        setIsAdding(false)
    }, [selectedToModify?.id, selectedToModify?.name, selectedGroups, toast])

    const addNewGroup = useCallback(async () => {
        setIsAdding(true)
        const supabase = createClient();
        const { error } = await supabase
            .rpc('add_new_group', {
                name: groupName,
                orgid: organization_id
            })
        if (error)
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        else {
            toast({
                title: "Success",
                description: `${groupName} group has been created successfully.`,
                variant: "success"
            })
            getGroups()
            setGroupName('')
            setOpenAdd(false)
        }
        setIsAdding(false)
    }, [groupName, organization_id, toast, getGroups])

    return (
        <div className="flex lg:flex-row flex-col gap-4">
            <div className="bg-card p-6 w-full rounded-none">
                {!loading ? <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold">Groups Management</h2>
                        {selectedGroups.length > 0 && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={isAdding}>
                                        {isAdding ? <LoadingSpinner color={primaryColor} /> : "Delete Selected"}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete the selected groups? Users inside this groups will not be
                                            assigned to any group.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={deleteGroup}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                    <div className="flex items-center gap-4 md:flex-row flex-col">
                        <Dialog open={openAdd} onOpenChange={(open) => {
                            if (!open) setGroupName('')
                            setOpenAdd(open)
                        }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="me-2 h-4 w-4" />
                                    Add Group
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Group</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="groupName" className="text-right">
                                            Group Name
                                        </Label>
                                        <Input
                                            id="groupName"
                                            value={groupName}
                                            onChange={(e) => setGroupName(e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button disabled={groupName.trim().length < 3} onClick={addNewGroup}>
                                        {isAdding ? <LoadingSpinner color={primaryColor} /> : "Add"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div> : <HeadTitleTableSkeleton />}
                <div className="overflow-x-auto">
                    {table}
                </div>
            </div>

            <Dialog open={selectedToModify?.action === 'edit'} onOpenChange={(open) => {
                if (!open) {
                    setSelectedToModify(undefined)
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-start">Edit Group</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="groupName" className="text-right">
                                Group Name
                            </Label>
                            <Input
                                id="groupName"
                                value={selectedToModify?.name}
                                onChange={(e) => setSelectedToModify(st => ({ ...st, name: e.target.value }) as any)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={editGroup}>
                            {isAdding ? <LoadingSpinner color={primaryColor} /> : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog key={`delete-${selectedToModify?.id}`} open={selectedToModify?.action === 'delete'} onOpenChange={(open) => {
                if (!open) setSelectedToModify(undefined);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Warning</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <p>
                            Are you sure you want to delete the group &quot;{selectedToModify?.name}&quot;? Users inside this group will not be assigned to any group.
                        </p>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button onClick={() => setSelectedToModify(undefined)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={deleteGroup}>
                            {isAdding ? <LoadingSpinner color={primaryColor} /> : "Delete Group"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}