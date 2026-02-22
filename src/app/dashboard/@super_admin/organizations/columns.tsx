"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, ChevronUp, ChevronsUpDown, Edit, Trash2, UserPlus } from "lucide-react"
import { Organization } from "./type"

const ProgressBar = ({ current, allowed }: { current: number; allowed: number }) => {
    const percentage = Math.min((current / allowed) * 100, 100)
    const color = percentage > 90 ? "bg-destructive" : percentage > 75 ? "bg-warning" : "bg-success"

    return (
        <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div
                    className={`h-full ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-sm px-2">
                {current} / {allowed}
            </span>
        </div>
    )
}

export const columns: ColumnDef<Organization>[] = [
    {
        accessorKey: "name",
        meta: {
            headerClassName: "w-[120px] ",
        },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Organization Name
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUp className="ms-2 h-4 w-4" />
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDown className="ms-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDown className="ms-2 h-4 w-4" />
                    )}
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="exclude-weglot">{row.original.name}</div>
        )
    },
    {
        accessorKey: "domain",
        meta: {
            headerClassName: "w-[200px] ",
        },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Domain
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUp className="ms-2 h-4 w-4" />
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDown className="ms-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDown className="ms-2 h-4 w-4" />
                    )}
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="exclude-weglot">{row.original.domain}</div>
        )
    },
    {
        accessorKey: "subscriptionPackage",
        meta: {
            headerClassName: "w-[120px] ",
        },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Subscription
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUp className="ms-2 h-4 w-4" />
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDown className="ms-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDown className="ms-2 h-4 w-4" />
                    )}
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="exclude-weglot">{row.original.subscriptionPackage}</div>
        )
    },
    {
        accessorKey: "totalUsers",
        meta: {
            headerClassName: "w-[200px] ",
        },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Total Users
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUp className="ms-2 h-4 w-4" />
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDown className="ms-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDown className="ms-2 h-4 w-4" />
                    )}
                </Button>
            )
        },
        cell: ({ row }) => (
            <ProgressBar current={row.original.totalUsers} allowed={row.original.allowedUsers} />
        ),
    },
    {
        accessorKey: "totalCourses",
        meta: {
            headerClassName: "w-[200px] ",
        },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Total Courses
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUp className="ms-2 h-4 w-4" />
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDown className="ms-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDown className="ms-2 h-4 w-4" />
                    )}
                </Button>
            )
        },
        cell: ({ row }) => (
            <ProgressBar current={row.original.totalCourses} allowed={row.original.allowedCourses} />
        ),
    },
    {
        accessorKey: "totalContentCreators",
        meta: {
            headerClassName: "w-[120px] ",
            cellClassName: "flex flex justify-center items-center w-full    "
        },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Content Creators
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUp className="ms-2 h-4 w-4" />
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDown className="ms-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDown className="ms-2 h-4 w-4" />
                    )}
                </Button>
            )
        },
        cell: ({ row }) => (
            <ProgressBar current={row.original.totalContentCreators} allowed={row.original.allowedContentCreators} />
        ),
    },
    {
        accessorKey: "subscriptionExpirationDate",
        meta: {
            headerClassName: "w-[200px] text-center",


        },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Expiration Date
                    {column.getIsSorted() === "asc" ? (
                        <ChevronUp className="ms-2 h-4 w-4" />
                    ) : column.getIsSorted() === "desc" ? (
                        <ChevronDown className="ms-2 h-4 w-4" />
                    ) : (
                        <ChevronsUpDown className="ms-2 h-4 w-4" />
                    )}
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="flex items-center justify-center exclude-weglot ">
                {row.original.subscriptionExpirationDate.toLocaleDateString()}
                <span
                    className={`ms-2 w-2 h-2 rounded-full ${row.original.status === "Active" ? "bg-success" : "bg-destructive"
                        }`}
                />
                <span className="ms-1 text-sm">
                    {row.original.status}
                </span>
            </div>
        ),
    },
    {
        id: "actions",
        meta: {
            headerClassName: "!w-[120px] ",
            cellClassName: "flex flex justify-center items-center w-full    "
        },
        cell: ({ row }) => {
            const organization = row.original
            const canAddUsers = organization.totalUsers < organization.allowedUsers

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => organization.onEdit && organization.onEdit(organization)}>
                            <Edit className="me-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => organization.onDelete && organization.onDelete(organization)}>
                            <Trash2 className="me-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => organization.onAddUser && organization.onAddUser(organization)}
                            disabled={!canAddUsers || organization.status !== "Active"}
                            className={(!canAddUsers || organization.status !== "Active") ? "cursor-not-allowed opacity-50" : ""}
                        >
                            <UserPlus className="me-2 h-4 w-4" />
                            Add User
                            {!canAddUsers && (
                                <span className="ms-2 text-xs text-muted-foreground">
                                    (User limit reached)
                                </span>
                            )}
                            {organization.status !== "Active" && (
                                <span className="ms-2 text-xs text-muted-foreground">
                                    (Subscription inactive)
                                </span>
                            )}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]