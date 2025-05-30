
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wand2, Users, CalendarCheck, BarChart3, Info } from "lucide-react";
import { suggestDueDate, type SuggestDueDateInput, type SuggestDueDateOutput } from "@/ai/flows/suggest-due-date";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/types";
import { format, parseISO } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers } from "@/lib/mock-data"; // Using mock data


const assistedAssignmentSchema = z.object({
  taskDescription: z.string().min(10, { message: "Description must be at least 10 characters." }),
  priority: z.enum(["low", "medium", "high"]),
});

type AssistedAssignmentFormValues = z.infer<typeof assistedAssignmentSchema>;

export function AssistedAssignmentClientPage() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [aiResult, setAiResult] = useState<SuggestDueDateOutput | null>(null);
  const [teamMembersData, setTeamMembersData] = useState<UserProfile[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(true);


  useEffect(() => {
    if (currentUser) {
      // Simulate fetching team members
      setTeamMembersData(mockUsers.filter(user => user.role === 'employee'));
      setTeamMembersLoading(false);
    }
  }, [currentUser]);

  const form = useForm<AssistedAssignmentFormValues>({
    resolver: zodResolver(assistedAssignmentSchema),
    defaultValues: {
      taskDescription: "",
      priority: "medium",
    },
  });

  async function onSubmit(data: AssistedAssignmentFormValues) {
    setIsAISuggesting(true);
    setAiResult(null);
    try {
      const currentDate = new Date().toISOString().split('T')[0]; 
      
      if (!teamMembersData || teamMembersData.length === 0) {
        toast({
          title: "No Team Members",
          description: "Could not find any employees to assign tasks to. Please add employees in the Team Management section.",
          variant: "destructive",
        });
        setIsAISuggesting(false);
        return;
      }
      
      const employeesForAI = teamMembersData
        .map(user => ({
          name: user.name,
          currentWorkload: user.currentWorkload || 0,
        }));

      if (employeesForAI.length === 0) {
        toast({
          title: "No Employees Found",
          description: "No users with the 'employee' role found for AI suggestion.",
          variant: "destructive",
        });
        setIsAISuggesting(false);
        return;
      }
      
      const inputForAI: SuggestDueDateInput = {
        ...data,
        teamMembers: employeesForAI,
        currentDate,
      };

      const result = await suggestDueDate(inputForAI);
      setAiResult(result);
      toast({
        title: "Suggestion Received",
        description: "AI has suggested a due date and assignee(s).",
      });
    } catch (error) {
      console.error("Error calling AI flow:", error);
      let errorMessage = "Failed to get suggestion from AI. Please try again. Ensure GOOGLE_API_KEY is set if using Google AI.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAISuggesting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Task Details for AI Suggestion</CardTitle>
          <CardDescription>Provide task information. The AI will use current employee data for workload analysis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="taskDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the task to be assigned..." {...field} rows={4} disabled={isAISuggesting || teamMembersLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isAISuggesting || teamMembersLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select task priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Team Data {teamMembersLoading && <Loader2 className="inline h-4 w-4 animate-spin ml-2" />}</AlertTitle>
                <AlertDescription>
                  The AI will automatically consider all current employees and their workloads.
                  {teamMembersLoading && " Loading team data..."}
                </AlertDescription>
              </Alert>
              
              <Button type="submit" disabled={isAISuggesting || teamMembersLoading} className="w-full">
                {isAISuggesting || teamMembersLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                {teamMembersLoading ? "Loading Team..." : isAISuggesting ? "Getting Suggestion..." : "Get AI Suggestion"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>AI Suggestion</CardTitle>
          <CardDescription>The AI's recommendations for due date, assignee(s), and workload will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          {isAISuggesting && (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Generating suggestion...</p>
            </div>
          )}
          {!isAISuggesting && !aiResult && (
            <p className="text-muted-foreground text-center py-10">Submit the form to get an AI suggestion.</p>
          )}
          {aiResult && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg text-primary flex items-center"><CalendarCheck className="mr-2 h-5 w-5" />Suggested Due Date:</h3>
                <p className="text-xl ml-7">{format(parseISO(aiResult.suggestedDueDate), "PPP")} ({aiResult.suggestedDueDate})</p>
                <h4 className="font-medium mt-1 ml-7">Reasoning:</h4>
                <p className="text-sm text-muted-foreground ml-7 whitespace-pre-wrap">{aiResult.reasoningForDueDate}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg text-primary flex items-center"><Users className="mr-2 h-5 w-5" />Suggested Assignee(s):</h3>
                {aiResult.suggestedAssignees.length > 0 ? (
                  aiResult.suggestedAssignees.map((assignee, index) => (
                    <div key={index} className="ml-7 mt-2 p-3 bg-secondary/30 rounded-md">
                      <p className="text-lg font-medium">{assignee.name}</p>
                      <h4 className="font-medium mt-1">Reasoning for Assignment:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{assignee.reasoningForAssignment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground ml-7">AI did not suggest specific assignees.</p>
                )}
              </div>
              
              <Separator />

              <div>
                <h3 className="font-semibold text-lg text-primary flex items-center"><BarChart3 className="mr-2 h-5 w-5" />Projected Workload After Assignment:</h3>
                <ul className="list-disc list-inside text-muted-foreground ml-7 mt-2 space-y-1">
                  {aiResult.projectedWorkloadAfterAssignment.map(member => (
                    <li key={member.name}>{member.name}: {member.projectedWorkload}%</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        {aiResult && (
            <CardFooter>
                <p className="text-xs text-muted-foreground">Note: This is an AI-generated suggestion. Please review carefully before finalizing.</p>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
