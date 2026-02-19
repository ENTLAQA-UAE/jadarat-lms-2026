"use client";
import React, { SetStateAction, Dispatch, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { OrganizationFormData } from "./type";
import { Upload } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  domain: z
    .string()
    .min(3, {
      message: "Domain must be at least 3 characters.",
    })
    .regex(
      /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      "Please enter a valid domain format (e.g., example.com)"
    ),
  logo: z.instanceof(File).optional(),
  subscriptionPackage: z.string({
    required_error: "You need to select a subscription package.",
  }),
  allowCreateCourses: z.boolean().default(false),
  allowCreateAICourses: z.boolean().default(false),
  allowCreateCoursesFromDocuments: z.boolean().default(false),
});

interface OrganizationFormProps {
  onSubmit: (data: OrganizationFormData) => void;
  initialData?: Partial<OrganizationFormData>;
  setCreateDialogOpen: Dispatch<SetStateAction<boolean>>;
  logoError: string | null;
}

interface SubscriptionTier {
  id: string;
  tier_name: string;
  max_user: number;
  max_courses: number;
  max_lms_managers: number;
}

export function OrganizationForm({
  onSubmit,
  initialData,
  setCreateDialogOpen,
  logoError,
}: OrganizationFormProps) {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.logo_url || null
  );
  const supabase = createClient();

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      domain: "",
      logo: undefined,
      subscriptionPackage: undefined, // Change to undefined
      allowCreateCourses: false,
      allowCreateAICourses: false,
      allowCreateCoursesFromDocuments: false,
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("logo", file);
    }
  };

  const openFullSizeLogo = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank");
    }
  };

  useEffect(() => {
    const getTiers = async () => {
      let { data: subscription_tiers, error } = await supabase
        .from("subscription_tiers")
        .select("*");
      if (!error) {
        setTiers(subscription_tiers || []); // Ensure setTiers handles null
      }
    };
    getTiers();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name
                <span className="text-red-500 text-base">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Organization name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Domain
                <span className="text-red-500 text-base">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {previewUrl && (
                    <div
                      className="w-24 h-24 border rounded-md overflow-hidden cursor-pointer"
                      onClick={openFullSizeLogo}
                    >
                      <Image
                        src={previewUrl}
                        alt="Logo Preview"
                        width={96}
                        height={96}
                        className="object-contain w-full h-full"
                      />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleLogoChange}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Upload a PNG or JPG file (max 3 MB)
              </FormDescription>
              {logoError && (
                <p className="text-sm font-medium text-red-500">{logoError}</p>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subscriptionPackage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Subscription Package
                <span className="text-red-500 text-base">*</span>
              </FormLabel>
              <Select
                defaultValue={field.value}
                onValueChange={(value) => {
                  setSelectedPackage(value);
                  field.onChange(value);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a package" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tiers.map((tier) => (
                    <SelectItem
                      className="exclude-weglot"
                      key={tier.id}
                      value={tier.tier_name}
                    >
                      {tier.tier_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Display selected tier details */}
        {selectedPackage && (
          <div className="">
            <p className="text-sm font-medium">Allowed Benefits:</p>
            <ul className="list-disc list-inside text-sm">
              {tiers
                .filter((tier) => tier.tier_name === selectedPackage)
                .map((tier) => (
                  <React.Fragment key={tier.id}>
                    <li>Total Users Allowed: {tier.max_user}</li>
                    <li>Total Courses Allowed: {tier.max_courses}</li>
                    <li>
                      Total Content Creators Allowed: {tier.max_lms_managers}
                    </li>
                  </React.Fragment>
                ))}
            </ul>
          </div>
        )}

        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="allowCreateCourses"
            render={({ field }) => (
              <FormItem className="flex items-center flex-row-reverse justify-end gap-2 ">
                <div className="flex">
                  <FormLabel className="mt-3 text-sm">
                    Allow Create Courses
                  </FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="allowCreateAICourses"
            render={({ field }) => (
              <FormItem className="flex items-center flex-row-reverse justify-end gap-2 ">
                <div className="flex">
                  <FormLabel className="mt-3 text-sm">
                    Allow Create AI Courses
                  </FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="allowCreateCoursesFromDocuments"
            render={({ field }) => (
              <FormItem className="flex items-center flex-row-reverse justify-end gap-2">
                <div className="mt-3 text-sm">
                  <FormLabel className="text-sm">
                    Allow Create Courses From Documents
                  </FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant={"outline"}
            onClick={() => setCreateDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </div>
      </form>
    </Form>
  );
}
