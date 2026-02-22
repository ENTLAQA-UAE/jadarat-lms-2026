/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect, useState } from 'react';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppSelector } from '@/hooks/redux.hook';
import Image from 'next/image';
import SentEmail from './SentEmail';
import { fulldomain } from '@/utils/getFullDomain';
import LoadingSpinner from '@/components/loading-spinner/loading-spinner';
import { createAdminClient } from '@/utils/supabase';
import { createClient } from '@/utils/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { countries } from '@/lib/controllers/countries';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { uploadImage } from '@/utils/uploadFile';
import { LanguageSwitcher } from '@/components/languageSwithcer';

const calculatePasswordStrength = (password: string) => {
  let strength = 0;
  if (password.length > 7) strength += 25;
  if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
  if (password.match(/\d/)) strength += 25;
  if (password.match(/[^a-zA-Z\d]/)) strength += 25;
  return strength;
};

export default function RegisterForm() {
  const { toast } = useToast();
  const {
    settings: { logo, registerationDomain },
  } = useAppSelector((state) => state.organization);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  );
  const [groups, setGroups] = useState<{ id: any; name: any }[]>([]);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [organizationId, setOrganizationId] = useState<Number | null>(null);
  const [organizationSettings, setOrganizationSettings] = useState<{
    require_approval: boolean | null;
    require_specific_domain: boolean | null;
  }>({ require_approval: null, require_specific_domain: null });
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  type FormValues = z.infer<ReturnType<typeof createFormSchema>>;
  const form = useForm<FormValues>({
    resolver: zodResolver(
      createFormSchema(
        organizationSettings.require_specific_domain || false,
        `${fulldomain?.split('.').at(0)}.com` || ''
      )
    ),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      repeatPassword: '',
      fullName: '',
      jobTitle: '',
      grade: '',
      city: '',
      country: '',
      department: '',
      groups: '',
    },
  });
  function createFormSchema(
    requireSpecificDomain: boolean,
    allowedDomain: string
  ) {
    const formSchema = z
      .object({
        email: z
          .string()
          .email({ message: 'Invalid email address' })
          .refine(
            (email) => {
              if (requireSpecificDomain) {
                const domain = email.split('@')[1];
                return domain === registerationDomain;
              }
              return true; // Allow any email if specific domain is not required
            },
            {
              message: `Email must be a business email address (e.g., @${registerationDomain})`,
            }
          ),
        password: z
          .string()
          .min(8, { message: 'Password must be at least 8 characters long' })
          .refine(
            (password) => {
              const strength = calculatePasswordStrength(password);
              return strength >= 75;
            },
            { message: 'Password is not strong enough' }
          ),
        repeatPassword: z.string(),
        fullName: z
          .string()
          .min(2, { message: 'Full name is required' })
          .refine((name) => name.trim().split(' ').length >= 2, {
            message: 'Please enter your full name',
          }),
        jobTitle: z.string().min(1, { message: 'Job title is required' }),
        grade: z.string().min(1, { message: 'Grade is required' }),
        city: z.string(),
        country: z.string(),
        department: z.string(),
        groups: z.string(),
        image: z.any().optional().nullable(),
      })
      .refine((data) => data.password === data.repeatPassword, {
        message: "Passwords don't match",
        path: ['repeatPassword'],
      });

    return formSchema;
  }

  useEffect(() => {
    const getGroups = async () => {
      const supabase = createClient();

      let { data: orgId, error: idError } = await supabase.rpc(
        'get_organization_id',
        {
          domain_input: fulldomain,
        }
      );
      setOrganizationId(orgId);
      if (idError || !orgId) {
        console.error(
          'Organization not found or there was an error retrieving the ID:',
          idError
        );
        setGroups([]);
        return;
      }

      let { data: groups, error: groupError } = await supabase
        .from('groups')
        .select('id,name')
        .eq('organization_id', orgId);

      if (groupError) {
        console.error('Error fetching groups:', groupError);
        setGroups([]);
      } else {
        setGroups(groups || []);
      }
    };

    getGroups();
  }, []);

  useEffect(() => {
    async function authorizationCheck() {
      setIsLoading(true);
      const supabase = createClient();
      let { data: org_settings, error } = await supabase.rpc(
        'get_organization_settings',
        {
          domain_input: fulldomain,
        }
      );
      setOrganizationSettings({
        require_approval: org_settings?.registeration_require_approval,
        require_specific_domain:
          org_settings?.registeration_require_specific_domain,
      });
      if (
        fulldomain !== process.env.NEXT_PUBLIC_MAIN_DOMIAN &&
        fulldomain !== process.env.NEXT_PUBLIC_MAIN_DOMIAN_DEV &&
        org_settings?.registeration_enabled
      ) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
      setIsLoading(false);
    }
    authorizationCheck();
  }, []);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImagePreview(null);
    setImage(null); // Reset the image in the form
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const adminSupabase = createAdminClient();
      let uploadResult: any;
      // Ensure image is uploaded only once
      if (!imageUrl && image) {
        const name = `userImage_${Date.now()}.${image.name.split('.').pop()}`;
        uploadResult = await uploadImage(
          name,
          image,
          Number(organizationId),
          toast
        );
        if (uploadResult?.signedUrl) {
          setImageUrl(uploadResult.signedUrl);
        } else {
          throw new Error('Image upload failed');
        }
      }

      // // 1. Sign up the user
      let { data: newUser, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window?.location?.protocol}//${fulldomain}/email-confirmed`,
        },
      });
      if (signUpError) {
        console.log(signUpError);
        return;
      }

      const userId = newUser?.user?.id;

      if (!userId) {
        throw new Error('User ID is undefined after sign-up');
      }

      // 2. Insert data into the 'users' table using the service role client
      const { error: insertError } = await adminSupabase.from('users').insert([
        {
          id: userId,
          organization_id: organizationId,
          organization_domain: fulldomain,
          email: data.email,
          role: 'learner',
          is_active: !organizationSettings.require_approval ? true : false,
          name: data.fullName,
          group_id: data.groups,
          department: data.department,
          job_title: data.jobTitle,
          job_grade: data.grade,
          country: data.country,
          city: data.city,
          lang: 'en',
          avatar_url: image ? uploadResult.signedUrl : null, // Use the uploaded image URL here
        },
      ]);

      if (insertError) {
        console.log(insertError);
        // 3. If insertion fails, delete the user from auth
        await adminSupabase.auth.admin.deleteUser(userId);
        throw insertError;
      } else {
        console.log('User added successfully');
      }
    } catch (error) {
      console.error('Error during user registration:', error);
    } finally {
      setIsLoading(false);
      setIsRegistered(true);
    }
  };

  const isStep1Valid =
    form.getValues('email') !== '' &&
    form.getValues('password') !== '' &&
    form.getValues('repeatPassword') !== '' &&
    form.getValues('fullName') !== '' &&
    form.getValues('country') !== '' &&
    form.getValues('city') !== '' &&
    form.formState.errors.email === undefined &&
    form.formState.errors.password === undefined &&
    form.formState.errors.repeatPassword === undefined &&
    form.formState.errors.fullName === undefined &&
    form.formState.errors.country === undefined &&
    form.formState.errors.city === undefined;

  const isFormValid =
    isStep1Valid &&
    form.getValues('department') !== '' &&
    form.getValues('jobTitle') !== '' &&
    form.getValues('grade') !== '' &&
    form.getValues('groups') !== '' &&
    form.formState.errors.department === undefined &&
    form.formState.errors.jobTitle === undefined &&
    form.formState.errors.grade === undefined &&
    form.formState.errors.groups === undefined;

  const handleFieldTouch = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  if (authorized === null || isLoading) {
    return <div>Loading...</div>;
  }

  if (!authorized) {
    return <div>Unauthorized</div>;
  }

  if (isRegistered) {
    return <SentEmail email={form.getValues('email')} />;
  }

  return (
    <div className="min-h-screen bg-card flex flex-col items-center justify-center p-4">
      <LanguageSwitcher className="absolute top-10 left-10 rtl:right-10 rtl:left-0" />
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Image src={logo} width={200} height={200} alt="Logo" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Create your account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {step === 1 && (
                  <>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="example@example.com"
                              {...field}
                              onBlur={() => handleFieldTouch('email')}
                            />
                          </FormControl>
                          {touchedFields.email && <FormMessage />}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Type your Password"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setPasswordStrength(
                                    calculatePasswordStrength(e.target.value)
                                  );
                                }}
                                onBlur={() => handleFieldTouch('password')}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute ltr:right-0 rtl:left-0 top-0 h-full"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <Progress
                            value={passwordStrength}
                            className="h-2 w-full"
                          />
                          <div className="flex justify-between text-sm">
                            <span>Password strength:</span>
                            <span>
                              {passwordStrength === 100
                                ? 'Strong'
                                : passwordStrength >= 75
                                  ? 'Good'
                                  : passwordStrength >= 50
                                    ? 'Medium'
                                    : 'Weak'}
                            </span>
                          </div>
                          {touchedFields.password && <FormMessage />}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="repeatPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repeat Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="password"
                                placeholder="Repeat your Password"
                                {...field}
                                onBlur={() =>
                                  handleFieldTouch('repeatPassword')
                                }
                              />
                              {field.value &&
                                form.getFieldState('repeatPassword').invalid ===
                                false && (
                                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-success h-5 w-5" />
                                )}
                            </div>
                          </FormControl>
                          {touchedFields.repeatPassword && <FormMessage />}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Type your Full Name"
                                {...field}
                                onBlur={() => handleFieldTouch('fullName')}
                              />
                              {field.value &&
                                form.getFieldState('fullName').invalid ===
                                false && (
                                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-success h-5 w-5" />
                                )}
                            </div>
                          </FormControl>
                          {touchedFields.fullName && <FormMessage />}
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Select
                                {...field}
                                onValueChange={(value) =>
                                  field.onChange({ target: { value } })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Country" />
                                </SelectTrigger>
                                <SelectContent>
                                  {countries.map((item) => {
                                    return (
                                      <SelectItem
                                        value={item.name}
                                        key={item.code}
                                      >
                                        {item.name}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => setStep(2)}
                      disabled={!isStep1Valid}
                    >
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                )}
                {step === 2 && (
                  <>
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your job department"
                              {...field}
                              onBlur={() => handleFieldTouch('department')}
                            />
                          </FormControl>
                          {touchedFields.department && <FormMessage />}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your job title"
                              {...field}
                              onBlur={() => handleFieldTouch('jobTitle')}
                            />
                          </FormControl>
                          {touchedFields.jobTitle && <FormMessage />}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your grade"
                              {...field}
                              onBlur={() => handleFieldTouch('grade')}
                            />
                          </FormControl>
                          {touchedFields.grade && <FormMessage />}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="groups"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="group" className="font-semibold">
                            Organization Group
                          </Label>
                          <FormControl>
                            <Select
                              {...field}
                              onValueChange={(value) =>
                                field.onChange({ target: { value } })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Assigned Group" />
                              </SelectTrigger>
                              <SelectContent>
                                {groups.map((e) => {
                                  return (
                                    <SelectItem
                                      value={e.id.toString()}
                                      key={e.id}
                                    >
                                      {e.name}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          {touchedFields.groups && <FormMessage />}
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2">
                      <div className="flex flex-col items-center space-y-2">
                        <FormField
                          control={form.control}
                          name="image"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Profile Image (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  id="profileImage"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const file = e.target.files[0].name;
                                      field.onChange(file);
                                      handleProfileImageChange(e);
                                    }
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
                                      field.onChange(null); // Reset the image in the form
                                    }}
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
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isLoading || !isFormValid}
                      >
                        {isLoading ? (
                          <>
                            <span className="loading loading-spinner loading-sm mr-2"></span>
                            Registering...
                          </>
                        ) : (
                          'Register'
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}