
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
//import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Shield, AlertTriangle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const passwordFormSchema = z.object({
  currentPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  newPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const twoFactorSchema = z.object({
  twoFactorAuth: z.boolean().default(false),
});


type PasswordFormValues = z.infer<typeof passwordFormSchema>;
type TwoFactorFormValues = z.infer<typeof twoFactorSchema>;

const SettingsSecurity = () => {
  //const { toast } = useToast();
  
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const twoFactorForm = useForm<TwoFactorFormValues>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      twoFactorAuth: false,
    },
  });
  const navigate=useNavigate();
  const user_id=localStorage.getItem("user_id");
// request to update-password
 async function onPasswordSubmit(data: PasswordFormValues){
    const actions="update_password"
    
    const arr={actions,user_id,data}
      try {
    const res = await axios.post("http://127.0.0.1:5000/reset-password", arr);
    if (res.status === 200) {
       toast.success(res.data?.message || "Your password has been updated successfully.");
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
       toast.error(res.data?.message || "Failed to update password.");
    }
  } catch (error: any) {
      toast.error(
    error?.response?.data?.message || "Failed to update password."
  );
  }
  }
  // request to delete 
  const onDelete=async() =>{
    try{
      const res=await axios.post("http://127.0.0.1:5000/delete",{user_id})
      if (res)
      {
        console.log("successfull")
      }
    }
    catch(error)
    {
      console.log("error:",error)
    }

  }

  function onTwoFactorSubmit(data: TwoFactorFormValues) {
    toast({
      title: data.twoFactorAuth ? "Two-factor authentication enabled" : "Two-factor authentication disabled",
      description: data.twoFactorAuth ? 
        "Your account is now more secure with two-factor authentication." : 
        "Two-factor authentication has been disabled for your account.",
    });
    
  }

  return (
    <div className="space-y-6">
      {/* <div>
        <h3 className="text-lg font-medium">Security</h3>
        <p className="text-sm text-muted-foreground">
          Update your password and manage security settings.
        </p>
      </div>
       */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter current password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Password must be at least 8 characters long.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Update Password</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>Two-Factor Authentication</span>
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...twoFactorForm}>
            <form onSubmit={twoFactorForm.handleSubmit(onTwoFactorSubmit)} className="space-y-4">
              <FormField
                control={twoFactorForm.control}
                name="twoFactorAuth"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Two-Factor Authentication</FormLabel>
                      <FormDescription>
                        Require a verification code when logging in to your account.
                      </FormDescription>
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
              
              {twoFactorForm.watch("twoFactorAuth") && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    If you enable two-factor authentication, you will need to enter a verification code each time you log in.
                    Make sure you have access to your authentication app or backup codes.
                  </AlertDescription>
                </Alert>
              )}
              
              <Button type="submit">
                {twoFactorForm.watch("twoFactorAuth") ? "Enable Two-Factor Authentication" : "Disable Two-Factor Authentication"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Last sign in: Yesterday at 15:32 from 192.168.1.1
        </CardFooter>
      </Card>
       */}
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            These actions are irreversible. Please proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-destructive p-4">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div  className="flex-1">
                <h4 className="font-medium">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data.
                </p>
              </div>
              <Button variant="destructive" className="w-full sm:w-auto min-w-[150px]"  onClick={()=>onDelete()}>Delete Account</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSecurity;
