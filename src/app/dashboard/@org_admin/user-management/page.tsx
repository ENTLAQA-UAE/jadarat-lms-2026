'use client';

import { buttonVariants } from '@/components/ui/button';
import { ChevronDown, Plus } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { DataTable } from '@/components/ui/data-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createAdminClient } from '@/utils/supabase';
import { createClient } from '@/utils/supabase/client';
import { useAppSelector } from '@/hooks/redux.hook';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { fulldomain } from '@/utils/getFullDomain';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

import Filters from './filters';
import { User } from './types';
import { cols as columns } from './columns';
import UserDetails from './userDetails';
import AddUser from './addUserDetails';
import HeadTitleTableSkeleton from '@/components/skeleton/HeadTitleTableSkeleton';
import useWindowSize from '@/hooks/useWindowSize';

export default function Component() {
  const { toast } = useToast();
  const { loading } = useAppSelector((state) => state.organization);
  const {
    user: { organization_id },
  } = useAppSelector((state) => state.user);
  const { user } = useAppSelector((state) => state.user);
  const { width } = useWindowSize();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState<boolean>(false);
  const [showDisableUserModal, setShowDisableUserModal] = useState<boolean>(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [filters, setFilters] = useState<{
    department: string;
    email: string;
    group: string;
    name: string;
    role: string;
    status: string;
  }>();
  const [open, setOpen] = useState<boolean>(false);
  const [openAddUser, setOpenAddUser] = useState<boolean>(false);
  const [openFilterMobile, setOpenFilterMobile] = useState<boolean>(false);

  console.log("users " ,users);
  

  useEffect(() => {
    if (width! > 768) {
      setOpenFilterMobile(false);
    }
  }, [width]);

  const getUsers = useCallback(async () => {
    console.log('Fetching users...');
    setOpen(false);
    const supabase = createClient();
    setIsLoading(true);
    try {
      let { data, error } = await supabase.rpc('get_organization_users_info', {
        orgid: organization_id,
      });
      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        console.log('Users fetched successfully:', data);
        setUsers(data);
      }
    } catch (error) {
      console.error('Unexpected error fetching users:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching users.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [organization_id, toast]);

  useEffect(() => {
    window.addEventListener('refreshUsers', getUsers);

    if (!loading) getUsers();

    return () => {
      window.removeEventListener('refreshUsers', getUsers);
    };
  }, [loading, getUsers]);

  const handleSendResetPassword = useCallback(async () => {
    setShowResetPasswordModal(false);

    const supabase = createClient();
    if (selectedUser?.email) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(
          selectedUser.email,
          {
            redirectTo:
              window?.location?.protocol + '//' + fulldomain + '/update-password',
          }
        );

        if (error == null) {
          toast({
            title: 'Success',
            description: `Reset password link has been sent to ${selectedUser.email}`,
            duration: 10000,
            variant: 'success',
          });
        } else if (
          error.message ===
          'For security purposes, you can only request this once every 60 seconds'
        ) {
          toast({
            title: 'Please wait',
            description:
              'You have to wait 1 minute to send a reset password link',
            duration: 10000,
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } catch (error) {
        console.error('Error sending reset password:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while sending the reset password link.',
          duration: 10000,
          variant: 'destructive',
        });
      } finally {
        setSelectedUser(undefined);
      }
    }
  }, [selectedUser?.email, toast]);

  const handleDisableUser = useCallback(async () => {
    setShowDisableUserModal(false);

    const supabase = createClient();
    if (selectedUser?.email) {
      try {
        let { error } = await supabase.rpc('update_user_is_active', {
          isactive: !selectedUser.is_active,
          userid: selectedUser.id,
          orgid: organization_id,
        });

        if (error == null) {
          toast({
            title: 'Success',
            description: `User with email ${selectedUser.email} has been ${selectedUser.is_active ? 'deactivated' : 'activated'
              } successfully.`,
            duration: 10000,
            variant: 'success',
          });
          setSelectedUser({
            ...selectedUser,
            is_active: !selectedUser.is_active,
          });
          setUsers((st) =>
            st.map((e) =>
              e.id === selectedUser.id ? { ...e, is_active: !e.is_active } : e
            )
          );
        } else {
          throw error;
        }
      } catch (error) {
        console.error('Error updating user status:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while updating the user status.',
          duration: 10000,
          variant: 'destructive',
        });
      } finally {
        setSelectedUser(undefined);
      }
    }
  }, [organization_id, selectedUser, toast]);

  const handleDeleteUser = useCallback(async () => {
    setShowDeleteUserModal(false);

    const supabase = createClient();
    if (selectedUser?.email) {
      try {
        let { error } = await supabase.rpc('delete_user', {
          orgid: organization_id,
          userid: selectedUser.id,
        });

        if (error == null) {
          const adminSupabase = createAdminClient();
          if (selectedUser.id) {
            const { error } = await adminSupabase.auth.admin.deleteUser(
              selectedUser.id
            );
            if (error) {
              throw error;
            }
            toast({
              title: 'Success',
              description: `User with email ${selectedUser.email} has been deleted successfully.`,
              duration: 10000,
              variant: 'success',
            });
            setUsers((st) => st.filter((e) => e.id !== selectedUser.id));
          }
        } else {
          throw error;
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while deleting the user.',
          duration: 10000,
          variant: 'destructive',
        });
      } finally {
        setSelectedUser(undefined);
      }
    }
  }, [organization_id, selectedUser?.email, selectedUser?.id, toast]);

  const departments = useMemo(() => {
    let departments: string[] = [];

    for (var i = 0; i < users.length; i++) {
      if (
        !departments.includes(users[i].department ?? '') &&
        users[i].department
      ) {
        departments.push(users[i].department as string);
      }
    }

    return departments;
  }, [users]);

  const groups = useMemo(() => {
    let groups: string[] = [];

    for (var i = 0; i < users.length; i++) {
      if (!groups.includes(users[i].group_name ?? '') && users[i].group_name) {
        groups.push(users[i].group_name as string);
      }
    }

    return groups;
  }, [users]);

  const filteredUsers = useCallback(
    (filters?: {
      department: string;
      email: string;
      group: string;
      name: string;
      role: string;
      status: string;
    }) => setFilters(filters),
    []
  );

  const handleDialogOpenChange = useCallback((newOpen: boolean) => {
    console.log('Dialog open state changing to:', newOpen);
    setOpen(newOpen);
    if (!newOpen) {
      console.log('Closing dialog, resetting selected user');
      setSelectedUser(undefined);
    }
  }, []);

  const table = useMemo(
    () => (
      <DataTable
        data={users.filter((e) => {
          return (
            (filters?.['department']
              ? e.department === filters['department']
              : true) &&
            e.email
              ?.toLowerCase()
              ?.includes(filters?.['email']?.toLowerCase() ?? '') &&
            (filters?.['group'] ? e.group_name === filters['group'] : true) &&
            (filters?.['role'] ? e.role === filters['role'] : true) &&
            (filters?.['status']
              ? e.is_active === (filters['status'] === 'active')
              : true) &&
            e.name
              ?.toLowerCase()
              .includes(filters?.['name']?.toLowerCase() ?? '')
          );
        })}
        columns={columns({
          setShowResetPasswordModal,
          setShowDeleteUserModal,
          setOpen,
          setShowDisableUserModal,
          setSelectedUser,
          id: user?.id,
        })}
        enablePagination
        withLoading={isLoading}
        title="Users"
      />
    ),
    [filters, isLoading, user?.id, users]
  );

  const filtersView = useMemo(
    () => (
      <Filters
        onFilter={filteredUsers}
        departments={departments}
        groups={groups}
      />
    ),
    [departments, filteredUsers, groups]
  );

  useEffect(() => {
    console.log('Selected user changed:', selectedUser);
  }, [selectedUser]);

  return (
    <div className="flex lg:flex-row flex-col gap-4">
      <span className="lg:block hidden">{filtersView}</span>

      <Collapsible open={openFilterMobile}>
        <CollapsibleTrigger
          onClick={() => setOpenFilterMobile(!openFilterMobile)}
          className="justify-between items-center w-full border-y-2 p-4 lg:hidden flex"
        >
          Filters
          <ChevronDown />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-0">{filtersView}</CollapsibleContent>
      </Collapsible>
      <div className="bg-white dark:bg-gray-950 p-6 w-full rounded-none">
        <>
          {!loading ? (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="flex items-center gap-4 md:flex-row flex-col">
                <Dialog open={openAddUser} onOpenChange={setOpenAddUser}>
                  <DialogTrigger
                    className={buttonVariants({ variant: 'default' })}
                  >
                    <span className="flex items-center justify-center">
                      <Plus className="me-2 h-4 w-4" />
                      Add User
                    </span>
                  </DialogTrigger>
                  <DialogContent className='h-[95dvh] overflow-y-auto'>
                    <AddUser setOpenAddUser={setOpenAddUser} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : (
            <HeadTitleTableSkeleton />
          )}
        </>
        <div className="overflow-x-auto">{table}</div>
      </div>

      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <UserDetails selectedUser={selectedUser} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showResetPasswordModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">
              Reset Password
            </AlertDialogTitle>
            <AlertDialogDescription dir="auto">
              A password reset link will be sent to {selectedUser?.email}. Are
              you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowResetPasswordModal(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSendResetPassword}>
              Reset Password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showDisableUserModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">
              {selectedUser?.is_active ? 'Disable' : 'Reactivate'} User Access
            </AlertDialogTitle>
            <AlertDialogDescription dir="auto">
              {selectedUser?.is_active
                ? `This will prevent ${selectedUser?.name} from accessing the system. Are you sure you want to proceed?`
                : `This will allow ${selectedUser?.name} access to the system. Are you sure you want to proceed?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDisableUserModal(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDisableUser}>
              {selectedUser?.is_active ? 'Disable' : 'Allow'} Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showDeleteUserModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription dir="auto">
              This will permanently delete {selectedUser?.name}&apos;s account
              and all associated data. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteUserModal(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}