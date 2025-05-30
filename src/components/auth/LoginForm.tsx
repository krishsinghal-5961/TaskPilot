
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

const loginSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required."),
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
    const success = await login(data.employeeId);
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
              placeholder="e.g., user-1"
              {...form.register("employeeId")}
              disabled={isLoading}
            />
            {form.formState.errors.employeeId && (
              <p className="text-sm text-destructive">{form.formState.errors.employeeId.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Login"
            )}
          </Button>
        </form>
        <p className="mt-4 text-xs text-center text-muted-foreground">
          Hint: Try 'user-1' (manager), 'user-2', 'user-3', or 'user-4' (employees).
        </p>
      </CardContent>
    </Card>
  );
}
