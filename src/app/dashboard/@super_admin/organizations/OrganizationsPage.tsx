// OrganizationsPage.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTableComponent } from "@/components/DataTable";
import { Organization, OrganizationFormData } from "./type";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OrganizationForm } from "./OrganizationsForm";
import { columns } from "./columns";
import FilterTable from "./FilterTable";
import LoadingSpinner from "@/components/loading-spinner/loading-spinner";
import { uploadImage } from "@/utils/uploadFile";
import { toast } from "@/components/ui/use-toast";

// Import action functions
import {
  createOrganization,
  editOrganization,
  deleteOrganization,
  updateOrganizationLogo,
} from "@/action/super-admin/orgnizations/organizationsActions";
import { createClient } from "@/utils/supabase/client";
import AddUser from "./addUserDetails";
import { SubscriptionSheet } from "./SubscriptionSheet";

interface OrganizationsPageProps {
  initialData: Organization[];
}

export default function OrganizationsPage({
  initialData,
}: OrganizationsPageProps) {
  const [data, setData] = useState<Organization[]>(initialData);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [subscriptionSheetOpen, setSubscriptionSheetOpen] = useState(false);
  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [logoError, setLogoError] = useState<string | null>(null);

  const supabase = createClient();
  async function refershOrgTable() {
    let { data, error } = await supabase.rpc("get_all_organization");
    if (!error && data) {
      // restructure the data
      const restructureData = data.map((org: any) => {
        const isActive = org.subscription_is_active ?? true;
        const isExpired = org.subscription_expiration_date && new Date() > new Date(org.subscription_expiration_date);
        let status: 'Active' | 'Expired' | 'Suspended';
        if (!isActive) status = 'Suspended';
        else if (isExpired) status = 'Expired';
        else status = 'Active';

        return {
          id: org.id as string,
          name: org.name,
          domain: org.domain,
          subscriptionPackage: org.subscription_package,
          totalUsers: org.total_users,
          allowedUsers: org.allowed_users,
          totalCourses: org.total_courses,
          allowedCourses: org.allowed_courses,
          totalContentCreators: org.total_content_creators,
          allowedContentCreators: org.allowed_content_creators,
          subscriptionExpirationDate: org.subscription_expiration_date ? new Date(org.subscription_expiration_date) : null,
          subscriptionStartDate: org.subscription_start_date ? new Date(org.subscription_start_date) : null,
          subscriptionIsActive: isActive,
          status,
          allowCreateCourses: org.create_courses,
          allowCreateAICourses: org.ai_builder,
          allowCreateCoursesFromDocuments: org.document_builder,
          logo_url: org.logo_url,
        };
      });
      setData(restructureData);
    }
  }

  const validateLogo = (file: File | undefined): boolean => {
    if (!file) return true;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    const maxSize = 3 * 1024 * 1024; // 3 MB

    if (!allowedTypes.includes(file.type)) {
      setLogoError("Logo must be a PNG or JPG file.");
      return false;
    }

    if (file.size > maxSize) {
      setLogoError("Logo size must not exceed 3 MB.");
      return false;
    }

    setLogoError(null);
    return true;
  };

  const handleCreateOrganization = async (newOrg: OrganizationFormData) => {
    setIsLoading(true);
    setErrorMessage("");
    setLogoError(null);

    try {
      const { logo, ...organizationData } = newOrg;
      console.log(newOrg);
      if (logo && !validateLogo(logo)) {
        setIsLoading(false);
        return;
      }

      // Step 1: Create the organization via server action, passing only serializable data
      const { loading, organizationId, errorMessage } =
        await createOrganization(organizationData);

      if (errorMessage) {
        setErrorMessage(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (organizationId) {
        // Step 2: Upload the logo file (if provided) using the organization ID
        if (logo) {
          // Use the provided uploadImage function
          const uploadedImage = await uploadImage(
            "logo",
            logo,
            organizationId,
            ""
          );

          if (uploadedImage) {
            const logoUrl = uploadedImage.signedUrl;

            // Step 3: Update the organization's logo URL via server action
            const { loading: updateLoading, errorMessage: updateError } =
              await updateOrganizationLogo(organizationId, logoUrl);

            if (updateError) {
              console.error("Error updating organization logo:", updateError);
              setErrorMessage(updateError);
              toast({
                title: "Error",
                description: updateError,
                variant: "destructive",
              });
            }
          } else {
            // Handle error if uploadImage failed
            const uploadError = "Failed to upload logo image.";
            setErrorMessage(uploadError);
            toast({
              title: "Error",
              description: uploadError,
              variant: "destructive",
            });
          }
        }

        await refershOrgTable();
        setCreateDialogOpen(false);
        toast({
          title: "Success",
          description: "Organization created successfully.",
        });
      }
    } catch (error: any) {
      console.error("Error creating organization:", error.message);
      setErrorMessage(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditOrganization = async (editedOrg: OrganizationFormData) => {
    if (!currentOrganization) return;
    setIsLoading(true);
    setErrorMessage("");
    setLogoError(null);

    try {
      const { logo, ...organizationData } = editedOrg;

      if (logo && !validateLogo(logo)) {
        setIsLoading(false);
        return;
      }

      const { loading, success, errorMessage } = await editOrganization(
        currentOrganization.id,
        organizationData
      );

      if (errorMessage) {
        setErrorMessage(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (success) {
        // Step 2: Upload the logo file (if provided) using the organization ID
        if (logo) {
          const bucketName = "LMS Resources";
          const folderPath = `${currentOrganization.id}`;
          const fileName = "logo";
          const filePath = `${folderPath}/${fileName}`;
          const { error: removeError } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);

          if (removeError) {
            console.error("Error removing existing logo:", removeError.message);
            return { success: false, error: removeError };
          }
          // Use the provided uploadImage function
          const uploadedImage = await uploadImage(
            "logo",
            logo,
            currentOrganization.id,
            ""
          );

          if (uploadedImage) {
            const logoUrl = uploadedImage.signedUrl;

            // Step 3: Update the organization's logo URL via server action
            const { loading: updateLoading, errorMessage: updateError } =
              await updateOrganizationLogo(currentOrganization.id, logoUrl);

            if (updateError) {
              console.error("Error updating organization logo:", updateError);
              setErrorMessage(updateError);
            }
          } else {
            // Handle error if uploadImage failed
            setErrorMessage("Failed to upload logo image.");
          }
        }
        await refershOrgTable();
        setCurrentOrganization(null);
        setEditDialogOpen(false);
        toast({
          title: "Success",
          description: "Organization updated successfully.",
        });
      } else if (errorMessage) {
        console.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrganization = async () => {
    if (!currentOrganization) return;
    setIsLoading(true);
    try {
      const { loading, success, errorMessage } = await deleteOrganization(
        currentOrganization.id
      );
      setErrorMessage(errorMessage);
      if (success) {
        setData((prevData) =>
          prevData.filter((org) => org.id !== currentOrganization.id)
        );
        setDeleteDialogOpen(false);
        setCurrentOrganization(null);
      } else if (errorMessage) {
        console.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const dataWithActions: Organization[] = data.map((org) => ({
    ...org,
    onEdit: (org: Organization) => {
      setCurrentOrganization(org);
      setEditDialogOpen(true);
    },
    onDelete: (org: Organization) => {
      setCurrentOrganization(org);
      setDeleteDialogOpen(true);
    },
    onAddUser: (org: Organization) => {
      setCurrentOrganization(org);
      setAddUserDialogOpen(true);
    },
    onManageSubscription: (org: Organization) => {
      setCurrentOrganization(org);
      setSubscriptionSheetOpen(true);
    },
  }));

  if (isLoading) {
    return <LoadingSpinner color="#0A66C2" />;
  }

  console.log("selectedOrganization", currentOrganization);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Organizations</h1>

        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Organization
          </Button>
        </div>
      </div>
      <DataTableComponent
        columns={columns}
        data={dataWithActions}
        renderToolbar={(table) => <FilterTable table={table} />}
        pagination={true}
      />

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="flex flex-col gap-6 sm:max-w-[425px]   overflow-y-auto">
          <DialogHeader className="space-y-0 h-[20px]">
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Add a new organization to your platform.
            </DialogDescription>
          </DialogHeader>
          <OrganizationForm
            onSubmit={handleCreateOrganization}
            setCreateDialogOpen={setCreateDialogOpen}
            logoError={logoError}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Make changes to the organization.
            </DialogDescription>
          </DialogHeader>
          {currentOrganization && (
            <OrganizationForm
              onSubmit={handleEditOrganization}
              initialData={{
                name: currentOrganization.name,
                domain: currentOrganization.domain,
                subscriptionPackage: currentOrganization.subscriptionPackage,
                allowCreateCourses: currentOrganization.allowCreateCourses,
                allowCreateAICourses: currentOrganization.allowCreateAICourses,
                allowCreateCoursesFromDocuments:
                  currentOrganization.allowCreateCoursesFromDocuments,
                logo_url: currentOrganization.logo_url,
              }}
              setCreateDialogOpen={setEditDialogOpen}
              logoError={logoError}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              organization and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={"destructive"}
              onClick={handleDeleteOrganization}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col gap-0 p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>
              Add a new user to {currentOrganization?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 pt-2">
            {currentOrganization && (
              <AddUser
                setOpenAddUser={setAddUserDialogOpen}
                selectedOrganization={currentOrganization}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <SubscriptionSheet
        open={subscriptionSheetOpen}
        onOpenChange={setSubscriptionSheetOpen}
        organization={currentOrganization}
        onUpdated={async () => {
          await refershOrgTable();
        }}
      />
    </div>
  );
}
