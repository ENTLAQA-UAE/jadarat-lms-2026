'use client';
import { addCategory } from '@/action/categories/categoriesActions';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { uploadImage } from '@/utils/uploadFile';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppSelector } from "@/hooks/redux.hook"
import { z } from 'zod';

const formSchema = z.object({
    name_en: z.string().min(1, "English name is required"),
    name_ar: z.string().min(1, "Arabic name is required"),
    image: z.any().nullable(),
});

function CategoryHeader() {
    const { toast } = useToast();
    const { settings: { organization_id } } = useAppSelector(state => state.organization);
    const [isLoading, setIsLoading] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
    const [open, setOpen] = useState<boolean>(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name_en: "",
            name_ar: "",
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

    const handleRemoveImage = () => {
        setProfileImagePreview(null);
        setImage(null);
    };

    const handleToast = (title: string, description: string, variant: 'default' | 'destructive') => {
        toast({ title, description, variant });
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            let imageUrl: string | null = null;

            // Upload image if one was selected
            if (image && Number(organization_id) > 0) {
                const uploadedImage = await uploadImage(`category_${Date.now()}`, image, organization_id, toast);
                if (uploadedImage) {
                    imageUrl = uploadedImage.signedUrl;
                }
            }

            // Always create the category (image is optional)
            const { errorMessage } = await addCategory(values.name_en, imageUrl, values.name_ar);

            if (errorMessage) {
                handleToast('Category Adding Failed', errorMessage, 'destructive');
            } else {
                handleToast('Category Added', 'Category added successfully.', 'default');
                form.reset();
                setProfileImagePreview(null);
                setImage(null);
                setOpen(false);
            }
        } catch (error: any) {
            handleToast('Category Adding Failed', error?.message || 'An unexpected error occurred', 'destructive');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Category
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
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
                        </div>

                        <div className="w-full flex justify-end mt-3">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Loading...' : 'Add Category'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default CategoryHeader;