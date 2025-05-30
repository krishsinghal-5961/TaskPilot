
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserMinus, UserPlus, Wand2, Users, CalendarCheck, MessageSquareQuote, BarChart3 } from "lucide-react";
import { suggestDueDate, type SuggestDueDateInput, type SuggestDueDateOutput } from "@/ai/flows/suggest-due-date";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { mockUsers } from "@/lib/mock-data";
import { format, parseISO } from "date-fns";
import { Separator } from "@/components/ui/separator";

const teamMemberSchema = z.object({
  name: z.string().min(1, "Member name is required."),
  currentWorkload: z.number().min(0).max(100, "Workload must be between 0 and 100."),
});

const assistedAssignmentSchema = z.object({
  taskDescription: z.string().min(10, { message: "Description must be at least 10 characters." }),
  priority: z.enum(["low", "medium", "high"]),
  teamMembers: z.array(teamMemberSchema).min(1, "At least one team member is required."),
});

type AssistedAssignmentFormValues = z.infer<typeof assistedAssignmentSchema>;

export function AssistedAssignmentClientPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<SuggestDueDateOutput | null>(null);

  const form = useForm<AssistedAssignmentFormValues>({
    resolver: zodResolver(assistedAssignmentSchema),
    defaultValues: {
      taskDescription: "",
      priority: "medium",
      teamMembers: mockUsers.filter(u => u.role === 'employee').slice(0,2).map(u => ({ name: u.name, currentWorkload: u.currentWorkload || 0 })), // Pre-fill with some mock employee users
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "teamMembers",
  });

  async function onSubmit(data: AssistedAssignmentFormValues) {
    setIsLoading(true);
    setAiResult(null);
    try {
      const currentDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
      const inputForAI: SuggestDueDateInput = {
        ...data,
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
      let errorMessage = "Failed to get suggestion from AI. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Task Details for AI Suggestion</CardTitle>
          <CardDescription>Provide task information and team workload for an AI-powered due date and assignee suggestion.</CardDescription>
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
                      <Textarea placeholder="Describe the task to be assigned..." {...field} rows={4} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              <div>
                <FormLabel>Team Members & Workload</FormLabel>
                <FormDescription>Add team members and their current workload (0-100%). Only employees are listed for auto-population.</FormDescription>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2 mt-2 p-3 border rounded-md">
                    <FormField
                      control={form.control}
                      name={`teamMembers.${index}.name`}
                      render={({ field: nameField }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-xs">Member Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Team member name" {...nameField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`teamMembers.${index}.currentWorkload`}
                      render={({ field: workloadField }) => (
                        <FormItem className="w-28">
                          <FormLabel className="text-xs">Workload %</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g. 70" {...workloadField} onChange={e => workloadField.onChange(parseInt(e.target.value, 10))} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: "", currentWorkload: 0 })}
                  className="mt-2"
                >
                  <UserPlus className="mr-2 h-4 w-4" /> Add Team Member
                </Button>
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Get AI Suggestion
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
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Generating suggestion...</p>
            </div>
          )}
          {!isLoading && !aiResult && (
            <p className="text-muted-foreground text-center py-10">Submit the form to get an AI suggestion. Ensure your GOOGLE_API_KEY is set in .env if you're running locally.</p>
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
