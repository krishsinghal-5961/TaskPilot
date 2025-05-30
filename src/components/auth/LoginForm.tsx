
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { mockUsers } from "@/lib/mock-data"; // Import mockUsers for hints

const loginSchema = z.object({
  employeeId: z.string().min(1, "Employee ID cannot be empty."),
  // Password field removed for mock login
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      employeeId: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsSubmitting(true);
    const success = login(data.employeeId); // Pass employeeId to login
    if (!success) {
      toast({
        title: "Login Failed",
        description: "Invalid Employee ID. Please try again.",
        variant: "destructive",
      });
    }
    // On success, AuthContext handles redirection
    setIsSubmitting(false);
  }

  const isLoading = authLoading || isSubmitting;

  const managerExample = mockUsers.find(u => u.role === 'manager');
  const employeeExample = mockUsers.find(u => u.role === 'employee');

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Login to TaskPilot</CardTitle>
        <CardDescription>Enter your Employee ID to access your dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              type="text"
              placeholder="e.g., priya-mgr or rohan-dev"
              {...form.register("employeeId")}
              disabled={isLoading}
            />
            {form.formState.errors.employeeId && (
              <p className="text-sm text-destructive">{form.formState.errors.employeeId.message}</p>
            )}
          </div>
          {/* Password field removed */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Login"
            )}
          </Button>
        </form>
        <p className="mt-4 text-xs text-center text-muted-foreground">
          Hint: Try 
          {managerExample ? ` '${managerExample.uid}' (${managerExample.name} - manager)` : " a manager ID"} or 
          {employeeExample ? ` '${employeeExample.uid}' (${employeeExample.name} - employee)` : " an employee ID"}.
        </p>
      </CardContent>
    </Card>
  );
}
