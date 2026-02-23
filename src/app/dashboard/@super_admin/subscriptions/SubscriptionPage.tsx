// SubscriptionPage.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Eye, MoreHorizontal, Plus, Trash } from 'lucide-react';
import { DataTableComponent } from '@/components/DataTable';
import { columns, Subscription } from './columns';
import { SubscriptionForm } from './SubscriptionForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import FilterTable from './FilterTable';
import LoadingSpinner from '@/components/loading-spinner/loading-spinner';

// Import action functions
import {
  createSubscription,
  editSubscription,
  deleteSubscription,
} from '@/action/super-admin/subscriptions/SubscriptionsActions';

interface SubscriptionPageProps {
  initialSubscriptionTierData: Subscription[];
}

export default function SubscriptionPage({
  initialSubscriptionTierData,
}: SubscriptionPageProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [subscriptionToEdit, setSubscriptionToEdit] =
    useState<Subscription | null>(null);
  const [subscriptionToDelete, setSubscriptionToDelete] =
    useState<Subscription | null>(null);
  const [subscriptionToView, setSubscriptionToView] =
    useState<Subscription | null>(null);
  const [newTier, setNewTier] = useState('');
  const [subscriptionTierData, setSubscriptionTierData] = useState<
    Subscription[]
  >(initialSubscriptionTierData);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCreateSubscription = async (
    data: Omit<Subscription, 'id' | 'associatedOrganizations'>
  ) => {
    setLoading(true);
    try {
      const {
        loading: actionLoading,
        newSubscription,
        errorMessage,
      } = await createSubscription(data);
      setErrorMessage(errorMessage);
      if (newSubscription) {
        setSubscriptionTierData((prevData) => [...prevData, newSubscription]);
        setCreateDialogOpen(false);
      } else if (errorMessage) {
        console.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubscription = async (
    data: Omit<Subscription, 'id' | 'associatedOrganizations'>
  ) => {
    if (subscriptionToEdit) {
      setLoading(true);
      try {
        const {
          loading: actionLoading,
          updatedSubscription,
          errorMessage,
        } = await editSubscription(subscriptionToEdit.id, data);
        setErrorMessage(errorMessage);
        if (updatedSubscription) {
          setSubscriptionTierData((prevData) =>
            prevData.map((subscription) =>
              subscription.id === updatedSubscription.id
                ? updatedSubscription
                : subscription
            )
          );
          setEditDialogOpen(false);
          setSubscriptionToEdit(null);
        } else if (errorMessage) {
          console.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteSubscription = async () => {
    if (subscriptionToDelete && newTier) {
      setLoading(true);
      try {
        const {
          loading: actionLoading,
          result,
          errorMessage,
        } = await deleteSubscription(subscriptionToDelete.id, newTier); // Ensure newTier is a string
        setErrorMessage(errorMessage);
        if (result) {
          // Remove the deleted subscription from the state
          setSubscriptionTierData((prevData) =>
            prevData.filter((sub) => sub.id !== subscriptionToDelete.id)
          );
          setDeleteDialogOpen(false);
          setSubscriptionToDelete(null);
          setNewTier('');
        } else if (errorMessage) {
          console.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewSubscription = (subscription: Subscription) => {
    setSubscriptionToView(subscription);
    setViewDialogOpen(true);
  };

  const updatedColumns = columns.map((column) => {
    if (column.id === 'actions') {
      return {
        ...column,
        cell: ({ row }: { row: any }) => {
          const subscription = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleViewSubscription(subscription)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSubscriptionToEdit(subscription);
                    setEditDialogOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSubscriptionToDelete(subscription);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      };
    }
    return column;
  });

  if (loading) {
    return <LoadingSpinner color="#0A66C2" />;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Subscription
        </Button>
      </div>

      <DataTableComponent
        columns={updatedColumns}
        data={subscriptionTierData}
        renderToolbar={(table) => <FilterTable table={table} />}
      />

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Subscription</DialogTitle>
            <DialogDescription>
              Enter the details for the new subscription package.
            </DialogDescription>
          </DialogHeader>
          <SubscriptionForm onSubmit={handleCreateSubscription} mode="create" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Update the details for this subscription package.
            </DialogDescription>
          </DialogHeader>
          {subscriptionToEdit && (
            <SubscriptionForm
              subscription={subscriptionToEdit}
              onSubmit={(formData) => handleEditSubscription(formData)}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscription package? All
              associated organizations will be moved to another tier.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-tier">
              Select new tier for associated organizations
            </Label>
            <Select value={newTier} onValueChange={setNewTier}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Select a new tier" />
              </SelectTrigger>
              <SelectContent>
                {subscriptionTierData
                  .filter((sub) => sub.id !== subscriptionToDelete?.id)
                  .map((sub) => (
                    <SelectItem className='exclude-weglot' key={sub.id} value={sub.id.toString()}>
                      {sub.package}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteSubscription}
              variant="destructive"
              disabled={!newTier}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>View Subscription</DialogTitle>
          </DialogHeader>
          {subscriptionToView && (
            <div className="space-y-4">
              <div>
                <Label>Package Name</Label>
                <p>{subscriptionToView.package}</p>
              </div>
              <div>
                <Label>Total Allowed Users</Label>
                <p>{subscriptionToView.totalAllowedUsers}</p>
              </div>
              <div>
                <Label>Total Allowed Courses</Label>
                <p>{subscriptionToView.totalAllowedCourses}</p>
              </div>
              <div>
                <Label>Total Allowed Content Creators</Label>
                <p>{subscriptionToView.totalAllowedContentCreators}</p>
              </div>
              <div>
                <Label>Associated Organizations</Label>
                <p>{subscriptionToView.associatedOrganizations}</p>
              </div>
              <div className="border-t pt-4 space-y-2">
                <Label>Tier Features</Label>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <span className={subscriptionToView.allowCreateCourses ? 'text-green-600' : 'text-muted-foreground'}>
                      {subscriptionToView.allowCreateCourses ? '✓' : '✗'}
                    </span>
                    Create Courses
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={subscriptionToView.allowCreateAICourses ? 'text-green-600' : 'text-muted-foreground'}>
                      {subscriptionToView.allowCreateAICourses ? '✓' : '✗'}
                    </span>
                    AI Course Builder
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={subscriptionToView.allowCreateCoursesFromDocuments ? 'text-green-600' : 'text-muted-foreground'}>
                      {subscriptionToView.allowCreateCoursesFromDocuments ? '✓' : '✗'}
                    </span>
                    Document Course Builder
                  </li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
