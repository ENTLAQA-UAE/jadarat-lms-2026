/* eslint-disable react/no-unescaped-entities */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/hooks/redux.hook';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/loading-spinner/loading-spinner';
import { getToken } from '@/utils/authToken';
import { getOrganizationDetails } from '@/action/organization/organizationAction';
import { setOrganizationSettings } from '@/redux/organization.slice';
import { useDispatch } from 'react-redux';
import { fulldomain } from '@/utils/getFullDomain';
import { setUser } from '@/redux/user.slice';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language.context';
import ExpiredTokenForm from '@/components/shared/ExpiredTokenForm';

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' })
      .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),
    repeatPassword: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: 'Passwords must match',
    path: ['repeatPassword'],
  });

// Create a custom hook for password strength
function usePasswordStrength(password: string) {
  return useMemo(() => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/) || password.match(/[^a-zA-Z0-9]/)) strength += 25;
    return strength;
  }, [password]);
}

export default function WelcomePage() {
  const dispatch = useDispatch();
  const { isRTL } = useLanguage()

  const {
    settings: { authBackground, logo, primaryColor },
    loading: LoadingTheme,
  } = useAppSelector((state) => state.organization);
  const { push, refresh } = useRouter();
  const [shouldStop, setShouldStop] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  // const [refreshToken, setRefreshToken] = useState<string | null>(null)
  // const [accessToken, setAccessToken] = useState<string | null>(null)

  const hashedTokens = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.location.href.split('#')?.[1];
    }
    return '';
  }, []);



  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      repeatPassword: '',
    },
  });



  // useEffect(() => {
  //   if (typeof window !== 'undefined' && hashedTokens) {
  //     const refreshToken = hashedTokens.substring(
  //       hashedTokens.indexOf('refresh_token=') + 14,
  //       hashedTokens.lastIndexOf('&token_type')
  //     );
  //     const accessToken = hashedTokens.substring(
  //       hashedTokens.indexOf('access_token=') + 13,
  //       hashedTokens.lastIndexOf('&expires_at')
  //     );

  //   }
  // }, [hashedTokens]);



  const checkResponse = useCallback(
    (time: number) => {
      const date = new Date().getTime();

      if (date - time > 5000) {
        push('/');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        if (!shouldStop)
          setTimeout(() => {
            checkResponse(time);
          }, 1000);
      }
    },
    [push, shouldStop]
  );

  const onUpdatePassword = useCallback(
    async ({ password }: { password: string }) => {
      if (hashedTokens) {
        const { accessToken, refreshToken } = getToken(hashedTokens);
        const auth = async () => {
          if (accessToken) {
            const supabase = createClient();
            await supabase.auth.setSession({
              refresh_token: refreshToken,
              access_token: accessToken,
            });
          } else {
            setError(true);
          }
        };
        await auth()
        push('/dashboard')

      }

      setLoading(true);
      const supabase = createClient();

      const startedAt = new Date().getTime();

      checkResponse(startedAt);

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      const { data: { user } } = await supabase.auth.getUser()
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single()

      const organizationDetails = await getOrganizationDetails(fulldomain! ?? null)
      dispatch(setOrganizationSettings({
        authBackground: organizationDetails.auth_bg ?? '/side.png',
        logo: organizationDetails.logo ?? '/logo.png',
        primaryColor: organizationDetails.primary_color ?? '#706efa',
        secondaryColor: organizationDetails.secondary_color,
        organization_id: organizationDetails.organization_id,
        registerationEnabled: organizationDetails.registeration_enabled,
        registerationRequireApproval: organizationDetails.registeration_require_approval,
        registerationRequireSpecificDomain: organizationDetails.registeration_require_specific_domain,
        registerationDomain: organizationDetails.registeration_domain,
        courseExpirationEnabled: organizationDetails.course_expiration_enabled,
        courseExpirationPeriod: organizationDetails.course_expiration_period,
        courseSelfEntrollmentPolicy: organizationDetails.course_self_entrollment_policy,
        name: organizationDetails.name,
        certificate: {
          certificateTemplate: organizationDetails.certificate_template,
          certificateLogo: organizationDetails.certificate_logo,
          certificateAuthTitle: organizationDetails.certificate_auth_title,
          certificateSign: organizationDetails.certificate_sign,
          certificateBGColor: organizationDetails.certificate_bg_color,
          certificatePreview: organizationDetails.certificate_preview,
        },
        lang: organizationDetails.lang,
      }))
      dispatch(setUser(userData))

      setShouldStop(true);

      if (error != null) toast.error(error.message);
      setLoading(false);
    },
    [checkResponse, dispatch, hashedTokens, push]
  );



  // Get form values in a type-safe way
  const password = form.watch('password');
  const repeatPassword = form.watch('repeatPassword');

  // Use the custom hook
  const strength = usePasswordStrength(password);
  const passwordsMatch = password === repeatPassword;
  const isValidPassword = strength === 100 && passwordsMatch;

  if (hashedTokens && hashedTokens.startsWith('error=')) {
    return <div className="h-[100dvh]">
      <ExpiredTokenForm />
    </div>;
  }
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md w-full space-y-6">
        <div className="flex items-center justify-center">
          <Image
            src={logo}
            alt="Image"
            width="500"
            height="500"
            className="w-1/2 object-cover self-end mb-2 mx-auto"
            key={Math.random()}
          />
          <span className="sr-only">Acme Inc</span>
        </div>
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome to Jadarat
          </h1>
          <p className="text-muted-foreground">
            We're excited to have you join our platform. Get started by creating
            your account.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onUpdatePassword)}
            className="space-y-8"
          >
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                        />
                      </FormControl>
                      <div className="absolute right-0 top-0 h-full flex items-center gap-3 pr-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Progress value={strength} className="h-2" />
                      <div className="text-sm text-muted-foreground">
                        Password strength:{" "}
                        <span
                          className={cn(
                            strength === 100
                              ? "text-success"
                              : strength > 50
                                ? "text-warning"
                                : "text-destructive"
                          )}
                        >
                          {strength === 100
                            ? isRTL ? "قوي" : "Strong"
                            : strength > 50
                              ? isRTL ? "متوسط" : "Medium"
                              : isRTL ? "ضعيف" : "Weak"}
                        </span>
                      </div>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="repeatPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repeat password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showRepeatPassword ? "text" : "password"}
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                      >
                        {showRepeatPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? (
                <LoadingSpinner color={primaryColor} />
              ) : (
                'Set up Account'
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
