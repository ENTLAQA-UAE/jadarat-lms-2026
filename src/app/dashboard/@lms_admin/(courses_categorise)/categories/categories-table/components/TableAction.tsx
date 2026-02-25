'use client';

import { deleteCategory, editCategory, fetchAllCategories } from '@/action/categories/categoriesActions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useLanguage } from '@/context/language.context';
import { useAppSelector } from '@/hooks/redux.hook';
import { deleteImageFromStorage } from '@/utils/deleteImageFromStorage';
import { uploadImage } from '@/utils/uploadFile';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Trash, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { z } from 'zod';

const formSchema = z.object({
  name_en: z.string().min(1, 'English name is required').optional(),
  name_ar: z.string().min(1, 'Arabic name is required').optional(),
  image: z.any().nullable(),
});


const deleteFormSchema = z.object({
  newCategoryId: z.string().min(1, 'New category is required'),
});


const TableAction = ({ row, categoriesData }: {
  row: any, categoriesData: {
    name: string,
    id: number,
    ar_name: string
    image: string | null
  }[]
}) => {
  const { settings: { organization_id } } = useAppSelector(state => state.organization);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const { isRTL } = useLanguage()



  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name_en: row.original.name,
      name_ar: row.original.ar_name,
      image: null,
    },
  });

  const deleteForm = useForm<z.infer<typeof deleteFormSchema>>({
    resolver: zodResolver(deleteFormSchema),
    defaultValues: {
      newCategoryId: "",
    },
  });

  const handleEditClick = () => {
    setOpen(true);
  };


  const handleDeleteClick = () => {
    setDeleteOpen(true);
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImagePreview(null);
    setImage(null);
  };

  const handleToast = (title: string, description: string, variant: 'default' | 'destructive') => {
    if (variant === 'destructive') {
      toast.error(title, { description });
    } else {
      toast.success(title, { description });
    }
  };


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      let imageUrl: string | null = row.original.image ?? null;

      // Upload new image if one was selected
      if (image && Number(organization_id) > 0) {
        const uploadedImage = await uploadImage(`category_${values.name_en}`, image, organization_id);
        if (uploadedImage) {
          imageUrl = uploadedImage.signedUrl;
        }
      }

      const { errorMessage } = await editCategory(
        row.original.id,
        values.name_en ?? row.original.name,
        imageUrl,
        values.name_ar ?? row.original.ar_name
      );

      if (errorMessage) {
        handleToast('Category Editing Failed', errorMessage, 'destructive');
        if (image) {
          deleteImageFromStorage(`${organization_id}/category_${values.name_en}`);
        }
      } else {
        handleToast('Category Edited', 'Category edited successfully.', 'default');
        setOpen(false);
      }
    } catch (error: any) {
      handleToast('Category Editing Failed', error?.message || 'An unexpected error occurred', 'destructive');
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteSubmit = async (values: z.infer<typeof deleteFormSchema>) => {
    setIsLoading(true);
    try {
      const { errorMessage } = await deleteCategory(+row.original.id, +values.newCategoryId);
      if (errorMessage) {
        handleToast('Category Deletion Failed', errorMessage, 'destructive');
      } else {
        handleToast('Category Deleted', 'Category deleted successfully.', 'default');
        setDeleteOpen(false);
      }
    } catch (error: any) {
      handleToast('Category Deletion Failed', error?.message || 'An unexpected error occurred', 'destructive');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="icon" variant="outline" onClick={handleEditClick} aria-label="Edit category">
        <Edit className="w-5 h-5" />
      </Button>

      <Button size="icon" variant="outline" onClick={handleDeleteClick} aria-label="Delete category">
        <Trash className="w-5 h-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-2 py-2 p-4">
                <FormFieldComponent
                  control={form.control}
                  name="name_en"
                  label="Name (EN)"
                  placeholder="Enter English name"
                />
                <FormFieldComponent
                  control={form.control}
                  name="name_ar"
                  label="Name (AR)"
                  placeholder="Enter Arabic name"
                />
                <ImageUploadField
                  control={form.control}
                  name="image"
                  profileImagePreview={profileImagePreview}
                  handleProfileImageChange={handleProfileImageChange}
                  handleRemoveImage={handleRemoveImage}
                />

                {/* add image preview */}
                <div className="flex justify-center items-center">
                  <Image
                    src={row.original.image ?? ''}
                    alt="Profile preview"
                    className="w-32 h-32 mx-auto object-contain"
                    width={128}
                    height={128}
                  />
                </div>
              </div>

              <div className="w-full flex justify-end mt-3">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Edit Category'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog for Delete */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>

          <Form {...deleteForm}>
            <form onSubmit={deleteForm.handleSubmit(onDeleteSubmit)}>
              <div className="grid gap-2 py-2 p-4">
                <FormField
                  control={deleteForm.control}
                  name="newCategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Category</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value.toString()}>
                          <SelectTrigger className="w-[180px] exclude-weglot">
                            <SelectValue className='exclude-weglot' placeholder={isRTL ? "حدد الفئة" : "Select a category"} />
                          </SelectTrigger>
                          <SelectContent>

                            {categoriesData
                              .filter((category: any) => category.id !== row.original.id)
                              .map((category: any) => (
                                <SelectItem className='exclude-weglot ' key={category.id} value={category.id.toString()}>
                                  {isRTL ? category.ar_name : category.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-full flex justify-end mt-3">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Delete Category'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const FormFieldComponent = ({
  control,
  name,
  label,
  placeholder,
}: {
  control: any;
  name: string;
  label: string;
  placeholder: string;
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input {...field} placeholder={placeholder} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const ImageUploadField = ({
  control,
  name,
  profileImagePreview,
  handleProfileImageChange,
  handleRemoveImage,
}: {
  control: any;
  name: string;
  profileImagePreview: string | null;
  handleProfileImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: () => void;
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>Image</FormLabel>
        <FormControl>
          <Input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={(e) => {
              field.onChange(e.target.files?.[0] || null);
              handleProfileImageChange(e);
            }}
          />
        </FormControl>

        {profileImagePreview && (
          <div className="relative">
            <Image
              src={profileImagePreview}
              alt="Profile preview"
              className="w-32 h-32 mx-auto object-cover rounded-full"
              width={128}
              height={128}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-0 right-0"
              onClick={() => {
                handleRemoveImage();
                field.onChange(null);
              }}
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <FormMessage />
      </FormItem>
    )}
  />
);

export default TableAction;