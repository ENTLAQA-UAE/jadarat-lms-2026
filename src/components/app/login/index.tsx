"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase";
import { toast } from "sonner";
import LoadingSpinner from "@/components/loading-spinner/loading-spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { fulldomain } from "@/utils/getFullDomain";
import { useAppSelector } from "@/hooks/redux.hook";
import { LanguageSwitcher } from "@/components/languageSwithcer";
import { LoadingAnimation } from "@/components/loader";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/user.slice";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrganizationDetails } from "@/action/organization/organizationAction";
import { setOrganizationSettings } from "@/redux/organization.slice";

const scheme = z.object({
  email: z.string().email(),
  password: z.string(),
});


const LoginPage = () => {
  const dispatch = useDispatch();
  const { replace, refresh } = useRouter();
  const {
    settings: { logo, primaryColor },
    loading,
  } = useAppSelector((state) => state.organization);

  // Consolidating state into a single object
  const [state, setState] = useState({
    isLoading: false,
    registerationEnabled: false,
    isMounted: false,
  });

  const form = useForm<z.infer<typeof scheme>>({
    resolver: zodResolver(scheme),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Set mounted state
  useEffect(() => {
    setState((prev) => ({ ...prev, isMounted: true }));
  }, []);

  // Login logic
  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true }));

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {

        await supabase.rpc('update_last_login')
        const { data: { user } } = await supabase.auth.getUser()
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user?.id)
          .single()
        console.log(user)
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
        replace('/dashboard')
      } else {
        form.setError("root", { message: error.message });
      }

      setState((prev) => ({ ...prev, isLoading: true }));
    },
    [dispatch, form, replace]
  );

  // Validate subdomain and login
  const validateUserBasedOnSubDomain = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      setState((prev) => ({ ...prev, isLoading: true }));

      if (
        [
          process.env.NEXT_PUBLIC_MAIN_DOMIAN,
          process.env.NEXT_PUBLIC_MAIN_DOMIAN_DEV,
        ].includes(fulldomain as string)
      ) {
        handleLogin(email, password);
        refresh();
      } else {
        const supabase = createClient();
        const { data, error } = await supabase.rpc(
          "check_if_user_exists_under_organization",
          {
            domain: fulldomain,
            user_email: email,
          }
        );

        if (error != null) {
          toast.error(error.message);
        } else {
          if (data) {
            handleLogin(email, password);
          } else {
            form.setError("root", { message: "Invalid login credentials" });
            setState((prev) => ({ ...prev, isLoading: false }));
          }
        }
      }
    },
    [handleLogin, refresh, form]
  );

  // // Fetch registration settings
  useEffect(() => {
    async function authorizationCheck() {
      setState((prev) => ({ ...prev, isLoading: true }));
      const supabase = createClient();
      let { data: org_settings } = await supabase.rpc(
        "get_organization_settings_for_user",
        {
          domain_name: fulldomain ?? null,
        }
      );
      setState((prev) => ({
        ...prev,
        registerationEnabled: org_settings?.registeration_enabled,
        isLoading: false,
      }));
    }
    authorizationCheck();
  }, []);

  // Memoize components to prevent unnecessary renders
  const LoginForm = useMemo(() => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(validateUserBasedOnSubDomain)} className="grid gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="m@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link href="/reset-password" className="inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <FormControl>
                <Input placeholder="" required {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {form.formState.errors.root && (
            <p className="text-[0.8rem] font-medium text-destructive text-center">
              {form.formState.errors.root?.message ?? ""}
            </p>
          )}
          <Button type="submit" className="w-full mt-4">
            {state.isLoading ? <LoadingSpinner color={primaryColor} /> : "Login"}
          </Button>
        </div>
      </form>
    </Form>
  ), [form, validateUserBasedOnSubDomain, state.isLoading, primaryColor]);

  const RegistrationLink = useMemo(() => (
    state.registerationEnabled && !loading && (
      <div className="mt-4 text-center text-sm">
        Not have an account?{" "}
        <Link
          href={`${window?.location?.protocol}//${fulldomain}/register`}
          className="underline"
        >
          Sign up your account
        </Link>
      </div>
    )
  ), [state.registerationEnabled, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100dvh-64px)] w-full">
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <>
      {state.isMounted && (
        <div className="flex items-center justify-center py-12">
          <LanguageSwitcher className="absolute top-10 left-10 rtl:right-10 rtl:left-0" />
          <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
              {loading ? (
                <Skeleton className="w-1/2 h-40 mb-20 mx-auto" />
              ) : (
                <Image
                  src={logo}
                  alt="Image"
                  width="500"
                  height="500"
                  className="w-1/2 object-cover self-end mb-20 mx-auto"
                />
              )}
              <h1 className="text-3xl font-bold text-center">Welcome back</h1>
              <p className="text-muted-foreground px-0">
                Enter your email below to login to your account
              </p>
            </div>
            {LoginForm}
            {[
              process.env.NEXT_PUBLIC_MAIN_DOMIAN,
              process.env.NEXT_PUBLIC_MAIN_DOMIAN_DEV,
            ].includes(fulldomain as string) && (
                <div className="mt-4 text-center text-sm">
                  Not a member?{" "}
                  <Link
                    href={`${process.env.NEXT_PUBLIC_DOMIAN_MARKETING}`}
                    className="underline"
                  >
                    Sign up your organization
                  </Link>
                </div>
              )}
            {RegistrationLink}
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPage;
