import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Subscription } from './columns';

const subscriptionSchema = z.object({
  package: z.string().min(1, 'Package name is required'),
  totalAllowedUsers: z
    .number()
    .min(1, 'Total allowed users must be at least 1'),
  totalAllowedCourses: z
    .number()
    .min(1, 'Total allowed courses must be at least 1'),
  totalAllowedContentCreators: z
    .number()
    .min(1, 'Total allowed content creators must be at least 1'),
  allowCreateCourses: z.boolean().default(true),
  allowCreateAICourses: z.boolean().default(false),
  allowCreateCoursesFromDocuments: z.boolean().default(false),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

interface SubscriptionFormProps {
  subscription?: Omit<Subscription, 'associatedOrganizations'>;
  onSubmit: (data: SubscriptionFormData) => void;
  mode: 'create' | 'edit';
}

export function SubscriptionForm({
  subscription,
  onSubmit,
  mode,
}: SubscriptionFormProps) {
  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      package: subscription?.package || '',
      totalAllowedUsers: subscription?.totalAllowedUsers || 0,
      totalAllowedCourses: subscription?.totalAllowedCourses || 0,
      totalAllowedContentCreators:
        subscription?.totalAllowedContentCreators || 0,
      allowCreateCourses: subscription?.allowCreateCourses ?? true,
      allowCreateAICourses: subscription?.allowCreateAICourses ?? false,
      allowCreateCoursesFromDocuments: subscription?.allowCreateCoursesFromDocuments ?? false,
    },
  });

  function handleSubmit(data: SubscriptionFormData) {
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="package"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Package Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter package name" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="totalAllowedUsers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Allowed Users</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter total allowed users"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="totalAllowedCourses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Allowed Courses</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter total allowed courses"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="totalAllowedContentCreators"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Allowed Content Creators</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter total allowed content creators"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />
        <div className="space-y-3">
          <p className="text-sm font-medium">Tier Features</p>
          <FormField
            control={form.control}
            name="allowCreateCourses"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <FormLabel className="text-sm">Allow Create Courses</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="allowCreateAICourses"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <FormLabel className="text-sm">Allow AI Course Builder</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="allowCreateCoursesFromDocuments"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <FormLabel className="text-sm">Allow Document Course Builder</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">
          {mode === 'create' ? 'Create Subscription' : 'Update Subscription'}
        </Button>
      </form>
    </Form>
  );
}
