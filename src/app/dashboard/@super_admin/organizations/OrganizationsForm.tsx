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
import { DatePicker } from "@/components/ui/date-picker";
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
  startDate: z.string().optional(),
  endDate: z.string().optional(),
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
  create_courses: boolean;
  ai_builder: boolean;
  document_builder: boolean;
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
      subscriptionPackage: undefined,
      allowCreateCourses: false,
      allowCreateAICourses: false,
      allowCreateCoursesFromDocuments: false,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
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
        .select("id, tier_name, max_user, max_courses, max_lms_managers, create_courses, ai_builder, document_builder");
      if (!error) {
        setTiers(subscription_tiers || []);
        // In edit mode, auto-fill features from the selected tier
        if (initialData?.subscriptionPackage && subscription_tiers) {
          const tier = subscription_tiers.find(
            (t: SubscriptionTier) => t.tier_name === initialData.subscriptionPackage
          );
          if (tier) {
            setSelectedPackage(tier.tier_name);
            form.setValue("allowCreateCourses", tier.create_courses);
            form.setValue("allowCreateAICourses", tier.ai_builder);
            form.setValue("allowCreateCoursesFromDocuments", tier.document_builder);
          }
        }
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
                <span className="text-destructive text-base">*</span>
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
                <span className="text-destructive text-base">*</span>
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
                <p role="alert" className="text-sm font-medium text-destructive">{logoError}</p>
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
                <span className="text-destructive text-base">*</span>
              </FormLabel>
              <Select
                defaultValue={field.value}
                onValueChange={(value) => {
                  setSelectedPackage(value);
                  field.onChange(value);
                  const tier = tiers.find((t) => t.tier_name === value);
                  if (tier) {
                    form.setValue("allowCreateCourses", tier.create_courses);
                    form.setValue("allowCreateAICourses", tier.ai_builder);
                    form.setValue("allowCreateCoursesFromDocuments", tier.document_builder);
                  }
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

        {selectedPackage && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      selectedDate={field.value ? new Date(field.value) : new Date()}
                      onDateChange={(date) => {
                        field.onChange(date?.toISOString());
                        // Auto-set end date to 1 year from start if not manually changed
                        if (date) {
                          const endDate = new Date(date);
                          endDate.setFullYear(endDate.getFullYear() + 1);
                          form.setValue("endDate", endDate.toISOString());
                        }
                      }}
                      placeholder="Start date"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      selectedDate={field.value ? new Date(field.value) : undefined}
                      onDateChange={(date) => field.onChange(date?.toISOString())}
                      placeholder="End date"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="grid gap-2">
          <p className="text-xs text-muted-foreground">
            Features are inherited from the subscription tier
          </p>
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
                    disabled
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
                    disabled
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
                    disabled
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
