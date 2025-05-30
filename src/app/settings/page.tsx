
"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Cog } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const editNameSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  // Add other editable fields here if needed, e.g., designation
});
type EditNameFormValues = z.infer<typeof editNameSchema>;

export default function SettingsPage() {
  const { currentUser, isLoading, updateCurrentUserDetails } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const editNameForm = useForm<EditNameFormValues>({
    resolver: zodResolver(editNameSchema),
    defaultValues: {
      name: currentUser?.name || "",
    },
  });

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, isLoading, router]);

  useEffect(() => {
    if (currentUser) {
      editNameForm.reset({ name: currentUser.name });
    }
  }, [currentUser, editNameForm]);


  if (isLoading || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  async function onEditNameSubmit(data: EditNameFormValues) {
    if (!currentUser) return;
    const success = await updateCurrentUserDetails({ name: data.name });
    if (success) {
      toast({ title: "Name Updated", description: "Your name has been successfully updated." });
      setIsEditDialogOpen(false);
    } else {
      toast({ title: "Update Failed", description: "Could not update your name.", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your application preferences and account settings."
      />
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cog className="h-6 w-6 text-primary" />
            Application Settings
          </CardTitle>
          <CardDescription>
            Customize your TaskPilot experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Account Information</h3>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Edit Name</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Your Name</DialogTitle>
                      <DialogDescription>Make changes to your displayed name.</DialogDescription>
                    </DialogHeader>
                    <Form {...editNameForm}>
                      <form onSubmit={editNameForm.handleSubmit(onEditNameSubmit)} className="space-y-4 py-2">
                        <FormField
                          control={editNameForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                          <Button type="submit" disabled={editNameForm.formState.isSubmitting}>
                            {editNameForm.formState.isSubmitting && <Loader2 className="animate-spin mr-2 h-4 w-4"/>}
                            Save Changes</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-muted-foreground">User ID: {currentUser.uid}</p>
              <p className="text-muted-foreground">Name: {currentUser.name}</p>
              <p className="text-muted-foreground">Email: {currentUser.email}</p>
              <p className="text-muted-foreground">Role: {currentUser.role}</p>
              {currentUser.designation && <p className="text-muted-foreground">Designation: {currentUser.designation}</p>}
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Theme Preferences</h3>
              <div className="flex items-center justify-between mt-2">
                <Label htmlFor="theme-switch" className="cursor-pointer">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </Label>
                <Switch
                  id="theme-switch"
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Toggle to switch between light and dark themes for the application.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Notification Settings</h3>
              <p className="text-muted-foreground">Manage how you receive notifications. (Using mock notifications)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
