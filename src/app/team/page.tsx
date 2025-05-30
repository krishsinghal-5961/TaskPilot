
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Loader2, Users, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockUsers } from "@/lib/mock-data"; 
import type { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
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

const addMemberSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  designation: z.string().min(2, {message: "Designation must be at least 2 characters."}),
});
type AddMemberFormValues = z.infer<typeof addMemberSchema>;

export default function TeamManagementPage() {
  const { currentUser, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); 

  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      designation: "",
    },
  });

  useEffect(() => {
    if (!authIsLoading) {
      if (!currentUser || currentUser.role !== "manager") {
        router.replace("/login");
      }
    }
  }, [currentUser, authIsLoading, router]);

  const handleAddMemberSubmit = async (data: AddMemberFormValues) => {
    setIsSubmitting(true);
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      designation: data.designation,
      avatarUrl: `https://placehold.co/100x100.png?text=${getInitials(data.name)}`,
      currentWorkload: 0,
      role: "employee",
    };

    await new Promise(resolve => setTimeout(resolve, 500));

    mockUsers.push(newUser); 

    toast({
      title: "Member Added",
      description: `${newUser.name} has been added to the team.`,
    });
    form.reset();
    setIsAddMemberDialogOpen(false);
    setIsSubmitting(false);
    setRefreshKey(prev => prev + 1); 
  };

  if (authIsLoading || !currentUser || currentUser.role !== "manager") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  const displayedTeamMembers = mockUsers.filter(user => user.role === 'employee');

  return (
    <div className="space-y-6" key={refreshKey}>
      <PageHeader
        title="Manage Team"
        description="View and manage your team members."
        actions={
          <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Add New Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Team Member</DialogTitle>
                <DialogDescription>
                  Enter the details for the new team member. They will be added with an 'employee' role.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddMemberSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Krish Singhal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="e.g., krish.singhal@gmail.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Software Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddMemberDialogOpen(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Add Member
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Current Team Members</CardTitle>
          <CardDescription>List of all employees in your team.</CardDescription>
        </CardHeader>
        <CardContent>
          {displayedTeamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedTeamMembers.map(member => (
                <Card key={member.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="team member avatar"/>
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      {member.designation && <p className="text-xs text-muted-foreground">{member.designation}</p>}
                      <p className="text-xs text-muted-foreground">Workload: {member.currentWorkload || 0}%</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No team members found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
