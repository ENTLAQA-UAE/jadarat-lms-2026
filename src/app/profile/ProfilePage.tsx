"use client"
import React, { useMemo, useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FormControl, Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAppSelector } from "@/hooks/redux.hook"
import { Camera, Loader2 } from 'lucide-react'
import { createAdminClient, createClient } from "@/utils/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { uploadImage } from "@/utils/uploadFile"
import { useDispatch } from "react-redux"
import { setUser } from "@/redux/user.slice"
import { Progress } from "@/components/ui/progress"
import { MFASetup } from "@/components/auth/MFASetup"




const calculatePasswordStrength = (password: string) => {
  let strength = 0;
  if (password.length > 7) strength += 25;
  if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
  if (password.match(/\d/)) strength += 25;
  if (password.match(/[^a-zA-Z\d]/)) strength += 25;
  return strength;
};


const formSchema = z.object({

  image: z.any().optional(),
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
  confirmPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});




export default function ProfilePage() {
  const { user } = useAppSelector(state => state.user);

  const dispatch = useDispatch();
  const { toast } = useToast();
  const [passwordStrength, setPasswordStrength] = useState(0);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: "",
      password: "",
      confirmPassword: "",
    },
  })
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [image, setImage] = useState<File | null>(null)

  // const meterValue = 75



  const handleUploadClick = () => {
    setIsUploadOpen(true)
  }
  const handlePasswordClick = () => {
    setIsPasswordOpen(true)
  }


  const handleImage = async () => {
    if (!image || !user || !user.id) return;

    const name = `userImage.${image.name.split(".").pop()}`;
    try {
      setIsLoading(true)
      const uploadedImageUrl = await uploadImage(`user_${user.id}_${Date.now()}`, image, user.organization_id, toast);
      if (uploadedImageUrl && uploadedImageUrl.signedUrl) {
        await updateUserAvatar(user.id, uploadedImageUrl.signedUrl);

        // Fetch the updated user data
        const updatedUserData = await fetchUserData(user.id);
        if (updatedUserData) {
          // Dispatch the updated user data
          dispatch(setUser({ ...updatedUserData, avatar_url: uploadedImageUrl.signedUrl }));
          setIsLoading(false)
          toast({
            title: "Success",
            description: "Profile picture updated successfully.",
            variant: "success",
          });
          setIsUploadOpen(false);
        }
      }
    } catch (error) {
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to update profile picture.",
        variant: "destructive",
      });
    }
  };

  // Function to fetch user data from the server
  const fetchUserData = async (userId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Failed to fetch user data:", error.message);
      return null;
    }

    return data;
  };

  const updateUserAvatar = async (userId: string, avatarUrl: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId);

    if (error) throw error;
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { password } = values
    const supabase = createAdminClient()
    if (user) {
      const { error } = await supabase.auth.admin.updateUserById(
        user.id as string,
        { password }
      )
      if (!error) {
        setIsPasswordOpen(false)
        form.reset()
        setPasswordStrength(0)
        toast({
          title: "Password Updated",
          description: "Your password has been successfully updated.",
          variant: "success"
        })
      } else {
        toast({
          title: "Error",
          description: error.message || "An error occurred while updating the password.",
          variant: "destructive"

        });
      }
    }

  }


  return (
    <div className="grid min-h-screen w-full grid-cols-1 gap-6 bg-muted/40 p-4 sm:p-8 lg:p-12">
      <div className="grid gap-6 sm:grid-cols-[1fr_2fr] lg:grid-cols-[1fr_3fr]">
        <div className="flex flex-col items-center gap-6 rounded-lg bg-background p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="relative">
            <Avatar className="h-24 w-24 rounded-full">
              <AvatarImage src={`${user.avatar_url}`} />
              <AvatarFallback className="exclude-weglot">{user.name?.split(' ')[0].slice(0, 1)}{user.name?.split(' ')?.[1] ? user.name?.split(' ')?.[1].slice(0, 1) : ''}</AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2"
              onClick={handleUploadClick}
            >
              <Camera className="h-4 w-4" />
              <span className="sr-only">Change Profile Picture</span>
            </Button>
          </div>
          <div className="grid w-full gap-2  text-center">
            <div className="text-lg font-medium">{!user.name ? <Skeleton className=" mx-auto  w-[80%] h-[23px]" /> : user.email}</div>
            <div className="text-sm text-muted-foreground exclude-weglot">{!user.name ? <Skeleton className="w-[80%] mx-auto h-[14px]" /> : user.name}</div>
            <Button variant="default" size="sm" className="dark" onClick={handlePasswordClick}>
              Change Password
            </Button>
          </div>

        </div>
        <div className="flex flex-col gap-6 rounded-lg bg-background p-6 shadow-sm sm:p-8 lg:p-10 ">
          <div className="grid gap-2">
            <div className="text-sm font-medium text-muted-foreground">Full Name</div>
            <div className="text-lg font-medium exclude-weglot">{!user.name ? <Skeleton className="w-[200px] h-[23px]" /> : user.name}</div>
          </div>
          <div className="grid gap-2">
            <div className="text-sm font-medium text-muted-foreground">Department</div>
            <div className="text-lg font-medium exclude-weglot">{!user.name ? <Skeleton className="w-[100px] h-[20px]" /> : user.department}</div>
          </div>
          <div className="grid gap-2">
            <div className="text-sm font-medium text-muted-foreground">Group</div>
            <div className="text-lg font-medium exclude-weglot">{!user.name ? <Skeleton className="w-[100px] h-[20px]" /> : user.group_name}</div>
          </div>
          <div className="grid gap-2">
            <div className="text-sm font-medium text-muted-foreground">Country</div>
            <div className="text-lg font-medium ">{!user.name ? <Skeleton className="w-[80px] h-[20px]" /> : user.country}</div>
          </div>
        </div>
      </div>
      {/* <div className="flex flex-col gap-6 rounded-lg bg-background p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="grid gap-2">
          <h3 className="text-xl font-semibold tracking-tight">Security Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage your account security and authentication methods
          </p>
        </div>
        <div className="grid gap-4">
          <MFASetup />
        </div>
      </div> */}
      {isUploadOpen && (
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Profile Picture</DialogTitle>
              <DialogDescription>Choose a new profile picture or upload one from your device.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input id="picture" type="file" accept="image/*" onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setImage(e.target.files[0]);
                }
              }} />
            </div>
            <DialogFooter>
              <Button disabled={isLoading} onClick={handleImage}>{isLoading ? <Loader2 size={20} className="animate-spin" /> : "Update Picture"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {isPasswordOpen && (
        <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle >Change Password</DialogTitle>
              <DialogDescription className="text-start">Enter a new password and confirm it.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Password" {...field} onChange={(e) => {
                          field.onChange(e);
                          setPasswordStrength(
                            calculatePasswordStrength(e.target.value)
                          );
                        }} />
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

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="confirm Password" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Submit</Button>
              </form>
            </Form>
            <DialogFooter>
              {/* <Button type="button"  onClick={handlePasswordSubmit}>
                Change Password
              </Button> */}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function CameraIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}
