"use client"
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

const formSchema = z.object({
 name_en: z.string().min(1, "English name is required"),
 name_ar: z.string().min(1, "Arabic name is required"),
 image: z.any().nullable(),
});

function EditCategoryDialog({ category, isOpen, onClose }: { category: any, isOpen: boolean, onClose: () => void }) {
 const [image, setImage] = useState<File | null>(null);
 const [profileImagePreview, setProfileImagePreview] = useState<string | null>(category?.image || null);

 const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
   name_en: category?.name_en || '',
   name_ar: category?.name_ar || '',
   image: null,
  },
 });

 const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
   const file = e.target.files[0];
   setImage(file);
   const reader = new FileReader();
   reader.onloadend = () => setProfileImagePreview(reader.result as string);
   reader.readAsDataURL(file);
  }
 };

 const onSubmit = (values: z.infer<typeof formSchema>) => {
  // Submit updated category details
  console.log("Updated values:", values);
  onClose();  // Close the dialog after submission
 };

 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   <DialogContent>
    <DialogHeader>
     <DialogTitle>Edit Category</DialogTitle>
    </DialogHeader>
    <Form {...form}>
     <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-2 py-2 p-4">
       <FormField
        control={form.control}
        name="name_en"
        render={({ field }) => (
         <FormItem>
          <FormLabel>Name (EN)</FormLabel>
          <FormControl>
           <Input {...field} placeholder="Enter English name" />
          </FormControl>
          <FormMessage />
         </FormItem>
        )}
       />

       <FormField
        control={form.control}
        name="name_ar"
        render={({ field }) => (
         <FormItem>
          <FormLabel>Name (AR)</FormLabel>
          <FormControl>
           <Input {...field} placeholder="Enter Arabic name" />
          </FormControl>
          <FormMessage />
         </FormItem>
        )}
       />

       <FormField
        control={form.control}
        name="image"
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
            <img
             src={profileImagePreview}
             alt="Profile preview"
             className="w-32 h-32 mx-auto object-cover rounded-full"
            />
           </div>
          )}
          <FormMessage />
         </FormItem>
        )}
       />
      </div>

      <div className="w-full flex justify-end mt-3">
       <Button type="submit">Update Category</Button>
      </div>
     </form>
    </Form>
   </DialogContent>
  </Dialog>
 );
}

export default EditCategoryDialog;
