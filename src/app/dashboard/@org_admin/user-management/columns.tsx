"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-col-header";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ellipsis, Key, Lock, Pencil, Trash, Unlock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { rules } from "@/utils/constants/rulesEnums";

import { User } from "./types";

type propsType = {
  setShowResetPasswordModal: React.Dispatch<React.SetStateAction<boolean>>
  setShowDeleteUserModal: React.Dispatch<React.SetStateAction<boolean>>
  setShowDisableUserModal: React.Dispatch<React.SetStateAction<boolean>>
  setSelectedUser: React.Dispatch<React.SetStateAction<User | undefined>>
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  id: string | undefined
}

export const cols = ({ setSelectedUser, setShowDeleteUserModal, setShowDisableUserModal, setShowResetPasswordModal, id, setOpen }: propsType) => {

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "email",
      // meta: {
      //   title: "Email",
      // },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        // Remove TableCell component if it wraps another td or ensure it does not render as <td>
        <Button variant="link" className="p-0 h-fit" onClick={() => {
          setOpen(true)
          setSelectedUser(row.original)
        }}>
          {row.original.email}
        </Button>
      ),
    },
    {
      accessorKey: "name",
      // meta: {
      //   title: "Name",
      // },
      header: ({ column }) => {
        return (
          <DataTableColumnHeader
            column={column}
            title="Name"
            enableSorting={false}
          />
        );
      },
      cell: ({ row }) => (row.original.name ?? "N/A"),
    },
    {
      accessorKey: "group",
      // meta: {
      //   title: "Group",
      // },
      header: ({ column }) => {
        return (
          <DataTableColumnHeader
            column={column}
            title="Group"
            enableSorting={false}
          />
        );
      },
      cell: ({ row }) => (row.original.group_name),
    },
    {
      accessorKey: "completed_courses_count",
      // meta: {
      //   title: "Completed Courses",
      // },
      header: ({ column }) => {
        return (
          <DataTableColumnHeader
            column={column}
            title="Completed Courses"
            enableSorting={false}
          />
        );
      },
      cell: ({ row }) => (row.original.completed_courses_count),
    },
    {
      accessorKey: "department",
      // meta: {
      //   title: "Department",
      // },
      header: ({ column }) => {
        return (
          <DataTableColumnHeader
            column={column}
            title="Department"
            enableSorting={false}
          />
        );
      },
      cell: ({ row }) => (row.original.department),
    },
    {
      accessorKey: "created_at",
      // meta: {
      //   title: "Creation Date",
      // },
      header: ({ column }) => {
        return (
          <DataTableColumnHeader
            column={column}
            title="Creation Date"
            enableSorting={false}
          />
        );
      },
      cell: ({ row }) => (new Date(row.original.created_at ?? "").toDateString()),
    },
    {
      accessorKey: "role",
      // meta: {
      //   title: "Role",
      // },
      header: ({ column }) => {
        return (
          <DataTableColumnHeader
            column={column}
            title="Role"
            enableSorting={false}
          />
        );
      },
      cell: ({ row }) => (rules[row.original.role]),
    },
    {
      accessorKey: "is_active",
      // meta: {
      //   title: "Status",
      // },
      header: ({ column }) => {
        return (
          <DataTableColumnHeader
            column={column}
            title="Status"
            enableSorting={false}
          />
        );
      },
      cell: ({ row }) => {
        return (

          <div className="flex items-center gap-2">
            {row.original.is_active ? (
              <div className="w-2 h-2 rounded-full bg-success" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-destructive" />
            )}
            <Badge variant="outline">
              {row.original.is_active ? "Active" : "Disabled"}
            </Badge>
          </div>

        );
      },
    },
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <DataTableColumnHeader
            column={column}
            title=""
            enableSorting={false}
          />
        );
      },
      cell: ({ row }) => {
        return (
          <DropdownMenu modal={false} onOpenChange={state => {
            if (state)
              setSelectedUser(row.original)
          }}>
            {id === row.original.id ?
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <DropdownMenuTrigger asChild disabled>
                      <Button variant="ghost" size="icon">
                        <Ellipsis className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{'Can\'t modify connected user.'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              :
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Ellipsis className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            }

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowResetPasswordModal(true)}>
                <Key className="h-4 w-4 mr-2" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDisableUserModal(true)}>
                {row.original.is_active ? <Lock className="h-4 w-4 mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
                {row.original.is_active ? "Disable Access" : "Reactivate Access"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDeleteUserModal(true)}>
                <Trash className="h-4 w-4 mr-2" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return columns;
}